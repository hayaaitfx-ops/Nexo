// All persistence is device-local. A synchronous recovery journal protects the
// debounce window; IndexedDB remains the durable repository after each commit.
const KEY='nexo-recovery-v1';
let db, timer, pending, revision=0, chain=Promise.resolve();
function validSnapshot(snapshot){
 if(!snapshot||!Number.isFinite(snapshot.revision)||!Array.isArray(snapshot.data?.projects))return false;
 return snapshot.data.projects.every(p=>{if(!p||typeof p.id!=='string'||typeof p.name!=='string'||!Number.isFinite(p.updated)||!Array.isArray(p.nodes)||!Array.isArray(p.edges)||!p.view||![p.view.x,p.view.y,p.view.z].every(Number.isFinite))return false;const ids=new Set();for(const n of p.nodes){if(!n||typeof n.id!=='string'||ids.has(n.id)||typeof n.text!=='string'||typeof n.notes!=='string'||!/^#[0-9a-f]{6}$/i.test(n.color)||!Number.isFinite(n.x)||!Number.isFinite(n.y))return false;ids.add(n.id);}return p.edges.every(e=>e&&typeof e.id==='string'&&ids.has(e.source)&&ids.has(e.target));});
}
export async function load(){
 db=await new Promise((resolve,reject)=>{const r=indexedDB.open('nexo-projects',1);r.onupgradeneeded=()=>r.result.createObjectStore('state');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.onblocked=()=>reject(new Error('Feche outras abas do Nexo e tente novamente.'));});
 const saved=await new Promise((resolve,reject)=>{const t=db.transaction('state');const r=t.objectStore('state').get('workspace');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
 let journal;try{journal=JSON.parse(localStorage.getItem(KEY)||'null');}catch{}
 let latest=validSnapshot(journal)&&(!validSnapshot(saved)||journal.revision>saved.revision)?journal:validSnapshot(saved)?saved:null;
 if(!latest&&saved){const previous=await readPreviousWorkspace();if(previous){revision=Number.isFinite(saved.revision)?saved.revision:0;return previous;}throw new Error('Dados locais inválidos. Não foram substituídos.');}
 revision=latest?.revision||0;
 if(latest&&latest===journal)await write(latest);
 return latest?.data||null;
}
function write(snapshot){return new Promise((resolve,reject)=>{const t=db.transaction('state','readwrite'),store=t.objectStore('state');const previous=store.get('workspace');previous.onsuccess=()=>{if(validSnapshot(previous.result)&&previous.result.revision!==snapshot.revision)store.put(previous.result,'previous-workspace');store.put(snapshot,'workspace');};t.oncomplete=()=>resolve();t.onerror=()=>reject(t.error);t.onabort=()=>reject(t.error||new Error('Gravação interrompida'));});}
export function readPreviousWorkspace(){return new Promise((resolve,reject)=>{const t=db.transaction('state'),r=t.objectStore('state').get('previous-workspace');r.onsuccess=()=>resolve(validSnapshot(r.result)?r.result.data:null);r.onerror=()=>reject(r.error);});}
export function save(data,onStatus){
 const snapshot={revision:++revision,data:structuredClone(data)};pending={snapshot,onStatus};
 let journalOK=true;try{localStorage.setItem(KEY,JSON.stringify(snapshot));}catch{journalOK=false;}
 onStatus(journalOK?'Salvando…':'Salvando · mantenha a aba aberta');
 clearTimeout(timer);timer=setTimeout(flush,journalOK?180:0);
}
export function flush(){
 clearTimeout(timer);if(!pending)return chain;const {snapshot,onStatus}=pending;pending=null;
 chain=chain.catch(()=>{}).then(()=>write(snapshot)).then(()=>{if(snapshot.revision===revision){try{const j=JSON.parse(localStorage.getItem(KEY)||'null');if(j?.revision===snapshot.revision)localStorage.removeItem(KEY);}catch{}onStatus('Tudo salvo neste navegador');}}).catch(()=>{if(snapshot.revision===revision&&!pending)pending={snapshot,onStatus};onStatus('Falha ao salvar · exporte um backup JSON');});
 return chain;
}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flush();});
window.addEventListener('pagehide',flush);
export function backupProject(key,project){
 return new Promise((resolve,reject)=>{const t=db.transaction('state','readwrite');t.objectStore('state').put({createdAt:Date.now(),project},key);t.oncomplete=()=>resolve();t.onerror=()=>reject(t.error);t.onabort=()=>reject(t.error||new Error('Não foi possível criar o backup antes da adição'));});
}
