const DB=(()=>{let db;const ST=['courses','lectures','tasks','exams','notes','sessions','meta'];
const open=()=>db?Promise.resolve(db):new Promise((ok,no)=>{const r=indexedDB.open('yousif-uos',1);
r.onupgradeneeded=()=>ST.forEach(s=>r.result.createObjectStore(s,{keyPath:'id'}));
r.onsuccess=()=>ok(db=r.result);r.onerror=()=>no(r.error)});
const tx=(s,m,f)=>open().then(d=>new Promise((ok,no)=>{const q=f(d.transaction(s,m).objectStore(s));q.onsuccess=()=>ok(q.result);q.onerror=()=>no(q.error)}));
return{ST,all:s=>tx(s,'readonly',o=>o.getAll()),put:(s,v)=>(v.id=v.id||Date.now()+''+Math.random().toString(36).slice(2,6),tx(s,'readwrite',o=>o.put(v)).then(()=>v)),
del:(s,id)=>tx(s,'readwrite',o=>o.delete(id)),
async dump(){const o={};for(const s of ST)o[s]=await this.all(s);return o},
async load(o){for(const s of ST){await tx(s,'readwrite',x=>x.clear());for(const v of o[s]||[])await tx(s,'readwrite',x=>x.put(v))}}}})();
