# Issue #12 — navegação das viagens

Base: `dev/incremental-rls-deploy` (inclui o visual/capas da Issue #6).
Branch: `fix/issue-12-trip-navigation`.

## Correção

- `/trip/new`: seta do cabeçalho sempre navega para `/`, inclusive em acesso direto, sem depender do histórico.
- `/trip/:tripId`: apenas a seta do cabeçalho retorna a `/trips`; o link redundante foi removido. Nome acessível: “Voltar para Minhas viagens”.
- Botões mantêm área mínima de 44×44 px, usam type=button, foco visível e nome acessível; funcionam com toque, Enter e Space.
- Campos não salvos ficam em sessionStorage, por conta e por aba. Ao voltar/reabrir/recarregar a criação, o rascunho é recuperado sem criar viagem no banco. Ao salvar, reconhecer uma tentativa já gravada ou sair da conta, ele é removido. Outra conta não recebe os campos. Se o armazenamento falhar, a tela informa que não conseguiu guardar o rascunho.
- O comportamento de browser back e o replace após salvar foram preservados, evitando retornar ao formulário para reenviar a criação.
- Não foram alterados o schema, RLS, API de capas, internacionalização, visual das capas, persistência remota ou vercel.json. O cliente Supabase mudou apenas para limpar o novo rascunho local no logout.

## Validação

46 testes aprovados (12 novos): rotas diretas, retorno explícito, teclado, rascunho/restauração, limpeza, conta separada, browser back após salvar, viagem inexistente/excluída e proteção sem sessão, além dos testes anteriores de auth, persistência e capas. TypeScript e build aprovados. Lint conserva 42 erros e 12 avisos preexistentes, sem novos diagnósticos; permanece o aviso de chunk grande do build.

Chromium desktop e perfil de iPhone com toque: entrada direta na criação → Home → browser back/reload com campos restaurados; lista → criar → salvar → detalhes → browser back para lista sem nova gravação; detalhes por URL → retorno único à lista. Sem erros de runtime; API e sessão simuladas, sem Supabase remoto.

**Safari iOS permanece não verificado**: a instalação do WebKit foi bloqueada pela política de rede (`403 Domain forbidden`). Perfil de iPhone em Chromium não equivale ao Safari. Ainda validar em iPhone real: toque na seta, foco/nome via VoiceOver, acesso direto e back/reload com rascunho. Não foi introduzida edição/exclusão de viagens: essas ações não existem nas duas telas atuais; o retorno de um ID removido/indisponível é testado com dados simulados.

O rascunho é proteção proporcional ao MVP, restrita à mesma aba; fechar a aba/limpar armazenamento ou fazer logout pode descartá-lo. Não é um autosave remoto. Nenhum teste de criação/login contra o projeto real foi executado nesta tarefa.
