const STORY_NOTE_LINKS = {
  'story-renshi.html': 'https://note.com/crestory_crestix/n/n96793bbaa7ed',
  'story-nishida.html': 'https://note.com/crestory_crestix',
  'story-maekawa.html': 'https://note.com/crestory_crestix',
  'story-takahara.html': 'https://note.com/crestory_crestix',
  'story-uoi.html': 'https://note.com/crestory_crestix',
  'story-mizugaki.html': 'https://note.com/crestory_crestix',
  'story-matsuoka.html': 'https://crestory.crestix.jp/matsuoka-interview/',
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
