# Auditoria do Nexo — 02/10/2026

## 1. O que foi encontrado

A stack real é HTML/CSS/JavaScript nativo, com SVG e armazenamento local. Não há TypeScript, framework, dependências npm ou backend. A aplicação foi preservada. Foram encontrados conflitos de sobreposição na busca e no menu de exportação, buscas repetidas no grafo, validação insuficiente de IDs importados e ausência de uma recuperação simples da última versão válida.

## 2. Bugs corrigidos

- Resultados da busca ficavam sob o painel Visualização e podiam acionar o controle errado.
- Menu de exportação podia ficar sob o painel de detalhes.
- Importação rejeita IDs que quebrariam atributos/seletores; entradas nulas são tratadas como inválidas.
- Preferências de visualização com formato incorreto não causam falha de normalização.
- Falha de gravação mantém o estado pendente para uma nova tentativa.
- Diário de recuperação inválido não substitui uma versão válida; dados corrompidos usam o backup anterior válido quando disponível.
- Seleção repetida de uma ideia não duplica colunas de comparação nos slides.

## 3. Melhorias adicionadas

Backup automático da versão válida anterior, com restauração como cópias; Ctrl/Cmd+F para busca fora dos campos; Ctrl/Cmd+S para gravação local; destaque temporário da busca e aproximação de nós muito afastados; estado de mapa vazio; foco visível de teclado; ajustes de pequenas telas; índices de nós e relações para reduzir buscas repetidas. Nenhum framework foi adicionado.

## 4. Arquivos principais alterados

`dist/app.js`, `dist/storage.js`, `dist/explorer-model.js`, `dist/explorer-ui.js`, `dist/explorer.css`, `dist/presentation.js`, `README.md`, `.gitignore`, `tests/` e `test.cjs`.

## 5. Testes executados

- `node test.cjs`: dez grupos de testes de JSON/recuperação, snapshot anterior/falha de escrita, operações de mapa, filtros/ciclos, apresentação, migrações e sintaxe.
- Navegador separado dos dados do Brave: criação e edição com emojis e caracteres especiais, filha por Tab, nota longa, cor, exclusão, desfazer/refazer, recarga durante uso, busca, mapa vazio e recuperação como cópias.
- Importação real de mapas sintéticos com 100/99, 300/299 e 500/499 nós/conexões. Abertura de cada mapa, zoom e centralização; com 500 nós, pan, busca, arraste e desfazer do arraste.
- Inspeção visual em 1920×1080, 1366×768, tablet 820×1180 e celular 390×844.
- Console sem erros nos fluxos inspecionados.
- Verificação dos arquivos distribuídos em busca de credenciais, dados pessoais, caminhos de usuário, arquivos temporários e dependências.

## 6. Resultado

Todos os dez grupos automatizados passaram. Os fluxos inspecionados no navegador funcionaram. Os mapas com 100, 300 e 500 nós foram utilizáveis nos testes realizados. O teste de lógica com 5.000 nós passou em cadeia e em componentes isolados; não representa uma garantia de fluidez visual nessa escala. Não há comandos de lint, typecheck ou build: os arquivos estáticos servidos são a própria versão distribuída. Todos os módulos passaram na verificação de sintaxe.

## 7. Limites e pendências

- FPS não pôde ser medido de forma confiável: a prévia em segundo plano limita requestAnimationFrame. Uma amostra de heap com 500 nós indicou aproximadamente 20 MB; não é uma análise completa de vazamento.
- O ambiente de automação não forneceu o evento de download para confirmar o arquivo JSON no disco. Importação real e integridade do formato foram verificadas; a geração PNG foi acionada sem erro de console. Confirme o recebimento dos arquivos no navegador final antes de uma release pública.
- Não houve execução nativa no Linux/macOS nem teste de gesto de pinça em aparelho físico. O caminho comum `node start-local.cjs` usa APIs multiplataforma; os atalhos gráficos são Windows.
- Não foi simulado desligamento físico. A janela de debounce e falhas de gravação foram testadas por mocks, e recarga foi verificada no navegador.
- Backup automático conserva só a versão anterior à última gravação. Limpar o navegador pode apagar tanto dados quanto backup; JSON externo continua necessário.
- Licença ainda não definida. Isso está explicitado no README; não foi inventada uma licença.

## 8. Recomendações posteriores

Testes de navegador automatizados, validação em Linux e aparelhos físicos, capturas de demonstração, análise de FPS em primeiro plano e testes de acessibilidade com leitor de tela. Seleção múltipla e organização automática permanecem melhorias opcionais futuras.

## 9. Preparação para GitHub

O código está tecnicamente preparado para ser colocado em um repositório, com documentação, testes reproduzíveis e exclusões apropriadas. Não foram incluídos mapas pessoais, bancos do navegador, logs, .env, credenciais, metadados de hospedagem ou arquivos temporários. `dist/` é fonte estática nesta stack e deve ser versionado. A decisão de licença continua necessária antes de apresentar o projeto como open source. Nada foi publicado ou enviado para um remoto.

