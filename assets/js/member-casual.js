(function () {
  'use strict';

  const members = {
    nishida: {
      name: '西田 翔',
      role: 'COO',
      area: '経営・事業推進',
      media: 'assets/images/video/nishita.mp4',
      interview: 'https://crestory.crestix.jp/nishida-interview/'
    },
    maekawa: {
      name: '前川 弘行',
      role: 'CTO',
      area: 'プロダクト・技術戦略',
      media: 'assets/images/video/mae1.mp4',
      interview: 'https://crestory.crestix.jp/maekawa-interview/'
    },
    matsuoka: {
      name: '松岡 龍士',
      role: '第一営業部 FS',
      area: '医療機関向けフィールドセールス',
      media: 'assets/images/video/matuoka.mp4',
      interview: 'https://crestory.crestix.jp/matsuoka-interview/'
    },
    takahara: {
      name: '髙原 一真',
      role: 'Marketing MG',
      area: 'マーケティング・集患支援',
      media: 'assets/images/video/kazumatakahara.mp4'
    },
    uoi: {
      name: '魚井 風太',
      role: 'HD事業部 FS',
      area: '店舗向けフィールドセールス',
      media: 'assets/images/video/uoi.mp4'
    },
    mizugaki: {
      name: '水柿 裕香',
      role: 'HD事業部 CS',
      area: '店舗向けカスタマーサクセス',
      media: 'assets/images/video/mizugaki.mp4'
    }
  };

  const key = document.body.dataset.member;
  const member = members[key];
  if (!member) return;

  const talkItems = [
    `${member.role}としての日々の挑戦について`,
    'Crestixのカルチャーや働き方について',
    'キャリアや今後挑戦したいことについて'
  ];

  const targetItems = [
    'Crestixに少しでも興味がある人',
    '成長環境やチャレンジングな環境を探している人'
  ];

  const intro = `${member.role}として${member.area}を担当。日々の業務や挑戦について気軽に話せたら嬉しいです。`;
  const encodedName = encodeURIComponent(member.name);

  const setText = (selector, text) => {
    document.querySelectorAll(selector).forEach(el => {
      el.textContent = text;
    });
  };

  setText('[data-casual-name]', member.name);
  setText('[data-casual-role]', member.role);
  setText('[data-casual-area]', member.area);
  setText('[data-casual-intro]', intro);
  document.title = `${member.name}とカジュアル面談 | Crestix Careers`;

  const talkList = document.getElementById('talk-list');
  if (talkList) {
    talkList.innerHTML = talkItems.map(item => `<li>${item}</li>`).join('');
  }

  const targetList = document.getElementById('target-list');
  if (targetList) {
    targetList.innerHTML = targetItems.map(item => `<li>${item}</li>`).join('');
  }

  const mediaWrap = document.getElementById('casual-media');
  if (mediaWrap) {
    mediaWrap.innerHTML = `
      <video autoplay muted loop playsinline preload="metadata" aria-label="${member.role} | ${member.name}">
        <source src="${member.media}" type="video/mp4">
      </video>
    `;
  }

  const interviewSlot = document.getElementById('interview-action');
  if (interviewSlot && member.interview) {
    interviewSlot.innerHTML = `
      <a href="${member.interview}" class="casual-btn" target="_blank" rel="noopener noreferrer">
        インタビュー記事を読む <i class="fa-solid fa-arrow-up-right-from-square"></i>
      </a>
    `;
  }

  const hiddenName = document.querySelector('input[name="member_name"]');
  if (hiddenName) hiddenName.value = member.name;

  const next = document.querySelector('input[name="_next"]');
  if (next) next.value = `https://crestix.jp/thanks.html?name=${encodedName}`;

  const formTitle = document.getElementById('form-title');
  if (formTitle) formTitle.textContent = `${member.name}と話してみる`;

  const sections = Array.from(document.querySelectorAll('.casual-section[id]'));
  const links = Array.from(document.querySelectorAll('.casual-index a[href^="#"]'));

  links.forEach(link => {
    link.addEventListener('click', event => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(link => {
        link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`);
      });
    });
  }, { rootMargin: '-35% 0px -55% 0px', threshold: 0.01 });

  sections.forEach(section => observer.observe(section));
})();
