# Primeira jornada de desenvolvimento

Branch: `dev/first-user-journey`, baseada em `dev/supabase-development-deploy`.

## Funcionalidade preparada

Cadastro com confirmação de e-mail, retorno em `/auth/confirm`, login e logout compartilham uma única sessão. O perfil é criado pelo trigger do banco; o frontend consulta e atualiza o perfil existente, sem criar outro.

`/trip/new` salva uma viagem básica sem depender de IA. O formulário valida destino, datas e orçamento BRL, bloqueia duplo envio e reutiliza o mesmo UUID em uma tentativa com resposta perdida. `/trips` lista os registros do usuário; `/trip/:tripId` consulta o registro real. Consultas filtram o proprietário, mas a proteção efetiva continua sendo o RLS do banco. Logout e troca de conta cancelam consultas e limpam cache, sessão e tentativas locais. Em falha de rede no logout, a interface informa que a revogação no servidor não foi confirmada.

O antigo formulário duplicado em `/auth` encaminha ao login. Recuperação de senha, OAuth, edição de viagens e agentes de IA ficam fora desta entrega.

## Correção de segurança pendente

A migration `20261107000500_restrict_rls_auto_enable.sql` revoga EXECUTE de PUBLIC, anon e authenticated quando `public.rls_auto_enable()` existe e retorna event_trigger. Não recria a função nem altera seu corpo, SECURITY DEFINER, search_path ou o trigger `ensure_rls`. A execução administrativa do event trigger continua sendo o mecanismo de ativação automática do RLS; usuários da API não precisam chamar essa função.

O teste adicional aplica a migration real e verifica oito condições: permissões, definição preservada, SECURITY DEFINER, vínculos dos triggers e ativação do RLS em novas tabelas. Usa uma fixture somente quando o Supabase local não fornece a função. A fixture valida o mecanismo; não substitui uma futura verificação do objeto real no projeto.

Nenhuma migration desta entrega foi aplicada remotamente.

## Validação e limites

- `npm test`: 12 testes de frontend, com Supabase simulado. Incluem confirmação, login, criação, consulta, logout, troca de conta, resposta perdida, erros e prevenção de duplicação. Não provam integração real nem RLS remoto.
- `python3 -m unittest discover -s scripts/tests -v`: 19 testes offline.
- `npx tsc --noEmit -p tsconfig.app.json` e `npm run build`: checks de TypeScript e compilação.
- Lint: 42 erros e 12 avisos preexistentes restantes; baseline era 46 erros e 12 avisos. Nenhum diagnóstico novo.
- As 15 migrations originais permanecem intactas. Seu histórico de 77 asserções aprovadas é anterior a esta alteração.
- O runner local/CI agora exige 16 migrations, quatro suítes e 85 asserções. Essa execução ampliada ainda precisa ocorrer: o Docker deste ambiente usa VFS e a extração das imagens excedeu o armazenamento disponível. Não repetir o download aqui.

O manifesto `docs/go-nomad-dev-migrations.sha256` e o deploy remoto continuam sendo o bootstrap imutável das 15 migrations originais. O script remoto rejeita a 16ª migration sem revisão, antes de conectar. Os testes desse bootstrap usam uma cópia isolada das 15 migrations e verificam a rejeição de uma migration extra. Não contornar essa proteção para publicar a correção.

## Próximos passos, sem executar operações remotas nesta entrega

1. Executar manualmente o workflow de testes de banco existente no GitHub, selecionando esta branch. Exigir `Files=4, Tests=85` e `Result: PASS`, com as 16 migrations confirmadas. O workflow usa somente Supabase descartável local ao runner.
2. Preparar uma alteração revisada de implantação incremental apenas da migration 16, com dry-run, histórico remoto e confirmação explícita do projeto `mksylwolwshpxhfrgldq`. A aplicação remota exige autorização separada; não usar reset, repair nem reaplicar o bootstrap.
3. Configurar `.env.development.local`, ignorado pelo Git, com `VITE_SUPABASE_URL=https://mksylwolwshpxhfrgldq.supabase.co` e `VITE_SUPABASE_PUBLISHABLE_KEY` pública do desenvolvimento. Nunca usar service_role ou senha no frontend. O arquivo `.env` legado não foi alterado e não é configuração válida para este teste. Validar com o checker offline indicado em `docs/ativacao-go-nomad-dev.md`.
4. No Supabase Auth de desenvolvimento, manter confirmação de e-mail habilitada e configurar Site URL `http://localhost:8080` e redirect permitido `http://localhost:8080/auth/confirm`. Revisar o template de confirmação para usar o link oficial com o redirect autorizado. Essas configurações ainda não foram alteradas. Se usar outro host de desenvolvimento, cadastrar exatamente esse host e caminho, sem alterar Lovable.
5. Iniciar a aplicação de desenvolvimento e usar uma conta de teste A: cadastrar, verificar a tela de e-mail pendente, confirmar o link, entrar e verificar perfil automático. Criar viagem com destino, datas e orçamento; anotar o ID da URL. Sair e verificar ausência de dados privados. Entrar novamente, localizar em Minhas viagens e abrir o mesmo ID. Repetir em novo contexto de navegador para demonstrar persistência no banco, não apenas cache.
6. Com conta B, confirmar lista separada e impossibilidade de obter a viagem de A pela URL ou API. Testar link expirado, credenciais inválidas, datas inválidas, perda de conexão e clique duplo. Confirmar que falhas de IA não participam do salvamento básico.

Somente após esses passos a jornada pode ser declarada validada no go-nomad-dev. Não há publicação, merge ou alteração do Lovable nesta entrega.

## Execução offline e reversão

Usar `npm ci`, `npm test`, `npx tsc --noEmit -p tsconfig.app.json`, `npm run build` e os testes Python acima. Os testes frontend configuram URL/chave fictícias e não usam Supabase remoto. Para compilar sem configuração real, podem ser usadas variáveis de ambiente com URL loopback e chave fictícia.

Antes de merge, basta voltar à branch base para deixar de usar estas alterações. Se necessário após integração, usar `git revert` do commit em uma branch revisada. Isso reverte arquivos, não configurações ou migrations já aplicadas; não desfazer permissões remotamente sem revisão específica.
