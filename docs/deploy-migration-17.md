# Deploy incremental exclusivo da migration 17

Projeto fixo: **go-nomad-dev — mksylwolwshpxhfrgldq**.
Branch de execução: `dev/migration-17-deploy`.
Workflow: `.github/workflows/database-dev-trip-covers.yml` (**Banco go-nomad-dev — migration 17 manual**).
SQL autorizado: `20261108000100_trip_destination_covers.sql`.

## O que está preparado

O workflow é somente manual, sem eventos push/PR. Reutiliza Environment `go-nomad-dev`, secrets `SUPABASE_DEV_ACCESS_TOKEN`, `SUPABASE_DEV_DB_PASSWORD`, `SUPABASE_DEV_CA_CERT` e variável `SUPABASE_DEV_DB_HOST`. Não exige novos secrets. Mantém CA explícita, TLS `verify-full`, hostname validado, Session pooler na porta 5432 ou host direto autorizado, CLI 2.54.11 com checksum e a mesma trava de concorrência dos deploys anteriores. Senha segue apenas por ambiente, não pela URL/argumentos; a CA temporária é removida inclusive em falhas.

Antes de conectar, exige confirmação exata do Project Ref em **ambos** os modos, os três manifestos SHA-256, os 17 arquivos esperados e nenhum SQL extra. Os dois manifestos anteriores e todos os arquivos SQL permanecem intactos; o manifesto novo contém apenas a migration 17. Os modos bootstrap/delta 16 continuam rejeitando arquivos extras.

Na futura execução, confirma nome/Ref/status na API de gerenciamento e PostgreSQL 17.11, usuário/banco postgres e conexão de inspeção somente leitura. A seguir exige histórico remoto exatamente igual às **16 versões anteriores**, em ordem:

```text
20250614182224, 20250614210746, 20250615103002, 20250615103535,
20250615170036, 20250615170742, 20250615171334, 20250615172612,
20250615190000, 20250615210449, 20250622222155, 20261107000100,
20261107000200, 20261107000300, 20261107000400, 20261107000500
```

Histórico ausente, parcial, inesperado ou sem a migration 16 bloqueia antes do preview. Se já houver as 17 versões, não aplica novamente e verifica a segurança da tabela existente. Se `trip_covers` existir sem a versão 17, bloqueia em vez de tentar recriar ou reparar.

A cópia temporária local contém os **17 arquivos originais**, necessários à comparação do CLI; como as 16 primeiras versões já estão registradas, somente a última pode ficar pendente. Não usa include-all, seed, reset, repair ou alteração manual de histórico. Apply repete o preview e revalida o histórico e a ausência da tabela imediatamente antes de permitir a única chamada de escrita. Depois exige as 17 versões registradas e valida a segurança. Não há repetição automática após falha.

## Registrar o workflow sem levar código da aplicação para main

Nenhum registro/PR/merge foi executado nesta tarefa. Para o GitHub disponibilizar Run workflow, o arquivo precisa existir na branch padrão:

1. Em uma PR de registro separada, partir de main e copiar **somente** `.github/workflows/database-dev-trip-covers.yml` desta branch.
2. A diff dessa PR deve conter exatamente esse arquivo; não copiar scripts, manifestos, migrations, frontend ou vercel.json. Obter revisão e merge autorizados em outra tarefa.
3. Após o registro, disparar escolhendo **dev/migration-17-deploy**, não main. O checkout usa a branch selecionada, onde estão os scripts e manifestos necessários. Em main sem esses arquivos, o check offline falha antes de qualquer conexão.

O workflow é autocontido para registro: usa actions/checkout por SHA, instala o CLI e referencia os scripts da branch escolhida. Não é necessário mesclar o código da Issue #6 em main para registrá-lo.

## Executar dry-run — instruções futuras, não executadas aqui

1. Confirmar os secrets/host já configurados no Environment e revisar o commit exato desta branch. As proteções/revisores existentes do Environment continuam valendo.
2. Em Actions → **Banco go-nomad-dev — migration 17 manual** → Run workflow:
   - Branch: `dev/migration-17-deploy`.
   - `mode`: `dry-run`.
   - `confirm_project_ref`: `mksylwolwshpxhfrgldq`.
3. Alternativa com GitHub CLI, depois do registro:

   ```sh
   gh workflow run database-dev-trip-covers.yml \
     --repo sflaviaelias/nomad-flow-ui-design \
     --ref dev/migration-17-deploy \
     -f mode=dry-run \
     -f confirm_project_ref=mksylwolwshpxhfrgldq
   ```

Revisar **os logs completos**, não apenas o resumo:

- Projeto confirmado exatamente como acima e modo dry-run.
- Histórico remoto com as 16 versões listadas; na tabela do CLI todas presentes em Local e Remote.
- `Migrations pendentes: 20261108000100_trip_destination_covers.sql` e somente esse arquivo no preview CLI.
- `trip_covers ausente` é esperado no primeiro deploy: não é possível atestar permissões de uma tabela ainda inexistente sem criá-la.
- Final `Dry-run concluído em conexão somente leitura; nenhuma migration aplicada.` e job bem-sucedido.
- Se já houver 17 versões, deve aparecer `Migrations pendentes: nenhuma` e a confirmação de RLS/permissões; não precisa apply.

Qualquer divergência, falha de TLS, histórico parcial ou erro implica parar e revisar. Não remover as verificações, não usar outro banco e não reaplicar migrations anteriores.

## Apply — depende de autorização posterior

Não executar agora. Após aprovação do dry-run do mesmo commit, usar o mesmo workflow/branch, `mode: apply` e confirmação `mksylwolwshpxhfrgldq`. O workflow faz novamente todas as verificações e preview. A migration cria o cache e registra sua versão; não publica frontend nem Edge Function. Não dispara outros workflows.

Após a escrita, as consultas de catálogo, em transações somente leitura, exigem:

- `trip_covers` como tabela regular com RLS ativo;
- nenhum privilégio PUBLIC;
- anon sem SELECT, escrita ou grants de coluna;
- authenticated com SELECT, sem INSERT/UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER nem escrita por grants de coluna;
- service_role com SELECT/INSERT/UPDATE/DELETE, conforme a migration;
- exatamente uma política SELECT, `trip_covers_owner_read`, para authenticated, com a expressão de proprietário prevista, sem políticas adicionais que possam ampliar acesso.

Não basta encontrar auth.uid() no texto: a verificação rejeita expressões diferentes, inclusive OR true. O formato de saída do catálogo também é verificado estritamente; se diferir, parar para revisão, sem alterar a política automaticamente. Não são inseridas contas, viagens ou fotos para o pós-check.

Esperar `trip_covers: RLS, política de propriedade e permissões verificadas.` e `Histórico final verificado: 17 versões aprovadas`. Uma falha no pós-check **não desfaz** uma migration já confirmada: revisar histórico/segurança antes de qualquer nova ação; não repetir automaticamente nem executar rollback destrutivo.

## Validações e limites

44 testes Python offline aprovados: fluxos anteriores e 17 novos testes do delta 17, incluindo histórico exato, ausência da versão 16, confirmação em ambos os modos, SHA de SQL original/novo, SQL extra, TLS/CA, preview sem escrita, aplicação única, alterações concorrentes, tabela existente sem histórico, modo já aplicado e drift de RLS/permissões antes/depois do apply. API, CLI e SQL são simulados nos testes.

Actionlint, sintaxe Python/SQL e os três manifestos SHA-256 verificados. A migration 17 e os dez testes pgTAP existentes de trip_covers foram revisados, sem alteração: cobrem isolamento A/B, proibição de escrita do cliente, anon, checks e cascade. Não executamos pgTAP/Docker nem os workflows nesta tarefa; o CI de banco completo esperado continua sendo 17 migrations / cinco suítes / 95 asserções.

**Nenhum acesso ao Supabase remoto ocorreu**, portanto as 16 versões e as permissões remotas ainda não foram confirmadas por esta tarefa. Essa verificação está implementada como pré-condição do futuro dry-run/apply. O histórico compara versões registradas, não comprova o SQL executado anteriormente no servidor; os hashes preservam os arquivos locais aprovados. A trava GitHub não impede alterações por administradores externos: reservar janela sem operações concorrentes. PostgreSQL diferente de 17.11 também bloqueia e exige revisão.
