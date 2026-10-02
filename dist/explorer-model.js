export const categories=[['Tecnologia','#635bdb'],['Utilidades','#4094db'],['Comércio','#35ac8a'],['Comunidade','#e88c38'],['Segurança','#db5267'],['Entretenimento','#d4aa24'],['Finanças','#279b9d'],['Experimentos','#d879ad']];
export const sectionKeys=['problem','operation','difference','mvp','money'];
export function descendants(project,id,blocked=new Set()){
 const out=new Set(),queue=[id],links=new Map();
 for(const edge of project.edges){if(!links.has(edge.source))links.set(edge.source,[]);links.get(edge.source).push(edge.target);}
 while(queue.length){const current=queue.pop();if(out.has(current))continue;out.add(current);if(!blocked.has(current))queue.push(...(links.get(current)||[]));}
 return out;
}
export function visibleIds(project){
 const links=new Map();for(const e of project.edges){if(!links.has(e.source))links.set(e.source,[]);links.get(e.source).push(e.target);}const walk=(id,blocked=new Set(),out=new Set())=>{const queue=[id];while(queue.length){const current=queue.pop();if(out.has(current))continue;out.add(current);if(!blocked.has(current))queue.push(...(links.get(current)||[]));}return out;};
 const prefs=project.explorer||{},ids=new Set(project.nodes.map(n=>n.id)),collapsed=new Set(prefs.collapsedIds||[]);
 const incoming=new Set(project.edges.map(e=>e.target));let seeds=project.nodes.filter(n=>!incoming.has(n.id)).map(n=>n.id);
 // Include disconnected cyclic components without resurrecting hidden branches.
 const covered=new Set();for(const id of seeds)walk(id,new Set(),covered);
 for(const node of project.nodes)if(!covered.has(node.id)){seeds.push(node.id);walk(node.id,new Set(),covered);}
 let visible=new Set();
 if(prefs.focusId&&ids.has(prefs.focusId))visible=walk(prefs.focusId,collapsed);
 else for(const id of seeds)walk(id,collapsed,visible);
 if(prefs.category||prefs.favoritesOnly){
  const matches=new Set();
  for(const n of project.nodes)if(visible.has(n.id)&&(!prefs.category||n.color.toLowerCase()===prefs.category.toLowerCase())&&(!prefs.favoritesOnly||n.favorite)){
   matches.add(n.id);if(prefs.favoritesOnly)for(const id of walk(n.id,collapsed))if(visible.has(id))matches.add(id);
  }
  // Retain ancestors as context; never add nodes outside the focused branch.
  const queue=[...matches],parents=new Map();for(const e of project.edges){if(!parents.has(e.target))parents.set(e.target,[]);parents.get(e.target).push(e.source);}
  while(queue.length){for(const id of parents.get(queue.pop())||[])if(visible.has(id)&&!matches.has(id)){matches.add(id);queue.push(id);}}
  visible=matches;
 }
 return new Set([...visible].filter(id=>ids.has(id)));
}
export function readSections(node){
 const fields={problem:'',operation:'',difference:'',mvp:'',money:''};
 const headings={'Problema que resolve':'problem','Produto unificado':'problem','Como funcionaria':'operation','Diferencial':'difference','Por que faz sentido':'difference','Primeira versão':'mvp','Possibilidades de monetização':'money'};
 let current=null;for(const line of (node.notes||'').split('\n')){
  if(line==='DETALHES DAS IDEIAS DE ORIGEM'||line==='ANOTAÇÕES ANTERIORES DO NÓ PRINCIPAL')break;
  if(headings[line.trim()]){current=headings[line.trim()];continue;}
  if(line.trim()==='Ideias reunidas'||line.startsWith('Categoria:')){current=null;continue;}
  if(current)fields[current]+=(fields[current]?'\n':'')+line;
 }
 for(const key of sectionKeys)fields[key]=typeof node.sections?.[key]==='string'?node.sections[key]:fields[key].trim();
 return fields;
}
export function categoryName(node){return categories.find(([,color])=>color===node.color.toLowerCase())?.[0]||'Outra cor';}
export function nodeSearchText(node){return [node.text,node.notes,...Object.values(node.sections||{}),...Object.values(node.review||{})].join(' ').toLocaleLowerCase();}
export function normalizeExplorer(project){
 const valid=new Set(project.nodes.map(n=>n.id));const prefs=project.explorer&&typeof project.explorer==='object'&&!Array.isArray(project.explorer)?project.explorer:{};
 Object.assign(prefs,{collapsedIds:[...new Set(Array.isArray(prefs.collapsedIds)?prefs.collapsedIds:[])].filter(id=>valid.has(id)),focusId:valid.has(prefs.focusId)?prefs.focusId:null,category:/^#[0-9a-f]{6}$/i.test(prefs.category||'')?prefs.category:null,favoritesOnly:!!prefs.favoritesOnly,compareIds:[...new Set(Array.isArray(prefs.compareIds)?prefs.compareIds:[])].filter(id=>valid.has(id)).slice(0,3)});project.explorer=prefs;
 return project.explorer;
}
