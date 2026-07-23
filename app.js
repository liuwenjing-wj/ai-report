let CAT_COLORS = {};
let nodes = [];
let edges = [];
let exercises = [];
let learningPaths = [];
let newIdSet = new Set();
let scoreCorrect=0,scorePartial=0,scoreWrong=0,scoreTotal=0;
function updateScoreDisplay(){
  const el=document.getElementById('session-score');
  if(!scoreTotal){el.innerHTML='';return;}
  const pct=Math.round(((scoreCorrect+scorePartial*0.5)/scoreTotal)*100);
  el.innerHTML='本轮得分：<strong>'+pct+'%</strong>（'+scoreCorrect+' 对 / '+scorePartial+' 部分对 / '+scoreWrong+' 错，共 '+scoreTotal+' 题）';
}

// ---- Sidebar ----
document.querySelectorAll('.nav-item').forEach(item=>{
  item.addEventListener('click',e=>{
    e.preventDefault();
    document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
    item.classList.add('active');
    const t=document.getElementById(item.dataset.target);
    if(t)t.scrollIntoView({behavior:'smooth',block:'start'});
    document.getElementById('sidebar').classList.remove('open');
  });
});
const sectionIds=['sec-graph','sec-challenge','sec-practice','sec-news','sec-articles','sec-skills'];
window.addEventListener('scroll',()=>{
  let cur=sectionIds[0];
  for(const id of sectionIds){const el=document.getElementById(id);if(el&&el.getBoundingClientRect().top<=120)cur=id;}
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.target===cur));
});

// ---- Hero ----
function parseExDate(d){const p=d.split('/');return new Date(2026,parseInt(p[0])-1,parseInt(p[1]));}
function renderHeroChallenge(){
  const sorted=[...exercises].map((e,i)=>({e,i})).sort((a,b)=>{const d=parseExDate(b.e.date)-parseExDate(a.e.date);return d!==0?d:b.i-a.i;}).map(x=>x.e);
  const ex=sorted[0];if(!ex)return;
  document.getElementById('hero-challenge').innerHTML=
    '<div class="hero-card">'+
    '<div class="hero-meta"><span class="hero-date">'+ex.date+'</span><span class="hero-diff '+ex.diff+'">'+ex.diff+'</span><span class="hero-type">'+ex.type+'</span></div>'+
    '<div class="hero-scene">'+ex.scene+'</div><div class="hero-q">'+ex.question+'</div>'+
    '<button class="hero-reveal" onclick="revealHeroAnswer()">查看答案</button>'+
    '<div class="hero-answer" id="hero-answer">'+ex.answer+'</div>'+
    '<div class="hero-score-row" id="hero-score-row" style="display:none"><span class="hero-score-label">自评：</span>'+
    '<button class="score-btn correct" onclick="scoreHero(1)">答对了</button>'+
    '<button class="score-btn partial" onclick="scoreHero(0.5)">部分对</button>'+
    '<button class="score-btn wrong" onclick="scoreHero(0)">答错了</button></div></div>';
}
function revealHeroAnswer(){document.getElementById('hero-answer').classList.add('show');document.querySelector('.hero-reveal').style.display='none';document.getElementById('hero-score-row').style.display='flex';}
function scoreHero(v){scoreTotal++;if(v===1)scoreCorrect++;else if(v===0.5)scorePartial++;else scoreWrong++;document.querySelectorAll('.hero-score-row .score-btn').forEach(b=>b.classList.remove('active'));if(v===1)document.querySelector('.hero-score-row .correct').classList.add('active');else if(v===0.5)document.querySelector('.hero-score-row .partial').classList.add('active');else document.querySelector('.hero-score-row .wrong').classList.add('active');updateScoreDisplay();}

// ---- News ----
function renderNews(items){document.getElementById('news-grid').innerHTML=items.map(n=>'<div class="news-card">'+(n.tags?'<div>'+n.tags.map(t=>'<span class="news-tag">'+t+'</span>').join('')+'</div>':'')+'<div class="news-title">'+n.title+'</div><div class="news-summary">'+(n.summary||'')+'</div>'+(n.source?'<div class="news-source">'+(n.sourceUrl?'<a href="'+n.sourceUrl+'" target="_blank" style="color:#a5b4fc;text-decoration:none">'+n.source+' ↗</a>':n.source)+'</div>':'')+'</div>').join('');}
function renderNewsEmpty(){document.getElementById('news-grid').innerHTML='<div class="news-empty">暂无行业热点数据，定时任务将在下次推送时同步更新</div>';}

// ---- Exercise History ----
function toggleHistory(){const b=document.getElementById('history-body'),t=document.getElementById('history-toggle'),tx=document.getElementById('history-toggle-text');const o=b.classList.toggle('show');t.classList.toggle('open',o);tx.textContent=o?'收起历史题目':'展开历史题目';}
function renderExerciseHistory(){
  const sorted=[...exercises].map((e,i)=>({e,i})).sort((a,b)=>{const d=parseExDate(b.e.date)-parseExDate(a.e.date);return d!==0?d:b.i-a.i;}).map(x=>x.e);
  const hist=sorted.slice(1);
  const types=['全部',...new Set(hist.map(e=>e.type))];
  const tabsEl=document.getElementById('history-tabs');
  let activeTab='全部';
  let curPage=1;
  const PAGE_SIZE=10;
  let openAnswerIdx=null;
  tabsEl.innerHTML='';
  types.forEach(t=>{
    const c=t==='全部'?hist.length:hist.filter(e=>e.type===t).length;
    const el=document.createElement('div');el.className='history-tab'+(t==='全部'?' active':'');el.textContent=t==='全部'?'全部 ('+c+')':t+' ('+c+')';
    el.addEventListener('click',()=>{document.querySelectorAll('.history-tab').forEach(x=>x.classList.remove('active'));el.classList.add('active');activeTab=t;curPage=1;openAnswerIdx=null;renderTable();});
    tabsEl.appendChild(el);
  });
  document.getElementById('search-input').addEventListener('input',()=>{curPage=1;openAnswerIdx=null;renderTable();});
  function getFiltered(){
    const q=document.getElementById('search-input').value.trim().toLowerCase();
    return hist.filter(e=>(activeTab==='全部'||e.type===activeTab)&&(!q||e.scene.toLowerCase().includes(q)||e.question.toLowerCase().includes(q)||e.answer.toLowerCase().includes(q)));
  }
  function renderTable(){
    const filtered=getFiltered();
    const total=filtered.length;
    const totalPages=Math.max(1,Math.ceil(total/PAGE_SIZE));
    if(curPage>totalPages)curPage=totalPages;
    const start=(curPage-1)*PAGE_SIZE;
    const pageItems=filtered.slice(start,start+PAGE_SIZE);
    const c=document.getElementById('ex-container');
    if(!total){c.innerHTML='<div style="text-align:center;color:#475569;padding:20px">没有匹配的练习题</div>';return;}
    let h='<div class="ex-table-wrap"><table class="ex-table"><thead><tr><th class="col-idx">序号</th><th class="col-date">日期</th><th class="col-tags">分类</th><th class="col-title">题目</th><th class="col-action">答案</th></tr></thead><tbody>';
    pageItems.forEach((ex,i)=>{
      const globalIdx=start+i;
      const isOpen=openAnswerIdx===globalIdx;
      const fullText=ex.scene+(ex.question?' '+ex.question:'');
      h+='<tr><td class="col-idx">'+(start+i+1)+'</td>';
      h+='<td class="col-date">'+ex.date+'</td>';
      h+='<td class="col-tags"><span class="ex-tag-type">'+ex.type+'</span><span class="ex-tag-diff '+ex.diff+'">'+ex.diff+'</span></td>';
      h+='<td class="col-title"><span class="ex-title-text" data-idx="'+globalIdx+'">'+fullText+'</span></td>';
      h+='<td class="col-action"><button class="ex-action-btn'+(isOpen?' open':'')+'" data-idx="'+globalIdx+'">'+(isOpen?'收起':'查看')+'</button></td></tr>';
      if(isOpen){
        h+='<tr class="ex-row-answer"><td colspan="5"><div class="ex-answer-text">'+ex.answer+'</div></td></tr>';
      }
    });
    h+='</tbody></table></div>';
    // Pagination
    h+='<div class="ex-pagination">';
    h+='<button class="ex-page-btn" data-page="prev"'+(curPage<=1?' disabled':'')+'>上一页</button>';
    for(let p=1;p<=totalPages;p++){
      if(totalPages>7&&Math.abs(p-curPage)>2&&p!==1&&p!==totalPages){
        if(p===2||p===totalPages-1)h+='<span class="ex-page-info">...</span>';
        continue;
      }
      h+='<button class="ex-page-btn'+(p===curPage?' active':'')+'" data-page="'+p+'">'+p+'</button>';
    }
    h+='<button class="ex-page-btn" data-page="next"'+(curPage>=totalPages?' disabled':'')+'>下一页</button>';
    h+='<span class="ex-page-info">'+curPage+'/'+totalPages+'</span>';
    h+='</div>';
    h+='<div class="ex-total">共 '+total+' 条记录</div>';
    c.innerHTML=h;
    // Event delegation for buttons
    c.querySelectorAll('.ex-action-btn').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const idx=parseInt(btn.dataset.idx);
        openAnswerIdx=openAnswerIdx===idx?null:idx;
        renderTable();
      });
    });
    c.querySelectorAll('.ex-title-text').forEach(sp=>{
      sp.addEventListener('click',()=>{
        const idx=parseInt(sp.dataset.idx);
        openAnswerIdx=openAnswerIdx===idx?null:idx;
        renderTable();
      });
    });
    c.querySelectorAll('.ex-page-btn').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const p=btn.dataset.page;
        if(p==='prev')curPage=Math.max(1,curPage-1);
        else if(p==='next')curPage=Math.min(totalPages,curPage+1);
        else curPage=parseInt(p);
        openAnswerIdx=null;
        renderTable();
      });
    });
  }
  renderTable();
}
function toggleHistAnswer(uid,btn){const a=document.getElementById(uid);a.classList.toggle('show');btn.textContent=a.classList.contains('show')?'收起答案':'查看答案';const s=document.getElementById('s_'+uid);if(s&&a.classList.contains('show'))s.style.display='flex';}
function scoreHist(btn,v){scoreTotal++;if(v===1)scoreCorrect++;else if(v===0.5)scorePartial++;else scoreWrong++;btn.parentElement.querySelectorAll('.score-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');updateScoreDisplay();}

// ---- Learning Paths ----
function renderLearningPaths(){
  const el=document.getElementById('paths-section');
  let h='<div class="path-tabs">';
  learningPaths.forEach((p,i)=>{h+='<div class="path-tab'+(i===0?' active':'')+'" data-path="'+p.id+'" style="'+(i===0?'border-color:'+p.color+'40;color:'+p.color:'')+'">'+p.name+'</div>';});
  h+='</div>';
  learningPaths.forEach((p,i)=>{
    h+='<div class="path-display'+(i===0?' active':'')+'" id="path-'+p.id+'"><div class="path-header"><h3 style="color:'+p.color+'">'+p.name+'</h3><p>'+p.desc+'（'+p.nodes.length+' 个知识点）</p></div><div class="path-nodes">';
    p.nodes.forEach((nId,j)=>{const n=nodes.find(x=>x.id===nId);h+='<div class="path-node" data-node="'+nId+'" style="border-color:'+p.color+'20"><span class="step-num" style="border-color:'+p.color+'60;color:'+p.color+'">'+(j+1)+'</span>'+(n?n.name:nId)+'</div>';if(j<p.nodes.length-1)h+='<span class="path-arrow">\u2192</span>';});
    h+='</div></div>';
  });
  el.innerHTML=h;
  // Tab click
  el.querySelectorAll('.path-tab').forEach(tab=>{
    tab.addEventListener('click',()=>{
      const pid=tab.dataset.path,path=learningPaths.find(p=>p.id===pid);
      el.querySelectorAll('.path-tab').forEach(t=>{t.classList.remove('active');t.style.borderColor='';t.style.color='';});
      el.querySelectorAll('.path-display').forEach(d=>d.classList.remove('active'));
      tab.classList.add('active');tab.style.borderColor=path.color+'40';tab.style.color=path.color;
      document.getElementById('path-'+pid).classList.add('active');
    });
  });
  // Node click — delegate to graph API
  el.querySelectorAll('.path-node').forEach(pn=>{
    pn.addEventListener('click',()=>{
      const nId=pn.dataset.node;
      const n=nodes.find(x=>x.id===nId);
      if(!n||!window._graphAPI)return;
      window._graphAPI.showDetail(n);
      window._graphAPI.highlightNode(n);
      document.getElementById('sec-graph').scrollIntoView({behavior:'smooth',block:'start'});
    });
  });
}

// ---- Incremental updates ----
(async()=>{
// ---- Welcome Popup ----
const wMsgs=['你终于来了','嘿，今天学点啥？','知识充电站营业中','每天进步一点点'];
let wIdx=0;
const wEl=document.getElementById('welcome-text');
const wTimer=setInterval(()=>{wIdx=(wIdx+1)%wMsgs.length;wEl.style.opacity='0';setTimeout(()=>{wEl.textContent=wMsgs[wIdx];wEl.style.opacity='1';},300);},3000);
function closeWelcome(){clearInterval(wTimer);const o=document.getElementById('welcome-overlay');if(o){o.style.transition='opacity 0.3s';o.style.opacity='0';setTimeout(()=>o.remove(),300);}}
const wBtn=document.getElementById('welcome-btn');if(wBtn)wBtn.addEventListener('click',closeWelcome);
const wOv=document.getElementById('welcome-overlay');if(wOv)wOv.addEventListener('click',e=>{if(e.target.id==='welcome-overlay')closeWelcome();});

// ---- Load base data ----
try{
  const dr=await fetch('data.json?v='+Date.now());
  if(dr.ok){
    const dd=await dr.json();
    if(dd.CAT_COLORS)CAT_COLORS=dd.CAT_COLORS;
    if(dd.nodes)dd.nodes.forEach(n=>nodes.push(n));
    if(dd.edges)dd.edges.forEach(e=>edges.push(e));
    if(dd.exercises)dd.exercises.forEach(e=>exercises.push(e));
    if(dd.learningPaths)dd.learningPaths.forEach(p=>learningPaths.push(p));
  }
}catch(e){}

try{
  const r=await fetch('updates.json?v='+Date.now());
  if(r.ok){
    const d=await r.json();
    if(d.nodes){const ids=new Set(nodes.map(n=>n.id));d.nodes.forEach(n=>{if(!ids.has(n.id)){nodes.push(n);ids.add(n.id);}});}
    if(d.newNodeIds)d.newNodeIds.forEach(id=>newIdSet.add(id));
    if(d.edges){d.edges.forEach(e=>{if(!edges.some(x=>x.source===e.source&&x.target===e.target))edges.push(e);});}
    if(d.exercises)d.exercises.forEach(e=>exercises.push(e));
    const sn=document.getElementById('stat-nodes'),se=document.getElementById('stat-exercises'),sc=document.getElementById('stat-cats');
    if(sn)sn.textContent=nodes.length;if(se)se.textContent=exercises.length;if(sc)sc.textContent=new Set(nodes.map(n=>n.cat)).size;
    if(d.lastDate){document.getElementById('sidebar-update').textContent='更新于 '+d.lastDate;}
    if(d.news&&d.news.length)renderNews(d.news);
  }
}catch(e){}
// Fallback: if sidebar still shows '--', use today's date
const suEl=document.getElementById('sidebar-update');
if(suEl&&suEl.textContent.includes('--')){const now=new Date();suEl.textContent='更新于 '+(now.getMonth()+1)+'月'+now.getDate()+'日';}

renderHeroChallenge();

// ---- News with today/yesterday toggle ----
const fallbackNews = [
{title:'OpenAI 发布 GPT-5.6：旗舰版新增多智能体调度能力',summary:'GPT-5.6 分为 Sol/Terra/Luna 三个版本，其中 Sol 旗舰版新增 Ultra 多智能体模式，可同时调度多个 AI 协同完成复杂任务。Terra 主打企业级性价比，Luna 侧重低延迟实时问答并上线全双工语音模型。',tags:['大模型','多智能体'],source:'OpenAI · 7月10日'},
{title:'DeepSeek-V4 发布：首创峰谷分时计费降低企业调用成本',summary:'DeepSeek-V4 在国内首创"峰谷分时计费"模式，大幅降低企业 API 调用成本。数学与代码能力保持顶尖水平，推理速度显著提升。7月24日将全面停用旧版 API。',tags:['大模型','成本优化'],source:'DeepSeek · 7月15日'},
{title:'月之暗面推出 Kimi K3：全球首个开源 3 万亿级大模型',summary:'Kimi K3 参数规模达 2.8 万亿，通过协同优化整体扩展效率提升约 2.5 倍。能独立完成芯片构建、优化与验证，高效处理科研编程和深度金融研报生成。原生 480K 上下文。',tags:['大模型','开源'],source:'月之暗面 · 7月'},
{title:'智谱 GLM-5.2：1M 超长上下文，Function Calling 达生产级',summary:'GLM-5.2 支持 100 万 Token 超长上下文窗口，Function Calling 达到生产级标准。以 MIT 协议全面开源 GLM 系列模型，产品已覆盖民生治理、工业制造、能源电力等 20 余个行业。',tags:['开源','Function Calling'],source:'智谱 AI · 7月上旬'},
{title:'腾讯混元 Hy-3 发布：MoE 架构 256K 上下文免费商用',summary:'Hy-3 采用 MoE 混合专家架构，支持 256K 上下文且免费商用。与微信生态、数字人、短视频深度打通，Agent 能力突出。支持华为昇腾芯片部署，推动国产算力生态。',tags:['MoE','Agent'],source:'腾讯 · 7月6日'},
{title:'Google 发布 Gemini-3.5 Pro：强化视频理解与 3D 解析',summary:'Gemini-3.5 Pro 采用全新训练基座，大幅强化视频理解、3D 解析和数学科研能力。原生对接搜索引擎，支持云端与端侧双部署模式。',tags:['大模型','多模态'],source:'Google · 7月17日'},
{title:'AI 物流供应链市场预计 2034 年达 1965.8 亿美元',summary:'据 Global Market Insights 最新报告，全球 AI 在物流与供应链领域的市场规模预计从当前水平增长至 2034 年的 1965.8 亿美元，需求预测、智能调度和预测性维护是三大核心增长驱动力。',tags:['供应链','市场趋势'],source:'SDC Executive · 7月'},
{title:'2026 被定义为"智能体爆发年"：从单 Agent 到多 Agent 协作',summary:'新华社报道指出，2026 年 AI Agent 从实验走向大规模落地，企业级多智能体系统开始覆盖订单-库存-排产-调度全链路。MCP 协议标准化和 Agent 编排框架成熟是两大推动力。',tags:['Agent','行业趋势'],source:'新华社 · 4月'}
];
let newsData={today:{date:'',items:fallbackNews},yesterday:{date:'',items:[]}};
let newsView='today';
function fmtDateLabel(d){if(!d)return'';const p=d.split('-');return p[1]+'/'+p[2];}
function updateNewsToggle(){
  const btns=document.querySelectorAll('.news-toggle-btn');
  btns.forEach(b=>{
    b.classList.toggle('active',b.dataset.date===newsView);
    const d=newsData[b.dataset.date];
    if(d&&d.date)b.textContent=(b.dataset.date==='today'?'今日 ':'昨日 ')+fmtDateLabel(d.date);
  });
}
function renderActiveNews(){
  const d=newsData[newsView];
  if(d&&d.items&&d.items.length)renderNews(d.items);
  else renderNewsEmpty();
}
(async()=>{
  try{
    const r=await fetch('news.json?v='+Date.now());
    if(r.ok){const j=await r.json();if(j.today)newsData.today=j.today;if(j.yesterday)newsData.yesterday=j.yesterday;}
  }catch(e){}
  updateNewsToggle();
  renderActiveNews();
  // ---- News Ticker ----
  const tItems=(newsData.today&&newsData.today.items)?newsData.today.items:fallbackNews;
  const tTitles=tItems.map(i=>i.title);
  const tEl=document.getElementById('ticker-content');
  if(tEl&&tTitles.length){
    const tHTML=tTitles.map((t,i)=>'<span data-idx="'+i+'">'+t+'</span>').join('');
    tEl.innerHTML=tHTML+tHTML;
    tEl.addEventListener('click',e=>{
      const sp=e.target.closest('span');
      if(!sp||sp.dataset.idx===undefined)return;
      const idx=parseInt(sp.dataset.idx);
      const cards=document.querySelectorAll('#news-grid .news-card');
      if(cards[idx]){
        document.getElementById('sec-news').scrollIntoView({behavior:'smooth'});
        setTimeout(()=>{cards[idx].scrollIntoView({behavior:'smooth',block:'center'});cards[idx].classList.add('highlight');setTimeout(()=>cards[idx].classList.remove('highlight'),2500);},500);
      }
    });
    document.getElementById('ticker-more').addEventListener('click',()=>{
      document.getElementById('sec-news').scrollIntoView({behavior:'smooth'});
    });
  }
})();
document.querySelectorAll('.news-toggle-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{newsView=btn.dataset.date;updateNewsToggle();renderActiveNews();});
});

// ---- Admin Mode ----
const isAdmin=new URLSearchParams(location.search).has('admin');
if(isAdmin){
  document.querySelectorAll('.admin-nav').forEach(el=>el.style.display='');
  document.getElementById('sec-articles').style.display='';
  document.getElementById('sec-skills').style.display='';
  (async()=>{
    try{
      const r=await fetch('articles.json?v='+Date.now());
      if(r.ok){const d=await r.json();if(d.articles&&d.articles.length){document.getElementById('articles-list').innerHTML=d.articles.map(a=>'<div class="article-card"><div class="article-title"><a href="'+a.url+'" target="_blank">'+a.title+'</a></div>'+(a.summary?'<div class="article-summary">'+a.summary+'</div>':'')+'<div class="article-meta">'+(a.author?'<span>'+a.author+'</span>':'')+(a.date?'<span>'+a.date+'</span>':'')+(a.tags?a.tags.map(t=>'<span class="news-tag">'+t+'</span>').join(''):'')+'</div></div>').join('');return;}}
    }catch(e){}
    document.getElementById('articles-list').innerHTML='<div class="news-empty">暂无文章，等待添加</div>';
  })();
  (async()=>{
    try{
      const r=await fetch('skills.json?v='+Date.now());
      if(r.ok){const d=await r.json();if(d.skills&&d.skills.length){document.getElementById('skills-list').innerHTML=d.skills.map(s=>'<div class="skill-card"><div class="skill-info"><div class="skill-name">'+s.name+'</div><div class="skill-desc">'+s.description+'</div><div class="skill-meta">'+(s.version?'<span>v'+s.version+'</span>':'')+(s.author?'<span>'+s.author+'</span>':'')+(s.downloads?'<span>下载 '+s.downloads+'</span>':'')+'</div></div><a class="skill-dl-btn" href="'+s.downloadUrl+'" target="_blank">下载</a></div>').join('');return;}}
    }catch(e){}
    document.getElementById('skills-list').innerHTML='<div class="news-empty">暂无 Skill 包，等待添加</div>';
  })();
}

renderExerciseHistory();

// Legend
const legendEl=document.getElementById('legend');
[...new Set(nodes.map(n=>n.cat))].forEach(cat=>{
  if(!CAT_COLORS[cat])CAT_COLORS[cat]='#94a3b8';
  legendEl.innerHTML+='<div class="legend-item" data-cat="'+cat+'"><div class="legend-dot" style="background:'+CAT_COLORS[cat]+'"></div>'+cat+'</div>';
});

// ---- D3 Graph ----
let graphVisible=true;
const _gObs=new IntersectionObserver(es=>{graphVisible=es[0].isIntersecting;},{threshold:0.05});
_gObs.observe(document.getElementById('graph-section'));

const svgEl=document.getElementById('graph-svg');
const W=svgEl.clientWidth,H=svgEl.clientHeight;
const svg=d3.select('#graph-svg');
const g=svg.append('g');

// SVG glow filters
const defs=svg.append('defs');
const fGlow=defs.append('filter').attr('id','glow').attr('x','-50%').attr('y','-50%').attr('width','200%').attr('height','200%');
fGlow.append('feGaussianBlur').attr('stdDeviation','3').attr('result','b');
const fMerge=fGlow.append('feMerge');fMerge.append('feMergeNode').attr('in','b');fMerge.append('feMergeNode').attr('in','SourceGraphic');
const fSoft=defs.append('filter').attr('id','softGlow').attr('x','-100%').attr('y','-100%').attr('width','300%').attr('height','300%');
fSoft.append('feGaussianBlur').attr('stdDeviation','6').attr('result','b');
const fSM=fSoft.append('feMerge');fSM.append('feMergeNode').attr('in','b');fSM.append('feMergeNode').attr('in','SourceGraphic');

// Enhanced 3D orbital particles
const pG=g.append('g');
const pLineG=pG.append('g');
const PCOLS=['#60a5fa','#22d3ee','#a78bfa','#f472b6','#34d399'];
const pts=Array.from({length:60},()=>{
  const th=Math.random()*Math.PI*2,ph=Math.random()*Math.PI;
  const r=50+Math.random()*Math.min(W,H)*0.42;
  return{th,ph,r,spd:0.001+Math.random()*0.004,phSpd:(Math.random()-0.5)*0.001,
    sz:0.6+Math.random()*2.8,col:PCOLS[Math.floor(Math.random()*PCOLS.length)],
    o:0.1+Math.random()*0.35,x:0,y:0,depth:0,pulse:Math.random()*6.28};
});
const pCircles=pG.append('g').selectAll('circle').data(pts).join('circle')
  .attr('r',d=>d.sz).attr('fill',d=>d.col).attr('opacity',d=>d.o)
  .attr('class','particle').attr('filter','url(#glow)');

const zoomEl=document.getElementById('zoom-level');
const zoom=d3.zoom().scaleExtent([0.3,3]).filter(e=>{if(e.type==='wheel')return e.ctrlKey||e.metaKey;if(e.touches)return true;return!e.button;}).on('zoom',e=>{g.attr('transform',e.transform);if(zoomEl)zoomEl.textContent=Math.round(e.transform.k*100)+'%';});
svg.call(zoom);
// Set initial zoom to 100%
const initScale=1;
svg.call(zoom.transform,d3.zoomIdentity);
document.getElementById('graph-svg').addEventListener('wheel',e=>{if(e.ctrlKey||e.metaKey)e.preventDefault();},{passive:false});
document.getElementById('zoom-in').addEventListener('click',()=>svg.transition().duration(300).call(zoom.scaleBy,1.4));
document.getElementById('zoom-out').addEventListener('click',()=>svg.transition().duration(300).call(zoom.scaleBy,0.7));
document.getElementById('zoom-reset').addEventListener('click',()=>svg.transition().duration(400).call(zoom.transform,d3.zoomIdentity));
let hv=true;svg.on('mousedown.hint',()=>{if(hv){document.getElementById('scroll-hint').style.opacity='0';hv=false;}});

const cc={};edges.forEach(e=>{cc[e.source]=(cc[e.source]||0)+1;cc[e.target]=(cc[e.target]||0)+1;});

// 3D spherical node positioning
const R=Math.min(W,H)*0.3;
const cL=Object.keys(CAT_COLORS),cC={};
cL.forEach((cat,i)=>{const th=(i/cL.length)*Math.PI*2,ph=Math.PI*0.3+(i%3)*Math.PI*0.2;cC[cat]={th,ph};});
nodes.forEach(n=>{
  const c=cC[n.cat]||{th:0,ph:Math.PI/2};
  n.th=c.th+(Math.random()-0.5)*0.9;
  n.ph=c.ph+(Math.random()-0.5)*0.5;
  n.x=R*Math.sin(n.ph)*Math.cos(n.th);
  n.y=R*Math.cos(n.ph);
  n.z=R*Math.sin(n.ph)*Math.sin(n.th);
  n.r=Math.max(6,Math.min(18,4+(cc[n.id]||0)*1.8));
});

const sim=d3.forceSimulation(nodes)
  .force('link',d3.forceLink(edges).id(d=>d.id).distance(60).strength(0.3))
  .force('charge',d3.forceManyBody().strength(-100))
  .force('collision',d3.forceCollide().radius(d=>d.r+6))
  .force('radial',d3.forceRadial(R,0,0).strength(0.12));

const lG=g.append('g');
const link=lG.selectAll('line').data(edges).join('line').attr('stroke','#64748b').attr('stroke-width',1);

const nG=g.append('g');
const node=nG.selectAll('g').data(nodes).join('g').attr('cursor','pointer').classed('node-new',d=>newIdSet.has(d.id)).attr('data-id',d=>d.id);

node.append('circle').attr('r',d=>d.r).attr('fill',d=>CAT_COLORS[d.cat]).attr('fill-opacity',0.7).attr('stroke',d=>CAT_COLORS[d.cat]).attr('stroke-width',d=>newIdSet.has(d.id)?3:1.5).attr('stroke-opacity',d=>newIdSet.has(d.id)?0.9:0.4);
node.filter(d=>newIdSet.has(d.id)).select('circle').style('filter',d=>'drop-shadow(0 0 8px '+CAT_COLORS[d.cat]+'80)');

node.append('text').text(d=>d.name).attr('text-anchor','middle').attr('dy',d=>d.r+14).attr('fill','#94a3b8').attr('font-size',d=>d.name.length>10?8:d.name.length>7?9:10).attr('pointer-events','none');
node.filter(d=>newIdSet.has(d.id)).append('text').text('NEW').attr('class','new-badge').attr('text-anchor','middle').attr('dy',d=>-d.r-6);
node.append('circle').attr('r',d=>Math.max(d.r*1.8,14)).attr('fill','transparent').attr('stroke','none').attr('pointer-events','all');

const tt=document.getElementById('tooltip');
node.on('mouseover',(e,d)=>{tt.querySelector('.tt-name').textContent=d.name;tt.querySelector('.tt-cat').textContent=d.cat;tt.style.opacity=1;d3.select(e.currentTarget).select('circle').transition().duration(200).attr('fill-opacity',1).attr('stroke-opacity',0.8).attr('stroke-width',3).style('filter','drop-shadow(0 0 8px '+CAT_COLORS[d.cat]+'60)');}).on('mousemove',e=>{tt.style.left=(e.clientX+16)+'px';tt.style.top=(e.clientY-10)+'px';}).on('mouseout',e=>{tt.style.opacity=0;if(!document.getElementById('detail-panel').classList.contains('active')&&!sA){d3.select(e.currentTarget).select('circle').transition().duration(300).attr('fill-opacity',0.7).attr('stroke-opacity',0.4).attr('stroke-width',1.5).style('filter',d=>newIdSet.has(d.id)?'drop-shadow(0 0 8px '+CAT_COLORS[d.cat]+'80)':'none');}});

node.on('mousedown',(e,d)=>{e.stopPropagation();targetSpeed=0;rotSpeed=0;clickedNode=d;showDetail(d);hlNode(d);});
node.on('touchend',(e,d)=>{if(!e.defaultPrevented){var tc=e.changedTouches[0],dx=tc.clientX-(e.target._tsx||tc.clientX),dy=tc.clientY-(e.target._tsy||tc.clientY);if(dx*dx+dy*dy<225){e.preventDefault();e.stopPropagation();targetSpeed=0;rotSpeed=0;clickedNode=d;showDetail(d);hlNode(d);}}}).on('touchstart',(e)=>{e.target._tsx=e.touches[0].clientX;e.target._tsy=e.touches[0].clientY;});
svg.on('mousedown',()=>{hideDetail();if(!sA)resetHL();});
svg.on('dblclick.zoom',null);

sim.on('tick',()=>{});// sim only resolves forces; rendering in rotation loop

// ---- 3D rotation + projection render loop ----
let rotY=0,rotSpeed=0.001,targetSpeed=0.001;
let frameCount=0;
let FOV=800,CX=W/2,CY=H/2;
let dimSet=null;
let clickedNode=null;

nG.on('mouseover',()=>{targetSpeed=0;})
    .on('mouseout',()=>{if(!clickedNode)targetSpeed=0.001;});

(function animate3D(){
  if(!graphVisible){requestAnimationFrame(animate3D);return;}
  frameCount++;
  // Smooth rotation speed transition
  rotSpeed+=(targetSpeed-rotSpeed)*0.05;
  rotY+=rotSpeed;
  const cY=Math.cos(rotY),sY=Math.sin(rotY);

  // Project nodes: 3D→2D with perspective
  nodes.forEach(d=>{
    const rx=d.x*cY-d.z*sY, rz=d.x*sY+d.z*cY;
    const sc=FOV/(FOV+rz);
    d.sx=rx*sc+CX; d.sy=d.y*sc+CY; d.sc=sc; d.depth=rz;
  });

  // Update node positions with depth-based scale & opacity
  node.attr('transform',d=>'translate('+d.sx+','+d.sy+') scale('+d.sc+')')
      .attr('opacity',d=>{const base=Math.max(0.18,Math.min(1,(d.sc-0.55)*2.8));return dimSet?(dimSet.has(d.id)?base:0.06):base;});

  // Update links with depth-based opacity for 3D volume
  link.attr('x1',d=>d.source.sx).attr('y1',d=>d.source.sy)
      .attr('x2',d=>d.target.sx).attr('y2',d=>d.target.sy)
      .attr('opacity',d=>{const as=(d.source.sc+d.target.sc)/2;return Math.max(0.1,(as-0.55)*0.8);});

  // Depth-sort nodes (back to front) every 10 frames
  if(frameCount%10===0){
    const sorted=[...nodes].sort((a,b)=>a.depth-b.depth);
    sorted.forEach(d=>{const el=document.querySelector('[data-id="'+d.id+'"]');if(el)el.parentNode.appendChild(el);});
  }

  // Orbital particles
  pts.forEach(p=>{
    p.th+=p.spd; p.ph+=p.phSpd; p.pulse+=0.02;
    const px=p.r*Math.sin(p.ph)*Math.cos(p.th);
    const py=p.r*Math.cos(p.ph);
    const pz=p.r*Math.sin(p.ph)*Math.sin(p.th);
    const rx2=px*cY-pz*sY, rz2=px*sY+pz*cY;
    const sc=FOV/(FOV+rz2);
    p.x=rx2*sc+CX; p.y=py*sc+CY; p.depth=rz2;
    p.curO=p.o*(0.4+0.6*Math.max(0,(sc-0.5)*2.5))*(0.7+0.3*Math.sin(p.pulse));
    p.curR=p.sz*sc;
  });
  pCircles.attr('cx',d=>d.x).attr('cy',d=>d.y).attr('r',d=>d.curR).attr('opacity',d=>d.curO);

  // Constellation lines between nearby particles (draw every 3 frames)
  if(frameCount%10===0){
    let lHTML='';
    for(let i=0;i<pts.length;i++){for(let j=i+1;j<pts.length;j++){
      const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,dist=Math.sqrt(dx*dx+dy*dy);
      if(dist<80){const o=Math.max(0,(1-dist/80)*0.06*Math.min(pts[i].curO,pts[j].curO)*8);
        lHTML+='<line x1="'+pts[i].x+'" y1="'+pts[i].y+'" x2="'+pts[j].x+'" y2="'+pts[j].y+'" stroke="#60a5fa" stroke-width="0.5" opacity="'+o+'"/>';
    }}}
    pLineG.html(lHTML);
  }

  requestAnimationFrame(animate3D);
})();

function hlNode(d){
  const ids=new Set([d.id]);
  edges.forEach(e=>{const s=typeof e.source==='object'?e.source.id:e.source,t=typeof e.target==='object'?e.target.id:e.target;if(s===d.id)ids.add(t);if(t===d.id)ids.add(s);});
  dimSet=ids;
  node.classed('node-dim',n=>!ids.has(n.id)).classed('node-hl',n=>ids.has(n.id));
  link.transition().duration(300).attr('stroke',e=>{const s=typeof e.source==='object'?e.source.id:e.source,t=typeof e.target==='object'?e.target.id:e.target;return(s===d.id||t===d.id)?CAT_COLORS[d.cat]:'rgba(148,163,184,0.1)';}).attr('stroke-width',e=>{const s=typeof e.source==='object'?e.source.id:e.source,t=typeof e.target==='object'?e.target.id:e.target;return(s===d.id||t===d.id)?2:0.5;});
}
let sA=false,lA=null;
function resetHL(){
  dimSet=null;
  node.classed('node-dim',false).classed('node-hl',false);
  node.select('circle').transition().duration(300).attr('fill-opacity',0.7).attr('stroke-opacity',0.4).attr('stroke-width',1.5).style('filter',d=>newIdSet.has(d.id)?'drop-shadow(0 0 8px '+CAT_COLORS[d.cat]+'80)':'none');
  node.select('text').transition().duration(300).attr('fill-opacity',1);
  link.transition().duration(300).attr('stroke','#64748b').attr('stroke-width',1);
  document.querySelectorAll('.legend-item.active').forEach(el=>el.classList.remove('active'));
  lA=null;
}
function showDetail(d){
  const p=document.getElementById('detail-panel'),c=CAT_COLORS[d.cat];
  document.getElementById('dp-badge').textContent=d.cat;document.getElementById('dp-badge').style.background=c+'20';document.getElementById('dp-badge').style.color=c;
  document.getElementById('dp-name').textContent=d.name;document.getElementById('dp-desc').textContent=d.desc;
  const pm=document.getElementById('dp-pm');if(d.pm){pm.style.display='block';document.getElementById('dp-pm-text').textContent=d.pm;}else pm.style.display='none';
  // Learning paths containing this node
  const relPaths=learningPaths.filter(lp=>lp.nodes.includes(d.id));
  const pathsEl=document.getElementById('dp-paths'),pathsList=document.getElementById('dp-paths-list');
  if(relPaths.length){pathsEl.style.display='block';pathsList.innerHTML=relPaths.map(lp=>{const idx=lp.nodes.indexOf(d.id);return'<div class="dp-path-tag" style="border-color:'+lp.color+'40;color:'+lp.color+'">'+lp.name+'<span class="dp-path-step"> · 第'+(idx+1)+'步 / 共'+lp.nodes.length+'步</span></div>';}).join('');}else pathsEl.style.display='none';
  const rel=[];edges.forEach(e=>{const s=typeof e.source==='object'?e.source.id:e.source,t=typeof e.target==='object'?e.target.id:e.target;if(s===d.id){const n=nodes.find(x=>x.id===t);if(n)rel.push(n);}if(t===d.id){const n=nodes.find(x=>x.id===s);if(n)rel.push(n);}});
  document.getElementById('dp-related').innerHTML=rel.map(r=>'<span class="dp-tag" data-id="'+r.id+'" style="border-color:'+CAT_COLORS[r.cat]+'40">'+r.name+'</span>').join('');
  document.querySelectorAll('.dp-tag').forEach(tag=>{tag.addEventListener('click',()=>{const nd=nodes.find(n=>n.id===tag.dataset.id);if(nd){showDetail(nd);hlNode(nd);}});});
  p.classList.add('active');
}
function hideDetail(){document.getElementById('detail-panel').classList.remove('active');svg.transition().duration(400).call(zoom.transform,d3.zoomIdentity);clickedNode=null;targetSpeed=0.001;}
document.getElementById('dp-close').addEventListener('click',()=>{hideDetail();if(!sA)resetHL();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){hideDetail();if(!sA)resetHL();}});

// Graph search (centered)
const gsi=document.getElementById('graph-search-input'),mce=document.getElementById('match-count');
const scb=document.getElementById('search-clear');
function clearSearch(){gsi.value='';sA=false;lA=null;resetHL();mce.textContent='';scb.classList.remove('show');}
gsi.addEventListener('input',()=>{
  const q=gsi.value.trim().toLowerCase();
  scb.classList.toggle('show',q.length>0);
  if(!q){sA=false;lA=null;resetHL();mce.textContent='';return;}
  sA=true;lA=null;
  document.querySelectorAll('.legend-item.active').forEach(el=>el.classList.remove('active'));
  const mIds=new Set();
  nodes.forEach(n=>{if(n.name.toLowerCase().includes(q)||n.desc.toLowerCase().includes(q)||n.cat.toLowerCase().includes(q)||(n.pm&&n.pm.toLowerCase().includes(q)))mIds.add(n.id);});
  dimSet=mIds;
  mce.textContent=mIds.size+'/'+nodes.length;
  node.classed('node-dim',n=>!mIds.has(n.id)).classed('node-hl',n=>mIds.has(n.id));
  link.transition().duration(200).attr('stroke',e=>{const s=typeof e.source==='object'?e.source.id:e.source,t=typeof e.target==='object'?e.target.id:e.target;return(mIds.has(s)&&mIds.has(t))?'rgba(148,163,184,0.4)':'rgba(148,163,184,0.08)';});
});
scb.addEventListener('click',clearSearch);

// Legend click: highlight nodes by category (toggle on/off, mutually exclusive with search)
document.querySelectorAll('.legend-item').forEach(item=>{
  item.addEventListener('click',()=>{
    const cat=item.dataset.cat;
    if(lA===cat){lA=null;resetHL();return;}
    lA=cat;sA=false;gsi.value='';mce.textContent='';scb.classList.remove('show');
    document.querySelectorAll('.legend-item').forEach(el=>el.classList.remove('active'));
    item.classList.add('active');
    const catIds=new Set(nodes.filter(n=>n.cat===cat).map(n=>n.id));
    dimSet=catIds;
    node.classed('node-dim',n=>!catIds.has(n.id)).classed('node-hl',n=>catIds.has(n.id));
    node.select('circle').transition().duration(300)
      .attr('fill-opacity',n=>catIds.has(n.id)?1:0.15)
      .attr('stroke-opacity',n=>catIds.has(n.id)?0.8:0.1)
      .attr('stroke-width',n=>catIds.has(n.id)?3:1);
    node.select('text').transition().duration(300).attr('fill-opacity',n=>catIds.has(n.id)?1:0.2);
    link.transition().duration(300)
      .attr('stroke',e=>{const s=typeof e.source==='object'?e.source.id:e.source,t=typeof e.target==='object'?e.target.id:e.target;return(catIds.has(s)&&catIds.has(t))?CAT_COLORS[cat]+'80':'rgba(148,163,184,0.08)';})
      .attr('stroke-width',e=>{const s=typeof e.source==='object'?e.source.id:e.source,t=typeof e.target==='object'?e.target.id:e.target;return(catIds.has(s)&&catIds.has(t))?2:0.5;});
  });
});

window.addEventListener('resize',()=>{const nW=svgEl.clientWidth,nH=svgEl.clientHeight;CX=nW/2;CY=nH/2;sim.alpha(0.3).restart();});

// Expose graph API globally for learning path clicks
window._graphAPI = { showDetail, highlightNode: hlNode };

// ---- Back to Top ----
const btt=document.getElementById('back-to-top');
window.addEventListener('scroll',()=>{if(btt)btt.classList.toggle('show',window.scrollY>400);});
if(btt)btt.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));

})(); // close async IIFE
