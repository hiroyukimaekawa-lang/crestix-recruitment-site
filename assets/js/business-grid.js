(function () {
  const grid = document.querySelector('.biz-grid__cells');
  const cells = Array.from(document.querySelectorAll('.biz-grid__cell'));
  const contents = cells.map(cell => cell.querySelector('.biz-grid__content'));

  // color を変更する子要素のセレクタ
  const TEXT_SEL = '.biz-grid__title, .biz-grid__sub, .biz-grid__desc, .biz-grid__link, .biz-grid__tag';

  function applyStyle(content, color, opacity) {
    if (!content) return;
    content.style.opacity = opacity;
    content.style.color = color;
    content.querySelectorAll(TEXT_SEL).forEach(el => {
      el.style.color = color;
      el.style.opacity = '';
      if (color === 'white') {
        el.style.textShadow = '0 1px 4px rgba(0,0,0,0.5)';
      } else {
        el.style.textShadow = '';
      }
    });
  }

  function resetAll() {
    contents.forEach(content => applyStyle(content, '#111827', '1'));
    cells.forEach(c => { c.style.background = ''; });
  }

  // transition を初期設定
  contents.forEach(content => {
    if (!content) return;
    content.style.transition = 'opacity 0.4s ease, color 0.4s ease';
    content.querySelectorAll(TEXT_SEL).forEach(el => {
      el.style.transition = 'color 0.4s ease';
    });
  });

  // 初期状態：黒色テキストで全表示
  resetAll();

  cells.forEach((cell, i) => {
    const video = cell.querySelector('.biz-grid__cell-video');

    cell.addEventListener('mouseenter', () => {
      // 動画制御
      if (video) {
        cells.forEach((c, j) => {
          if (j !== i) {
            const v = c.querySelector('.biz-grid__cell-video');
            if (v) { v.pause(); v.currentTime = 0; }
          }
        });
        video.currentTime = 0;
        video.play().catch(() => { });
      }

      // 非ホバーカード → ダーク背景（白テキストの視認性確保）
      cells.forEach((c, j) => {
        c.style.background = j === i ? '' : 'rgba(10, 20, 40, 0.85)';
      });

      // 全カード → 白・薄く
      contents.forEach(content => applyStyle(content, 'white', '0.65'));
      // ホバーカード → 白・濃く
      applyStyle(contents[i], 'white', '1');
    });

    cell.addEventListener('mouseleave', () => {
      if (video) { video.pause(); video.currentTime = 0; }
    });
  });

  // グリッド全体からカーソルが外れたら黒・通常に戻す
  if (grid) {
    grid.addEventListener('mouseleave', resetAll);
  }
}());
