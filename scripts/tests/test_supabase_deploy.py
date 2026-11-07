"""Checks offline: nenhuma API, CLI ou consulta SQL real é executada."""
import importlib.util
import io
import json
import os
from pathlib import Path
import subprocess
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location("deploy", Path(__file__).resolve().parents[1] / "deploy-supabase-development.py")
deploy = importlib.util.module_from_spec(spec)
spec.loader.exec_module(deploy)


class DeploymentTests(unittest.TestCase):
    def state(self, **changes):
        return dict(version=170011, database="postgres", user="postgres", read_only="on",
                    public_objects=0, users=0, history_exists=False, **changes)

    def test_exact_confirmation(self):
        deploy.validate_mode("dry-run", "")
        deploy.validate_mode("apply", deploy.TARGET_REF)
        for mode, confirmation in [("apply", ""), ("apply", "outro"), ("dry-run", "outro"), ("reset", "")]:
            with self.assertRaises(RuntimeError):
                deploy.validate_mode(mode, confirmation)

    def test_url_pins_tenant_and_read_only_without_password(self):
        for host in [f"db.{deploy.TARGET_REF}.supabase.co", "aws-0-eu-west-1.pooler.supabase.com"]:
            url = deploy.database_url(host)
            self.assertIn("default_transaction_read_only%3Don", url)
            self.assertIn("verify-full", url)
            self.assertIn(":5432/postgres", url)
            self.assertNotIn("senha", url)
        for host in ["evil.example.com", "db.hxjjdutzpzrchfkrbxcd.supabase.co", "aws-0-eu-west-1.pooler.supabase.com:6543"]:
            with self.assertRaises(RuntimeError):
                deploy.database_url(host)

    def test_wrong_identity_is_rejected(self):
        for value in [{"id": "outro", "name": deploy.TARGET_NAME},
                      {"id": deploy.TARGET_REF, "name": "producao"},
                      {"id": deploy.TARGET_REF, "name": deploy.TARGET_NAME, "status": "INACTIVE"}]:
            with self.assertRaises(RuntimeError):
                deploy.validate_project(value)

    def test_state_and_manifest(self):
        versions = [path.name[:14] for path in deploy.migration_files()]
        self.assertEqual(len(versions), 15)
        self.assertEqual(deploy.validate_state(self.state(), [], versions), "empty")
        self.assertEqual(deploy.validate_state(self.state(), versions, versions), "complete")
        for field, value in [("version", 170010), ("read_only", "off"), ("users", 1), ("public_objects", 1)]:
            state = self.state()
            state[field] = value
            with self.assertRaises(RuntimeError):
                deploy.validate_state(state, [], versions)
        with self.assertRaises(RuntimeError):
            deploy.validate_state(self.state(), versions[:2], versions)

    def simulate(self, mode, project=None, command_failure=False):
        versions = [p.name[:14] for p in deploy.migration_files()]
        calls = []
        def run(command, **options):
            calls.append((command, options.get("env")))
            output = ""
            if command == ["supabase", "--version"]:
                output = deploy.CLI_VERSION
            elif command[0] == "psql":
                output = json.dumps(self.state()) if "json_build_object" in command[-1] else json.dumps(versions)
            elif command[1] == "init":
                (Path(command[command.index("--workdir") + 1]) / "supabase").mkdir()
            if command_failure and command[:3] == ["supabase", "db", "push"]:
                return subprocess.CompletedProcess(command, 1, "", "Erro simulado")
            return subprocess.CompletedProcess(command, 0, output, "")
        environment = dict(GITHUB_ACTIONS="true", DEPLOY_MODE=mode,
            CONFIRM_PROJECT_REF=deploy.TARGET_REF if mode == "apply" else "",
            SUPABASE_DEV_ACCESS_TOKEN="token-ficticio", SUPABASE_DEV_DB_PASSWORD="senha-ficticia",
            SUPABASE_DEV_DB_HOST="aws-0-eu-west-1.pooler.supabase.com")
        project = project or {"id": deploy.TARGET_REF, "name": deploy.TARGET_NAME, "status": "ACTIVE_HEALTHY"}
        with patch.dict(os.environ, environment, clear=True), patch.object(deploy, "urlopen", return_value=io.BytesIO(json.dumps(project).encode())) as api, \
             patch.object(deploy.subprocess, "run", side_effect=run), patch("sys.stdout", new_callable=io.StringIO) as output:
            try:
                deploy.main()
                error = None
            except RuntimeError as caught:
                error = caught
            text = output.getvalue()
            self.assertEqual(api.call_args.args[0].get_method(), "GET")
            self.assertEqual(api.call_args.args[0].full_url, f"https://api.supabase.com/v1/projects/{deploy.TARGET_REF}")
        self.assertNotIn("token-ficticio", text)
        self.assertNotIn("senha-ficticia", text)
        return calls, error

    def test_dry_run_never_invokes_write_or_link(self):
        calls, error = self.simulate("dry-run")
        self.assertIsNone(error)
        pushes = [(c, env) for c, env in calls if c[:3] == ["supabase", "db", "push"]]
        self.assertEqual(len(pushes), 1)
        self.assertIn("--dry-run", pushes[0][0])
        self.assertTrue(all("link" not in c and "reset" not in c and "repair" not in c for c, _ in calls))
        for command, env in calls:
            if command[0] == "psql" or command[:3] == ["supabase", "db", "push"]:
                self.assertEqual(env["PGOPTIONS"], "-c default_transaction_read_only=on")
                self.assertNotIn("senha-ficticia", " ".join(command))

    def test_apply_has_preview_then_single_write(self):
        calls, error = self.simulate("apply")
        self.assertIsNone(error)
        pushes = [(c, env) for c, env in calls if c[:3] == ["supabase", "db", "push"]]
        self.assertEqual(len(pushes), 2)
        self.assertIn("--dry-run", pushes[0][0])
        self.assertNotIn("--dry-run", pushes[1][0])
        self.assertIn("--yes", pushes[1][0])
        self.assertEqual(pushes[1][1]["PGOPTIONS"], "-c default_transaction_read_only=off")

    def test_wrong_project_stops_before_sql(self):
        calls, error = self.simulate("dry-run", project={"id": "errado", "name": deploy.TARGET_NAME})
        self.assertIsNotNone(error)
        self.assertFalse(any(c[0] == "psql" for c, _ in calls))

    def test_cli_error_is_not_hidden(self):
        calls, error = self.simulate("dry-run", command_failure=True)
        self.assertIsNotNone(error)
        self.assertEqual(sum(c[:3] == ["supabase", "db", "push"] for c, _ in calls), 1)


if __name__ == "__main__":
    unittest.main()
