// 사이트(index.html)의 프로젝트 데이터로 공개용 이력서 PDF(files/shinjaewoo-resume.pdf)를 만듭니다.
// 실행: node tools/make-resume.js  (playwright 필요, 집 주소·생년은 넣지 않음)
const {chromium}=require('playwright');
const path=require('path');
const root=path.resolve(__dirname,'..');
const exe=process.env.CHROME_PATH||undefined;
(async()=>{
  const b=await chromium.launch({executablePath:exe,proxy:process.env.HTTPS_PROXY?{server:process.env.HTTPS_PROXY}:undefined});
  const pg=await b.newPage();
  await pg.goto('file://'+root+'/index.html');
  const d=await pg.evaluate(()=>({
    P:P.map(p=>({id:p.id,sec:p.sec,title:p.title,client:p.client,year:p.year,key:p.key,role:p.role,res:p.res})),
    lead:document.querySelector('.lead').textContent.trim(),
    tl:[...document.querySelectorAll('.tl li')].map(li=>({when:li.querySelector('.when').textContent,org:li.querySelector('b').textContent,desc:li.querySelector('span').textContent})),
    edu:[...document.querySelectorAll('.about ul.plain')].map(u=>[...u.querySelectorAll('li')].map(l=>l.textContent.trim()))
  }));
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const sec={campaign:'캠페인·PR',proposal:'기획·제안',content:'콘텐츠 기획·집필'};
  const proj=Object.keys(sec).map(k=>`<h3>${sec[k]}</h3>`+d.P.filter(p=>p.sec===k).map(p=>`
    <div class="pj"><div class="pt"><b>${esc(p.title)}</b><span>${esc(p.client)} · ${esc(p.year)}</span></div>
    <div class="pr">${esc(p.role)}</div><div class="pk">${esc(p.key)}</div></div>`).join('')).join('');
  const html=`<!doctype html><html lang="ko"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@700&family=IBM+Plex+Sans+KR:wght@400;600&display=swap">
<style>
@page{size:A4;margin:16mm 16mm 14mm}
:root{--ink:#18202f;--soft:#4a5468;--faint:#7b8496;--rule:#dde1e8;--accent:#2a46c9;--marker:#fff1a8}
body{margin:0;font-family:"IBM Plex Sans KR","Apple SD Gothic Neo","Malgun Gothic",sans-serif;font-size:9.6pt;line-height:1.6;color:var(--ink);word-break:keep-all}
h1{font-family:"Gowun Batang",serif;font-size:18pt;margin:0;line-height:1.25}
h1 mark{background:linear-gradient(transparent 58%,var(--marker) 58%);color:inherit}
h2{font-size:10.5pt;color:var(--accent);letter-spacing:.06em;margin:16px 0 6px;padding-bottom:4px;border-bottom:1.5px solid var(--ink)}
h3{font-size:9.6pt;margin:10px 0 4px;color:var(--soft)}
.top{display:grid;grid-template-columns:1fr auto;gap:6px 20px;align-items:end;padding-bottom:10px;border-bottom:1px solid var(--rule)}
.ct{text-align:right;color:var(--soft);font-size:9pt}
.lead{color:var(--soft);margin:10px 0 0}
.tl div{display:grid;grid-template-columns:110px 1fr;gap:10px;margin-bottom:3px}
.tl .w{color:var(--faint);font-variant-numeric:tabular-nums}
.pj{padding:5px 0;border-bottom:1px solid var(--rule);break-inside:avoid}
.pt{display:flex;justify-content:space-between;gap:12px}.pt span{color:var(--faint);white-space:nowrap}
.pr{color:var(--soft)}.pk{font-weight:600}
.two{display:grid;grid-template-columns:1fr 1fr;gap:16px}
ul{margin:0;padding-left:1.1em}
</style></head><body>
<div class="top"><div><div style="color:var(--faint);font-size:8.5pt;letter-spacing:.12em">PR / CONTENT PLANNER</div>
<h1>신재우, 까다로운 이야기를 <mark>쉽게 전하는</mark> 기획자</h1></div>
<div class="ct">andro0541@gmail.com<br>010-4814-0541<br>shinjaewoo-kr.github.io</div></div>
<p class="lead">${esc(d.lead)}</p>
<h2>경력</h2><div class="tl">${d.tl.map(t=>`<div><span class="w">${esc(t.when)}</span><span><b>${esc(t.org)}</b> · ${esc(t.desc)}</span></div>`).join('')}</div>
<h2>주요 프로젝트</h2>${proj}
<div class="two"><div><h2>교육 · 자격</h2><ul>${d.edu[0].map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>
<div><h2>쓰는 도구</h2><ul>${d.edu[1].map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div></div>
<p style="color:var(--faint);font-size:8.5pt;margin-top:14px">각 프로젝트의 세부 업무와 자료는 포트폴리오 사이트 shinjaewoo-kr.github.io 에서 볼 수 있습니다.</p>
</body></html>`;
  const r=await b.newPage();
  await r.setContent(html,{waitUntil:'networkidle'});
  await r.evaluate(()=>document.fonts.ready);
  await r.pdf({path:path.join(root,'files','shinjaewoo-resume.pdf'),format:'A4',printBackground:true});
  await b.close();
})();
