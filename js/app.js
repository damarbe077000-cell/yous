const $=s=>document.querySelector(s),esc=t=>String(t??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const DAYS=['السبت','الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة'],JS2D=[1,2,3,4,5,6,0];
const PRI={high:'عالية',mid:'متوسطة',low:'منخفضة'},ST={new:'جديد',doing:'قيد الإنجاز',done:'مكتمل'};
const SEC={
courses:{t:'المواد',s:'courses',f:[['name','اسم المادة (عربي / English)'],['teacher','الأستاذ'],['units','الوحدات','number'],['grade','الدرجة من 100','number']]},
schedule:{t:'الجدول',s:'lectures',f:[['name','المادة / المختبر'],['day','اليوم','select',DAYS],['start','البداية','time'],['end','النهاية','time'],['room','القاعة']]},
tasks:{t:'الواجبات',s:'tasks',f:[['title','عنوان الواجب'],['course','المادة'],['due','موعد التسليم','date'],['pri','الأولوية','select',PRI],['notes','ملاحظات']]},
exams:{t:'الامتحانات',s:'exams',f:[['course','المادة'],['date','التاريخ','date'],['room','القاعة']]},
notes:{t:'الملاحظات',s:'notes',f:[['title','العنوان'],['course','المادة'],['body','النص','textarea']]}};
const OPT=['teacher','room','course','notes','body','grade'];
let view='home',q='',timer=null,left=25*60,mins=25;
const toast=m=>{const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(toast.h);toast.h=setTimeout(()=>t.hidden=true,2800)};
const fmt=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
const sel=(f,v)=>Array.isArray(f[3])?f[3][v]:f[3][v];
function form(k){return`<form data-k="${k}" class="card">${SEC[k].f.map(f=>{const[n,l,t,o]=f;const r=OPT.includes(n)?'':'required';
return`<label>${l}`+(t==='select'?`<select name="${n}">${Object.entries(o).map(([i,x])=>`<option value="${i}">${x}</option>`).join('')}</select>`:t==='textarea'?`<textarea name="${n}" rows="4"></textarea>`:`<input name="${n}" type="${t||'text'}" ${t==='number'?'min="0" max="100" step="any"':''} ${r}>`)+'</label>'}).join('')}<button class="pri">إضافة</button></form>`}
function row(k,x){const meta=SEC[k].f.filter(f=>x[f[0]]!==''&&x[f[0]]!=null).map(f=>`<span>${esc(f[1].split(' ')[0])}: ${esc(f[2]==='select'?sel(f,x[f[0]]):x[f[0]])}</span>`).join('');
let extra='';if(k==='exams')extra=`<b class="cd">${Logic.daysLeft(x.date)} يوم</b>`;
if(k==='tasks')extra=`<button data-act="cyc" data-id="${x.id}" class="chip ${x.status}">${ST[x.status||'new']}</button>`;
return`<div class="row"><div>${meta}</div>${extra}<button data-act="edit" data-k="${k}" data-id="${x.id}" class="x" aria-label="تعديل">✎</button><button data-act="del" data-k="${k}" data-id="${x.id}" class="x" aria-label="حذف">✕</button></div>`}
async function list(k){let a=await DB.all(SEC[k].s);if(k==='notes'&&q)a=a.filter(x=>((x.title||'')+(x.body||'')+(x.course||'')).includes(q));
if(k==='tasks')a.sort((x,y)=>x.due.localeCompare(y.due));if(k==='exams')a.sort((x,y)=>x.date.localeCompare(y.date));
if(k==='schedule')a.sort((x,y)=>x.day-y.day||x.start.localeCompare(y.start));
let h=`<h2>${SEC[k].t}</h2>`+(k==='notes'?`<input id="q" class="card" placeholder="بحث في الملاحظات" value="${esc(q)}">`:'');
if(k==='courses'){const g=Logic.gpa(a);h+=`<div class="card big">المعدل التراكمي: <b>${g==null?'—':g.toFixed(2)}</b></div>`}
return h+form(k)+(a.length?a.map(x=>row(k,x)).join(''):'<p class="empty">لا توجد عناصر بعد. استخدم النموذج أعلاه للإضافة.</p>')}
async function home(){const[l,t,e,s,c]=await Promise.all(['lectures','tasks','exams','sessions','courses'].map(DB.all));
const d=JS2D[new Date().getDay()],today=new Date().toLocaleDateString('sv');
const tl=l.filter(x=>+x.day===d).sort((a,b)=>a.start.localeCompare(b.start)),open=t.filter(x=>x.status!=='done'),late=open.filter(x=>x.due<today);
const m=s.filter(x=>x.date===today).reduce((a,x)=>a+x.min,0),ne=e.filter(x=>Logic.daysLeft(x.date)>=0).sort((a,b)=>a.date.localeCompare(b.date))[0],g=Logic.gpa(c);
return`<h2>أهلاً يوسف</h2><p class="sub">${new Date().toLocaleDateString('ar-IQ',{weekday:'long',day:'numeric',month:'long'})}</p>
<div class="grid"><div class="card stat"><b>${m}</b>دقيقة دراسة اليوم</div><div class="card stat"><b>${open.length}</b>واجب مفتوح</div><div class="card stat ${late.length?'warn':''}"><b>${late.length}</b>متأخر</div><div class="card stat"><b>${g==null?'—':g.toFixed(1)}</b>المعدل</div></div>
<div class="card"><h3>محاضرات اليوم</h3>${tl.map(x=>`<div class="row"><div><span>${esc(x.name)}</span><span>${x.start}–${x.end}</span><span>${esc(x.room)}</span></div></div>`).join('')||'<p class="empty">لا محاضرات اليوم.</p>'}</div>
<div class="card"><h3>أقرب امتحان</h3>${ne?`<div class="row"><div><span>${esc(ne.course)}</span><span>${ne.date}</span></div><b class="cd">${Logic.daysLeft(ne.date)} يوم</b></div>`:'<p class="empty">لا امتحانات قادمة.</p>'}</div>`}
const focus=async()=>{const s=await DB.all('sessions'),days=[...Array(7)].map((_,i)=>{const d=new Date(Date.now()-(6-i)*864e5).toLocaleDateString('sv');return[d.slice(5),s.filter(x=>x.date===d).reduce((a,x)=>a+x.min,0)]}),mx=Math.max(30,...days.map(x=>x[1])),st=Logic.streak(s.map(x=>x.date));return`<h2>التركيز</h2><div class="card center"><div id="clock">${fmt(left)}</div><label>المدة بالدقائق<input id="dur" type="number" min="1" max="120" value="${mins}"></label><button class="pri" data-act="tgl">${timer?'إيقاف':'ابدأ'}</button></div><div class="card"><h3>آخر 7 أيام (دقيقة) — سلسلة الأيام: ${st}</h3><svg viewBox="0 0 280 120" role="img">${days.map((x,i)=>`<rect x="${i*40+6}" y="${90-x[1]/mx*80}" width="28" height="${x[1]/mx*80}" rx="4" fill="var(--a)"/><text x="${i*40+20}" y="108" font-size="10" text-anchor="middle" fill="var(--m)">${x[0]}</text><text x="${i*40+20}" y="${84-x[1]/mx*80}" font-size="10" text-anchor="middle" fill="var(--t)">${x[1]||''}</text>`).join('')}</svg></div>`};
const tools=()=>`<h2>الأدوات</h2><form class="card" id="bc"><h3>محول الأنظمة</h3><input name="v" placeholder="الرقم" required><select name="f"><option value="10">عشري</option><option value="2">ثنائي</option><option value="16">سداسي عشري</option></select><button class="pri">حوّل</button><p id="bo" class="out"></p></form>
<form class="card" id="nd"><h3>الدرجة المطلوبة</h3><input name="e" type="number" step="any" placeholder="الدرجة المحصلة" required><input name="d" type="number" step="any" placeholder="وزن ما أُنجز من 100" required><input name="t" type="number" step="any" placeholder="الهدف من 100" required><button class="pri">احسب</button><p id="no" class="out"></p></form>`;
const settings=()=>`<h2>الإعدادات</h2><div class="card"><button data-act="theme">تبديل الوضع الليلي / النهاري</button><button data-act="exp">تصدير نسخة احتياطية</button><label class="file">استعادة نسخة<input type="file" id="imp" accept=".json"></label><button class="x2" data-act="wipe">حذف كل البيانات</button></div>`;
async function render(){const m=$('#main');m.innerHTML=view==='home'?await home():SEC[view]?await list(view):view==='focus'?await focus():view==='ai'?await AI.view():view==='lib'?await LIB.view():view==='tools'?tools():settings();
document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.v===view))}
document.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;const a=b.dataset.act;
if(b.dataset.v){view=b.dataset.v;q='';return render()}
if(a==='del'&&confirm('حذف هذا العنصر؟')){await DB.del(SEC[b.dataset.k].s,b.dataset.id);render()}
if(a==='edit'){const x=(await DB.all(SEC[b.dataset.k].s)).find(v=>v.id===b.dataset.id),f=$('form[data-k]');f.dataset.id=x.id;SEC[b.dataset.k].f.forEach(([n])=>{if(f.elements[n])f.elements[n].value=x[n]??''});f.querySelector('.pri').textContent='حفظ التعديل';f.scrollIntoView()}
if(a==='cyc'){const t=(await DB.all('tasks')).find(x=>x.id===b.dataset.id),o=['new','doing','done'];t.status=o[(o.indexOf(t.status||'new')+1)%3];await DB.put('tasks',t);render()}
if(a==='theme'){const d=document.documentElement.dataset.t==='dark'?'light':'dark';document.documentElement.dataset.t=d;localStorage.t=d}
if(a==='exp'){const u=URL.createObjectURL(new Blob([JSON.stringify(await DB.dump())],{type:'application/json'})),l=document.createElement('a');l.href=u;l.download='uos-backup.json';l.click()}
if(a==='wipe'&&confirm('سيتم حذف كل شيء نهائياً. متأكد؟')){await DB.load({meta:[{id:'seeded'}]});toast('تم الحذف');render()}
if(a==='tgl'){if(timer){clearInterval(timer);timer=null;render()}else{left=mins*60;timer=setInterval(async()=>{left--;const c=$('#clock');if(c)c.textContent=fmt(left);
if(left<=0){clearInterval(timer);timer=null;await DB.put('sessions',{date:new Date().toLocaleDateString('sv'),min:mins});toast('انتهت الجلسة. أحسنت!');navigator.vibrate&&navigator.vibrate(300);render()}},1000);render()}}});
document.addEventListener('submit',async e=>{e.preventDefault();const f=e.target,d=Object.fromEntries(new FormData(f));
if(f.id==='bc'){const r=[10,2,16].map(t=>Logic.conv(d.v,+d.f,t));$('#bo').textContent=r[0]==null?'رقم غير صالح لهذا النظام':`عشري ${r[0]} | ثنائي ${r[1]} | سداسي ${r[2]}`;return}
if(f.id==='nd'){const n=Logic.needed(+d.e,+d.d,+d.t);$('#no').textContent=n==null?'لا يوجد ما تبقى':n>100?`غير ممكن: تحتاج ${n.toFixed(1)}% من المتبقي`:`تحتاج ${n.toFixed(1)}% من الدرجات المتبقية`;return}
const k=f.dataset.k;if(!k)return;if(f.dataset.id)d.id=f.dataset.id;if(k==='schedule'){if(d.end<=d.start)return toast('وقت النهاية يجب أن يكون بعد البداية');
const c=Logic.findConflict(await DB.all('lectures'),d);if(c)return toast('تعارض مع: '+c.name)}
if(k==='tasks')d.status=f.dataset.id?(await DB.all('tasks')).find(v=>v.id===d.id).status:'new';await DB.put(SEC[k].s,d);toast('تمت الإضافة');render()});
document.addEventListener('input',e=>{if(e.target.id==='q'){q=e.target.value;const p=e.target.selectionStart;render().then(()=>{const i=$('#q');i.focus();i.setSelectionRange(p,p)})}if(e.target.id==='dur')mins=Math.max(1,+e.target.value||25)});
document.addEventListener('change',async e=>{if(e.target.id==='imp'){try{await DB.load(JSON.parse(await e.target.files[0].text()));toast('تمت الاستعادة');render()}catch{toast('ملف غير صالح')}}});
(async()=>{document.documentElement.dataset.t=localStorage.t||'light';
if(!(await DB.all('meta')).length){await DB.put('meta',{id:'seeded'});for(const n of['Programming','Practical Programming','Fundamentals of Electrical Engineering','Applied Mathematics','Digital Logic','English Language'])await DB.put('courses',{name:n+' (مادة تجريبية قابلة للتعديل)',teacher:'',units:'3',grade:''})}
render();if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js')})();
