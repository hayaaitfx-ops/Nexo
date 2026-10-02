# Nexo

Um mapa mental local para conectar ideias, organizar projetos e apresentar propostas ao seu grupo.

## Sobre

O Nexo combina um quadro livre com nós arrastáveis, conexões e anotações. A interface em português prioriza o mapa e guarda os projetos no próprio navegador. Não exige conta, backend ou API externa.

## Funcionalidades

- Criar, renomear, duplicar e excluir projetos separados.
- Criar ideias, editar textos e notas, mover blocos, conectar e excluir relações.
- Ideias filhas com Tab, cores por categoria, zoom e navegação pelo fundo.
- Busca por títulos e anotações, com aproximação e destaque do resultado.
- Desfazer/refazer, favoritos, foco e recolhimento de ramos.
- Filtros por categoria, minimapa e comparação de até três ideias.
- Apresentação guiada com sequência personalizável e tela cheia quando suportada.
- Salvamento automático, versão anterior recuperável, JSON de backup e exportação PNG.

## Screenshots

Espaço reservado para capturas do mapa, do painel de projetos e da apresentação. Use mapas de demonstração sem informações pessoais ao adicionar imagens em `docs/screenshots/`.

## Tecnologias

HTML, CSS, JavaScript com módulos nativos, SVG, IndexedDB e localStorage. Node.js serve os arquivos estáticos e executa os testes. Não há dependências npm, framework ou compilação.

## Como executar

1. Instale uma versão atual do Node.js (22 ou superior).
2. Clone o repositório ou baixe e extraia o ZIP.
3. Abra o terminal na pasta que contém `start-local.cjs`.
4. Execute:

```sh
node start-local.cjs
```

5. Abra **http://127.0.0.1:47863/** no navegador e mantenha o terminal aberto.

Funciona como aplicação web no Windows, Linux e macOS. O atalho `Abrir Nexo.cmd` e o lançador `open-nexo.cjs` são específicos do Windows. Não abra `index.html` diretamente por `file://`. A porta estável permite reencontrar o mesmo armazenamento nas próximas sessões.

## Estrutura do projeto

```text
dist/                  Aplicação estática, pronta para servir
  app.js               Interface, mapa, histórico e JSON
  storage.js           Persistência e recuperação
  explorer-model.js    Regras de visibilidade e notas
  explorer-ui.js        Filtros, foco, favoritos e comparação
  presentation.js      Configuração e reprodução dos slides
  *.css                Identidade visual e responsividade
  *ideas*.json          Catálogos de ideias de demonstração
tests/                 Testes de lógica, persistência e sintaxe
start-local.cjs         Servidor estático local
test.cjs                Executa todos os testes
DOCUMENTACAO.md         Detalhes técnicos e migrações de conteúdo
AUDITORIA.md            Resultados e limites da revisão
```

`dist/` é o código fonte estático desta stack; não é um artefato temporário de compilação. Os módulos de migração atendem ao mapa de origem “comparador de preços”, executam uma vez e guardam backup antes de alterar conteúdo. Os testes usam dados sintéticos.

## Atalhos

| Atalho | Ação |
| --- | --- |
| Tab | Criar filha quando há seleção no mapa ou foco no título |
| N | Nova ideia |
| C | Conectar a ideia selecionada |
| F | Centralizar os nós visíveis |
| Delete / Backspace | Excluir seleção |
| Ctrl / Cmd + Z | Desfazer |
| Ctrl / Cmd + Shift + Z ou Ctrl / Cmd + Y | Refazer |
| Ctrl / Cmd + F | Buscar no mapa ou na lista, fora dos campos de texto |
| Ctrl / Cmd + S | Forçar gravação local pendente |
| Esc | Fechar seleção, menus ou diálogo |
| Setas / Espaço | Avançar e voltar na apresentação |

Atalhos de letras não atuam durante digitação. Nos campos, desfazer/refazer segue o comportamento nativo do editor. Ctrl/Cmd+F continua como busca do navegador quando o foco está em um campo de texto.

## Backup / Importação / Exportação

Cada mudança escreve um diário de recuperação local; o IndexedDB recebe o estado após um debounce de 180 ms. O indicador confirma quando a transação termina. Uma falha mantém a versão pendente para nova tentativa.

A gravação guarda também a versão válida anterior. Na tela de projetos, **Restaurar backup** adiciona cópias dessa versão e preserva os projetos atuais. É uma versão anterior à última gravação, não um histórico completo.

**Exportar → Backup JSON** salva um projeto com ideias, notas, posições, cores, relações, zoom, foco, filtros e sequência da apresentação. **Importar JSON** valida o arquivo antes de adicionar projetos, sem substituir os atuais. O formato é `nexo`, versão 1; limite de 20 MB, 100 projetos, 5.000 nós e 10.000 conexões por projeto.

Os dados são separados por navegador, perfil e endereço. Para um amigo ver seu mapa, envie o JSON; o código do repositório não contém seus projetos pessoais. Não existe sincronização automática. Limpar dados do navegador ou perder o dispositivo pode apagar mapas e backups locais: mantenha cópias JSON em outro lugar.

## Testes

```sh
node test.cjs
```

Inclui sintaxe dos módulos, validação JSON, recuperação, operações de mapa, ciclos, filtros, migrações e slides. Não há lint, TypeScript ou etapa de build configurados. Confira `AUDITORIA.md` para os testes de navegador e as limitações.

## Roadmap

- Testes automatizados de navegador e regressão visual.
- Organização automática opcional e seleção múltipla.
- Melhor suporte a gestos de toque e leitores de tela.
- Perfil de desempenho em diferentes equipamentos.
- Sincronização e colaboração como módulos futuros opcionais.

## Contribuindo

Abra uma issue com passos de reprodução ou proponha uma alteração pequena. Preserve a identidade visual, o funcionamento local e a compatibilidade dos backups. Execute `node test.cjs` e teste recarga, edição e JSON antes de enviar uma contribuição. Não inclua mapas pessoais, logs, credenciais ou arquivos de ambiente.

## Licença

**Licença ainda não definida.** O responsável deve escolher e adicionar uma licença antes de divulgar o projeto como open source. Nenhuma licença foi presumida nesta versão.
