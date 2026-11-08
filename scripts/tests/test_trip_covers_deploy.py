"""Processo incremental simulado; nenhuma rede ou banco real."""
import importlib.util
import io
import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch
from copy import deepcopy

spec = importlib.util.spec_from_file_location("incremental", Path(__file__).resolve().parents[1] / "deploy-supabase-development.py")
deploy = importlib.util.module_from_spec(spec)
spec.loader.exec_module(deploy)


def security_state():
    denied = {name: False for name in ('select', 'insert', 'update', 'delete', 'truncate', 'references', 'trigger', 'column_select', 'column_write')}
    return dict(exists=True, rls=True, public_privileges=0,
        privileges={'anon': dict(denied), 'authenticated': dict(denied, select=True, column_select=True),
                    'service_role': dict(select=True, insert=True, update=True, delete=True)},
        policies=[dict(name='trip_covers_owner_read', command='r', roles=['authenticated'], permissive=True, check=None,
            using='(EXISTS ( SELECT 1 FROM public.trips t WHERE ((t.id = trip_covers.trip_id) AND (t.user_id = ( SELECT auth.uid() AS uid)))))')])


class TripCoverDeploymentTests(unittest.TestCase):
    def setUp(self):
        original = deploy.ROOT
        workspace = tempfile.TemporaryDirectory(prefix="go-nomad-trip-cover-fixture-")
        self.addCleanup(workspace.cleanup)
        root = Path(workspace.name)
        for name in ("go-nomad-dev-migrations.sha256", "go-nomad-dev-incremental.sha256", "go-nomad-dev-trip-covers.sha256"):
            manifest = original / "docs" / name
            target = root / "docs" / name
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(manifest.read_bytes())
            for line in manifest.read_text().splitlines():
                path = line.split()[1]
                target = root / path
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes((original / path).read_bytes())
        replacement = patch.object(deploy, "ROOT", root)
        replacement.start()
        self.addCleanup(replacement.stop)
        self.files = deploy.migration_files(trip_covers=True)
        self.versions = [p.name[:14] for p in self.files]
        self.state = dict(version=170011, database="postgres", user="postgres", read_only="on", history_exists=True,
                          public_objects=5, users=10)

    def test_only_expected_delta_and_strict_bootstrap(self):
        self.assertEqual(len(self.files), 17)
        self.assertEqual(self.files[-1].name, "20261108000100_trip_destination_covers.sql")
        with self.assertRaises(RuntimeError):
            deploy.migration_files()

    def test_history_must_match_exactly(self):
        self.assertEqual(deploy.validate_incremental_state(self.state, self.versions[:-1], self.versions), "pending")
        self.assertEqual(deploy.validate_incremental_state(self.state, self.versions, self.versions), "complete")
        for history in ([], self.versions[:14], self.versions[1:], self.versions[:-1] + ["20990101000000"], list(reversed(self.versions))):
            with self.assertRaises(RuntimeError):
                deploy.validate_incremental_state(self.state, history, self.versions)
        for field, value in (("version", 160000), ("user", "anon"), ("database", "other"), ("read_only", "off"), ("history_exists", False)):
            with self.assertRaises(RuntimeError):
                deploy.validate_incremental_state(dict(self.state, **{field: value}), self.versions[:-1], self.versions)

    def test_changed_sql_or_extra_migration_is_rejected(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            for p in self.files + [deploy.ROOT / "docs/go-nomad-dev-migrations.sha256", deploy.ROOT / "docs/go-nomad-dev-incremental.sha256", deploy.ROOT / "docs/go-nomad-dev-trip-covers.sha256"]:
                target = root / p.relative_to(deploy.ROOT)
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(p.read_bytes())
            with patch.object(deploy, "ROOT", root):
                extra = root / "supabase/migrations/20990101000000_extra.sql"
                extra.write_text("select 1;")
                with self.assertRaises(RuntimeError): deploy.migration_files(trip_covers=True)
                extra.unlink()
                (root / "supabase/migrations" / self.files[-1].name).write_text("select 1;")
                with self.assertRaises(RuntimeError): deploy.migration_files(trip_covers=True)

    def simulate(self, mode="dry-run", initial=None, race=False, bad_final=False, failed_preview=False, confirm=None, table_exists=False, table_race=False, bad_security=None):
        initial = self.versions[:-1] if initial is None else initial
        calls, histories, inspections = [], [], []
        applied = False
        def run(command, **options):
            nonlocal applied
            calls.append((command, options.get("env", {})))
            output = ""
            if command == ["supabase", "--version"]: output = deploy.CLI_VERSION
            elif command[0] == "psql":
                if "with target as" in command[-1]:
                    exists = applied or initial == self.versions or table_exists or (table_race and bool(inspections))
                    security = security_state() if exists else {"exists": False}
                    if bad_security and exists: security = bad_security
                    inspections.append(security)
                    output = json.dumps(security)
                elif "json_build_object" in command[-1]: output = json.dumps(self.state)
                else:
                    history = (self.versions if not bad_final else initial) if applied else initial
                    if race and histories: history = self.versions
                    histories.append(history)
                    output = json.dumps(history)
            elif command[1] == "init":
                (Path(command[command.index("--workdir") + 1]) / "supabase").mkdir()
            elif command[:3] == ["supabase", "db", "push"]:
                workdir = Path(command[command.index("--workdir") + 1])
                self.assertEqual(sorted(p.name for p in (workdir / "supabase/migrations").glob("*.sql")), [p.name for p in self.files])
                if "--dry-run" in command and failed_preview:
                    return subprocess.CompletedProcess(command, 1, "", "Preview falhou")
                if "--dry-run" not in command: applied = True
            return subprocess.CompletedProcess(command, 0, output, "")
        env = dict(GITHUB_ACTIONS="true", DEPLOY_MODE=mode, CONFIRM_PROJECT_REF=deploy.TARGET_REF if confirm is None else confirm,
                   SUPABASE_DEV_ACCESS_TOKEN="token-ficticio", SUPABASE_DEV_DB_PASSWORD="senha-ficticia", SUPABASE_DEV_DB_HOST="aws-0-eu-west-1.pooler.supabase.com",
                   SUPABASE_DEV_CA_CERT="-----BEGIN CERTIFICATE-----\nTEST\n-----END CERTIFICATE-----")
        project = dict(id=deploy.TARGET_REF, name=deploy.TARGET_NAME, status="ACTIVE_HEALTHY")
        with patch.dict(os.environ, env, clear=True), patch.object(deploy, "urlopen", return_value=io.BytesIO(json.dumps(project).encode())), patch.object(deploy.subprocess, "run", side_effect=run), patch("sys.stdout", new_callable=io.StringIO) as log:
            error = None
            try: deploy.main(trip_covers=True)
            except RuntimeError as caught: error = caught
            text = log.getvalue()
        for secret in ("token-ficticio", "senha-ficticia", "BEGIN CERTIFICATE"):
            self.assertNotIn(secret, text)
        for command, environment in calls:
            self.assertFalse(any(word in command for word in ("reset", "repair", "link", "--include-all", "--include-seed")))
            if command[0] == "psql" or command[:3] == ["supabase", "db", "push"]:
                self.assertIn("sslmode=verify-full", " ".join(command))
                self.assertIn("sslrootcert=", " ".join(command))
                self.assertEqual(environment["PGSSLMODE"], "verify-full")
                self.assertFalse(Path(environment["PGSSLROOTCERT"]).exists(), "CA temporária deve ser removida mesmo em falhas")
                if command[0] == "psql": self.assertTrue(command[-1].startswith("BEGIN READ ONLY;"))
        writes = [c for c, _ in calls if c[:3] == ["supabase", "db", "push"] and "--dry-run" not in c]
        return calls, writes, error, text

    def test_dry_run_only_reads_and_previews(self):
        calls, writes, error, text = self.simulate()
        self.assertIsNone(error)
        self.assertFalse(writes)
        self.assertIn("Migrations pendentes: " + self.files[-1].name, text)
        for command, env in calls:
            if command[0] == "psql" or command[:3] == ["supabase", "db", "push"]:
                self.assertEqual(env["PGOPTIONS"], "-c default_transaction_read_only=on")

    def test_confirmed_apply_previews_writes_once_and_verifies(self):
        calls, writes, error, text = self.simulate("apply")
        self.assertIsNone(error)
        self.assertEqual(len(writes), 1)
        self.assertIn("17 versões aprovadas", text)
        self.assertIn("--yes", writes[0])
        self.assertTrue(any("--dry-run" in c for c, _ in calls))

    def test_already_applied_is_noop(self):
        _, writes, error, text = self.simulate("apply", initial=self.versions)
        self.assertIsNone(error)
        self.assertFalse(writes)
        self.assertIn("Migrations pendentes: nenhuma", text)

    def test_unsafe_conditions_stop_before_write(self):
        for kwargs in (dict(confirm=""), dict(initial=[]), dict(initial=self.versions[:14]), dict(race=True), dict(failed_preview=True)):
            _, writes, error, _ = self.simulate("apply", **kwargs)
            self.assertIsNotNone(error, kwargs)
            self.assertFalse(writes, kwargs)

    def test_final_history_mismatch_reports_failure_without_retry(self):
        _, writes, error, _ = self.simulate("apply", bad_final=True)
        self.assertEqual(len(writes), 1)
        self.assertIsNotNone(error)

    def test_both_modes_require_project_confirmation_before_any_remote_call(self):
        for mode in ("dry-run", "apply"):
            for confirmation in ("", "outro-projeto"):
                calls, writes, error, _ = self.simulate(mode, confirm=confirmation)
                self.assertIsNotNone(error)
                self.assertFalse(calls)
                self.assertFalse(writes)

    def test_missing_migration_16_blocks_preview(self):
        calls, writes, error, _ = self.simulate(initial=self.versions[:15])
        self.assertIsNotNone(error)
        self.assertFalse(writes)
        self.assertFalse(any(c[:3] == ["supabase", "db", "push"] for c, _ in calls))

    def test_existing_unregistered_table_blocks_preview(self):
        calls, writes, error, _ = self.simulate(table_exists=True)
        self.assertIsNotNone(error)
        self.assertFalse(writes)
        self.assertFalse(any(c[:3] == ["supabase", "db", "push"] for c, _ in calls))

    def test_table_appearing_after_preview_blocks_write(self):
        _, writes, error, _ = self.simulate("apply", table_race=True)
        self.assertIsNotNone(error)
        self.assertFalse(writes)

    def test_security_validator_rejects_effective_privilege_and_policy_drift(self):
        good = security_state()
        deploy.cover_checks.validate_security(good)
        variants = []
        for field, value in (("exists", False), ("rls", False), ("public_privileges", 1)):
            variants.append(dict(good, **{field: value}))
        for role, field, value in (("anon", "select", True), ("anon", "column_select", True),
                ("authenticated", "update", True), ("authenticated", "column_write", True),
                ("authenticated", "select", False), ("service_role", "insert", False)):
            state = deepcopy(good); state['privileges'][role][field] = value; variants.append(state)
        for field, value in (("using", "true"), ("using", good['policies'][0]['using'] + ' OR true'),
                ("roles", ['anon']), ("command", '*'), ("check", 'true')):
            state = deepcopy(good); state['policies'][0][field] = value; variants.append(state)
        variants.append(dict(good, policies=[]))
        variants.append(dict(good, policies=good['policies'] * 2))
        for state in variants:
            with self.assertRaises(RuntimeError): deploy.cover_checks.validate_security(state)

    def test_bad_security_on_existing_release_blocks_before_preview(self):
        _, writes, error, _ = self.simulate(initial=self.versions, bad_security=dict(security_state(), rls=False))
        self.assertIsNotNone(error)
        self.assertFalse(writes)

    def test_postapply_security_failure_is_reported_without_retry(self):
        _, writes, error, _ = self.simulate("apply", bad_security=dict(security_state(), public_privileges=1))
        self.assertEqual(len(writes), 1)
        self.assertIsNotNone(error)

    def test_original_sql_tampering_is_rejected(self):
        self.files[0].write_text("select 1;")
        with self.assertRaises(RuntimeError): deploy.migration_files(trip_covers=True)

    def test_security_sql_is_catalog_only_and_read_only(self):
        sql = deploy.cover_checks.STATE_SQL.lower()
        self.assertIn("pg_policy", sql)
        self.assertIn("has_any_column_privilege", sql)
        self.assertNotIn("from public.trip_covers", sql)
        self.assertFalse(any(word in sql.split() for word in ('insert', 'update', 'delete', 'create', 'alter', 'drop')))


if __name__ == "__main__":
    unittest.main()
