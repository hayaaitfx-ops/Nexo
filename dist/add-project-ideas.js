// One-time, additive content request. Existing nodes, edges and project identity
// are never rewritten. This runs in the user's own browser, not on a server.
const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase();
const batch = 'software-ideas-40-v1';
export function appendIdeas(project, catalog) {
  if (project.contentBatches?.includes(batch)) return null;
  if (catalog.batchId !== batch || catalog.categories.length !== 8) throw Error('Catálogo inválido');
  const projects = catalog.categories.flatMap(category => category.projects);
  if (projects.length !== 40 || new Set(projects.map(item => normalize(item.name))).size !== 40) throw Error('Ideias duplicadas no catálogo');
  const oldNodes = project.nodes;
  const maxX = oldNodes.length ? Math.max(...oldNodes.map(node => node.x + 210)) : 0;
  const minY = oldNodes.length ? Math.min(...oldNodes.map(node => node.y)) : 0;
  const positions = {leftFeatures: maxX + 380, leftProjects: maxX + 700, root: maxX + 1140, rightProjects: maxX + 1580, rightFeatures: maxX + 1900};
  const leftNames = ['Tecnologia', 'Utilidades', 'Segurança', 'Finanças'];
  const nodes = [], edges = [];
  const rootId = crypto.randomUUID();
  let heights = [];
  let totals = {projects: 0, features: 0};
  for (const direction of ['left', 'right']) {
    let cursor = minY;
    const categories = catalog.categories.filter(category => leftNames.includes(category.name) === (direction === 'left'));
    for (const category of categories) {
      for (const item of category.projects) {
        const existing = oldNodes.find(node => normalize(node.text) === normalize(item.name));
        // Do not create a second copy or edit/reposition an existing idea.
        if (existing) continue;
        const projectId = crypto.randomUUID();
        const projectY = cursor + (item.features.length - 1) * 116 / 2;
        nodes.push({id: projectId, text: item.name, notes: `Categoria: ${category.name}\n\nProblema que resolve\n${item.problem}\n\nComo funcionaria\n${item.operation}\n\nDiferencial\n${item.difference}\n\nPossibilidades de monetização\n${item.money}`, color: category.color, x: direction === 'left' ? positions.leftProjects : positions.rightProjects, y: projectY});
        edges.push({id: crypto.randomUUID(), source: rootId, target: projectId, direction});
        totals.projects++;
        item.features.forEach((feature, index) => {
          const id = crypto.randomUUID();
          nodes.push({id, text: feature, notes: `Funcionalidade de ${item.name}.\nCategoria: ${category.name}.\n\nUse este espaço para definir o comportamento, as telas e o primeiro experimento dessa funcionalidade.`, color: category.color, x: direction === 'left' ? positions.leftFeatures : positions.rightFeatures, y: cursor + index * 116});
          edges.push({id: crypto.randomUUID(), source: projectId, target: id, direction});
          totals.features++;
        });
        cursor += item.features.length * 116 + 100;
      }
      cursor += 180;
    }
    heights.push(cursor - minY);
  }
  const root = {id: rootId, text: catalog.root, notes: `40 propostas para explorar com o grupo.\n\nCada projeto está ligado diretamente a este nó. As funcionalidades ficam do lado de fora de cada ramo, e as explicações completas ficam nas anotações do projeto.\n\nCores\nVioleta: Tecnologia\nAzul: Utilidades\nVerde: Comércio\nLaranja: Comunidade\nVermelho: Segurança\nAmarelo: Entretenimento\nTurquesa: Finanças\nRosa: Experimentos\n\nPara explorar\nBusque pelo nome de uma ideia no campo de pesquisa para ir até ela. Clique no bloco para ler suas anotações.\n\nPara escolher\nComparem quem sente o problema, como validar a demanda e qual pequena versão conseguem construir primeiro. As possibilidades de monetização são hipóteses a validar, não promessas de receita.\n\nAs ideias que já existiam foram preservadas com seus textos, anotações, posições e conexões.`, x: positions.root, y: minY + Math.max(...heights) / 2 - 42, color: '#635bdb'};
  nodes.unshift(root);
  // Verify the new geometry before committing any change to the project.
  const rectangles = nodes.map(node => ({x: node.x, y: node.y, w: 210, h: 106}));
  for (let i = 0; i < rectangles.length; i++) for (let j = i + 1; j < rectangles.length; j++) {
    const a = rectangles[i], b = rectangles[j];
    if (a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y) throw Error('Sobreposição no novo ramo');
  }
  const originalNodeCount = project.nodes.length, originalEdgeCount = project.edges.length;
  project.nodes.push(...nodes);
  project.edges.push(...edges);
  project.contentBatches = [...(project.contentBatches || []), batch];
  project.updated = Date.now();
  return {projectId: project.id, root, ...totals, originalNodeCount, originalEdgeCount};
}
export async function installRequestedIdeas(workspace, backup) {
  if (workspace.completedContentRequests?.includes(batch)) return null;
  // The user's screenshot identifies the lower-case custom project, distinct
  // from the title-case starter example. Prefer that exact title when present.
  const exact = workspace.projects.filter(project => project.name.trim() === 'comparador de preços');
  const matches = exact.length ? exact : workspace.projects.filter(project => normalize(project.name) === 'comparador de precos');
  // An absent or ambiguous target must never lead to an edit of another map.
  if (matches.length !== 1) return null;
  const response = await fetch('./project-ideas.json', {cache: 'no-store'});
  if (!response.ok) throw Error('Não foi possível carregar as novas ideias');
  const catalog = await response.json();
  const project = matches[0];
  if (project.contentBatches?.includes(batch)) return null;
  await backup(`before-${batch}-${project.id}`, structuredClone(project));
  const result = appendIdeas(project, catalog);
  if (result) workspace.completedContentRequests = [...(workspace.completedContentRequests || []), batch];
  return result;
}
