(function () {
  'use strict';

  function init() {
    const section = document.querySelector('.biz-grid-section');
    const grid = document.querySelector('.biz-grid__cells');
    if (!section || !grid) return;

    const cells = Array.from(grid.querySelectorAll('.biz-grid__cell'));
    const bgItems = Array.from(section.querySelectorAll('.biz-grid__video'));

    function resetGrid() {
      section.classList.remove('is-hovering');
      cells.forEach(cell => {
        cell.classList.remove('is-active', 'is-dimmed');
      });
      bgItems.forEach(item => {
        item.classList.remove('is-visible');
        if (item.tagName.toLowerCase() === 'video') {
          item.pause();
          item.currentTime = 0;
        }
      });
    }

    function activateCell(cell) {
      const target = cell.dataset.target;
      section.classList.add('is-hovering');
      cells.forEach(c => {
        c.classList.toggle('is-active', c === cell);
        c.classList.toggle('is-dimmed', c !== cell);
      });
      bgItems.forEach(item => {
        const isTarget = item.dataset.video === target;
        item.classList.toggle('is-visible', isTarget);
        if (item.tagName.toLowerCase() === 'video') {
          if (isTarget) {
            item.currentTime = 0;
            item.play().catch(() => {});
          } else {
            item.pause();
            item.currentTime = 0;
          }
        }
      });
    }

    cells.forEach(cell => {
      cell.addEventListener('mouseenter', () => activateCell(cell));
      cell.addEventListener('touchstart', () => activateCell(cell), { passive: true });
    });

    grid.addEventListener('mouseleave', resetGrid);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
