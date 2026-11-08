#!/usr/bin/env python3
"""Deploy manual de desenvolvimento: bootstrap ou delta 16/17 explicitamente selecionado."""
import argparse
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile
from urllib.parse import urlencode
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
TARGET_REF = "mksylwolwshpxhfrgldq"
TARGET_NAME = "go-nomad-dev"
CLI_VERSION = "2.54.11"
CA_FILE = "/etc/ssl/certs/ca-certificates.crt"
spec = importlib.util.spec_from_file_location("redactor", ROOT / "scripts/sanitize-database-log.py")
redactor = importlib.util.module_from_spec(spec)
spec.loader.exec_module(redactor)
checks_spec = importlib.util.spec_from_file_location("cover_checks", ROOT / "scripts/trip-covers-deploy-checks.py")
cover_checks = importlib.util.module_from_spec(checks_spec)
checks_spec.loader.exec_module(cover_checks)


def validate_mode(mode, confirmation):
    if mode not in ("dry-run", "apply"):
        raise RuntimeError("Modo inválido.")
    if mode == "apply" and confirmation != TARGET_REF:
        raise RuntimeError("Apply requer confirmação exata do Project Ref de desenvolvimento.")
    if confirmation and confirmation != TARGET_REF:
        raise RuntimeError("Project Ref de confirmação incorreto.")


def database_url(host, read_only=True, ca_file=CA_FILE):
    if host == f"db.{TARGET_REF}.supabase.co":
        username = "postgres"
    elif re.fullmatch(r"aws-[0-9]+-[a-z0-9-]+\.pooler\.supabase\.com", host):
        username = f"postgres.{TARGET_REF}"
    else:
        raise RuntimeError("Host inválido: use o host direto deste projeto ou pooler oficial de sessão.")
    options = urlencode({
        "sslmode": "verify-full", "sslrootcert": ca_file,
        "options": "-c default_transaction_read_only=" + ("on" if read_only else "off"),
    })
    # A senha é enviada somente por PGPASSWORD, nunca no argumento --db-url.
    return f"postgresql://{username}@{host}:5432/postgres?{options}"


def validate_project(project):
    if project.get("id") != TARGET_REF or project.get("name") != TARGET_NAME:
        raise RuntimeError("Identidade do projeto não corresponde ao destino autorizado.")
    if project.get("status") != "ACTIVE_HEALTHY":
        raise RuntimeError("Projeto não está ACTIVE_HEALTHY; inspeção interrompida.")


def migration_files(incremental=False, trip_covers=False):
    incremental = incremental or trip_covers
    entries = (ROOT / "docs/go-nomad-dev-migrations.sha256").read_text().splitlines()
    if len(entries) != 15:
        raise RuntimeError("O manifesto original deve preservar exatamente as 15 migrations.")
    if incremental:
        delta = (ROOT / "docs/go-nomad-dev-incremental.sha256").read_text().splitlines()
        if len(delta) != 1:
            raise RuntimeError("O manifesto incremental deve conter somente a migration 16.")
        entries += delta
    if trip_covers:
        delta = (ROOT / "docs/go-nomad-dev-trip-covers.sha256").read_text().splitlines()
        if len(delta) != 1:
            raise RuntimeError("O manifesto de capas deve conter somente a migration 17.")
        entries += delta
    files = []
    for entry in entries:
        checksum, name = entry.split()
        path = ROOT / name
        if path.parent != ROOT / "supabase/migrations" or not re.fullmatch(r"[0-9]{14}_.+\.sql", path.name):
            raise RuntimeError("Manifesto contém caminho inesperado.")
        if hashlib.sha256(path.read_bytes()).hexdigest() != checksum:
            raise RuntimeError("Uma migration não corresponde ao manifesto aprovado.")
        files.append(path)
    expected = 17 if trip_covers else (16 if incremental else 15)
    if len(files) != expected or files != sorted(set(files)) or set(files) != set((ROOT / "supabase/migrations").glob("*.sql")):
        raise RuntimeError(f"Esperadas exatamente {expected} migrations aprovadas em ordem.")
    if incremental and files[15].name != "20261107000500_restrict_rls_auto_enable.sql":
        raise RuntimeError("Somente a migration 16 autorizada pode ser adicionada.")
    if trip_covers and files[-1].name != "20261108000100_trip_destination_covers.sql":
        raise RuntimeError("Somente a migration 17 de capas pode ser adicionada.")
    return files


def validate_state(state, history, versions):
    if state.get("version") != 170011 or state.get("database") != "postgres" or state.get("user") != "postgres":
        raise RuntimeError("Servidor/usuário/banco diferentes do esperado (PostgreSQL 17.11, postgres).")
    if state.get("read_only") != "on":
        raise RuntimeError("A conexão de inspeção não está em modo somente leitura.")
    if history == versions:
        return "complete"
    if history:
        raise RuntimeError("Histórico parcial ou desconhecido: parar e revisar, sem repair ou reset.")
    if state.get("public_objects") != 0 or state.get("users") != 0:
        raise RuntimeError("Bootstrap requer public vazio e nenhuma conta de usuário.")
    return "empty"


def validate_incremental_state(state, history, versions):
    # Reutilizar as verificações de identidade SQL, mas nunca exigir banco vazio.
    validate_state(state, versions, versions)
    if not state.get("history_exists"):
        raise RuntimeError("Histórico remoto ausente; incremental requer todas as versões anteriores.")
    if history == versions:
        return "complete"
    if history == versions[:-1]:
        return "pending"
    raise RuntimeError("Histórico divergente das versões anteriores ou da release aprovada; operação bloqueada.")


def main(incremental=False, trip_covers=False):
    incremental = incremental or trip_covers
    if os.environ.get("GITHUB_ACTIONS") != "true":
        raise RuntimeError("Este roteiro só deve ser executado pelo workflow manual autorizado.")
    mode = os.environ.get("DEPLOY_MODE", "")
    validate_mode(mode, os.environ.get("CONFIRM_PROJECT_REF", ""))
    if trip_covers and os.environ.get("CONFIRM_PROJECT_REF") != TARGET_REF:
        raise RuntimeError("Migration 17 exige confirmação exata do projeto tanto no dry-run quanto no apply.")
    token = os.environ.get("SUPABASE_DEV_ACCESS_TOKEN", "")
    password = os.environ.get("SUPABASE_DEV_DB_PASSWORD", "")
    host = os.environ.get("SUPABASE_DEV_DB_HOST", "").strip()
    if not token or not password:
        raise RuntimeError("Configure os dois secrets no Environment go-nomad-dev; valores não serão exibidos.")
    files = migration_files(incremental=incremental, trip_covers=trip_covers)
    versions = [path.name[:14] for path in files]
    certificate = os.environ.get("SUPABASE_DEV_CA_CERT", "").strip()
    if not (certificate.startswith("-----BEGIN CERTIFICATE-----")
            and certificate.endswith("-----END CERTIFICATE-----")):
        raise RuntimeError("Configure o certificado CA oficial no secret SUPABASE_DEV_CA_CERT.")

    def clean(output):
        for secret in (token, password):
            output = output.replace(secret, "[SEGREDO OMITIDO]")
        return "".join(redactor.sanitize(line) for line in output.splitlines(keepends=True))

    def run(label, command, env=None, show=True):
        try:
            result = subprocess.run(command, env=env, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=900)
        except subprocess.TimeoutExpired:
            raise RuntimeError(f"Tempo limite em {label}; revisar histórico antes de qualquer nova aplicação.") from None
        if show or result.returncode:
            print(clean(result.stdout + result.stderr), end="", flush=True)
        if result.returncode:
            raise RuntimeError(f"Falha em {label}; código {result.returncode}. Não fazer repair/reset.")
        return result.stdout.strip()

    if run("versão CLI", ["supabase", "--version"], show=False) != CLI_VERSION:
        raise RuntimeError("Versão de CLI diferente de 2.54.11.")
    request = Request(f"https://api.supabase.com/v1/projects/{TARGET_REF}",
                      headers={"Authorization": f"Bearer {token}"}, method="GET")
    try:
        with urlopen(request, timeout=30) as response:
            project = json.load(response)
    except Exception:
        raise RuntimeError("Não foi possível verificar a identidade pela Management API; conexão SQL não iniciada.") from None
    validate_project(project)
    print(f"Projeto confirmado: {TARGET_NAME} ({TARGET_REF}); modo {mode}.", flush=True)

    # O certificado CA vem do secret e nunca entra no repositório nem nos logs.
    with tempfile.TemporaryDirectory(prefix="go-nomad-dev-ca-") as ca_directory:
        ca_path = Path(ca_directory) / "supabase-ca.crt"
        ca_path.write_text(certificate + "\n", encoding="utf-8")
        ca_path.chmod(0o600)
        read_url = database_url(host, ca_file=str(ca_path))
        env = dict(os.environ, PGPASSWORD=password, PGSSLMODE="verify-full", PGSSLROOTCERT=str(ca_path),
                   PGOPTIONS="-c default_transaction_read_only=on", NO_COLOR="1")
        # O CLI não precisa de token de API nem de vínculo: --db-url seleciona o destino.
        env.pop("SUPABASE_ACCESS_TOKEN", None)
        env.pop("SUPABASE_DB_PASSWORD", None)
        env.pop("SUPABASE_DEV_ACCESS_TOKEN", None)
        env.pop("SUPABASE_DEV_DB_PASSWORD", None)
        env.pop("SUPABASE_DEV_CA_CERT", None)

        def query(sql):
            return json.loads(run("consulta somente leitura", ["psql", "-XAtq", "-v", "ON_ERROR_STOP=1",
                "--dbname", read_url, "--command", "BEGIN READ ONLY; " + sql.rstrip(";") + "; COMMIT;"], env=env, show=False))

        state = query("""select json_build_object(
            'version', current_setting('server_version_num')::int,
            'database', current_database(), 'user', current_user,
            'read_only', current_setting('transaction_read_only'),
            'public_objects', (select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace
                where n.nspname='public' and c.relkind in ('r','p','v','m','f','S')),
            'users', (select count(*) from auth.users),
            'history_exists', to_regclass('supabase_migrations.schema_migrations') is not null)""")

        def history():
            return query("select coalesce(json_agg(version order by version), '[]'::json) from supabase_migrations.schema_migrations")

        before = history() if state["history_exists"] else []
        validator = validate_incremental_state if incremental else validate_state
        status = validator(state, before, versions)
        pending = files[-1:] if incremental and status == "pending" else (files if status == "empty" else [])
        if trip_covers:
            initial_cover_state = query(cover_checks.STATE_SQL)
            if status == "pending" and initial_cover_state.get("exists") is not False:
                raise RuntimeError("trip_covers já existe sem a versão 17 registrada; operação bloqueada.")
            if status == "complete":
                cover_checks.validate_security(initial_cover_state)
                print("trip_covers: RLS, política de propriedade e permissões verificadas.", flush=True)
            else:
                print("trip_covers ausente: RLS e permissões serão verificados após aplicação; dry-run não cria a tabela.", flush=True)
        print("Migrations pendentes: " + (", ".join(p.name for p in pending) if pending else "nenhuma"), flush=True)
        print("Histórico remoto: " + (", ".join(before) if before else "vazio/ausente"), flush=True)
        with tempfile.TemporaryDirectory(prefix="go-nomad-dev-deploy-") as folder:
            workdir = Path(folder)
            run("configuração temporária", ["supabase", "init", "--workdir", folder, "--yes"], env=env)
            destination = workdir / "supabase/migrations"
            destination.mkdir(exist_ok=True)
            for path in files:
                (destination / path.name).write_bytes(path.read_bytes())
            run("histórico remoto CLI", ["supabase", "migration", "list", "--db-url", read_url, "--workdir", folder], env=env)
            run("dry-run", ["supabase", "db", "push", "--db-url", read_url, "--dry-run", "--workdir", folder], env=env)
            if mode == "dry-run":
                print("Dry-run concluído em conexão somente leitura; nenhuma migration aplicada.")
                return
            if status in ("empty", "pending"):
                # Revalidar imediatamente antes da escrita; não aceitar mudanças desde o preview.
                if incremental and history() != before:
                    raise RuntimeError("Histórico mudou durante o preview; aplicação bloqueada.")
                if trip_covers and query(cover_checks.STATE_SQL).get("exists") is not False:
                    raise RuntimeError("trip_covers apareceu durante o preview; aplicação bloqueada.")
                print(f"Confirmação aceita; aplicando {len(pending)} migration(s) pendente(s).", flush=True)
                write_env = dict(env, PGOPTIONS="-c default_transaction_read_only=off")
                run("aplicação", ["supabase", "db", "push", "--db-url", database_url(host, False, ca_file=str(ca_path)),
                    "--workdir", folder, "--yes"], env=write_env)
            if history() != versions:
                raise RuntimeError("Histórico final diferente das versões aprovadas; não repetir automaticamente.")
            if trip_covers:
                cover_checks.validate_security(query(cover_checks.STATE_SQL))
                print("trip_covers: RLS, política de propriedade e permissões verificadas.", flush=True)
            run("histórico final CLI", ["supabase", "migration", "list", "--db-url", read_url, "--workdir", folder], env=env)
            print(f"Histórico final verificado: {len(versions)} versões aprovadas; nenhuma alteração de frontend.")

if __name__ == "__main__":
    try:
        parser = argparse.ArgumentParser(description=__doc__)
        group = parser.add_mutually_exclusive_group()
        group.add_argument("--incremental", action="store_true", help="Somente a migration 16, após verificar as 15 originais")
        group.add_argument("--trip-covers", action="store_true", help="Somente migration 17 após conferir as 16 anteriores")
        args = parser.parse_args()
        main(incremental=args.incremental, trip_covers=args.trip_covers)
    except Exception as error:
        # Exceções não previstas não imprimem payloads/tracebacks com credenciais.
        message = str(error) if isinstance(error, RuntimeError) else "Falha inesperada; execução interrompida sem expor detalhes sensíveis."
        print(f"ERRO: {message}", flush=True)
        raise SystemExit(1)
