# Nexo

Mapa mental local, sem dependências, backend, login da aplicação ou API externa. HTML, CSS e JavaScript em módulos nativos, com IndexedDB. Não utiliza fontes, scripts ou recursos externos.

## Usar no computador

Com Node.js instalado, abra um terminal nesta pasta e execute `node start-local.cjs`. Abra **http://127.0.0.1:47863** no navegador. Esse processo apenas serve os arquivos estáticos; os projetos ficam no navegador. Mantenha o mesmo endereço e porta nas próximas sessões. Não abra index.html diretamente via file://.

## Dados e backup

- IndexedDB guarda projetos completos, blocos, notas, cores, posições, conexões, viewport e última edição.
- Cada mudança primeiro escreve um diário síncrono de recuperação em localStorage. Após 180 ms de inatividade, uma transação IndexedDB salva o estado. Só depois do sucesso o diário é removido. Ao abrir, o diário mais recente é recuperado antes de mostrar projetos.
- O indicador só confirma o salvamento depois de a transação terminar. Erros preservam o estado em memória e orientam a exportar JSON.
- Web Locks mantém uma única aba com permissão de escrita; outras abas abrem em leitura. Recarregue a aba depois de fechar a primeira para passar a editar.
- A aplicação solicita armazenamento persistente quando suportado. A concessão depende do navegador.
- JSON é um backup por projeto; importar adiciona projetos com novos IDs sem substituir os existentes e valida o arquivo completo antes de alterar dados.
- Os dados ficam separados por navegador, perfil e endereço. A prévia local e a versão hospedada possuem armazenamentos diferentes. Use JSON para transferir entre elas.
- Limpar os dados do site, apagar o perfil, usar modo privado ou perder o dispositivo pode apagar os projetos. Nenhum armazenamento local garante proteção contra essas ações: mantenha backups JSON.
- Desfazer/refazer guarda até 80 estados do mapa na sessão atual. Os projetos persistem; o histórico de desfazer reinicia ao reabrir.

## Arquivos

- `dist/app.js`: interface, operações do mapa, histórico, importação/exportação e atalhos.
- `dist/storage.js`: repositório local e recuperação. É o ponto de integração para futura sincronização, mantendo o modelo de projetos da aplicação.
- `dist/style.css`: temas, componentes e layout responsivo.
- `dist/index.html` e `dist/favicon.svg`: entrada e identidade visual.

Conexões podem formar mapas livres, inclusive ciclos. PNG exporta todos os blocos e conexões; notas completas permanecem no JSON. Imagens são limitadas a 6000 pixels por dimensão para reduzir consumo de memória. JSON importado aceita até 20 MB, 100 projetos, 5000 blocos e 10000 conexões por projeto.

## Validação desta versão

Sintaxe dos módulos verificada. Testados no navegador: abertura, criação de filha com Tab, edição de texto/notas/cor, recuperação após recarga, pesquisa e desfazer/refazer. Testes de persistência verificam recuperação do diário, confirmação IndexedDB e limpeza após commit. Testes JSON verificam preservação dos campos e rejeição de conexões e cores inválidas. A leitura WebMCP opcional foi validada com entrada válida e inválida.

## Adição solicitada: ideias de software

Na próxima recarga, o navegador que possui um único projeto chamado **Comparador de Preços** adicionará o ramo **IDEIAS DE PROJETOS**. Maiúsculas e acentos não interferem na identificação. Não são alterados textos, notas, cores, posições, IDs ou conexões que já existiam. Novos nós ocupam uma área separada à direita do limite atual do mapa, com dois conjuntos de ramos voltados para fora. A câmera passa a mostrar o novo nó principal.

O catálogo contém 40 projetos e 201 funcionalidades, divididos em oito categorias por cor. Cada projeto se conecta diretamente ao nó principal e contém problema, funcionamento, diferencial e hipótese de monetização nas anotações. Projetos já existentes com o mesmo título não são duplicados nem movidos.

A aplicação cria um backup integral do projeto original no IndexedDB, na loja `state`, com chave `before-software-ideas-40-v1-<id do projeto>`. A adição só ocorre após a confirmação desse backup. Marcadores no projeto e no workspace impedem repetições em recargas futuras. Se o nome não existir, houver dois projetos com esse nome ou a aba estiver em modo de leitura, nenhum mapa é modificado. A aba principal deve ser recarregada para aplicar a adição.

`dist/project-ideas.json` contém o catálogo; `dist/add-project-ideas.js` contém a adição específica solicitada. Não há mudança nos estilos ou controles da interface. Apenas conexões novas que seguem para a esquerda usam a direção correspondente; o desenho das conexões anteriores permanece igual. A exportação/importação JSON preserva essa direção.

## Compactação solicitada

Uma segunda migração de conteúdo reúne as 40 ideias em **18 propostas**, com **86 módulos visíveis**. Os 242 nós gerados originalmente passam a 105; blocos anteriores ou personalizados fora da consolidação permanecem. O alvo preferido é o projeto em minúsculas, `comparador de preços`, para distingui-lo do exemplo inicial.

O mapa anterior inteiro é copiado no IndexedDB antes da troca, sob `before-software-ideas-compact-v1-<id do projeto>`. A transformação é montada e validada em uma cópia antes de qualquer alteração no workspace. As anotações completas das ideias originais, os nomes das antigas funcionalidades e as notas personalizadas dessas funcionalidades ficam nos detalhes de origem dos produtos unificados. Blocos personalizados e relações externas continuam no mapa; relações com um nó consolidado passam ao sucessor correspondente.

Cada proposta indica por que os módulos combinam, uma primeira versão pequena e expansões futuras. QueueLess, FreelanceFlow, SpoilerSafe e TimeCapsule continuam como produtos independentes. `dist/compact-ideas.json` registra o agrupamento e `dist/compact-project-ideas.js` aplica a mudança uma única vez na próxima recarga da aba principal. O design não é alterado.

## Exploração e comparação das ideias

- O botão −/+ de um bloco recolhe ou expande seu ramo sem excluir dados. Caminhos compartilhados e ciclos são tratados sem duplicar nem perder nós.
- “Visualização” reúne recolhimento geral, legenda de cores, filtro por categoria e favoritos. “Limpar filtros” restaura a visualização. Use Centralizar para enquadrar os nós visíveis.
- Nos detalhes, “Focar neste ramo” limita a visualização à ideia e suas descendentes; “Voltar ao mapa completo” restaura todos os ramos.
- Anotações têm campos de proposta/problema, funcionamento, diferencial, primeira versão e monetização. As anotações anteriores continuam disponíveis em “Texto original e detalhes preservados”. Alterações estruturadas não reescrevem esse texto.
- Marque favoritos e selecione até três ideias para comparação. “Critérios para escolher” permite registrar público, dificuldade e hipóteses a validar. Valores não preenchidos aparecem como não definidos.
- O minimapa mostra a área visível e permite navegar com um clique. Busca inclui as novas anotações e critérios e reabre o caminho de uma ideia escondida.
- Favoritos, campos estruturados, critérios, foco, filtros, ramos recolhidos e comparação selecionada são salvos no projeto e preservados no JSON. O estado aberto/fechado dos painéis é apenas da sessão.
- `dist/explorer-model.js` contém regras de visibilidade e leitura não destrutiva das notas; `dist/explorer-ui.js` e `dist/explorer.css` contêm os novos controles.

Validação: testes automatizados cobrem ciclos, caminhos compartilhados, foco, filtros, favoritos, limite de comparação, busca, preservação das notas e exportação/importação dos novos campos. No navegador de teste, foram verificados foco, recolhimento, legenda, favoritos, comparação e recuperação das preferências após recarregar. Os dados do Brave não foram alterados durante esses testes.

## Apresentação guiada

No mapa, abra **Visualização → Montar apresentação**. Escolha as ideias e organize a ordem arrastando ou usando as setas. A apresentação mostra uma visão geral, a proposta de cada ideia e seus filhos progressivamente. Se houver pelo menos duas favoritas selecionadas, termina com uma comparação de até três.

Use as setas do teclado, Espaço ou os botões para avançar. Home e End levam ao começo e ao fim. Esc ou Sair retorna ao mapa. O botão Tela cheia usa o recurso do navegador; ambientes incorporados podem bloquear esse recurso, mas os slides continuam ocupando a tela da aplicação. A sequência é salva e incluída no JSON; apresentar não altera posições, zoom, notas nem filtros do mapa.

## Revisão de qualidade

A revisão de 02/10/2026 reforçou a validação de IDs importados e reduziu buscas repetidas no desenho e cálculo de visibilidade. Testes cobrem operações de blocos/conexões, histórico, recuperação do diário e JSON. O teste de 5.000 nós mede apenas a visibilidade; a fluidez do mapa completo nessa escala e o layout em celulares ainda precisam de validação específica.
