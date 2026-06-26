(function () {
  const cells = document.querySelectorAll('.biz-grid__cell');

  cells.forEach(cell => {
    const video = cell.querySelector('.biz-grid__cell-video');
    if (!video) return;

    video.preload = 'auto';

    cell.addEventListener('mouseenter', () => {
      document.querySelectorAll('.biz-grid__cell-video').forEach(v => {
        if (v !== video) { v.pause(); v.currentTime = 0; }
      });
      video.currentTime = 0;
      video.play().catch(() => {});
    });

    cell.addEventListener('mouseleave', () => {
      video.pause();
      video.currentTime = 0;
    });
  });
}());
