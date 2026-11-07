#!/usr/bin/env bash
# Executa somente em uma cópia descartável, sem .env ou vínculo de projeto remoto.
set -euo pipefail
export NO_COLOR=1

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
supabase_bin="${SUPABASE_BIN:-supabase}"
command -v "$supabase_bin" >/dev/null || {
  echo 'Instale o Supabase CLI 2.54.11 e configure SUPABASE_BIN, se necessário.' >&2
  exit 1
}
if [ "$("$supabase_bin" --version)" != '2.54.11' ]; then
  echo 'Este roteiro requer Supabase CLI 2.54.11 para manter o ambiente reproduzível.' >&2
  exit 1
fi
# Não usar um contexto Docker remoto herdado.
unset DOCKER_CONTEXT DOCKER_TLS DOCKER_TLS_VERIFY DOCKER_CERT_PATH
export DOCKER_HOST=unix:///var/run/docker.sock
docker --host=unix:///var/run/docker.sock info >/dev/null
command -v python3 >/dev/null

test_workspace="$(mktemp -d "${DB_TEST_WORKSPACE_PARENT:-/tmp}/go-nomad-db-XXXXXXXX")"
# O workflow usa este arquivo para uma segunda limpeza, inclusive em cancelamento.
if [ -n "${DB_TEST_STATE_FILE:-}" ]; then
  printf '%s\n' "$test_workspace" > "$DB_TEST_STATE_FILE"
fi
run_logged() {
  local stage=$1
  shift
  "$@" 2>&1 | python3 "$repository_root/scripts/sanitize-database-log.py" \
    | tee "$test_workspace/$stage.log"
}
cleanup() {
  local outcome=$?
  trap - EXIT
  if ! "$supabase_bin" stop --workdir "$test_workspace" --no-backup \
    2>&1 | python3 "$repository_root/scripts/sanitize-database-log.py"; then
    echo 'Falha na limpeza local; execute stop para esta cópia antes de removê-la.' >&2
    if [ "$outcome" -eq 0 ]; then outcome=1; fi
  fi
  if [ "$outcome" -eq 0 ]; then
    rm -rf -- "$test_workspace"
  else
    echo "Teste não concluído; cópia local preservada em $test_workspace" >&2
  fi
  exit "$outcome"
}
trap cleanup EXIT

"$supabase_bin" init --workdir "$test_workspace" --yes
cp -R "$repository_root/supabase/migrations" "$test_workspace/supabase/"
cp -R "$repository_root/supabase/tests" "$test_workspace/supabase/"

echo 'Inicializando Supabase local descartável; nenhum comando usa --linked ou URL remota.'
run_logged start "$supabase_bin" start --workdir "$test_workspace" \
  -x studio,imgproxy,realtime,edge-runtime,logflare,vector,supavisor || {
    echo 'Falha na inicialização do Supabase local; consulte o log acima.' >&2
    exit 1
  }
echo 'Recriando banco local e aplicando as 15 migrations em ordem.'
run_logged reset "$supabase_bin" db reset --local --workdir "$test_workspace"
# CLI fixo: cada migration deve aparecer explicitamente no log de aplicação.
migration_count=0
for migration in "$test_workspace"/supabase/migrations/*.sql; do
  if ! grep -Fq "Applying migration $(basename "$migration")" "$test_workspace/reset.log"; then
    echo "Migration não confirmada no log: $(basename "$migration")" >&2
    exit 1
  fi
  migration_count=$((migration_count + 1))
done
if [ "$migration_count" -ne 15 ]; then
  echo "Esperadas 15 migrations; encontradas $migration_count." >&2
  exit 1
fi
echo 'Executando as três suítes pgTAP.'
run_logged tests "$supabase_bin" test db --workdir "$test_workspace"
if ! grep -Eq 'Files=3,[[:space:]]+Tests=77([,[:space:]]|$)' "$test_workspace/tests.log" \
  || ! grep -Eq '^Result: PASS[[:space:]]*$' "$test_workspace/tests.log"; then
  echo 'O runner não confirmou três suítes, 77 asserções e Result: PASS.' >&2
  exit 1
fi
echo 'Validação concluída: 15 migrations, três suítes e 77 asserções aprovadas.'
