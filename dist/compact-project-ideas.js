const batch='software-ideas-compact-v1';
const originalBatch='software-ideas-40-v1';
const norm=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
export function compactIdeas(project,sourceCatalog,compactCatalog){
 if(project.contentBatches?.includes(batch))return null;
 if(!project.contentBatches?.includes(originalBatch))return null;
 const sourceItems=sourceCatalog.categories.flatMap(category=>category.projects);
 const names=new Set(sourceItems.map(item=>item.name));
 const members=compactCatalog.groups.flatMap(group=>group.members);
 if(compactCatalog.batchId!==batch||members.length!==40||new Set(members).size!==40||members.some(name=>!names.has(name)))throw Error('Agrupamento inválido ou repetido');
 const nodesById=new Map(project.nodes.map(node=>[node.id,node]));
 const children=id=>project.edges.filter(edge=>edge.source===id).map(edge=>nodesById.get(edge.target)).filter(Boolean);
 const rootCandidates=project.nodes.filter(node=>node.text==='IDEIAS DE PROJETOS'&&children(node.id).some(child=>names.has(child.text)));
 if(rootCandidates.length!==1)return null;
 const oldRoot=rootCandidates[0];
 const topNodes=children(oldRoot.id);
 const originals=new Map();
 for(const item of sourceItems){
  const matches=topNodes.filter(node=>node.text===item.name||(node.notes.includes(item.problem)&&children(node.id).some(child=>child.notes.startsWith(`Funcionalidade de ${item.name}.`))));
  if(matches.length===1)originals.set(item.name,matches[0]);
 }
 if(!originals.size)return null;
 const removed=new Set(),featureParents=new Map();
 for(const [name,node]of originals){
  removed.add(node.id);
  const item=sourceItems.find(item=>item.name===name);
  for(const child of children(node.id))if(item.features.includes(child.text)||child.notes.startsWith(`Funcionalidade de ${name}.`)){removed.add(child.id);featureParents.set(child.id,name);}
 }
 const preserved=project.nodes.filter(node=>!removed.has(node.id)&&node.id!==oldRoot.id);
 const maxX=preserved.length?Math.max(...preserved.map(node=>node.x+210)):0;
 const minY=preserved.length?Math.min(...preserved.map(node=>node.y)):0;
 const x={leftFeature:maxX+380,leftProject:maxX+700,root:maxX+1140,rightProject:maxX+1580,rightFeature:maxX+1900};
 const newNodes=[],newEdges=[],replacement=new Map();
 const activeGroups=compactCatalog.groups.filter(group=>group.members.some(name=>originals.has(name)));
 const leftCategories=new Set(['Tecnologia','Utilidades','Segurança','Finanças']);
 let heights=[],features=0;
 for(const direction of ['left','right']){
  let cursor=minY;
  const groups=activeGroups.filter(group=>leftCategories.has(group.category)===(direction==='left'));
  for(const group of groups){
   const id=crypto.randomUUID();
   const ancestry=group.members.filter(name=>originals.has(name));
   let notes=`Categoria: ${group.category}\n\nProduto unificado\n${group.summary}\n\nIdeias reunidas\n${ancestry.join(' + ')}\n\nPor que faz sentido\n${group.reason}\n\nPrimeira versão\n${group.first}\n\nPossibilidades de monetização\n${group.money}\n\nDETALHES DAS IDEIAS DE ORIGEM\n`;
   for(const name of ancestry){
    const old=originals.get(name);replacement.set(old.id,id);
    notes+=`\n══ ${old.text} ══\n${old.notes}\n`;
    const oldFeatures=children(old.id).filter(child=>removed.has(child.id));
    notes+=`\nFuncionalidades anteriores: ${oldFeatures.map(child=>child.text).join('; ')}.\n`;
    for(const child of oldFeatures){
     const defaultNotes=`Funcionalidade de ${name}.\nCategoria: ${sourceCatalog.categories.find(category=>category.projects.some(item=>item.name===name)).name}.\n\nUse este espaço para definir o comportamento, as telas e o primeiro experimento dessa funcionalidade.`;
     if(child.notes&&child.notes!==defaultNotes)notes+=`\nAnotação preservada de “${child.text}”:\n${child.notes}\n`;
    }
   }
   newNodes.push({id,text:group.name,notes,color:group.color,x:direction==='left'?x.leftProject:x.rightProject,y:cursor+(group.features.length-1)*116/2});
   newEdges.push({id:crypto.randomUUID(),source:oldRoot.id,target:id,direction});
   for(let index=0;index<group.features.length;index++){
    const featureId=crypto.randomUUID();newNodes.push({id:featureId,text:group.features[index],notes:`Módulo de ${group.name}.\n\nOs detalhes das ideias anteriores estão preservados nas anotações do projeto principal. A primeira versão sugerida distingue o núcleo das expansões futuras.`,color:group.color,x:direction==='left'?x.leftFeature:x.rightFeature,y:cursor+index*116});
    newEdges.push({id:crypto.randomUUID(),source:id,target:featureId,direction});features++;
   }
   cursor+=group.features.length*116+140;
  }
  heights.push(cursor-minY);
 }
 for(const [featureId,name]of featureParents)replacement.set(featureId,replacement.get(originals.get(name).id));
 const root={...oldRoot,x:x.root,y:minY+Math.max(...heights)/2-42,notes:`${activeGroups.length} propostas consolidadas a partir das 40 ideias originais.\n\nCada proposta reúne módulos complementares para o mesmo público ou a mesma jornada. A primeira versão nas anotações evita tentar construir todos os módulos ao mesmo tempo.\n\nOs nomes, explicações e funcionalidades anteriores estão preservados nos detalhes de origem de cada projeto unificado. Um backup integral do mapa anterior também foi guardado antes da compactação.\n\n${activeGroups.map(group=>`${group.name}: ${group.members.join(' + ')}`).join('\n\n')}\n\nCores\nVioleta: Tecnologia\nAzul: Utilidades\nVerde: Comércio\nLaranja: Comunidade\nVermelho: Segurança\nAmarelo: Entretenimento\nTurquesa: Finanças\nRosa: Experimentos\n\nSuas ideias anteriores e os blocos personalizados fora dos módulos consolidados continuam no mapa.\n\nANOTAÇÕES ANTERIORES DO NÓ PRINCIPAL\n${oldRoot.notes}`};
 // Preserve all unrelated nodes and edges. External/custom relations to a
 // merged node follow its successor rather than disappearing.
 const keptEdges=[];
 for(const edge of project.edges){
  if(edge.source===oldRoot.id&&removed.has(edge.target))continue;
  if(removed.has(edge.source)&&removed.has(edge.target))continue;
  if(!removed.has(edge.source)&&!removed.has(edge.target)){keptEdges.push(edge);continue;}
  const source=replacement.get(edge.source)||edge.source,target=replacement.get(edge.target)||edge.target;
  if(source!==target)keptEdges.push({...edge,source,target});
 }
 const rectangles=[root,...newNodes];
 for(let i=0;i<rectangles.length;i++)for(let j=i+1;j<rectangles.length;j++){const a=rectangles[i],b=rectangles[j];if(a.x<b.x+210&&a.x+210>b.x&&a.y<b.y+106&&a.y+106>b.y)throw Error('Sobreposição na compactação');}
 const allNodes=[...preserved,root,...newNodes],allEdges=[...keptEdges,...newEdges];
 const ids=new Set(allNodes.map(node=>node.id));
 if(allEdges.some(edge=>!ids.has(edge.source)||!ids.has(edge.target)))throw Error('Conexão inválida na compactação');
 project.nodes=allNodes;project.edges=allEdges;project.contentBatches=[...project.contentBatches,batch];project.updated=Date.now();
 return{projectId:project.id,root,projects:activeGroups.length,features,message:`40 ideias organizadas em ${activeGroups.length} propostas. Detalhes anteriores preservados.`};
}
export async function installRequestedCompaction(workspace,backup){
 if(workspace.completedContentRequests?.includes(batch))return null;
 const exact=workspace.projects.filter(project=>project.name.trim()==='comparador de preços');
 const matches=exact.length?exact:workspace.projects.filter(project=>norm(project.name)==='comparador de precos');
 if(matches.length!==1||!matches[0].contentBatches?.includes(originalBatch)||matches[0].contentBatches?.includes(batch))return null;
 const responses=await Promise.all([fetch('./project-ideas.json',{cache:'no-store'}),fetch('./compact-ideas.json',{cache:'no-store'})]);
 if(responses.some(response=>!response.ok))throw Error('Não foi possível carregar a compactação');
 const [sourceCatalog,compactCatalog]=await Promise.all(responses.map(response=>response.json()));
 const project=matches[0];
 // Work on a clone; no failure can leave a partly reorganized live map.
 const next=structuredClone(project),result=compactIdeas(next,sourceCatalog,compactCatalog);
 if(!result)return null;
 await backup(`before-${batch}-${project.id}`,structuredClone(project));
 workspace.projects[workspace.projects.indexOf(project)]=next;
 workspace.completedContentRequests=[...(workspace.completedContentRequests||[]),batch];
 return result;
}
