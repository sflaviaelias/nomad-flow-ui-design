# Preparação da integração com go-nomad-dev

Branch: `dev/supabase-integration-preparation`, baseada em `dev/database-ci-tests`
(`ea3a3396fef012f6c34acd83d8a15b3a99e4d28a`). Nenhum projeto Supabase remoto
foi acessado. O deployment Lovable e o projeto pausado permanecem inalterados.

## Evidência de validação do banco

- [Execução 42395017960](https://github.com/sflaviaelias/nomad-flow-ui-design/actions/runs/42395017960):
  página pública conferida, status **Success**, branch `dev/database-ci-tests`,
  commit `ea3a3396fef012f6c34acd83d8a15b3a99e4d28a`.
- [Job 128470409933](https://github.com/sflaviaelias/nomad-flow-ui-design/actions/runs/42395017960/job/128470409933):
  página pública conferida, **succeeded**, duração de 3m23s.
- A API continua bloqueada por HTTP 403. Logs completos exigem autenticação no
  site; os trechos abaixo foram fornecidos pelo responsável pela execução:

```text
2026-11-07T17:13:16.0501897Z Recriando banco local e aplicando as 15 migrations em ordem.
2026-11-07T17:13:55.7682891Z Files=3, Tests=77,  0 wallclock secs ( 0.02 usr  0.01 sys +  0.02 cusr  0.01 csys =  0.06 CPU)
2026-11-07T17:13:55.7683471Z Result: PASS
2026-11-07T17:13:55.9030125Z Validação concluída: 15 migrations, três suítes e 77 asserções aprovadas.
```

O script nesse commit exige cada uma das 15 migrations no log, código de saída
zero, três suítes, 77 asserções e PASS para retornar sucesso. O job não ignora
falhas. Assim, o status público, o código auditado e os trechos fornecidos são
consistentes com aprovação dos testes de banco. Não houve download independente
do log integral. As migrations/suítes nesta branch não foram alteradas.

Essa evidência valida Supabase **local no CI**, com identidades SQL simuladas.
Não valida envio de e-mail, login HTTP, upload de bytes, React ou o banco remoto.
O aviso de depreciação do Node 20 na action de checkout não impediu esse job;
atualizar a action fica para manutenção separada.

## Configuração do frontend, sem conexão

O cliente lê `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`. Não contém
URL ou chave fixas. As funções chamadas diretamente derivam da mesma URL;
`supabase.functions.invoke` acompanha o cliente. `VITE_SUPABASE_PROJECT_ID` não
é usado para escolher o destino. `supabase/config.toml` também não configura o
destino do React e continua com o identificador legado, sem alterações.

O `.env` versionado ainda contém valores públicos antigos. **Não iniciar o app**
para testar a integração antes de configurar ambas as variáveis de development.
Não foi criado arquivo local com credenciais nesta preparação.

Quando a configuração for autorizada:

1. No dashboard, confirmar nome **go-nomad-dev**, organização e Project Ref.
   Não inferir o Ref pelo nome nem assumir que outro ID citado anteriormente é
   o projeto novo. URL/chave pública devem vir da mesma tela/projeto.
2. Se `.env.development.local` não existir, copiar `.env.example` para ele.
   Preservar qualquer arquivo existente. Preencher URL e chave publishable
   pública (ou anon pública legada); nunca service_role, secret ou senha.
3. Conferir overrides: variáveis exportadas no terminal têm prioridade;
   `.env.development.local` sobrepõe os arquivos genéricos no modo development.
4. Rodar a checagem offline, substituindo apenas o Ref público:

```bash
node scripts/check-supabase-development.mjs --project-ref PROJECT_REF_REAL_DO_GO_NOMAD_DEV
```

O verificador usa o carregamento real de variáveis do Vite no modo development.
Recusa o projeto antigo, URL diferente do Ref informado, campos ausentes e
formatos privados. Para anon JWT, confere somente metadados públicos, não a
assinatura. Chaves publishable são opacas: não é possível provar offline a qual
projeto pertencem ou se funcionam. A checagem não cria cliente nem acessa rede.

`.env.development.local` vale para `npm run dev` e `npm run build:dev`.
Não configura `npm run build` em modo production. Não alterar variáveis,
domínios, publicação ou integração do Lovable. Reiniciar Vite após mudar valores.
O novo arquivo é ignorado pelo Git; não compartilhar seu conteúdo pelo chat.

## Revisão de compatibilidade das 15 migrations

Todas foram revisadas e têm timestamps únicos no formato `<timestamp>_<nome>.sql`.
O manifesto `docs/go-nomad-dev-migrations.sha256` registra os 15 arquivos exatos.

| Ordem | Versão | Papel e compatibilidade |
| --- | --- | --- |
| 1 | 20250614182224 | Tabelas, foreign keys e RLS inicial; requer schemas Supabase auth/storage, não PostgreSQL puro. |
| 2 | 20250614210746 | Trigger histórico de e-mail; removido pela versão 20261107000100. Não parar aqui. |
| 3 | 20250615103002 | birth_date; corresponde ao mapeamento dos metadados de cadastro. |
| 4 | 20250615103535 | Políticas históricas de perfil; substituídas pela versão 20261107000200. |
| 5 | 20250615170036 | description em expenses. |
| 6 | 20250615170742 | payment_method/receipt_url; não cria bucket de recibos. |
| 7 | 20250615171334 | is_smart_trip com default false; não executa IA. |
| 8 | 20250615172612 | Políticas históricas de places; corrigidas para somente leitura. |
| 9 | 20250615190000 | Posts privados ao autor; fora da jornada prioritária. |
| 10 | 20250615210449 | Políticas históricas de avatars; todas substituídas no pacote corretivo. |
| 11 | 20250622222155 | Bucket público avatars e limite de 5 MB; exige privilégios apropriados em Storage. |
| 12 | 20261107000100 | Perfil automático para contas com e-mail; sincroniza e-mail e remove trigger redundante. Funções privilegiadas com search_path seguro. |
| 13 | 20261107000200 | Grants/RLS explícitos: isolamento de perfis/viagens/despesas; bloqueio de exclusão de perfil; places somente leitura. |
| 14 | 20261107000300 | Avatar público para leitura; escrita apenas em `<uid>.jpg/.jpeg/.png`, compatível com o frontend. |
| 15 | 20261107000400 | Proprietário obrigatório, destino não vazio, datas finitas em ordem, orçamento não negativo/finito ou NULL; índices. |

Compatibilidade comprovada no CI não revela o estado do projeto novo. Antes de
aplicar, conferir versão PostgreSQL, objetos existentes, histórico e políticas
automáticas. O CLI isolado gerará config atual, sem usar o config legado.
Conflitos de objetos, e-mails ou registros inválidos devem interromper o plano;
não apagar dados, usar repair ou forçar include-all para contornar diferenças.
O backfill de perfis não sobrescreve perfis existentes e pode falhar diante de
conflitos que exigem revisão. Não existe restauração de dados do projeto pausado.

## Plano exato de ativação — NÃO executado

Todos os blocos abaixo são propostas. As etapas remotas exigem autorização
explícita antes de execução. Não há script que as execute automaticamente.

### A. Preparar uma cópia local de ativação

Exigir Supabase CLI **2.54.11**, commit aprovado desta preparação e árvore limpa.
O operador precisa confirmar o Project Ref real antes de qualquer conexão.

```bash
supabase --version
git status --porcelain
sha256sum --check docs/go-nomad-dev-migrations.sha256
GO_NOMAD_DEV_REF='SUBSTITUIR_PELO_PROJECT_REF_REAL'
[[ "$GO_NOMAD_DEV_REF" =~ ^[a-z0-9]{20}$ ]] && [[ "$GO_NOMAD_DEV_REF" != hxjjdutzpzrchfkrbxcd ]] || exit 1
activation_dir=$(mktemp -d /tmp/go-nomad-dev-activation-XXXXXXXX)
supabase init --workdir "$activation_dir" --yes
cp -R supabase/migrations "$activation_dir/supabase/"
```

Impacto: somente arquivos temporários locais; sem .env, funções, seed, testes
ou vínculos antigos. Conferir a saída de versão e árvore limpa, não apenas
executar os comandos sem olhar os resultados. Não copiar chaves privadas.

### B. Primeira autorização: conexão e conferência do plano

```bash
supabase link --project-ref "$GO_NOMAD_DEV_REF" --workdir "$activation_dir"
supabase migration list --linked --workdir "$activation_dir"
supabase db push --linked --dry-run --workdir "$activation_dir"
```

Impacto: acessa o projeto remoto para vínculo/conferência; cria metadados locais
de vínculo. A simulação não aplica as migrations. Não considerar essa etapa
offline. Usar autenticação própria do operador pelo fluxo seguro do CLI, sem
senha, token ou URL com credenciais em argumentos, arquivos do Git ou chat.
Não iniciar login interativo nem solicitar valores privados nesta preparação.

Condição para continuar: dashboard confirma go-nomad-dev, banco novo/estado
conhecido e plano contém exatamente as 15 versões acima. Qualquer divergência
exige parar. Preservar a cópia de ativação e apresentar plano ao responsável.

### C. Segunda autorização: aplicação das migrations

Antes de aplicar, manter o projeto de desenvolvimento sem usuários de teste e
sem frontend conectado. Propor temporariamente desabilitar Data API no dashboard
do go-nomad-dev durante bootstrap, reabilitando apenas após as 15 versões:
o histórico contém políticas permissivas antes das correções. Essa alteração de
configuração remota também depende de aprovação; não afeta o Lovable.

```bash
supabase db push --linked --workdir "$activation_dir"
supabase migration list --linked --workdir "$activation_dir"
```

Impacto: cria tabelas, índices, triggers, políticas, grants e bucket avatars;
executa backfill de perfis e registra o histórico. A segunda linha confere as
15 versões aplicadas. Não usar --include-seed, --include-roles, --include-all,
db reset remoto ou migration repair. Não publicar Edge Functions nesta etapa.

Se falhar no meio, migrations anteriores podem ter sido aplicadas. Não prometer
rollback automático do pacote inteiro; parar, conferir histórico/erro e propor
correção revisada. Não destruir o banco como tentativa de recuperação.

## Configuração futura de Supabase Auth e Data API

- Habilitar o provedor e-mail/senha em go-nomad-dev; manter confirmação de e-mail
  habilitada no teste representativo. Cadastro pode criar conta/perfil sem sessão.
- Site URL: `http://localhost:8080`. Redirect permitido usado pelo código:
  `http://localhost:8080/`. Se usar `127.0.0.1`, cadastrar a origem e retorno
  exatos correspondentes. Não adicionar URLs de produção nem curingas amplos.
- O código atual retorna confirmação para `/`; não há callback dedicado. Corrigir
  o tratamento da sessão e garantir que o onboarding não intercepte esse retorno.
- Rever envio de e-mails, templates e limites de envio do plano Free; não assumir
  que todo signUp entrega sessão imediatamente. Não configurar SMTP privado agora.
- Após bootstrap, Data API habilitada expondo public, com RLS/grants finais
  conferidos. RLS automático não substitui as migrations ou os testes de acesso.
- Não habilitar OAuth para esta primeira jornada. Recuperação de senha aponta
  hoje para `/auth/reset`, rota inexistente; tratar em tarefa própria antes de
  prometer esse recurso. Não habilitar o retorno como se a tela já existisse.
- Após banco e Auth autorizados/configurados, conectar o frontend e usar somente
  contas/dados fictícios para testar signup, login e recuperação de viagens.

## Pendências do frontend para a jornada completa

| Área | Alteração necessária |
| --- | --- |
| Cadastro | Unificar os dois caminhos atuais; distinguir conta pendente de confirmação de sessão autenticada. |
| Perfil | Usar o perfil criado pelo banco; remover/deixar de depender do helper morto. Preservar preferências ao editar. |
| Login/saída | Restaurar sessão, tratar falhas e limpar dados privados/cache na saída/troca de conta; remover logs de sessão. |
| Viagem | Validar dados, enviar moeda explícita, retornar ID salvo, impedir duplicação/reenvio e encerrar loading em falha. |
| Recuperação | Criar rota por ID, detalhes reais e lista de todas as viagens; corrigir links atuais e separar erro de lista vazia. |
| Cache | Chaves com user.id e atualização após criação; não mostrar dados da conta anterior. |
| IA | Não deixar sugestões ou falhas de funções impedir salvamento; não publicar funções/credenciais agora. |

Nenhuma dessas mudanças funcionais foi implementada nesta preparação. Mesmo com
schema validado, a jornada React completa ainda não está pronta para aceite.

## Teste futuro e reversão

Depois das autorizações, testar com duas contas: A confirma e-mail, entra, cria
viagem e sai; entra novamente em outro contexto de navegador e recupera o mesmo
ID/dados. B não pode ler/alterar/excluir a viagem de A. Verificar também erros e
sessão expirada. Só então declarar a integração funcional.

Como nada remoto foi aplicado, a reversão atual é apenas reverter o commit de
preparação. Preservar arquivos locais do usuário. Se futuramente configurar
`.env.development.local`, removê-lo/ajustá-lo e reiniciar Vite muda a configuração
local, mas não desfaz migrations. Não sugerir reset remoto como reversão.

## Verificações desta preparação

- Build com URL/chave fictícias e TypeScript: passaram, sem iniciar o aplicativo.
- Sete testes Node do verificador offline e nove testes Python do roteiro com
  executáveis simulados: passaram. Nenhum deles conecta a banco.
- Checagem offline com valores fictícios e manifesto dos 15 arquivos: passaram.
- `git diff --check`: passou. Lint completo: 46 erros e 12 avisos preexistentes,
  nos arquivos anteriores, sem alteração de frontend nesta branch.
- `.env.example` vazio e `.gitignore` protegem arquivos locais e `supabase/.temp/`.
  Não foram configuradas chaves reais, executadas migrations, iniciados Docker
  ou disparados workflows nesta tarefa. A aprovação de 77 asserções vem do CI
  registrado acima, não de uma nova execução local.
