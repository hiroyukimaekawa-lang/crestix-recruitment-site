(function () {
  const section = document.querySelector('.biz-grid-section');
  const cells = document.querySelectorAll('.biz-grid__cell[data-target]');
  const images = document.querySelectorAll('.biz-grid__video[data-video]');

  if (!section || !cells.length || !images.length) return;

  function activateImage(key, activeCell) {
    images.forEach((image) => {
      if (image.dataset.video === key) {
        image.classList.add('is-active');
      } else {
        image.classList.remove('is-active');
      }
    });
    section.classList.add('is-hovered');
    cells.forEach((cell) => cell.classList.remove('is-active-cell'));
    activeCell.classList.add('is-active-cell');
  }

  function deactivateAll() {
    images.forEach((image) => {
      image.classList.remove('is-active');
    });
    section.classList.remove('is-hovered');
    cells.forEach((cell) => cell.classList.remove('is-active-cell'));
  }

  cells.forEach((cell) => {
    cell.addEventListener('mouseenter', () => activateImage(cell.dataset.target, cell));
    cell.addEventListener('focus', () => activateImage(cell.dataset.target, cell));
  });

  section.addEventListener('mouseleave', deactivateAll);
  section.addEventListener('focusout', (event) => {
    if (!section.contains(event.relatedTarget)) deactivateAll();
  });
}());
