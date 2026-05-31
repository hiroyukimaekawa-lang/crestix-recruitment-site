/**
 * Crestix — Universal Navbar Controller
 * 全ページ共通: assets/js/navbar.js
 *
 * 機能:
 *  - スマートヘッダー (下スクロール非表示 / 上スクロール再表示)
 *  - 80px以上スクロールで背景 + ブラー付与
 *  - フルスクリーンメニュー開閉
 *  - 現在ページのnav-linkをアクティブ表示
 *  - メガメニュー (hover / keyboard accessible)
 *  - Escキーでメニュー閉じる
 *
 * 依存: Font Awesome 6.x (icon), Poppins / Noto Sans JP (font)
 */

(function () {
  'use strict';

  /* ── Elements ────────────────────────────────────────── */
  const navbar   = document.getElementById('cx-navbar');
  const fmenu    = document.getElementById('fullscreen-menu');
  const hamLines = document.getElementById('cx-ham-lines');
  const hamBtn   = document.getElementById('cx-hamburger');

  if (!navbar) return; /* Navbar not present on this page — bail */

  /* ── State ───────────────────────────────────────────── */
  let menuOpen = false;
  let lastScrollY = window.scrollY;
  let ticking = false;

  /* ── Scroll handler ──────────────────────────────────── */
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  }

  function updateNavbar() {
    const y = window.scrollY;
    const goingDown = y > lastScrollY;
    const scrolled  = y > 80;

    /* Background + blur */
    if (scrolled) {
      navbar.classList.add('cx-scrolled');
    } else {
      navbar.classList.remove('cx-scrolled');
    }

    /* Smart hide / show — only when menu is closed */
    if (!menuOpen) {
      if (scrolled && goingDown) {
        navbar.classList.add('cx-hidden');
      } else {
        navbar.classList.remove('cx-hidden');
      }
    }

    lastScrollY = y;
    ticking = false;
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  /* Run once on load to set initial state */
  updateNavbar();

  /* ── Active page detection ───────────────────────────── */
  (function setActiveLink() {
    const path     = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';

    /* Map: filename keyword → data-page value */
    const pageMap = {
      'index'          : 'index',
      'corporate'      : 'corporate',
      'company'        : 'corporate',   /* company.html → corporate active */
      'mvv'            : 'corporate',   /* mvv.html → corporate active */
      'message'        : 'corporate',   /* message.html → corporate active */
      'business'       : 'business',
      'service-sales'  : 'business',    /* service pages → business active */
      'service-meraise': 'business',
      'members'        : 'members',
      'news'           : 'news',
      'jobs'           : 'news',        /* jobs → Crestory section */
      'privacy'        : '',
      'terms'          : '',
    };

    /* Find matching key */
    let activePage = '';
    for (const [key, val] of Object.entries(pageMap)) {
      if (filename.includes(key)) {
        activePage = val;
        break;
      }
    }

    if (!activePage) return;

    /* Apply cx-active to matching links */
    document.querySelectorAll('.cx-nav-link[data-page]').forEach(link => {
      if (link.dataset.page === activePage) {
        link.classList.add('cx-active');
      }
    });
  })();

  /* ── Fullscreen menu ─────────────────────────────────── */
  function toggleMenu(forceClose) {
    menuOpen = forceClose === true ? false : !menuOpen;

    if (fmenu)    fmenu.classList.toggle('cx-fm-open', menuOpen);
    if (hamLines) hamLines.classList.toggle('cx-open', menuOpen);
    if (hamBtn)   hamBtn.setAttribute('aria-expanded', menuOpen);

    /* Prevent body scroll when menu open */
    document.body.style.overflow = menuOpen ? 'hidden' : '';

    /* Always show navbar when menu opens */
    if (menuOpen) {
      navbar.classList.remove('cx-hidden');
    }
  }

  /* Expose globally — used by onclick in HTML */
  window.cxToggleMenu = toggleMenu;

  /* Legacy support for old toggleMenu() calls in existing pages */
  if (!window.toggleMenu) {
    window.toggleMenu = toggleMenu;
  }

  /* Close on Escape */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menuOpen) toggleMenu(true);
  });

  /* Close when clicking outside fullscreen menu on desktop */
  if (fmenu) {
    fmenu.addEventListener('click', function (e) {
      /* Only close if click was on the overlay bg, not a child link */
      if (e.target === fmenu) toggleMenu(true);
    });
  }

  /* ── Mega menu keyboard support ──────────────────────── */
  document.querySelectorAll('.cx-mega-trigger').forEach(trigger => {
    const link = trigger.querySelector('.cx-nav-link');
    const menu = trigger.querySelector('.cx-mega-menu');
    if (!link || !menu) return;

    /* Show on focus within trigger */
    trigger.addEventListener('focusin', () => {
      menu.style.opacity = '1';
      menu.style.pointerEvents = 'auto';
      menu.style.transform = 'translateX(-50%) translateY(0)';
    });
    trigger.addEventListener('focusout', (e) => {
      if (!trigger.contains(e.relatedTarget)) {
        menu.style.opacity = '';
        menu.style.pointerEvents = '';
        menu.style.transform = '';
      }
    });
  });

})();