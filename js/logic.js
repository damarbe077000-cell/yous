(function(g){
const L={
overlaps:(a,b)=>a.day===b.day&&a.start<b.end&&b.start<a.end,
findConflict:(list,n)=>list.find(x=>x.id!==n.id&&L.overlaps(x,n)),
gpa(cs){let u=0,s=0;cs.forEach(c=>{if(c.grade!==''&&c.grade!=null&&+c.units>0){u+=+c.units;s+=+c.grade*+c.units}});return u?s/u:null},
needed(earned,done,target){const left=100-done;return left>0?(target-earned)/left*100:null},
daysLeft:(d,now=new Date())=>Math.ceil((new Date(d+'T00:00:00')-new Date(now.toDateString()))/864e5),
conv(v,from,to){const n=parseInt(String(v).trim(),from);return isNaN(n)?null:n.toString(to).toUpperCase()},
localCards:t=>t.split(/\n+/).map(l=>l.match(/^(.{2,60}?)\s*[:：]\s*(.+)$/)).filter(Boolean).map(m=>'س: ما هو '+m[1]+'؟\nج: '+m[2]).join('\n\n'),
localBlanks:t=>t.split(/[.؟!\n]+/).map(s=>s.trim()).filter(s=>s.length>25).map((s,i)=>{const w=s.split(/\s+/).sort((a,b)=>b.length-a.length)[0];return (i+1)+') '+s.replace(w,'____')+'\n   الإجابة: '+w}).join('\n'),
streak(ds,now=new Date()){let n=0,d=new Date(now.toDateString());const set=new Set(ds);if(!set.has(d.toLocaleDateString('sv')))d.setDate(d.getDate()-1);while(set.has(d.toLocaleDateString('sv'))){n++;d.setDate(d.getDate()-1)}return n}
};
if(typeof module!=='undefined')module.exports=L;else g.Logic=L})(this);
