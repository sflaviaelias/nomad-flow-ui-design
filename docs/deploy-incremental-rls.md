# Deploy incremental: somente migration 16

Destino fixo: **go-nomad-dev (`mksylwolwshpxhfrgldq`)**.
Workflow: `.github/workflows/database-dev-incremental.yml` — **Banco go-nomad-dev — migration 16 manual**.

## Garantias

- Nenhum disparo em push; apenas `workflow_dispatch`. Nenhuma execução foi iniciada nesta preparação.
- Usa o Environment existente `go-nomad-dev`, os secrets `SUPABASE_DEV_ACCESS_TOKEN`, `SUPABASE_DEV_DB_PASSWORD`, `SUPABASE_DEV_CA_CERT` e a variável `SUPABASE_DEV_DB_HOST`. Não mudar seus valores se já estão corretos. O certificado deve ser a CA oficial do projeto; host deve ser o Session pooler oficial ou host direto permitido. Porta 5432.
- TLS `verify-full`, CA explícita e validação de hostname permanecem obrigatórios. Senha somente via PGPASSWORD; valores de secrets não são impressos.
- Identidade conferida pela Management API: Project Ref, nome e estado ACTIVE_HEALTHY. SQL exige banco/usuário postgres, PostgreSQL 17.11 e conexão de inspeção somente leitura.
- SHA-256 das 15 migrations conferido pelo manifesto original, que não foi alterado. Um segundo manifesto fixa exclusivamente o arquivo `20261107000500_restrict_rls_auto_enable.sql`. Arquivos extras ou alterados bloqueiam o processo.
- Antes de qualquer escrita, exige histórico remoto exatamente igual às 15 versões abaixo, ou às mesmas 15 mais a 16ª já aplicada. Histórico ausente, parcial ou desconhecido é bloqueado. Se já tem as 16, apply é uma operação sem aplicação adicional.
- Cópia temporária contém as 16 migrations para o CLI comparar com o histórico. Com as 15 primeiras registradas, somente a 16ª é pendente; não se copia apenas a última, pois isso prejudicaria a comparação do histórico CLI. Nomes, timestamps e SQL não são alterados.
- Preview e consultas usam transações/conexão somente leitura. Apply exige confirmação exata, repete o dry-run e reconsulta o histórico imediatamente antes da escrita; depois exige as 16 versões registradas. A trava de concorrência é compartilhada com o bootstrap. Pausar outras operações administrativas durante a janela: a trava GitHub não bloqueia operadores externos.
- Não há reset, repair ou tentativa automática após falha. A única alteração SQL prevista é REVOKE EXECUTE da função; o CLI também registra a versão 16 em seu histórico. Corpo da função e event trigger permanecem intactos.

## Como executar o dry-run

1. Confirmar que a branch selecionada contém este commit e os testes de banco aprovados. Não selecionar main, branches antigas ou o workflow de bootstrap.
2. O GitHub exige que o novo workflow esteja registrado na branch padrão para disponibilizar seu disparo manual. Se ainda não estiver listado em Actions, preparar uma PR separada copiando **somente** `.github/workflows/database-dev-incremental.yml` para main e obter revisão/merge autorizado. Esta tarefa não fez esse registro nem merge. Depois usar a branch de desenvolvimento como referência de execução; ela contém o script e manifestos necessários.
3. Em **Actions → Banco go-nomad-dev — migration 16 manual → Run workflow**, selecionar a branch `dev/incremental-rls-deploy`, `mode: dry-run`, e deixar `confirm_project_ref` vazio. Aprovar o Environment, se a proteção existente exigir.
4. Alternativa após registro, com GitHub CLI autenticado:

   ```sh
   gh workflow run database-dev-incremental.yml --repo sflaviaelias/nomad-flow-ui-design --ref dev/incremental-rls-deploy -f mode=dry-run
   ```

## O que revisar nos logs

- `Projeto confirmado: go-nomad-dev (mksylwolwshpxhfrgldq); modo dry-run.`
- `Histórico remoto:` com estas 15 versões, em ordem:

  ```text
  20250614182224, 20250614210746, 20250615103002, 20250615103535,
  20250615170036, 20250615170742, 20250615171334, 20250615172612,
  20250615190000, 20250615210449, 20250622222155, 20261107000100,
  20261107000200, 20261107000300, 20261107000400
  ```

- `Migrations pendentes: 20261107000500_restrict_rls_auto_enable.sql`.
- Na tabela CLI: as 15 primeiras versões presentes em Local e Remote; somente `20261107000500` ausente em Remote.
- No preview CLI: somente o arquivo da migration 16, sem reaplicação das anteriores.
- Final: `Dry-run concluído em conexão somente leitura; nenhuma migration aplicada.` e job bem-sucedido. O resumo do workflow sozinho não substitui essa revisão.
- Se a 16ª já constar remotamente, deve aparecer `Migrations pendentes: nenhuma`; não é necessário apply. Em qualquer divergência, erro de TLS ou falha, parar. Não enfraquecer TLS nem usar reset/repair.

## Apply — somente após revisão e autorização posteriores

Não executar nesta tarefa. Depois de aprovar o dry-run do mesmo commit, disparar o mesmo workflow e branch com `mode: apply` e `confirm_project_ref: mksylwolwshpxhfrgldq`. O roteiro faz nova inspeção e novo preview; não reutiliza um plano antigo. Revisar o histórico final com as 16 versões e a mensagem `Histórico final verificado: 16 versões aprovadas`. Verificar posteriormente os avisos do Security Advisor e o comportamento do event trigger em uma inspeção autorizada. Não fazer teste DDL improvisado no projeto remoto.

Em falha de apply ou timeout, não repetir automaticamente: inspecionar o histórico antes de decidir o próximo passo. A comparação de versões não comprova os hashes do SQL histórico remoto; preservamos e verificamos os arquivos locais aprovados e a sequência remota registrada pelo CLI.

## Checks realizados

27 testes Python offline aprovados, incluindo preview sem escrita, apply confirmado, histórico exato, estado já aplicado, falha de preview, alteração concorrente do histórico, confirmação ausente, TLS estrito, arquivos alterados/extras e falha na verificação final. Mocks substituem API, CLI e SQL: não demonstram conectividade remota. Actionlint e hashes locais verificados. O resultado prévio de 16 migrations/85 asserções foi informado pelo responsável; esta tarefa não repetiu testes Docker nem executou migrations.
