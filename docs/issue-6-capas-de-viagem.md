# Issue #6: experiência visual e capas por destino

Branch: `dev/issue-6-trip-visuals`, base `dev/incremental-rls-deploy`.

## Entrega

Minhas viagens e Detalhes da viagem preservam Inter, a paleta terracota/creme/marrom e os componentes de navegação existentes. Agora têm área grande de capa, nomes destacados, datas em pt-BR, duração inclusiva (primeiro e último dia), status calculado no calendário local e orçamento na moeda já salva. Estados vazios, carregamento, erro e foto quebrada usam o mesmo estilo. Não há dados de viagem fictícios no produto.

A nova Edge Function `trip-destination-cover` recebe **apenas tripId**. Valida a sessão no Supabase Auth e consulta a viagem usando RLS e o proprietário explícito antes de acessar o cache privilegiado. O destino vem do banco; nunca de parâmetros arbitrários do cliente. A chave fotográfica fica somente no backend. Criação de viagens, autenticação e tabelas existentes não foram alteradas. A função antiga `destination-image-unsplash`, insegura para esta finalidade por aceitar texto e o primeiro resultado sem validar localização, não é usada por estas telas e não foi alterada para preservar consumidores legados.

## Escolha do provedor

| Aspecto | Unsplash — escolhido | Pexels |
| --- | --- | --- |
| Uso/licença | Licença geral permite amplo uso gratuito, sujeita a restrições; a integração API também precisa cumprir suas diretrizes específicas | Licença geral também permite amplo uso gratuito, sujeita às restrições e aos termos da API |
| Crédito | SDK oficial exige atribuição ao fotógrafo, hotlink da URL fornecida e tracking de seleção/download | Planejar crédito ao fotógrafo/Pexels e revisar as exigências atuais da API antes de usar |
| Identificação do local | Endpoint de detalhe oferece `location.country`, `location.city` e coordenadas; pode haver ausência de metadados | O tipo Photo do SDK oficial oferece imagem, título/alt e fotógrafo, sem campos equivalentes de país/cidade/coordenadas |
| Limites de referência | Demo costuma oferecer 50 requisições/hora; produção depende de aprovação (referência usual: 5.000/hora) | Referência usual: 200/hora e 20.000/mês, com ampliação sujeita a aprovação |
| Adequação | Permite validar mais do que a semelhança textual da busca | Exigiria outra fonte de confirmação geográfica para o mesmo nível de cautela |

**Limite da pesquisa:** as páginas comerciais/documentação dos dois provedores foram bloqueadas pela política de rede deste ambiente. Foram consultados os repositórios oficiais abaixo, inclusive as exigências explícitas do SDK Unsplash e o schema Photo do Pexels. Os números acima são referências para dimensionamento, não uma confirmação dos termos vigentes da conta. Antes de ativar, revisar licença, diretrizes e quota no painel do provedor; termos de API podem ser mais restritos que a licença geral. Nenhuma conta/chave foi criada, nenhum provedor foi chamado com credenciais e nenhuma imagem real foi validada nesta tarefa.

Fontes oficiais:

- https://github.com/unsplash/unsplash-js (README: confidencialidade da chave, hotlink, atribuição e tracking).
- https://unsplash.com/documentation e https://unsplash.com/license — revisar na ativação.
- https://help.unsplash.com/en/articles/2511245-unsplash-api-guidelines — revisar na ativação.
- https://github.com/pexels/pexels-javascript/blob/master/src/types.ts e https://github.com/pexels/pexels-javascript/blob/master/readme.md.
- https://www.pexels.com/api/documentation/ e https://www.pexels.com/license/ — revisar na ativação.

## Correspondência geográfica e estabilidade

- Resolução conservadora por aliases exatos: Albânia, Brasil, Portugal, França, Espanha, Itália, Reino Unido, Japão, Estados Unidos, Argentina, Chile, Peru, Grécia e Alemanha, com aliases pt/en e alguns nomes locais.
- Cidades suportadas exigem **cidade e país**, por exemplo `Porto, Portugal`, `Paris, França` e `Tirana, Albânia`. O catálogo inicial também contempla Lisboa, Rio de Janeiro, São Paulo, Recife, Barcelona, Roma, Londres e Tóquio. `Porto`, `Paris`, `Georgia`, combinações de destinos e locais desconhecidos usam fallback; não se presume um país. Ampliar cobertura exige ampliar/testar os aliases, sem adivinhar locais.
- Busca até três candidatos paisagem e consulta seus detalhes. Exige país correspondente, cidade quando especificada e coordenadas válidas. Para Albânia, exige também coordenadas dentro dos limites aproximados do país. Rejeita URLs externas ao Unsplash, país/cidade divergentes, geotag ausente e retratos. Título da busca sozinho não comprova o local.
- A geotag é fornecida pelo provedor/fotógrafo, não uma verificação visual independente do conteúdo. Falsos metadados não podem ser excluídos com certeza absoluta por esta API; a implementação não aceita divergências conhecidas e prefere fallback em caso de dúvida. Validar amostras reais na ativação, especialmente Albânia.
- Hotlink preserva a URL original, incluindo parâmetros do Unsplash. Créditos usam links com `utm_source=go_nomad&utm_medium=referral`. A escolha automática chama o endpoint oficial de download/tracking uma vez na seleção; reabrir não faz nova seleção.
- `trip_covers` guarda uma referência por viagem no banco. Requisições concorrentes têm uma reserva de 90 segundos e chave de comparação, evitando seleções conflitantes. Uma foto pronta não é substituída em reload/login. O frontend só exibe uma seleção depois de persistida.
- Falta de foto, erro e quota esgotada são cacheados por 24 horas. Destino alterado invalida a seleção anterior. Se o processo parar, a reserva expira e permite recuperação. Uma URL quebrada mostra fallback, sem trocar silenciosamente por outra foto.
- Cada seleção nova faz no máximo cinco chamadas ao Unsplash: busca, até três detalhes e tracking. O cache evita chamadas a cada visualização. A quota da conta ainda precisa ser dimensionada; não prometemos cobertura universal.
- A chave React Query inclui usuário, viagem e destino; usa a limpeza de cache no logout já existente. O banco mantém a referência para reutilização entre dispositivos/sessões. Não são enviados ao Unsplash usuário, ID da viagem, orçamento ou datas, apenas o destino desambiguado.

## Configuração preparada, ainda não executada

O novo visual funciona com fallback sem qualquer configuração adicional. Fotos ficam desabilitadas por padrão até a preparação do backend.

Frontend, somente em `.env.development.local` ignorado pelo Git:

```dotenv
VITE_SUPABASE_URL=https://mksylwolwshpxhfrgldq.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<chave-publica-do-desenvolvimento>
VITE_TRIP_COVERS_ENABLED=false
```

Secrets da **Edge Function de desenvolvimento**, nunca `VITE_*` nem GitHub código:

- `UNSPLASH_ACCESS_KEY`: Access Key da aplicação Unsplash, mantida confidencial.
- `TRIP_COVER_ALLOWED_ORIGIN`: uma origem exata, por exemplo `http://localhost:8080`, sem barra/caminho. Deve corresponder ao host usado no navegador.
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`: variáveis internas fornecidas pelo runtime Supabase; a service role é usada somente no backend, depois de verificar propriedade. Não inserir esses valores privados no frontend nem copiá-los para chat/log.

Passos posteriores, sujeitos à revisão/autorização de acesso e alteração remotos:

1. Executar manualmente o CI de banco nesta branch. Esperado: **17 migrations, cinco suítes, 95 asserções e Result: PASS**. As dez novas asserções de RLS ainda não foram executadas aqui; o resultado anterior de 16/85 não as cobre.
2. Confirmar o histórico remoto e revisar um plano incremental exclusivo para `20261108000100_trip_destination_covers.sql`. A migration cria apenas o cache opcional, FK com exclusão em cascata, checks e RLS de leitura pelo dono. `anon` não acessa; `authenticated` não insere/altera/exclui; `service_role` pode gravar. Não há trigger que modifique a criação de viagens.
3. Aplicar essa migration somente após aprovação específica. **Não usar os workflows existentes de bootstrap (15) ou delta 16 com esta branch de 17 migrations**: continuam bloqueando SQL extra. Seus manifestos e todos os 16 arquivos anteriores foram preservados. Os testes do delta 16 usam agora fixture isolada da release aprovada e continuam verificando rejeição de arquivos extras.
4. Após revisar termos e criar a aplicação no Unsplash, configurar os secrets no projeto exato `mksylwolwshpxhfrgldq` pelo painel seguro, sem colocar valores em comandos versionados. Não alterar o projeto antigo nem o Lovable.
5. Publicar exclusivamente a nova função, com Project Ref explícito. Comando proposto, **não executado**:

   ```sh
   supabase functions deploy trip-destination-cover --project-ref mksylwolwshpxhfrgldq
   ```

   Não usar `--no-verify-jwt`; a função também valida o token via `auth.getUser`. O `supabase/config.toml` legado aponta para outro projeto e não foi alterado: não confiar em seu project_id nem publicar todas as funções. Revisar compatibilidade do JWT no ambiente de desenvolvimento sem remover a validação interna.
6. Alterar apenas a configuração local de desenvolvimento para `VITE_TRIP_COVERS_ENABLED=true`, reiniciar Vite e usar uma conta de teste. Criar Albânia; confirmar foto com crédito e correspondência geográfica, ou fallback correto. Abrir detalhes, recarregar, sair/entrar e conferir mesma referência no banco. Testar cidade com país, destino desconhecido, falha de API, URL inválida e uma segunda conta sem acesso às capas da primeira.

Para desativar fotos, voltar a flag para false e reiniciar o frontend. Isso não altera viagens nem apaga registros do cache. Não executar SQL destrutivo para reverter o visual.

## Testes e limites

- `npm test`: **34 aprovados**, incluindo os testes existentes da jornada e novos testes de geografia, cache, concorrência, falhas, imagem quebrada, atribuição, flag e isolamento de chaves por usuário.
- `python3 -B -m unittest discover -s scripts/tests -v`: **27 aprovados**; a saída pgTAP nesses testes é simulada para testar o runner, não execução real de SQL.
- TypeScript do frontend, Deno check da Edge Function, build, Actionlint, sintaxe Bash e sintaxe SQL: aprovados. Deno usou CA do sistema, com TLS verificado.
- Lint: 42 erros e 12 avisos preexistentes, sem novos diagnósticos. Build mantém o aviso de chunk grande existente.
- Chromium automatizado em 390px e 1440px, com API/sessão simuladas: lista → detalhes → lista, sem overflow horizontal nem erro de runtime. Screenshots locais em `/tmp/nomad-issue6-*.png`, usando fallback. Não equivale à integração real com Supabase/Unsplash.
- Não rodamos pgTAP real nem Docker nesta tarefa devido à limitação de armazenamento/VFS já identificada neste ambiente. Não acessamos banco remoto, não publicamos função/frontend e não alteramos Lovable.
