// ========================================
// GLOBALS & UTILS
// ========================================

const i18n = {
  cs: {
    "nav.home":"Ahoj","nav.story":"Bylo nebylo","nav.news":"Aktuality","nav.gallery":"Fotogalerie","nav.program":"Program","nav.about":"O nás","nav.contact":"Kontakt",
    "hero.kicker":"Oficiální stránky","hero.title":"Divoká voda – ČB","hero.lead":"Aktuality, galerie, program a live výsledky – přehledně a rychle.",
    "feat.news":"Aktuality","feat.news-desc":"Novinky, reporty a články z akcí.","feat.read":"Číst",
    "feat.gallery":"Fotogalerie","feat.gallery-desc":"Fotky ze závodů a tréninků.","feat.open":"Otevřít",
    "feat.schedule":"Harmonogram","feat.schedule-desc":"Program závodních dnů a startovní listiny.","feat.view":"Zobrazit",
    "aside.quick":"Rychlé odkazy","aside.live":"Live TV","aside.race":"Race Office","aside.docs":"Oficiální dokumenty","aside.sponsors":"Sponzoři",
    "news.title":"Nejnovější","news.lead":"Tady bude feed z aktualit – můžeš to napojit na RSS nebo CMS."
  },
  en: {
    "nav.home":"Home","nav.story":"Story","nav.news":"News","nav.gallery":"Gallery","nav.program":"Program","nav.about":"About","nav.contact":"Contact",
    "hero.kicker":"Official site","hero.title":"Whitewater – CB","hero.lead":"News, gallery, schedule and live results – clear and fast.",
    "feat.news":"News","feat.news-desc":"News, reports and articles from events.","feat.read":"Read",
    "feat.gallery":"Gallery","feat.gallery-desc":"Photos from races and training.","feat.open":"Open",
    "feat.schedule":"Schedule","feat.schedule-desc":"Race day schedule and start lists.","feat.view":"View",
    "aside.quick":"Quick links","aside.live":"Live TV","aside.race":"Race Office","aside.docs":"Official documents","aside.sponsors":"Sponsors",
    "news.title":"Latest","news.lead":"This will be the news feed – you can hook it up to RSS or CMS."
  }
};

const fmtDate = dstr => new Date(dstr).toLocaleDateString('cs-CZ', {year:'numeric',month:'short',day:'numeric'});

// ========================================
// THEME
// ========================================

function setTheme(theme) {
  if (theme === 'light') {
    document.documentElement.classList.add('light');
  } else {
    document.documentElement.classList.remove('light');
  }
  localStorage.setItem('wwcb_theme', theme);
  updateLogo(theme);
}

function updateLogo(theme) {
  const logo = document.querySelector('header img[alt*="logo"]');
  if (logo) {
    logo.src = theme === 'light' ? 'images/logo.png' : 'images/logo1.png';
  }
}

function toggleTheme() {
  const cur = localStorage.getItem('wwcb_theme') || 'dark';
  const next = (cur === 'light') ? 'dark' : 'light';
  setTheme(next);
}

function initTheme() {
  const savedTheme = localStorage.getItem('wwcb_theme') || 
    (window.matchMedia && window.matchMedia('(prefers-color-scheme:light)').matches ? 'light' : 'dark');
  setTheme(savedTheme);
}

// ========================================
// LANGUAGE
// ========================================

function applyLang(lang) {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const txt = (i18n[lang] && i18n[lang][key]) ? i18n[lang][key] : key;
    el.textContent = txt;
  });
  
  const label = document.getElementById('langLabel');
  if (label) label.textContent = (lang === 'cs' ? 'CZ' : 'EN');
  
  document.documentElement.lang = (lang === 'cs' ? 'cs' : 'en');
}

function toggleLang() {
  const cur = localStorage.getItem('wwcb_lang') || 'cs';
  const next = (cur === 'cs') ? 'en' : 'cs';
  localStorage.setItem('wwcb_lang', next);
  applyLang(next);
}

function initLang() {
  const savedLang = localStorage.getItem('wwcb_lang') || 'cs';
  applyLang(savedLang);
}

// ========================================
// MOBILE MENU
// ========================================

function initMobilePanel() {
  const mobilePanel = document.getElementById('mobilePanel');
  const hamburger = document.getElementById('hamburger');
  const closePanel = document.getElementById('closePanel');
  const overlay = document.getElementById('mobileOverlay');
  
  if (!mobilePanel || !hamburger) return;
  
  function openPanel() { 
    mobilePanel.classList.add('open'); 
    mobilePanel.setAttribute('aria-hidden', 'false'); 
  }
  
  function closePanelFn() { 
    mobilePanel.classList.remove('open'); 
    mobilePanel.setAttribute('aria-hidden', 'true'); 
  }
  
  hamburger.addEventListener('click', openPanel);
  if (closePanel) closePanel.addEventListener('click', closePanelFn);
  if (overlay) overlay.addEventListener('click', closePanelFn);
  
  document.addEventListener('keydown', (e) => { 
    if (e.key === 'Escape') closePanelFn(); 
  });
}

// ========================================
// NAV HIGHLIGHT
// ========================================

function highlightNav() {
  const cur = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(a => {
    a.classList.remove('active');
    const href = a.getAttribute('href') || '';
    if (href === cur) a.classList.add('active');
  });
}

// ========================================
// HEADER/FOOTER
// ========================================

async function loadPartials() {
  try {
    const [headerRes, footerRes] = await Promise.all([
      fetch('header.html'),
      fetch('footer.html')
    ]);
    
    const [headerHtml, footerHtml] = await Promise.all([
      headerRes.text(),
      footerRes.text()
    ]);
    
    document.getElementById('site-header').innerHTML = headerHtml;
    document.getElementById('site-footer').innerHTML = footerHtml;
    
    bindHeaderEvents();
  } catch (e) {
    console.error('Error loading partials:', e);
  }
}

function bindHeaderEvents() {
  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.replaceWith(themeToggle.cloneNode(true));
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  }
  
  // Lang toggle
  const langToggle = document.getElementById('langToggle');
  if (langToggle) {
    langToggle.replaceWith(langToggle.cloneNode(true));
    document.getElementById('langToggle').addEventListener('click', toggleLang);
  }
  
  // Mobile menu
  initMobilePanel();
  
  // Update logo after header is loaded
  const currentTheme = localStorage.getItem('wwcb_theme') || 'dark';
  updateLogo(currentTheme);
}

// ========================================
// FEED LOADING
// ========================================

async function loadFeed() {
  try {
    let res = await fetch('data/feed.json');
    if (!res.ok) {
      res = await fetch('data/feed.txt');
      if (!res.ok) throw new Error('Feed not found');
    }
    const text = await res.text();
    return JSON.parse(text);
  } catch (e) {
    console.error('Feed load error:', e);
    return null;
  }
}

async function loadFeedInto(container) {
  const articles = await loadFeed();
  
  if (!articles || !articles.length) {
    container.innerHTML = '<div class="empty">Žádné články. Přidej nějaký.</div>';
    return;
  }
  
  container.innerHTML = '';
  
  articles.forEach(a => {
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
          <div class="art-actions">
            <div style="margin-left:auto"></div>
            <div class="muted" style="color:var(--muted);font-size:13px">Číst dál →</div>
          </div>
        </div>
      </a>
    `;
    container.appendChild(row);
  });
}

// ========================================
// ARTICLE DETAIL
// ========================================

async function loadArticleDetail(id, container) {
  const articles = await loadFeed();
  
  if (!articles) {
    container.querySelector('#title').textContent = 'Chyba načítání';
    container.querySelector('#meta').textContent = '';
    container.querySelector('#content').innerHTML = '<p class="muted">Nepodařilo se načíst článek.</p>';
    return;
  }
  
  const art = articles.find(a => a.id === id);
  
  if (!art) {
    container.querySelector('#title').textContent = 'Článek nenalezen';
    container.querySelector('#meta').textContent = '';
    container.querySelector('#content').innerHTML = '<p class="muted">Tenhle článek tu momentálně není. Zkus zpět nebo otevři jiný.</p>';
    return;
  }
  
  container.querySelector('#title').textContent = art.title;
  container.querySelector('#meta').textContent = new Date(art.date).toLocaleDateString('cs-CZ', {year:'numeric',month:'long',day:'numeric'});
  
  // Auto-convert newlines to <br> if content doesn't contain HTML tags
  let content = art.content;
  if (content && !content.includes('<')) {
    content = '<p>' + content.replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br>') + '</p>';
  }
  
  container.querySelector('#content').innerHTML = content;
  
  // Init gallery
  const images = art.images || [art.image];
  if (images && images.length > 0) {
    initGallery(images);
  }
}

// ========================================
// GALLERY
// ========================================

let currentImages = [];
let currentIndex = 0;

function initGallery(images) {
  currentImages = images.filter(img => img); // remove empty
  if (currentImages.length === 0) return;
  
  currentIndex = 0;
  
  const gallery = document.getElementById('gallery');
  const galleryImg = document.getElementById('galleryImg');
  const counter = document.getElementById('counter');
  const prevBtn = document.getElementById('prevImg');
  const nextBtn = document.getElementById('nextImg');
  
  if (!gallery || !galleryImg) return;
  
  gallery.style.display = 'block';
  
  function updateGallery() {
    galleryImg.src = currentImages[currentIndex];
    counter.textContent = `${currentIndex + 1} / ${currentImages.length}`;
    
    prevBtn.style.opacity = currentIndex === 0 ? '0.3' : '1';
    nextBtn.style.opacity = currentIndex === currentImages.length - 1 ? '0.3' : '1';
  }
  
  prevBtn.onclick = () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateGallery();
    }
  };
  
  nextBtn.onclick = () => {
    if (currentIndex < currentImages.length - 1) {
      currentIndex++;
      updateGallery();
    }
  };
  
  // Fullscreen on click
  galleryImg.onclick = () => openFullscreen(currentIndex);
  
  updateGallery();
}

function openFullscreen(index) {
  currentIndex = index;
  const modal = document.getElementById('fullscreenModal');
  const modalImg = document.getElementById('modalImg');
  
  if (!modal || !modalImg) return;
  
  modal.style.display = 'flex';
  modalImg.src = currentImages[currentIndex];
  document.body.style.overflow = 'hidden';
  
  updateModalNav();
}

function closeFullscreen() {
  const modal = document.getElementById('fullscreenModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}

function updateModalNav() {
  const modalImg = document.getElementById('modalImg');
  if (modalImg) modalImg.src = currentImages[currentIndex];
}

function prevModalImg() {
  if (currentIndex > 0) {
    currentIndex--;
    updateModalNav();
  }
}

function nextModalImg() {
  if (currentIndex < currentImages.length - 1) {
    currentIndex++;
    updateModalNav();
  }
}

function initModalControls() {
  const closeBtn = document.getElementById('closeModal');
  const prevBtn = document.getElementById('prevModal');
  const nextBtn = document.getElementById('nextModal');
  const modal = document.getElementById('fullscreenModal');
  
  if (closeBtn) closeBtn.onclick = closeFullscreen;
  if (prevBtn) prevBtn.onclick = prevModalImg;
  if (nextBtn) nextBtn.onclick = nextModalImg;
  
  if (modal) {
    modal.onclick = (e) => {
      if (e.target === modal) closeFullscreen();
    };
  }
  
  document.addEventListener('keydown', (e) => {
    if (modal && modal.style.display === 'flex') {
      if (e.key === 'Escape') closeFullscreen();
      if (e.key === 'ArrowLeft') prevModalImg();
      if (e.key === 'ArrowRight') nextModalImg();
    }
  });
}

// ========================================
// SPA NAVIGATION
// ========================================

async function spaNavigate(url, addToHistory = true) {
  try {
    const res = await fetch(url, {cache: 'no-cache'});
    if (!res.ok) { 
      window.location.href = url; 
      return; 
    }
    
    const text = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    const newMain = doc.querySelector('#app-content') || doc.querySelector('main');
    
    if (!newMain) { 
      window.location.href = url; 
      return; 
    }
    
    const main = document.getElementById('app-content');
    main.innerHTML = newMain.innerHTML;
    
    const newTitle = doc.querySelector('title');
    if (newTitle) document.title = newTitle.textContent;
    
    if (addToHistory) history.pushState({url}, '', url);
    
    await initPageContent(url);
    
  } catch (e) {
    console.error('SPA nav failed', e);
    window.location.href = url;
  }
}

function initSpaLinks() {
  document.addEventListener('click', function(e) {
    const a = e.target.closest('a');
    if (!a) return;
    
    if (a.hasAttribute('target') && a.getAttribute('target') !== '_self') return;
    
    const href = a.getAttribute('href');
    if (!href) return;
    
    if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;
    
    try {
      const url = new URL(href, location.href);
      if (url.origin !== location.origin) return;
      
      if (url.pathname.endsWith('.html') || a.hasAttribute('data-spa')) {
        e.preventDefault();
        spaNavigate(url.pathname + url.search);
      }
    } catch (err) {
      // ignore
    }
  }, {once: false, capture: true});
}

window.addEventListener('popstate', (e) => {
  const url = (e.state && e.state.url) ? e.state.url : location.pathname + location.search;
  spaNavigate(url, false);
});

// ========================================
// PAGE-SPECIFIC CONTENT
// ========================================

async function initPageContent(url = location.href) {
  const main = document.getElementById('app-content');
  if (!main) {
    console.log('No main element found');
    return;
  }
  
  // Get page ONLY from url path (ignore data-page, je to mess)
  const urlPath = url.split('?')[0].split('/').pop() || 'index.html';
  const page = urlPath.replace('.html', '');
  
  console.log('Loading page:', page, 'from url:', urlPath);
  
  const u = new URL(url, location.origin);
  
  // Media page (aktuality list)
  if (page === 'media') {
    const list = document.getElementById('list');
    console.log('Media page detected, list element:', !!list);
    if (list) {
      console.log('Calling loadFeedInto...');
      await loadFeedInto(list);
      console.log('loadFeedInto complete');
    }
  }
  
  // Article detail
  if (page === 'article') {
    const id = u.searchParams.get('id');
    const articleContainer = document.getElementById('article');
    console.log('Article page detected, id:', id, 'container:', !!articleContainer);
    if (articleContainer && id) {
      await loadArticleDetail(id, articleContainer);
      initModalControls();
    }
  }
  
  // Update year in footer
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  
  // Re-apply common UI
  initLang();
  highlightNav();
}

// ========================================
// INIT
// ========================================

async function init() {
  // Set theme immediately
  initTheme();
  
  // Init common UI (can run before partials)
  initLang();
  initSpaLinks();
  
  // Load header/footer
  await loadPartials();
  
  highlightNav();
  
  // CRITICAL: Load page-specific content AFTER everything else
  await initPageContent();
  
  console.log('Init complete');
}

// Expose toggles globally for inline onclick handlers
window.toggleTheme = toggleTheme;
window.toggleLang = toggleLang;

// Start everything when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}