# Validação de banco no GitHub Actions

Branch: `dev/database-ci-tests`, derivada de `dev/database-stabilization`.
Workflow: `.github/workflows/database-tests.yml` — **Validação local do banco**.

## Objetivo e isolamento

Executar as 15 migrations e três suítes pgTAP em Supabase local descartável,
no runner `ubuntu-24.04`. Não há eventos de push, pull request ou agendamento:
somente `workflow_dispatch`. Preparar e enviar esta branch não inicia o job.

Não são usados secrets do repositório ou credenciais de produção. O checkout
tem somente `contents: read`, usa uma revisão fixa e não persiste credenciais.
O token automático de leitura do GitHub é usado apenas pelo checkout.
Não existem comandos de link, db push, deploy ou conexão a banco remoto.

O Supabase CLI 2.54.11 é obtido do release oficial, com verificação SHA-256.
O teste reutiliza `scripts/test-database-local.sh`: cria config própria em uma
cópia temporária, sem copiar `.env`, funções ou vínculos do repositório.
O config.toml legado não é usado. As imagens vêm do registry oficial no Docker
Hub; seu download não é uma conexão com um projeto Supabase.

## Viabilidade no runner

O runner Ubuntu padrão é uma VM com suporte a Docker, diferente de
`ubuntu-slim`, que não serve para este caso. A documentação de runners padrão
lista 14 GB de SSD; memória/CPU variam conforme modalidade do repositório.
O espaço realmente livre e o consumo do stack precisam ser comprovados na execução.

O workflow mostra disco, memória e driver. Recusa VFS e menos de 10 GiB livres
antes de tentar baixar imagens. Esse limiar é uma proteção inicial, não uma
garantia de capacidade. Não apaga ferramentas ou serviços do runner para abrir
espaço. Se faltar recurso, falha sem recorrer a banco remoto. Timeout: 35 minutos.

## O que conta como aprovação

1. Verificação do roteiro com executáveis simulados.
2. Inicialização do stack local com serviços não essenciais excluídos.
3. `db reset --local` na cópia descartável, aplicando tudo desde zero.
4. Confirmação de cada um dos 15 nomes no log de aplicação do CLI fixo.
5. `test db` com código de saída zero e resumo `Files=3, Tests=77`, `Result: PASS`.

Falhas de comandos não são escondidas pelo pipeline de logs. Uma execução com
zero asserções ou migration não confirmada é rejeitada. Ao acrescentar migrations
ou asserções no futuro, atualizar os totais esperados de forma revisada.

O sanitizador remove chaves/JWTs/URLs de banco locais dos logs antes de gravar e
imprimir. Não são enviados artifacts com arquivos de configuração ou credenciais.
Um trap para o stack em saída normal ou erro; uma etapa `always()` tenta a limpeza
adicional, usando somente o caminho temporário registrado. Ao final do job, a VM
hospedada é descartada. Cancelamento/timeout podem interromper a limpeza explícita;
o descarte da VM continua sendo a última camada de isolamento.

## Limitação atual da execução manual

O GitHub exige que um workflow com `workflow_dispatch` exista na **branch padrão**
para habilitar o disparo manual. A branch padrão deste repositório é `main`, que
ainda não possui o arquivo. Portanto, enviar somente `dev/database-ci-tests` não
faz o botão aparecer nem torna a execução disponível via API/CLI.

Nenhum merge ou alteração de main foi feito. Registrar o workflow na branch
padrão requer uma etapa futura explicitamente autorizada, com revisão própria.
Não alterar a branch padrão do repositório como contorno.

## Passos exatos para executar manualmente

**Depois de o workflow estar registrado na branch padrão, em tarefa separada:**

1. Abrir `https://github.com/sflaviaelias/nomad-flow-ui-design/actions`.
2. Selecionar **Validação local do banco** na lista de workflows.
3. Clicar em **Run workflow**.
4. No seletor **Branch**, escolher **dev/database-ci-tests**.
5. Confirmar **Run workflow**, sem preencher secrets ou credenciais Supabase.
6. Abrir a execução criada e o job **Migrations e pgTAP**.
7. Conferir primeiro o erro inicial, se houver. Só considerar o banco validado
   quando o job concluir com sucesso e mostrar 15 migrations, três suítes e 77
   asserções aprovadas. Conferir também a etapa de limpeza.

Se a lista/botão não aparecer, não há registro na branch padrão ou falta permissão
de escrita/Actions habilitado. Não disparar workflow alternativo contra banco remoto.
Em repositório privado, verificar também cota/minutos e políticas da organização.

## Validação feita no Codex

- Actionlint 1.7.7, obtido com checksum oficial: workflow validado (sem ShellCheck,
  que não está instalado neste ambiente).
- Sintaxe Bash do script e dos blocos run conferida; YAML e evento exclusivamente
  manual conferidos.
- Nove testes Python passaram usando CLI e Docker **simulados**: caminhos de
  sucesso/erro, limpeza, versão de CLI, migration ausente, zero asserções e logs.
- As migrations e as três suítes pgTAP permanecem idênticas à branch de origem.
- Nenhum Docker, migration ou teste de banco foi executado nesta preparação.
- Nenhum workflow foi disparado. Não há resultado real das 77 asserções.

## Referências oficiais

- [Execução manual e requisito da branch padrão](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow)
- [Runners hospedados e recursos](https://docs.github.com/en/actions/reference/runners/github-hosted-runners)
- [Release do Supabase CLI 2.54.11](https://github.com/supabase/cli/releases/tag/v2.54.11)

Depois de passar no banco, ainda serão necessários testes locais de Auth/Storage
por HTTP e da jornada no frontend. Este CI não faz deploy nem aplica mudanças ao
`go-nomad-dev` ou ao deployment Lovable.
