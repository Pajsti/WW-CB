console.log('Scripts.js starting to load...');

// QUICK FIX: expose global toggles so header buttons (inline onclick) always work
window.toggleTheme = function(){
  try{
    const cur = localStorage.getItem('wwcb_theme') || 'dark';
    const next = (cur === 'light') ? 'dark' : 'light';
    setTheme(next);
  }catch(e){ console.error('toggleTheme error', e); }
};

window.toggleLang = function(){
  try{
    const cur = localStorage.getItem('wwcb_lang') || 'cs';
    const next = (cur === 'cs') ? 'en' : 'cs';
    localStorage.setItem('wwcb_lang', next);
    applyLang(next);
  }catch(e){ console.error('toggleLang error', e); }
};

// i18n data
const i18n = {
  cs: {
    "nav.home":"Ahoj","nav.story":"Bylo nebylo","nav.news":"Aktuality","nav.gallery":"Fotogalerie","nav.program":"Program","nav.about":"O nás","nav.contact":"Kontakt",
    "hero.kicker":"Oficiální stránky","hero.title":"Divoká voda — ČB","hero.lead":"Aktuality, galerie, program a live výsledky — přehledně a rychle.",
    "feat.news":"Aktuality","feat.news-desc":"Novinky, reporty a články z akcí.","feat.read":"Číst",
    "feat.gallery":"Fotogalerie","feat.gallery-desc":"Fotky ze závodů a tréninků.","feat.open":"Otevřít",
    "feat.schedule":"Harmonogram","feat.schedule-desc":"Program závodních dnů a startovní listiny.","feat.view":"Zobrazit",
    "aside.quick":"Rychlé odkazy","aside.live":"Live TV","aside.race":"Race Office","aside.docs":"Oficiální dokumenty","aside.sponsors":"Sponzoři",
    "news.title":"Nejnovější","news.lead":"Tady bude feed z aktualit — můžeš to napojit na RSS nebo CMS."
  },
  en: {
    "nav.home":"Home","nav.story":"Story","nav.news":"News","nav.gallery":"Gallery","nav.program":"Program","nav.about":"About","nav.contact":"Contact",
    "hero.kicker":"Official site","hero.title":"Whitewater — CB","hero.lead":"News, gallery, schedule and live results — clear and fast.",
    "feat.news":"News","feat.news-desc":"News, reports and articles from events.","feat.read":"Read",
    "feat.gallery":"Gallery","feat.gallery-desc":"Photos from races and training.","feat.open":"Open",
    "feat.schedule":"Schedule","feat.schedule-desc":"Race day schedule and start lists.","feat.view":"View",
    "aside.quick":"Quick links","aside.live":"Live TV","aside.race":"Race Office","aside.docs":"Official documents","aside.sponsors":"Sponsors",
    "news.title":"Latest","news.lead":"This will be the news feed — you can hook it up to RSS or CMS."
  }
};

function applyLang(lang){
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key = el.getAttribute('data-i18n');
    const txt = (i18n[lang] && i18n[lang][key]) ? i18n[lang][key] : key;
    el.textContent = txt;
  });
  const label = document.getElementById('langLabel');
  if(label) label.textContent = (lang === 'cs' ? 'CZ' : 'EN');
  document.documentElement.lang = (lang === 'cs' ? 'cs' : 'en');
}

function initLang(){
  console.log('Initializing lang...');
  const savedLang = localStorage.getItem('wwcb_lang') || 'cs';
  console.log('Saved lang:', savedLang);
  applyLang(savedLang);
  const langToggle = document.getElementById('langToggle');
  console.log('Lang toggle found:', !!langToggle);
  if(langToggle && !langToggle._bound){
    langToggle.addEventListener('click', ()=>{
      console.log('Lang button clicked');
      window.toggleLang();
    });
    langToggle._bound = true;
  }
}

function setTheme(theme){
  if(theme === 'light') {
    document.documentElement.classList.add('light');
  } else {
    document.documentElement.classList.remove('light');
  }
  localStorage.setItem('wwcb_theme', theme);
}

function initTheme(){
  console.log('Initializing theme...');
  const savedTheme = localStorage.getItem('wwcb_theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme:light)').matches ? 'light' : 'dark');
  console.log('Saved theme:', savedTheme);
  setTheme(savedTheme);
  const themeToggle = document.getElementById('themeToggle');
  console.log('Theme toggle found:', !!themeToggle);
  if(themeToggle && !themeToggle._bound){
    themeToggle.addEventListener('click', ()=>{
      console.log('Theme button clicked');
      window.toggleTheme();
    });
    themeToggle._bound = true;
  }
}

function initMobilePanel(){
  const mobilePanel = document.getElementById('mobilePanel');
  const hamburger = document.getElementById('hamburger');
  const closePanel = document.getElementById('closePanel');
  const overlay = document.getElementById('mobileOverlay');
  
  if(!mobilePanel || !hamburger) return;
  if(hamburger._bound) return;
  
  function openPanel(){ 
    mobilePanel.classList.add('open'); 
    mobilePanel.setAttribute('aria-hidden','false'); 
  }
  function closePanelFn(){ 
    mobilePanel.classList.remove('open'); 
    mobilePanel.setAttribute('aria-hidden','true'); 
  }
  
  hamburger.addEventListener('click', openPanel);
  if(closePanel) closePanel.addEventListener('click', closePanelFn);
  if(overlay) overlay.addEventListener('click', closePanelFn);
  
  document.addEventListener('keydown', (e)=>{ 
    if(e.key === 'Escape') closePanelFn(); 
  });
  
  hamburger._bound = true;
}

function highlightNav(){
  const cur = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(a=>{
    a.classList.remove('active');
    const href = a.getAttribute('href') || '';
    if(href === cur) a.classList.add('active');
  });
}

// Page handlers (centralized)
async function loadFeedInto(container){
  try{
    console.log('Attempting to load feed...');
    // Zkus najít feed - buď JSON nebo TXT fallback
    let res, articles;
    try {
      res = await fetch('data/feed.json');
      if(!res.ok) throw new Error('JSON failed');
      articles = await res.json();
    } catch(e) {
      console.log('JSON failed, trying TXT:', e);
      res = await fetch('data/feed.txt');
      if(!res.ok) throw new Error('TXT also failed');
      const text = await res.text();
      articles = JSON.parse(text);
    }
    
    console.log('Feed loaded:', articles);
    container.innerHTML = '';
    
    if(!articles || !articles.length){
      container.innerHTML = '<div class="empty">Žádné články. Přidej nějaký.</div>';
      return;
    }
    
    const fmtDate = dstr => new Date(dstr).toLocaleDateString('cs-CZ', {year:'numeric',month:'short',day:'numeric'});
    
    articles.forEach(a=>{
      const row = document.createElement('article');
      row.className = 'article-row';
      row.innerHTML = `
        <a href="article.html?id=${encodeURIComponent(a.id)}" data-spa style="display:flex;gap:16px;text-decoration:none;color:inherit;width:100%;">
          <div class="art-thumb"><img src="${a.image}" alt="${a.title}"></div>
          <div class="art-body">
            <div class="art-meta">
              <div style="min-width:0"><h3 class="art-title">${a.title}</h3></div>
              <div class="date-pill">${fmtDate(a.date)}</div>
            </div>
            <p class="art-excerpt">${a.excerpt}</p>
            <div class="art-actions"><div style="margin-left:auto"></div><div class="muted" style="color:var(--muted);font-size:13px">Číst dál →</div></div>
          </div>
        </a>
      `;
      container.appendChild(row);
    });
  }catch(e){
    container.innerHTML = '<div class="empty">Chyba při načítání feedu.</div>';
    console.error('Feed load error:', e);
  }
}

async function loadArticleDetail(id, container){
  try{
    console.log('Loading article:', id);
    // Zkus najít feed - buď JSON nebo TXT fallback  
    let res, articles;
    try {
      res = await fetch('data/feed.json');
      if(!res.ok) throw new Error('JSON failed');
      articles = await res.json();
    } catch(e) {
      console.log('JSON failed, trying TXT:', e);
      res = await fetch('data/feed.txt');
      if(!res.ok) throw new Error('TXT also failed');
      const text = await res.text();
      articles = JSON.parse(text);
    }
    
    const art = articles.find(a=>a.id === id);
    
    if(!art){
      container.querySelector('#title').textContent = 'Článek nenalezen';
      container.querySelector('#meta').textContent = '';
      container.querySelector('#content').innerHTML = '<p class="muted">Tenhle článek tu momentálně není. Zkus zpět nebo otevři jiný.</p>';
      const hero = container.querySelector('#hero');
      if(hero) hero.style.display = 'none';
      return;
    }
    
    container.querySelector('#title').textContent = art.title;
    container.querySelector('#meta').textContent = new Date(art.date).toLocaleDateString('cs-CZ', {year:'numeric',month:'long',day:'numeric'});
    const heroImg = container.querySelector('#hero img');
    if(heroImg){ 
      heroImg.src = art.image; 
      heroImg.alt = art.title; 
    }
    container.querySelector('#content').innerHTML = art.content;
  }catch(e){
    container.querySelector('#content').innerHTML = '<p class="muted">Chyba při načítání článku.</p>';
    console.error('Article load error:', e);
  }
}

// SPA navigation
async function spaNavigate(url, addToHistory = true){
  try{
    const res = await fetch(url, {cache: 'no-cache'});
    if(!res.ok) { 
      window.location.href = url; 
      return; 
    }
    
    const text = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    const newMain = doc.querySelector('#app-content') || doc.querySelector('main');
    
    if(!newMain){ 
      window.location.href = url; 
      return; 
    }
    
    const main = document.getElementById('app-content');
    main.innerHTML = newMain.innerHTML;
    
    // update title
    const newTitle = doc.querySelector('title');
    if(newTitle) document.title = newTitle.textContent;
    
    // push state
    if(addToHistory) history.pushState({url}, '', url);
    
    // run page-specific initializer
    const page = main.getAttribute('data-page') || (url.split('/').pop() || 'index.html');
    
    setTimeout(()=>{
      initCommon();
      
      if(page === 'media.html' || page === 'media') {
        const list = document.getElementById('list');
        if(list) loadFeedInto(list);
      } else if(page.startsWith('article.html') || page === 'article') {
        const u = new URL(url, location.origin);
        const id = u.searchParams.get('id');
        const articleContainer = document.getElementById('article');
        if(articleContainer) loadArticleDetail(id, articleContainer);
      }
    }, 20);
  }catch(e){
    console.error('SPA nav failed', e);
    window.location.href = url;
  }
}

// click delegation to intercept links
function initSpaLinks(){
  if(document._spaBound) return;
  
  document.addEventListener('click', function(e){
    const a = e.target.closest('a');
    if(!a) return;
    
    if(a.hasAttribute('target') && a.getAttribute('target') !== '_self') return;
    
    const href = a.getAttribute('href');
    if(!href) return;
    
    if(href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;
    
    try{
      const url = new URL(href, location.href);
      if(url.origin !== location.origin) return;
      
      if(url.pathname.endsWith('.html') || a.hasAttribute('data-spa')){
        e.preventDefault();
        spaNavigate(url.pathname + url.search);
      }
    }catch(err){
      // ignore
    }
  });
  
  document._spaBound = true;
}

// handle popstate
window.addEventListener('popstate', (e)=>{
  const url = (e.state && e.state.url) ? e.state.url : location.pathname + location.search;
  spaNavigate(url, false);
});

// initialize common features
function initCommon(){
  initLang();
  initTheme();
  initMobilePanel();
  highlightNav();
  initSpaLinks();
  
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();
}

// initial call after DOMContentLoaded
document.addEventListener('DOMContentLoaded', ()=>{
  // Delší timeout pro IIS a pomalejší servery
  setTimeout(()=>{
    initCommon();
    
    // run page-specific code for initial load
    const main = document.getElementById('app-content');
    if(main){
      const page = main.getAttribute('data-page') || (location.pathname.split('/').pop() || 'index.html');
      
      if(page === 'media.html' || page === 'media'){
        const list = document.getElementById('list');
        if(list) {
          console.log('Loading feed into list...');
          // Další timeout pro feed načítání
          setTimeout(() => loadFeedInto(list), 100);
        }
      } else if(page.startsWith('article.html') || page === 'article'){
        const u = new URL(location.href);
        const id = u.searchParams.get('id');
        const articleContainer = document.getElementById('article');
        if(articleContainer) {
          // Další timeout pro článek
          setTimeout(() => loadArticleDetail(id, articleContainer), 100);
        }
      }
    }
  }, 200);
});