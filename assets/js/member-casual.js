(function () {
  'use strict';

  const members = {
    nishida: {
      name: '西田 翔',
      role: 'COO',
      area: '経営・事業推進',
      media: 'assets/images/video/nishita.mp4',
      interview: 'https://crestory.crestix.jp/nishida-interview/',
      lead: 'Crestixの事業づくり・組織づくりについて何でも話します',
      talk: [
        'COOとしての事業づくり・組織づくりのリアルについて',
        'Crestixがこれからどんな会社を目指していくのかについて',
        '若いうちから裁量を持って挑戦する働き方について'
      ],
      target: [
        '完成された環境に入るより、会社や事業を一緒につくっていくことにワクワクする方。',
        '若いうちから裁量を持ちたい方。',
        'Crestixのリアルな組織づくりや、これからの成長可能性について聞いてみたい方。'
      ],
      intro: 'COOとして経営・事業推進を担当しています。Crestixの事業づくり、組織づくり、これからの成長可能性について、飾らずにお話しできれば嬉しいです。'
    },
    maekawa: {
      name: '前川 弘行',
      role: 'CTO',
      area: 'プロダクト・技術戦略',
      media: 'assets/images/video/mae1.mp4',
      interview: 'https://crestory.crestix.jp/maekawa-interview/',
      lead: 'CrestixのDXについて何でも話します',
      talk: [
        'CrestixのDXや仕組み化について',
        '営業・ISで成果を出すための数字管理と改善について',
        'マネジメントや自分を変えるきっかけについて'
      ],
      target: [
        '営業やISとして、感覚だけでなく数字と改善で成果を出せるようになりたい方。',
        '仕組み化、DX、マネジメントに興味がある方。',
        '自分を変えたいけれど、まだ一歩踏み出せていない方。'
      ],
      intro: 'CTOとしてプロダクト・技術戦略を担当しています。営業現場の成果を仕組みで伸ばすこと、DXで組織を強くすること、そして自分自身を変えていく挑戦について気軽に話せたら嬉しいです。'
    },
    matsuoka: {
      name: '松岡 龍士',
      role: '第一営業部 FS',
      area: '医療機関向けフィールドセールス',
      media: 'assets/images/video/matuoka.mp4',
      interview: 'https://crestory.crestix.jp/matsuoka-interview/',
      lead: 'Crestixのクリニック向け営業と、営業として成長するリアルを話します',
      talk: [
        'クリニック向け営業のリアルについて',
        '顧客に本気で向き合う営業スタイルについて',
        '成長途中の会社で営業として挑戦する面白さについて'
      ],
      target: [
        '今の環境に大きな不満はないけれど、「もっとできるはず」と感じている方。',
        '営業としてもっと成長したい方。',
        '顧客に本気で向き合う営業をしたい方。',
        '成長途中の会社で、自分の可能性を試してみたい方。'
      ],
      intro: '第一営業部のフィールドセールスとして、医療機関向けの営業を担当しています。クリニックの課題にどう向き合うのか、営業としてどう成長していくのか、現場のリアルをそのまま話せたら嬉しいです。'
    },
    takahara: {
      name: '髙原 一真',
      role: 'Marketing MG',
      area: 'マーケティング・集患支援',
      media: 'assets/images/video/kazumatakahara.mp4',
      lead: 'Crestixのマーケティング/IS組織と、量も質も追う営業について何でも話します',
      talk: [
        'マーケティング/IS組織の立ち上げと運用について',
        '量と質の両方を追う営業・ISの考え方について',
        '行動を成果に変えるための基準値について'
      ],
      target: [
        '営業・ISとして本気で成長したい方。',
        '量も質もどちらも追える人になりたい方。',
        '今の自分の基準値を上げたい方。',
        '考えるだけで終わらず、行動して成果に変えたい方。'
      ],
      intro: 'Marketing MGとして、マーケティングとIS領域を担当しています。量をやり切る力と、質を高める改善の両方を大切にしながら、成果につながる営業組織づくりに向き合っています。'
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

  const talkItems = member.talk || [
    `${member.role}としての日々の挑戦について`,
    'Crestixのカルチャーや働き方について',
    'キャリアや今後挑戦したいことについて'
  ];

  const targetItems = member.target || [
    'Crestixに少しでも興味がある人',
    '成長環境やチャレンジングな環境を探している人'
  ];

  const intro = member.intro || `${member.role}として${member.area}を担当。日々の業務や挑戦について気軽に話せたら嬉しいです。`;
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

  const heroLead = document.querySelector('#top .casual-lead');
  if (heroLead && member.lead) heroLead.textContent = member.lead;

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
