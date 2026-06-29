(function () {
  const grid = document.querySelector('.biz-grid__cells');
  const cells = Array.from(document.querySelectorAll('.biz-grid__cell'));
  const contents = cells.map(cell => cell.querySelector('.biz-grid__content'));

  function resetOpacity() {
    contents.forEach(content => {
      if (content) content.style.opacity = '1';
    });
  }

  cells.forEach((cell, i) => {
    const video = cell.querySelector('.biz-grid__cell-video');

    cell.addEventListener('mouseenter', () => {
      // video
      if (video) {
        cells.forEach((c, j) => {
          if (j !== i) {
            const v = c.querySelector('.biz-grid__cell-video');
            if (v) { v.pause(); v.currentTime = 0; }
          }
        });
        video.currentTime = 0;
        video.play().catch(() => {});
      }

      // opacity: ホバーカード→1、他→0.25
      contents.forEach((content, j) => {
        if (content) content.style.opacity = (j === i) ? '1' : '0.25';
      });
    });

    cell.addEventListener('mouseleave', () => {
      if (video) { video.pause(); video.currentTime = 0; }
    });
  });

  // グリッド全体からカーソルが外れたときだけリセット
  if (grid) {
    grid.addEventListener('mouseleave', resetOpacity);
  }

  // 初期状態をセット
  resetOpacity();
}());
