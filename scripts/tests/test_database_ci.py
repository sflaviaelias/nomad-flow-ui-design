"""Testa o roteiro de CI com executáveis simulados; não inicia Docker ou banco."""
import importlib.util
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location("sanitizer", ROOT / "scripts/sanitize-database-log.py")
sanitizer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sanitizer)

MOCK_CLI = r'''#!/usr/bin/env bash
set -eu
echo "$*" >> "$MOCK_CALLS"
if [ "$1" = --version ]; then echo "${MOCK_VERSION:-2.54.11}"; exit 0; fi
stage=$1
if [ "$stage" = db ] || [ "$stage" = test ]; then stage=$2; fi
workspace=''
while [ "$#" -gt 0 ]; do
  if [ "$1" = --workdir ]; then shift; workspace=$1; fi
  shift
done
if [ "${MOCK_FAIL:-}" = "$stage" ]; then echo "Falha simulada em $stage"; exit 17; fi
case "$stage" in
  init) mkdir -p "$workspace/supabase"; echo 'project_id = "simulado"' > "$workspace/supabase/config.toml" ;;
  start) echo 'JWT secret: segredo-local-simulado'
         echo 'DB URL: postgresql://usuario:senha-simulada@127.0.0.1/teste' ;;
  reset) skipped=0
         for file in "$workspace"/supabase/migrations/*.sql; do
           if [ "${MOCK_SKIP_MIGRATION:-0}" = 1 ] && [ "$skipped" = 0 ]; then skipped=1; continue; fi
           echo "Applying migration $(basename "$file")..."
         done ;;
  db) echo "Files=4, Tests=${MOCK_ASSERTIONS:-85}, 1 wallclock secs"
      echo 'Result: PASS' ;;
  stop) : ;;
  *) echo "Comando simulado desconhecido: $stage" >&2; exit 99 ;;
esac
'''


class LogSanitizerTests(unittest.TestCase):
    def test_redacts_credentials(self):
        for entry in (
            "JWT secret: segredo-ficticio\n",
            "service_role key: segredo-ficticio\n",
            "S3 Access Key: segredo-ficticio\n",
        ):
            self.assertNotIn("segredo-ficticio", sanitizer.sanitize(entry))
        self.assertNotIn("eyJabc.def.ghi", sanitizer.sanitize("Bearer eyJabc.def.ghi\n"))
        self.assertNotIn("senha", sanitizer.sanitize("postgresql://u:senha@127.0.0.1/db\n"))
        self.assertNotIn("sb_secret_exemplo", sanitizer.sanitize("sb_secret_exemplo\n"))

    def test_preserves_diagnostics(self):
        for entry in ("ERROR: constraint violada\n", "not ok 7 - RLS\n", "Files=3, Tests=77\n"):
            self.assertEqual(sanitizer.sanitize(entry), entry)


class LocalRunnerTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="go-nomad-ci-mocks-")
        self.addCleanup(self.temp.cleanup)
        self.base = Path(self.temp.name)
        self.cli = self.base / "supabase"
        self.cli.write_text(MOCK_CLI)
        self.cli.chmod(0o755)
        docker = self.base / "docker"
        docker.write_text("#!/usr/bin/env bash\nexit 0\n")
        docker.chmod(0o755)
        self.calls = self.base / "calls.log"
        self.state = self.base / "workspace.txt"

    def run_script(self, **overrides):
        settings = dict(os.environ)
        settings.update(
            PATH=f"{self.base}:{settings['PATH']}",
            SUPABASE_BIN=str(self.cli), MOCK_CALLS=str(self.calls),
            DB_TEST_WORKSPACE_PARENT=str(self.base), DB_TEST_STATE_FILE=str(self.state),
        )
        settings.update(overrides)
        return subprocess.run(
            ["bash", str(ROOT / "scripts/test-database-local.sh")],
            env=settings, capture_output=True, text=True, timeout=20,
        )

    def test_success_requires_full_run_and_cleans_workspace(self):
        outcome = self.run_script()
        self.assertEqual(outcome.returncode, 0, outcome.stdout + outcome.stderr)
        self.assertIn("85 asserções aprovadas", outcome.stdout)
        self.assertNotIn("segredo-local-simulado", outcome.stdout)
        self.assertNotIn("senha-simulada", outcome.stdout)
        self.assertFalse(Path(self.state.read_text().strip()).exists())
        self.assertIn("stop --workdir", self.calls.read_text())
        self.assertIn("db reset --local", self.calls.read_text())

    def test_database_failure_propagates_and_stops(self):
        outcome = self.run_script(MOCK_FAIL="db")
        self.assertEqual(outcome.returncode, 17)
        self.assertIn("stop --workdir", self.calls.read_text())
        self.assertNotIn("85 asserções aprovadas", outcome.stdout)

    def test_zero_assertions_cannot_pass(self):
        outcome = self.run_script(MOCK_ASSERTIONS="0")
        self.assertNotEqual(outcome.returncode, 0)
        self.assertIn("não confirmou", outcome.stderr)

    def test_missing_migration_cannot_pass(self):
        outcome = self.run_script(MOCK_SKIP_MIGRATION="1")
        self.assertNotEqual(outcome.returncode, 0)
        self.assertIn("Migration não confirmada", outcome.stderr)
        self.assertNotIn("test db", self.calls.read_text())

    def test_start_failure_is_reported_and_stops(self):
        outcome = self.run_script(MOCK_FAIL="start")
        self.assertNotEqual(outcome.returncode, 0)
        self.assertIn("Falha na inicialização", outcome.stderr)
        self.assertIn("stop --workdir", self.calls.read_text())
        self.assertNotIn("db reset", self.calls.read_text())

    def test_reset_failure_is_not_hidden_by_logging(self):
        outcome = self.run_script(MOCK_FAIL="reset")
        self.assertEqual(outcome.returncode, 17)
        self.assertNotIn("test db", self.calls.read_text())

    def test_wrong_cli_version_is_rejected(self):
        outcome = self.run_script(MOCK_VERSION="3.0.0")
        self.assertNotEqual(outcome.returncode, 0)
        self.assertNotIn("init", self.calls.read_text())


if __name__ == "__main__":
    unittest.main()
