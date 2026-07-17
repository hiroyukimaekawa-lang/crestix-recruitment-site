const STORY_NOTE_LINKS = {
  'story-renshi.html': 'https://note.com/crestory_crestix/n/n96793bbaa7ed',
  'story-nishida.html': 'https://note.com/crestory_crestix',
  'story-maekawa.html': 'https://note.com/crestory_crestix',
  'story-takahara.html': 'https://note.com/crestory_crestix',
  'story-uoi.html': 'https://note.com/crestory_crestix',
  'story-mizugaki.html': 'https://note.com/crestory_crestix',
  'story-matsuoka.html': 'https://crestory.crestix.jp/%e3%80%8c%e3%82%82%e3%81%a3%e3%81%a8%e3%81%a7%e3%81%8d%e3%82%8b%e3%81%af%e3%81%9a%e3%80%8d%e3%82%92%e8%a8%bc%e6%98%8e%e3%81%99%e3%82%8b%e3%81%9f%e3%82%81%e3%81%ab%e3%80%81%e5%83%95%e3%81%af%e4%b8%8a/',
  'story-imafuku.html': 'https://note.com/crestory_crestix'
};

function applyStoryNoteLinks() {
  document.querySelectorAll('a[href^="story-"]').forEach((link) => {
    const href = link.getAttribute('href');
    const noteUrl = STORY_NOTE_LINKS[href];
    if (!noteUrl) return;

    link.href = noteUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  });
}

document.addEventListener('DOMContentLoaded', applyStoryNoteLinks);
