#!/usr/bin/env bash
# Executa somente em uma cópia descartável, sem .env ou vínculo de projeto remoto.
set -euo pipefail

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

test_workspace="$(mktemp -d /tmp/go-nomad-db-XXXXXXXX)"
cleanup() {
  local outcome=$?
  trap - EXIT
  "$supabase_bin" stop --workdir "$test_workspace" --no-backup >/dev/null 2>&1 || true
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
"$supabase_bin" start --workdir "$test_workspace" \
  -x studio,imgproxy,realtime,edge-runtime,logflare,vector,supavisor \
  >"$test_workspace/start.log" 2>&1 || {
    echo "Falha na inicialização; consulte $test_workspace/start.log localmente." >&2
    exit 1
  }
"$supabase_bin" db reset --local --workdir "$test_workspace"
"$supabase_bin" test db --workdir "$test_workspace"
