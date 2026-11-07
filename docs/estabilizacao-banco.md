# Estabilização local do banco — Go Nomad

Branch: `dev/database-stabilization`, derivada de `dev/supabase-env-preparation`.
Sem push, PR, merge, conexão remota ou alteração do deployment Lovable.

Para a preparação posterior de CI manual, consultar
[validação no GitHub Actions](validacao-banco-github-actions.md).

## O que muda

As 11 migrations históricas foram renomeadas para `<timestamp>_<nome>.sql`.
Cada timestamp e cada byte do SQL histórico foram preservados; a ordem permanece
igual. Quatro migrations posteriores corrigem o comportamento final:

| Arquivo | Responsabilidade |
| --- | --- |
| `20261107000100_stabilize_profiles.sql` | Remove o trigger redundante de e-mail, cria perfil na transação de cadastro, mapeia metadados e sincroniza e-mail com Auth. Recupera perfis ausentes sem sobrescrever existentes. |
| `20261107000200_stabilize_table_access.sql` | Substitui as políticas das quatro tabelas afetadas; define grants mínimos, isolamento por usuário, catálogo somente leitura e proibição de DELETE/TRUNCATE de perfil pelo cliente. |
| `20261107000300_secure_avatar_ownership.sql` | Remove as políticas permissivas históricas, inclusive a política antiga de exclusão, e restringe escrita ao caminho do usuário. |
| `20261107000400_validate_trip_integrity.sql` | Exige proprietário e viagem nas relações, destino não vazio, datas finitas em ordem e orçamento válido. Adiciona índices de consulta por proprietário/viagem. |

RLS significa que o banco filtra registros pela identidade autenticada, mesmo
que o navegador não aplique filtros. Grants definem quais operações um papel
pode tentar. Ambos são necessários e são exercitados nos testes.

## Decisões de compatibilidade

- A aplicação atual usa e-mail. Contas sem e-mail não recebem perfil fictício;
  suporte a telefone/outros métodos está fora desta entrega.
- `birthdate` vira `birth_date`; `country` do cadastro vira nacionalidade nas
  preferências, sem inventar país de residência. Nascimento inválido/futuro vira
  NULL, evitando bloquear o cadastro por metadados opcionais.
- O e-mail do perfil é obtido de Auth por trigger. O navegador não consegue
  reservar o e-mail de outra pessoa alterando seu próprio perfil. Alterações de
  e-mail feitas em Auth sincronizam o perfil, sem substituir suas preferências.
- Funções privilegiadas têm `search_path` vazio e execução direta revogada para
  clientes. Identificadores e e-mails vêm de Auth; metadados não dão privilégios.
- O upsert atual de perfil continua permitido apenas para o próprio ID. DELETE
  e TRUNCATE ficam indisponíveis ao cliente. Exclusão administrativa da conta
  continua sujeita aos relacionamentos históricos em cascata.
- Avatares continuam públicos para leitura, inclusive entre usuários. Escrita,
  atualização e exclusão exigem nome completo `<auth.uid()>.jpg`, `.jpeg` ou
  `.png`, aceitando extensão maiúscula. Isso corresponde ao frontend existente.
  Não são aceitas subpastas nem renomeação para o caminho de outra pessoa.
- Orçamento NULL significa não informado; zero é permitido. Negativos, NaN e
  infinitos são rejeitados. Uma viagem de um dia é válida.
- Não foram alterados frontend, funções de IA, comunidade nem o config.toml
  legado. O frontend ainda requer correções de confirmação de e-mail, cache,
  navegação e recuperação real dos detalhes, em tarefa própria.

## Testes automatizados

`supabase/tests/` usa pgTAP. Cada arquivo cria dados fictícios dentro de uma
transação e termina com ROLLBACK. As operações de clientes usam os papéis
`authenticated` e `anon`, com claims locais de identidades diferentes; não são
executadas como administrador para testar RLS.

- `profiles_test.sql`: perfil automático, metadados, fallback, upsert, e-mail
  controlado por Auth, isolamento e bloqueio de exclusão.
- `trips_test.sql`: criação/leitura/alteração, orçamento/checklist, validação,
  isolamento de viagens/despesas, troca de identidade e recuperação posterior.
- `catalog_storage_test.sql`: catálogo somente leitura, remoção de políticas
  antigas, escrita do próprio avatar, bloqueio de terceiros e leitura pública.

Esses testes exercitam o banco e metadados de Storage. Eles não simulam o
transporte HTTP, confirmação de e-mail, login real nem upload de bytes. Portanto,
mesmo quando passarem, ainda será necessário testar Auth e Storage pelas APIs
locais e a jornada no frontend. A recuperação de perfis preexistentes também
merece teste específico com um snapshot local que contenha contas sem perfil.

## Como executar com isolamento

Pré-requisitos: Supabase CLI 2.54.11, Docker local funcionando, Bash e acesso
às imagens oficiais. O instalador npm dessa versão pode não respeitar o proxy;
uma alternativa é baixar o release oficial e verificar o SHA-256 publicado.
Não desabilitar TLS ou checksums.

```bash
# Na raiz do repositório. Não necessita credenciais de projeto remoto.
SUPABASE_BIN=/caminho/para/supabase bash scripts/test-database-local.sh
```

O script cria uma cópia em `/tmp`, inicializa config local próprio e copia apenas
migrations/testes. Não copia `.env`, funções, `.temp` ou vínculos remotos. Inicia
o stack local, executa `db reset --local` e `test db`, preservando o código de
saída. Ao terminar, para somente esse stack sem guardar backup; em caso de erro,
preserva a cópia para diagnóstico. Conflitos de portas devem ser resolvidos sem
parar serviços de terceiros. O script não inclui comandos de push/deploy/link.

O CLI pode usar ECR ou o espelho oficial Docker Hub das imagens Supabase.
Se o ambiente permitir Docker Hub mas não ECR, a opção suportada é:

```bash
SUPABASE_INTERNAL_IMAGE_REGISTRY=docker.io SUPABASE_BIN=/caminho/para/supabase bash scripts/test-database-local.sh
```

Isso seleciona outro registry oficial; não desativa a política de rede ou TLS.
Se ambos estiverem indisponíveis, não é possível declarar os testes aprovados.

## Resultado desta execução

- Passou: comparação byte a byte dos 11 SQLs históricos com o commit de origem.
- Passou: 15 nomes no padrão esperado, timestamps únicos e ordem preservada.
- Passou: parser PostgreSQL nos 18 arquivos SQL e parser PL/pgSQL nas funções
  novas. Isso não verifica existência de objetos nem comportamento em execução.
- Passou: sintaxe Bash e `git diff --check`.
- Docker local respondeu normalmente. CLI 2.54.11 foi obtido do release oficial
  com SHA-256 verificado. A tentativa npm da versão 3.0.0 não funcionou por
  acesso ao diretório protegido; o instalador npm da série 2 tentou conexão sem
  proxy. O download oficial via proxy resolveu a obtenção do CLI.
- Inicialização falhou: ECR foi bloqueado pela política de rede. O espelho
  Docker Hub permitiu download, mas a extração da imagem
  `supabase/postgres:17.6.1.029` esgotou armazenamento no driver VFS deste ambiente
  (`no space left on device`). A limpeza automática devolveu o espaço.
- Nenhuma migration chegou a executar. As três suítes pgTAP não executaram;
  não há resultado funcional aprovado nem reprovado. A inicialização e suas
  novas tentativas foram interrompidas e o stack descartável foi parado.

Próximo passo: executar o roteiro em outro ambiente Docker local com capacidade
suficiente, preferencialmente com driver de armazenamento eficiente. Não alterar
o driver do daemon compartilhado para contornar este bloqueio. Somente depois de
passar os testes de banco validar Auth/Storage por HTTP e a jornada no frontend.

## Antes de qualquer aplicação remota futura

1. Exigir sequência local inteira aprovada, partindo de banco vazio.
2. Conferir que as 15 migrations foram reconhecidas e aplicadas.
3. Revisar grants e políticas efetivas. Políticas adicionais de Storage fora do
   histórico versionado podem reabrir permissões por OU e exigem revisão própria.
4. Só em tarefa autorizada, confirmar o destino e estado real do go-nomad-dev.
   Nunca usar o config.toml legado como prova do vínculo remoto.
5. Não expor o banco entre a aplicação do histórico permissivo e das correções.
6. Se houver dados antigos inválidos, a migration de constraints deve falhar e
   exigir revisão; não apaga nem corrige dados silenciosamente.

Renomear arquivos requer cuidado em bancos que já tenham histórico de migrations.
Esta entrega visa um banco novo: não executar repair/rebaseline em projetos
existentes. Recriar schema não restaura usuários ou dados do projeto pausado.
