(function () {
  'use strict';

  function init() {
    const section = document.querySelector('.biz-grid-section');
    const grid = document.querySelector('.biz-grid__cells');
    if (!section || !grid) return;

    const cells = Array.from(grid.querySelectorAll('.biz-grid__cell'));
    const bgItems = Array.from(section.querySelectorAll('.biz-grid__video'));
    const cellVideos = Array.from(section.querySelectorAll('.biz-grid__cell-video'));
    const isResponsive = window.matchMedia('(max-width: 1024px)').matches;

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

      cells.forEach(currentCell => {
        const isCurrent = currentCell === cell;
        currentCell.classList.toggle('is-active', isCurrent);
        currentCell.classList.toggle('is-dimmed', !isCurrent);
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

    if (isResponsive) {
      resetGrid();
      cellVideos.forEach(video => {
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.play().catch(() => {});
      });
      return;
    }

    cellVideos.forEach(video => {
      video.pause();
      video.currentTime = 0;
    });

    cells.forEach(cell => {
      cell.addEventListener('mouseenter', () => activateCell(cell));
    });

    grid.addEventListener('mouseleave', resetGrid);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
