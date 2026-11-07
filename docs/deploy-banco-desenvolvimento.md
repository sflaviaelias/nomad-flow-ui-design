# Aplicação manual do banco go-nomad-dev pelo GitHub Actions

Branch: `dev/supabase-development-deploy`, baseada em
`dev/supabase-integration-preparation`. Workflow: **Banco go-nomad-dev — manual**.
Nenhum dos modos foi executado durante a preparação. Nenhum projeto remoto,
setting de Auth/Data API ou deployment Lovable foi acessado/alterado.

## Desenho e limites

- Só `workflow_dispatch`, sem push/PR/schedule. Duas opções: `dry-run` (padrão)
  e `apply`; apply exige digitar **mksylwolwshpxhfrgldq** sem preenchimento automático.
- Destino fixo no código: **go-nomad-dev / mksylwolwshpxhfrgldq**. Nenhum input
  escolhe outro projeto. GET autenticado da Management API confirma id, nome e
  ACTIVE_HEALTHY antes de qualquer conexão SQL.
- PostgreSQL 17.11, banco postgres, usuário postgres e leitura obrigatória são
  conferidos por SELECT. Uma atualização de versão exige revisão; não há fallback.
- Bootstrap exige schema public sem objetos de aplicação, zero usuários e
  histórico vazio/ausente. Histórico completo das 15 versões é aceito como no-op;
  histórico parcial/desconhecido interrompe para revisão, sem reparação automática.
- CLI 2.54.11 fixo, download oficial com SHA-256. Uma cópia temporária recebe
  somente os 15 SQLs originais conferidos pelo manifesto. Não há renomeação,
  seed, novos papéis customizados, Docker, link ou publicação de funções.
- Aplicações são serializadas; uma execução não cancela outra. Checkout com
  permissão mínima de leitura e credenciais não persistidas. Segredos ficam
  disponíveis somente na etapa que precisa da conexão.

## Por que não usar supabase link

Foi revisado o código do CLI 2.54.11: `internal/link/link.go`, função
`linkDatabase`, chama `CreateMigrationTable` e `CreateSeedTable`.
Logo, link pode criar objetos mesmo antes de um dry-run. Não é usado aqui.

O workflow utiliza `migration list --db-url` e `db push --db-url --dry-run`.
O URL contém apenas host/usuário/porta, nunca senha. `PGPASSWORD` vem do Secret.
Tanto o URL quanto PGOPTIONS impõem `default_transaction_read_only=on` no
dry-run e nas inspeções. O código do CLI em `internal/db/push/push.go` retorna
a previsão antes de aplicar SQL; `pkg/migration/list.go` lê histórico ausente
como vazio, sem criá-lo. A conexão somente leitura é uma proteção adicional.

Somente depois da confirmação de apply é aberta uma conexão de escrita para
`db push --yes`. O CLI registra os timestamps originais em seu histórico.
Depois, nova conexão somente leitura exige as 15 versões exatas em ordem.

TLS usa verify-full e o bundle público de CAs do Ubuntu. Não há relaxamento de
certificados. Logs são filtrados e não incluem comandos com senha; não existem
artifacts de credenciais. Arquivos temporários são removidos e o runner hospedado
é descartado após o job. Nunca habilitar shell tracing ou debug do CLI.

## Configurar GitHub de forma segura — tarefa do administrador

Em **Settings → Environments**, criar **go-nomad-dev**. Configurar:

| Tipo | Nome | Origem/uso |
| --- | --- | --- |
| Environment Secret | `SUPABASE_DEV_ACCESS_TOKEN` | Token de acesso da conta Supabase, com o menor escopo disponível para ler metadados do projeto. Usado apenas no GET de identidade; não é chave publishable/service_role. |
| Environment Secret | `SUPABASE_DEV_DB_PASSWORD` | Senha do banco exclusivamente de go-nomad-dev. Fornecida ao processo por PGPASSWORD, não por argumento/URL. |
| Environment Variable | `SUPABASE_DEV_DB_HOST` | Apenas o hostname do Dashboard → Connect → **Session pooler**, sem usuário, senha, porta ou URL completa. |

O pooler de sessão usa porta **5432**, com usuário calculado como
`postgres.mksylwolwshpxhfrgldq`; a porta transacional 6543 não é aceita.
O host oficial segue `aws-N-REGIAO.pooler.supabase.com`. Host direto
`db.mksylwolwshpxhfrgldq.supabase.co` também é aceito, mas pode exigir IPv6 que
não esteja disponível no runner. Não copiar o hostname de outro projeto.

Não colocar valores em YAML, Git, issues, logs ou chat. Não é necessária chave
anon, publishable ou service_role. Se a senha não estiver disponível, parar e
obter acesso pelo procedimento administrativo autorizado; não fazer reset automático.

No Environment, permitir deployments somente de `dev/supabase-development-deploy`.
Configurar revisores obrigatórios e impedir autoaprovação se o plano permitir.
A aprovação do Environment se aplica aos dois modos. Se esses recursos não
estiverem disponíveis, registrar a limitação de governança; não afirmar que uma
segunda pessoa aprovou. Sem suporte a armazenamento seguro dos secrets, não executar.
Quem pode modificar a branch/workflow tem influência sobre o uso dos secrets:
revisar o commit escolhido antes de autorizar o job.

## Registrar o workflow

GitHub exige o arquivo de workflow na branch padrão para habilitar a execução
manual. O novo `database-dev-deploy.yml` precisa ser registrado em main numa
mudança separada e autorizada. Não houve merge nesta tarefa. Não trocar a branch
padrão como contorno; enquanto não houver registro, o botão pode não aparecer.

## Execução manual futura — não realizada

1. Abrir **Actions → Banco go-nomad-dev — manual → Run workflow**.
2. Selecionar **dev/supabase-development-deploy** e revisar o commit.
3. Para inspeção, escolher **dry-run**, deixar confirmação vazia e executar.
4. Conferir identidade, PostgreSQL 17.11, histórico e as 15 migrations previstas.
   Não interpretar o sucesso como aplicação: este modo não altera objetos.
5. Para aplicar, após revisão do dry-run, iniciar **outra execução manual** do
   mesmo commit. Escolher **apply** e digitar **mksylwolwshpxhfrgldq**.
6. Obter aprovação do Environment, quando configurada, e conferir a validação
   final das 15 versões. Guardar a URL da execução para auditoria.

Os comandos efetivos são `supabase migration list --db-url <URL sem senha>`,
`supabase db push --db-url <URL sem senha> --dry-run` e, exclusivamente em apply,
`supabase db push --db-url <URL sem senha> --yes`. O script fixa o destino e as
opções TLS/leitura; não substituir esses parâmetros manualmente.

Antes do bootstrap, manter frontend desconectado e sem usuários. Como o histórico
tem políticas permissivas intermediárias, avaliar uma janela com Data API
desabilitada por ação administrativa separadamente autorizada. O workflow não
muda settings de Data API/Auth e não torna o pacote inteiro uma transação única.
Em falha/timeout pode existir histórico parcial: parar e revisar, sem repetir
cegamente, resetar ou executar repair. O usuário postgres tem permissões elevadas
porque as migrations incluem auth/storage; proteger a senha e o acesso ao job.

## Validação desta preparação e bloqueios

- Oito testes offline passaram com API/CLI/SQL simulados: confirmação, identidade,
  URL/TLS/read-only, estados inesperados, erro do CLI e separação dos dois modos.
- Os nove testes existentes do roteiro local/sanitizador também passaram: 17
  testes offline ao todo, sem iniciar Docker ou banco.
- Workflow validado com Actionlint; Bash dos blocos validado estaticamente.
- Os 15 nomes, timestamps e SQLs correspondem ao manifesto original.
- Nenhuma conexão ou execução remota foi realizada. As 77 asserções aprovadas
  anteriormente são do CI local, não uma validação do PostgreSQL remoto 17.11.
- Ainda faltam configurar Environment/secrets/host, registrar workflow na branch
  padrão e validar conectividade/TLS reais. Se a CA do servidor não for confiável
  pelo bundle do runner, parar e revisar a CA oficial; nunca desativar verificação.
- O aviso de Node 20 da action checkout existente permanece como manutenção
  separada; o workflow anterior rodou com a mesma revisão fixa.

Referências de código auditado:
[link](https://github.com/supabase/cli/blob/v2.54.11/internal/link/link.go),
[push](https://github.com/supabase/cli/blob/v2.54.11/internal/db/push/push.go),
[histórico](https://github.com/supabase/cli/blob/v2.54.11/pkg/migration/list.go).
