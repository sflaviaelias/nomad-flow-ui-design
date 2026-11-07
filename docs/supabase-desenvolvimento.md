# Supabase de desenvolvimento — Go Nomad

## Objetivo e limites desta preparação

Usar o projeto `go-nomad-dev` para desenvolvimento e testes, mantendo React e
Supabase. Esta alteração prepara configuração e documentação; não conecta,
vincula, publica funções, executa migrations nem altera projetos remotos.
O deployment existente do Lovable não foi alterado. Não publicar ou integrar
esta branch ao fluxo do Lovable sem uma revisão específica de deployment.

Branch: `dev/supabase-env-preparation`.
Base anterior à preparação: `0b5b72fe1c6670cbc14205092352d57acdcfcdc3`.

## Configuração encontrada e decisão

- O cliente tinha URL e chave pública fixas do projeto `hxjjdutzpzrchfkrbxcd`.
- O `.env` versionado também aponta para esse projeto. Ele foi preservado para
  não substituir configurações existentes; ignorá-lo no Git não remove seu histórico.
- `supabase/config.toml` mantém `project_id = "hxjjdutzpzrchfkrbxcd"`.
  Esse arquivo não seleciona o projeto usado pelo frontend. Não foi alterado
  nem utilizado para vincular o CLI a um projeto remoto.
- Chamadas de Edge Functions tinham URLs antigas ou relativas. Agora seus
  endereços derivam da mesma `VITE_SUPABASE_URL` usada pelo cliente.
- As chamadas via `supabase.functions.invoke` já seguem o cliente compartilhado.

O frontend agora lê `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`.
Sem os dois valores, apresenta erro explícito ao inicializar. Não existe
fallback no código para o projeto antigo. Porém, o `.env` legado ainda é uma
fonte de valores do Vite: não iniciar o aplicativo para testar o novo projeto
sem substituir **ambas** as variáveis localmente.

`VITE_SUPABASE_PROJECT_ID`, presente no arquivo legado, não é necessário para
o cliente. O nome `go-nomad-dev` não determina seu Project Ref: copie a URL
exata do dashboard quando essa configuração for autorizada.

## Preparação local, sem conexão

1. Permanecer nesta branch e conferir `git status`.
2. Consultar `.env.example`, que não contém credenciais reais.
3. Para preparar o arquivo local, verificar primeiro se `.env.local` já existe;
   preservar seu conteúdo se existir. Caso contrário, copiar `.env.example`
   para `.env.local`. Não iniciar o app enquanto os valores estiverem vazios.
4. `.env.local` é ignorado pelo Git. Variáveis exportadas no terminal têm
   precedência sobre arquivos; `.env.development.local` também pode sobrepor
   `.env.local` no modo development. Conferir nomes/origem sem imprimir chaves.
5. Reiniciar o Vite depois de alterar variáveis. Elas são incorporadas ao build;
   mudar o arquivo não reconfigura um bundle que já foi publicado.

Tudo que começa com `VITE_` pode ser visto no navegador. Usar somente chave
publishable ou `anon` pública. Nunca colocar senha do banco, `service_role`,
secret key, chave Groq ou OpenAI nesses arquivos do frontend.

## Configuração futura do go-nomad-dev — não executada

1. No dashboard, confirmar que o projeto aberto é exclusivamente `go-nomad-dev`.
   Copiar sua Project URL e chave pública para os dois campos de `.env.local`.
   Não reaproveitar chave do projeto antigo e não enviar valores pelo chat.
2. Confirmar que a Data API expõe o schema `public`. RLS automático não cria
   tabelas, perfis ou regras de negócio. Conferir também as permissões dos papéis
   `anon` e `authenticated`; RLS e permissões de tabela precisam funcionar juntos.
3. Revisar as migrations abaixo e as políticas automáticas eventualmente criadas
   no projeto novo. Validar primeiro em Supabase local descartável. Não executar
   `supabase db push`, SQL remoto ou migrations nesta etapa.
4. Em uma tarefa autorizada posterior, confirmar o Project Ref e o destino do
   CLI antes de qualquer vinculação ou execução. Inspecionar eventuais metadados
   locais de vinculação; o `config.toml` legado não comprova um destino seguro.
5. Configurar Auth para e-mail/senha em desenvolvimento. Definir Site URL e URLs
   de retorno para o endereço local usado, por exemplo `http://localhost:8080`.
   Escolher explicitamente a confirmação por e-mail e validar o retorno. Não
   adicionar URLs ou mudar configurações no projeto/deployment do Lovable.
6. Só depois da recriação revisada do schema, testar com contas fictícias:
   cadastro, leitura do próprio perfil e gravação/consulta de uma viagem.
   Os problemas existentes de criação de perfil e trigger de e-mail, abaixo,
   devem ser corrigidos em tarefa separada antes de declarar a jornada pronta.
7. Testar com duas contas que uma não lê/altera viagens e perfil da outra.
8. Edge Functions e suas credenciais são opcionais e ficam para outra tarefa.
   Não publicar funções nem cadastrar secrets agora.

O projeto novo não recupera usuários, viagens, arquivos ou histórico do projeto
pausado. Migrations recriam estrutura; não são um backup dos dados antigos.

## Inventário das migrations

Para reproduzir a estrutura histórica completa, a sequência é a ordem abaixo.
Não foram modificados arquivos SQL. A compatibilidade de execução ainda não foi
validada em um banco e o inventário não é aprovação para aplicação remota.

| Ordem | Arquivo em `supabase/migrations/` | Efeito |
| --- | --- | --- |
| 1 | `20250614182224_e24e575c-9875-4617-aeb7-34629e3792dd.sql` | Cria profiles, trips, expenses, places e community_posts; relacionamentos e RLS inicial. |
| 2 | `20250614210746_971857b7-11f4-4fb8-be75-029309014f38.sql` | Cria trigger de duplicidade de e-mail em profiles. |
| 3 | `20250615103002_606ebda4-d24c-484c-ac2a-98a36a96bc7b.sql` | Acrescenta birth_date ao perfil. |
| 4 | `20250615103535_85a9d5ca-afb1-4fa0-8393-901968d1880c.sql` | Permite inserir, atualizar e excluir o próprio perfil. |
| 5 | `20250615170036_e7251b32-6fba-41fd-ae28-3f338bd35053.sql` | Acrescenta description às despesas. |
| 6 | `20250615170742_160498c0-c962-4e46-957f-40d14c527dab.sql` | Acrescenta payment_method e receipt_url às despesas. |
| 7 | `20250615171334_e1eb2cd4-88ce-4505-9922-5769ea639f08.sql` | Acrescenta is_smart_trip às viagens. |
| 8 | `20250615172612_6d57f4a0-7a47-4092-b7d6-02b4f0b11011.sql` | Habilita RLS de places e operações para autenticados. |
| 9 | `20250615190000_community-posts-rls.sql` | Substitui políticas de community_posts por operações do autor. |
| 10 | `20250615210449_1dae4a3c-44b0-4508-80a7-76040a6b4d36.sql` | Define políticas de Storage para avatars. |
| 11 | `20250622222155_10ce06f8-986c-4973-9532-6f7c607bba74.sql` | Cria/ajusta bucket avatars público, limite de 5 MB e políticas adicionais. |

Para o fluxo de perfil/viagem, os arquivos 1, 3, 4 e 7 são diretamente relevantes.
Os demais completam o schema e comportamento históricos, incluindo despesas,
comunidade e fotos. O arquivo 2 reproduz uma regra antiga problemática, não uma
necessidade estrutural: não é recomendação para instalar esse trigger sem revisão.
Evitar aplicar uma seleção parcial ad hoc e perder o histórico de migrations.

### Revisões necessárias antes de executar

Atualização: os nomes históricos foram normalizados na branch de estabilização.
Os pontos abaixo registram o diagnóstico anterior às novas migrations corretivas;
consulte [estabilização do banco](estabilizacao-banco.md) para as soluções e testes.

- Os nomes agora seguem `<timestamp>_<nome>.sql`, com timestamps e SQL
  preservados. As quatro migrations corretivas vêm depois das 11 históricas.
  A execução local deve comprovar que todos os 15 arquivos são reconhecidos.
- Não há trigger de criação automática de profiles a partir de auth.users.
  Recriar o schema não resolve sozinho o cadastro → perfil → viagem.
- O trigger de e-mail pode rejeitar o `upsert` de um perfil já existente antes
  de o banco tratar o conflito. Requer correção própria, não feita aqui.
- As políticas de places permitem alterações por qualquer autenticado. As de
  avatars não verificam propriedade do arquivo. Há também política antiga de
  exclusão de avatar que o último arquivo não remove pelo mesmo nome.
- community_posts só permite leitura do autor. Isso reproduz o código histórico,
  mas não um feed compartilhado.
- A base Supabase fornece auth/storage; executar esses arquivos em PostgreSQL
  puro sem esses schemas não é equivalente. Policies de Storage exigem permissões
  apropriadas. Reexecução manual de CREATE TABLE/POLICY pode falhar.

## Edge Functions: configuração preparada, operação não validada

Todos os endereços agora seguem `<VITE_SUPABASE_URL>/functions/v1/<nome>`.
Isso não publica nem autentica automaticamente funções chamadas via `fetch`.
Headers existentes foram preservados; autenticação, permissões e funcionamento
dos provedores precisam de validação separada. O config.toml histórico desativa
verify_jwt em duas funções; revisar antes de qualquer deployment futuro.

Credenciais futuras ficam apenas no servidor: `GO-NOMAD-GROQ`, `OPENAI_API_KEY`
e `UNSPLASH_ACCESS_KEY`, conforme a função. Nenhuma é necessária para conferir
esta preparação estaticamente. Não foi implementado agente nem corrigidos os
fluxos de IA existentes.

## Verificações locais sem conexão com Supabase

Na raiz `/workspace/nomad-flow-ui-design`:

```bash
# Valores fictícios sobrescrevem o .env legado apenas neste processo.
VITE_SUPABASE_URL=http://127.0.0.1:54321 VITE_SUPABASE_PUBLISHABLE_KEY=chave-publica-ficticia npm run build
./node_modules/.bin/tsc --noEmit -p tsconfig.app.json
npm run lint
git diff --check
```

O build não inicia o aplicativo nem valida o banco. Não abrir o app para esta
verificação, pois sua inicialização consulta Auth. O lint tem falhas preexistentes;
comparar com a base e distinguir erros anteriores dos introduzidos na preparação.

Resultados desta preparação: build com valores fictícios e TypeScript passaram;
ESLint dos arquivos de configuração passou; lint completo reportou 46 erros e
12 avisos. A comparação dos diagnósticos dos sete arquivos TypeScript alterados
com a base não encontrou diagnósticos novos. A checagem de configuração isolada,
sem SDK/rede, rejeitou quatro combinações de valores ausentes/vazios e verificou
o encaminhamento dos valores fictícios normalizados ao construtor do cliente.
As cinco chamadas diretas de funções foram conferidas quanto ao uso da URL
compartilhada. Nenhum teste funcional remoto ou teste SQL foi executado.

## Como reverter

- Nada foi publicado ou migrado; não existe reversão remota a fazer.
- Preservar primeiro mudanças locais com commit de desenvolvimento ou cópia
  externa. As alterações não commitadas acompanham a troca de branch; apenas
  `git switch` não as desfaz.
- Se a preparação estiver commitada, usar `git revert <commit-da-preparacao>`
  depois de revisar o diff. Não usar reset destrutivo.
- Se ainda não estiver commitada, reverter somente os trechos desta preparação
  com revisão interativa (`git restore -p`) e remover os novos arquivos apenas
  depois de confirmar que não contêm trabalho posterior.
- Preservar ou remover `.env.local` conforme seu uso; ele não é versionado.
  Reiniciar o Vite ao trocar variáveis. A volta ao código antigo não restaura o
  projeto pausado: apenas restaura a configuração anterior.
- Não integrar/publicar esta branch no Lovable mantém o deployment atual intacto.
