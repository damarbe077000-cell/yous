const AI=(()=>{
const A=[['explain','شرح خطوة بخطوة','اشرح الموضوع التالي بالعربية خطوة بخطوة مع المصطلحات الإنجليزية بين قوسين:'],
['sum','تلخيص','لخّص النص التالي بنقاط واضحة:'],
['mcq','أسئلة اختيار من متعدد','أنشئ 5 أسئلة اختيار من متعدد (4 خيارات) مع الإجابة الصحيحة وتفسيرها من النص التالي:'],
['tf','صح وخطأ','أنشئ 8 أسئلة صح وخطأ مع الإجابات من النص التالي:'],
['fill','فراغات وتعريفات','أنشئ 6 أسئلة فراغات وتعريفات مع الإجابات من النص التالي:'],
['exam','امتحان تجريبي','أنشئ امتحاناً تجريبياً متنوعاً مع سلم تصحيح من النص التالي:'],
['code','شرح كود','اشرح الكود التالي سطراً سطراً:'],
['bug','اكتشاف أخطاء برمجية','اكتشف الأخطاء في الكود التالي واشرح كل خطأ وصحّحه:'],
['cards','بطاقات مراجعة','حوّل النص التالي إلى بطاقات مراجعة بصيغة "س: ... ج: ...":'],
['map','خريطة مفاهيم','ارسم خريطة مفاهيم نصية متفرعة (شجرة بالمسافات) للنص التالي:']];
let H=[];const get=async()=>(await DB.all('meta')).find(x=>x.id==='ai')||{};
async function call(c,p){const M=Array.isArray(p)?p:[{role:'user',content:p}];const an=c.fmt==='anthropic',h={'content-type':'application/json'};
if(an){h['x-api-key']=c.key;h['anthropic-version']='2023-06-01';h['anthropic-dangerous-direct-browser-access']='true'}else h.authorization='Bearer '+c.key;
const r=await fetch(c.url,{method:'POST',headers:h,body:JSON.stringify(an?{model:c.model,max_tokens:2000,messages:M}:{model:c.model,messages:M})});
if(!r.ok)throw new Error('رفض المزود الطلب ('+r.status+'). راجع المفتاح والرابط والموديل.');
const j=await r.json();return an?j.content.map(x=>x.text||'').join(''):j.choices[0].message.content}
async function view(){const c=await get();
return`<h2>المساعد الدراسي</h2><form class="card" id="aicfg"><h3>مزود الذكاء الاصطناعي</h3><p class="empty">المفتاح يُحفظ على جهازك فقط ويُرسل مباشرة للمزود. بدون مفتاح تعمل ميزتا البطاقات والفراغات محلياً.</p>
<select name="fmt"><option value="openai" ${c.fmt!=='anthropic'?'selected':''}>متوافق مع OpenAI</option><option value="anthropic" ${c.fmt==='anthropic'?'selected':''}>Anthropic</option></select>
<input name="url" type="url" placeholder="رابط الـ API الكامل" value="${esc(c.url||'')}"><input name="model" placeholder="اسم الموديل" value="${esc(c.model||'')}"><input name="key" type="password" placeholder="مفتاح API" value="${esc(c.key||'')}"><button class="pri">حفظ الإعدادات</button><button type="button" data-ai="gem">تعبئة إعدادات Gemini</button></form>
<div class="card"><h3>اسأل أي شي</h3><div id="chat">${H.map(m=>`<div class="msg ${m.role==='user'?'u':'a'}">${esc(m.content)}</div>`).join('')||'<p class="empty">اكتب أي سؤال لم تفهمه وراح أشرحه لك خطوة بخطوة.</p>'}</div><form class="send" id="aichat"><input name="m" placeholder="اكتب سؤالك..." autocomplete="off" required><button class="pri">إرسال</button></form><button data-ai="clr">محادثة جديدة</button></div>
<form class="card" id="airun"><select name="act">${A.map(a=>`<option value="${a[0]}">${a[1]}</option>`).join('')}</select><textarea name="txt" id="aitxt" rows="8" placeholder="الصق النص أو الكود، أو ارفع ملف TXT" required></textarea><label>ملف TXT<input type="file" id="aif" accept=".txt,text/plain"></label><button class="pri">نفّذ</button></form>
<div class="card"><pre id="aiout" class="out" style="white-space:pre-wrap;margin:0"></pre><button data-ai="save" hidden id="aisv">حفظ كملاحظة</button></div>`}
document.addEventListener('submit',async e=>{const f=e.target;if(f.id==='aicfg'){e.preventDefault();const d=Object.fromEntries(new FormData(f));if(d.url&&!/^https:\/\//.test(d.url))return toast('الرابط يجب أن يبدأ بـ https://');d.id='ai';await DB.put('meta',d);toast('تم الحفظ')}
if(f.id==='airun'){e.preventDefault();const d=Object.fromEntries(new FormData(f)),a=A.find(x=>x[0]===d.act),o=$('#aiout'),c=await get();o.textContent='';let r=null;
if(c.key&&c.url&&c.model){o.textContent='جارٍ المعالجة...';try{r=await call(c,a[2]+'\nأجب اعتماداً على النص فقط، وإن لم يكفِ قل ذلك صراحة، واذكر المصدر المكتوب في أول النص إن وُجد.\n\n'+d.txt)}catch(x){o.textContent='تعذر الاتصال: '+x.message;return}}
else r=d.act==='cards'?Logic.localCards(d.txt):d.act==='fill'?Logic.localBlanks(d.txt):null;
o.textContent=r||'هذه الميزة تحتاج مزود API. أضف الإعدادات أعلاه، أو جرّب «بطاقات مراجعة» (صيغة مصطلح: تعريف) أو «فراغات» محلياً.';$('#aisv').hidden=!r;$('#aisv').dataset.t=a[1]}});
document.addEventListener('change',async e=>{if(e.target.id==='aif'){const f=e.target.files[0];if(f)$('#aitxt').value='[المصدر: '+f.name+']\n'+await f.text()}});
document.addEventListener('click',async e=>{if(e.target.dataset.ai==='save'){await DB.put('notes',{title:'AI: '+e.target.dataset.t,course:'',body:$('#aiout').textContent});toast('حُفظت في الملاحظات')}});
document.addEventListener('submit',async e=>{if(e.target.id!=='aichat')return;e.preventDefault();const i=e.target.m,t=i.value.trim(),c=await get();if(!t)return;
if(!(c.key&&c.url&&c.model)){toast('أضف إعدادات المزود والمفتاح بالأسفل أولاً');return}
i.value='';H.push({role:'user',content:t});const ch=$('#chat');ch.innerHTML=H.map(m=>`<div class="msg ${m.role==='user'?'u':'a'}">${esc(m.content)}</div>`).join('')+'<div class="msg a">...</div>';ch.scrollTop=ch.scrollHeight;
const pre='أنت مساعد دراسي لطالب هندسة الحوسبة السحابية وإنترنت الأشياء. أجب بالعربية بوضوح وخطوة بخطوة مع المصطلحات الإنجليزية بين قوسين.\n\n';
const msgs=H.slice(-20).map((m,k)=>k===0&&m.role==='user'?{role:'user',content:pre+m.content}:m);
try{H.push({role:'assistant',content:await call(c,msgs)})}catch(x){H.pop();toast(x.message)}
ch.innerHTML=H.map(m=>`<div class="msg ${m.role==='user'?'u':'a'}">${esc(m.content)}</div>`).join('');ch.scrollTop=ch.scrollHeight});
document.addEventListener('click',e=>{const k=e.target.dataset.ai;if(k==='clr'){H=[];render()}
if(k==='gem'){const f=$('#aicfg');f.fmt.value='openai';f.url.value='https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';toast('اكتب اسم الموديل والمفتاح ثم احفظ')}});
return{view}})();
