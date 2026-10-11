/* ============================================================
   Imberion — shared site behaviour for interior pages
   Nav elevation + scroll-progress signal · footer links ·
   magnetic CTAs · geometry-driven scroll reveal.
   ============================================================ */
/* ---- i18n engine (active only when the page defines window.IMB_I18N) ----
   Spanish is canonical (default + fallback). Pages provide:
     window.IMB_I18N = { es:{...}, en:{...}, pt:{...} }
   and mark text nodes with data-i18n="key" (innerHTML) or
   data-i18n-alt="key" (alt attribute). Optional t.__title sets <title>. */
(function(){
  var I = window.IMB_I18N;
  if(!I) return;
  function pick(){
    try{ var s = localStorage.getItem('imb_lang'); if(s && I[s]) return s; }catch(e){}
    var nl = (navigator.language || 'es').slice(0,2);
    return I[nl] ? nl : 'es';
  }
  function apply(lang){
    if(!I[lang]) lang = 'es';
    var t = I[lang];
    document.documentElement.lang = lang;
    if(t.__title) document.title = t.__title;
    document.querySelectorAll('[data-i18n]').forEach(function(el){
      var v = t[el.getAttribute('data-i18n')];
      if(v !== undefined && v !== null) el.innerHTML = v;
    });
    document.querySelectorAll('[data-i18n-alt]').forEach(function(el){
      var v = t[el.getAttribute('data-i18n-alt')];
      if(v !== undefined && v !== null) el.setAttribute('alt', v);
    });
    document.querySelectorAll('.lang-btn').forEach(function(b){
      b.classList.toggle('active', b.getAttribute('data-lang') === lang);
    });
    try{ localStorage.setItem('imb_lang', lang); }catch(e){}
  }
  window.IMBsetLang = apply;
  document.addEventListener('click', function(e){
    var b = e.target.closest ? e.target.closest('.lang-btn') : null;
    if(b){ e.preventDefault(); apply(b.getAttribute('data-lang')); }
  });
  apply(pick());
})();

(function(){
  var nav    = document.querySelector('nav');
  var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var fine   = window.matchMedia('(pointer:fine)').matches;

  /* nav progress element */
  var inner = document.querySelector('.nav-inner');
  var prog  = null;
  if(inner){
    prog = document.createElement('div');
    prog.className = 'nav-progress';
    prog.setAttribute('aria-hidden','true');
    inner.appendChild(prog);
  }

  /* populate footer links if the page left them empty */
  var fl = document.getElementById('footer-links');
  if(fl && !fl.children.length){
    var links = [
      ['How It Works','index.html#how-it-works'],
      ['Strategy','estrategia.html'],
      ['Market Signal','market-signal.html'],
      ['Floor Signal','floor-signal.html'],
      ['Concierge','concierge.html'],
      ['Retail','retail.html'],
      ["Who It's For",'index.html#who'],
      ['How we operate','how-we-operate.html'],
      ['Book a Call','https://zcal.co/rodrigoimberion/30min'],
      ['Contact','mailto:hello@imberion.com'],
      ['Aviso de privacidad','privacidad.html']
    ];
    fl.innerHTML = links.map(function(l){ return '<a href="'+l[1]+'">'+l[0]+'</a>'; }).join('');
  }

  function onScroll(){
    var y = window.scrollY || 0;
    if(nav) nav.classList.toggle('imb-elevated', y > 60);
    if(prog){
      var h = document.documentElement.scrollHeight - window.innerHeight;
      prog.style.width = (h > 0 ? Math.min(y / h, 1) * 100 : 0) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', onScroll, {passive:true});
  onScroll();

  /* magnetic CTAs */
  if(!reduce && fine){
    document.querySelectorAll('.btn').forEach(function(b){
      b.addEventListener('mousemove', function(e){
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX-r.left-r.width/2)*0.16).toFixed(1) + 'px,' + ((e.clientY-r.top-r.height/2)*0.22).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function(){ b.style.transform = ''; });
    });
  }

  if(reduce) return;

  /* geometry-driven reveal */
  var els = [];
  function mark(el, d){
    if(!el || el.__rv) return;
    el.__rv = 1;
    el.classList.add('imb-reveal');
    if(d) el.setAttribute('data-d', d);
    els.push(el);
  }

  var hero = document.querySelector('.page-hero, .hero');
  if(hero){ ['.back','.eyebrow','h1','.lead'].forEach(function(s,i){ mark(hero.querySelector(s), i); }); }

  var intro = ['.eyebrow','h2','.lead','.sec-head','.pipeline-note'];
  document.querySelectorAll('section, .cta-strip, footer').forEach(function(sec){
    if(sec.classList.contains('page-hero') || sec.classList.contains('hero')) return;
    intro.forEach(function(s){
      sec.querySelectorAll(s).forEach(function(el){ if(!el.closest('.page-hero, .hero')) mark(el); });
    });
  });
  document.querySelectorAll('.cta-strip h2, .cta-strip p, .cta-strip .btn').forEach(function(el){ mark(el); });

  ['.source-col','.submod','.value-card','.arm-card','.mod-card','.impact-card',
   '.serve-card-wrapper','.sector-chip','.feature-card','.principle','.step','.module-card','.kpi-card'
  ].forEach(function(s){
    document.querySelectorAll(s).forEach(function(el,i){ mark(el, Math.min(i%5 + 1, 5)); });
  });

  var ticking = false;
  function frame(){
    ticking = false;
    var vh = window.innerHeight;
    for(var i = els.length - 1; i >= 0; i--){
      if(els[i].getBoundingClientRect().top < vh - 40){
        els[i].classList.add('imb-in');
        els.splice(i, 1);
      }
    }
  }
  function sched(){ if(!ticking){ ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', sched, {passive:true});
  window.addEventListener('resize', sched, {passive:true});
  frame();
})();
