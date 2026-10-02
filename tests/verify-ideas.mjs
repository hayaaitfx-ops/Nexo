import fs from 'node:fs';
import assert from 'node:assert/strict';
const text=fs.readFileSync('dist/add-project-ideas.js','utf8');
const {appendIdeas,installRequestedIdeas}=await import('data:text/javascript;base64,'+Buffer.from(text).toString('base64'));
const catalog=JSON.parse(fs.readFileSync('dist/project-ideas.json','utf8'));
const original={id:'preserved',name:'Comparador de Preços',updated:10,view:{x:90,y:80,z:1},nodes:[{id:'old-a',text:'Minha ideia original',notes:'Não alterar',x:35,y:-120,color:'#35ac8a'},{id:'old-b',text:'Outro bloco',notes:'Texto mantido',x:450,y:120,color:'#4094db'}],edges:[{id:'old-e',source:'old-a',target:'old-b'}]};
const project=structuredClone(original);
const result=appendIdeas(project,catalog);
assert.equal(result.projects,40);
assert.deepEqual(project.nodes.slice(0,2),original.nodes);
assert.deepEqual(project.edges.slice(0,1),original.edges);
assert.deepEqual(project.view,original.view);
assert.equal(project.id,original.id);
const ids=new Set(project.nodes.map(node=>node.id));assert.equal(ids.size,project.nodes.length);
assert.equal(project.edges.filter(edge=>edge.source===result.root.id).length,40);
for(const edge of project.edges){assert(ids.has(edge.source));assert(ids.has(edge.target));}
const additions=project.nodes.slice(2);
for(const added of additions)for(const old of original.nodes)assert(added.x>=old.x+210+100);
for(const category of catalog.categories)for(const item of category.projects){const node=additions.find(node=>node.text===item.name);assert(node);assert.equal(node.color,category.color);assert(node.notes.includes('Problema que resolve'));assert(node.notes.includes('Como funcionaria'));assert(node.notes.includes('Diferencial'));assert(node.notes.includes('Possibilidades de monetização'));assert.equal(project.edges.filter(edge=>edge.source===node.id).length,item.features.length);assert(node.text.length<50);}
const after=JSON.stringify(project);assert.equal(appendIdeas(project,catalog),null);assert.equal(JSON.stringify(project),after);
const workspace={projects:[structuredClone(original)]};globalThis.fetch=async()=>({ok:true,json:async()=>catalog});let backup;
await installRequestedIdeas(workspace,async(key,value)=>backup={key,value});assert.deepEqual(backup.value,original);assert.equal(workspace.completedContentRequests.length,1);assert.equal(await installRequestedIdeas(workspace,async()=>{throw Error('Não repetir backup');}),null);
const wrong={projects:[{...structuredClone(original),name:'Outro projeto'}]};assert.equal(await installRequestedIdeas(wrong,async()=>{throw Error('Não modificar outro mapa');}),null);
const ambiguous={projects:[structuredClone(original),structuredClone(original)]};assert.equal(await installRequestedIdeas(ambiguous,async()=>{throw Error('Não modificar mapa ambíguo');}),null);
const custom={...structuredClone(original),id:'user-custom',name:'comparador de preços'};
const twoProjects={projects:[structuredClone(custom),structuredClone(original)]};
const starterBefore=JSON.stringify(twoProjects.projects[1]);
let selectedBackup;
const targeted=await installRequestedIdeas(twoProjects,async(key,value)=>selectedBackup=value);
assert.equal(targeted.projectId,'user-custom');
assert.deepEqual(selectedBackup,custom);
assert.equal(twoProjects.projects[0].nodes.length,custom.nodes.length+242);
assert.equal(JSON.stringify(twoProjects.projects[1]),starterBefore);
assert.deepEqual(twoProjects.projects[0].nodes.slice(0,custom.nodes.length),custom.nodes);
// Standalone preview/backup of the additions, independent of the user's originals.
const newOnly={id:crypto.randomUUID(),name:'IDEIAS DE PROJETOS — 40 propostas',updated:Date.now(),nodes:additions,edges:project.edges.slice(1),view:{x:500-result.root.x*.85,y:300-result.root.y*.85,z:.85}};
console.log(JSON.stringify({passed:true,projects:result.projects,features:result.features,newNodes:additions.length,newEdges:project.edges.length-1,checks:['preserved original fields','unique names and IDs','all projects connected directly to root','no overlapping rectangles','consistent categories','complete annotations','one-time installation','backup before mutation','correct target only']}));
