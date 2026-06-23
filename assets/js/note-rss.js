const NOTE_RSS_URL = 'https://note.com/crestory_crestix/rss/';

const YOUTUBE_ITEMS = [
  {
    type: 'youtube',
    title: 'Crestix対談コンテンツ',
    link: 'https://youtu.be/tWY2tBMc6Z4?si=Cz74uPnwDk0KSc9t&t=1895',
    thumbnail: 'https://img.youtube.com/vi/tWY2tBMc6Z4/hqdefault.jpg',
    excerpt: '指定の再生位置から視聴できるCrestix関連コンテンツ。現場の考え方や事業づくりの熱量を届けます。',
    displayDate: 'YouTube',
    sortDate: '2026-06-23T00:00:00+09:00'
  },
  {
    type: 'youtube',
    title: 'CEOメッセージ',
    link: 'https://www.youtube.com/watch?v=uVyNfP5gTZA&t=20s',
    thumbnail: 'https://img.youtube.com/vi/uVyNfP5gTZA/hqdefault.jpg',
    excerpt: '代表からCrestixの未来へのビジョン。創業背景や、これから目指す組織の姿を語ります。',
    displayDate: 'YouTube',
    sortDate: '2026-06-22T00:00:00+09:00'
  }
];

const NOTE_FALLBACK_ITEMS = [
  {
    type: 'note',
    title: '大きすぎる旗を、本気で掲げる。Crestixが「世界一挑戦し続ける会社」を目指す理由',
    link: 'https://note.com/crestory_crestix/n/n96793bbaa7ed',
    pubDate: 'Mon, 22 Jun 2026 23:48:57 +0900',
    thumbnail: 'https://assets.st-note.com/production/uploads/images/287837610/rectangle_large_type_2_7550fd6fcc3b69c8b1fd7ed5244f5799.png?width=800',
    excerpt: 'Crestixが掲げるビジョンは、「世界一挑戦し続ける会社へ」。代表の縞谷に、なぜこの旗を掲げるのか、どんな仲間と会社をつくっていきたいのかを聞きました。'
  }
];

function decodeEntities(text) {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text || '';
  return textarea.value;
}

function getText(node, selector) {
  return decodeEntities(node.querySelector(selector)?.textContent?.trim() || '');
}

function stripHtml(html) {
  const doc = new DOMParser().parseFromString(html || '', 'text/html');
  return (doc.body.textContent || '')
    .replace(/\s+/g, ' ')
    .replace(/続きをみる/g, '')
    .trim();
}

function getThumbnail(item) {
  const media = item.getElementsByTagName('media:thumbnail')[0];
  if (media?.getAttribute('url')) return media.getAttribute('url');

  const description = item.querySelector('description')?.textContent || '';
  const imageMatch = description.match(/<img[^>]+src=['"]([^'"]+)['"]/i);
  return imageMatch?.[1] || '';
}

function parseRss(xmlText) {
  const xml = new DOMParser().parseFromString(xmlText, 'application/xml');
  if (xml.querySelector('parsererror')) throw new Error('Invalid RSS XML');

  return [...xml.querySelectorAll('item')].map((item) => {
    const description = item.querySelector('description')?.textContent || '';
    const pubDate = getText(item, 'pubDate');

    return {
      type: 'note',
      title: getText(item, 'title'),
      link: getText(item, 'link'),
      pubDate,
      thumbnail: getThumbnail(item),
      excerpt: stripHtml(description).slice(0, 120)
    };
  });
}

function formatDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date).replaceAll('/', '.');
}

function escapeHtml(text) {
  return String(text || '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[char]));
}

function getSortTime(item) {
  const date = new Date(item.sortDate || item.pubDate || 0);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function getDisplayDate(item) {
  if (item.displayDate) return item.displayDate;
  return formatDate(item.pubDate);
}

function createMediaCard(item, index) {
  const title = escapeHtml(item.title);
  const excerpt = escapeHtml(item.excerpt);
  const date = escapeHtml(getDisplayDate(item));
  const image = item.thumbnail || 'assets/images/office/crestix.png';
  const isYoutube = item.type === 'youtube';
  const label = isYoutube ? 'YouTube' : 'note';
  const action = isYoutube ? 'Watch More' : 'Read note';
  const labelClass = isYoutube
    ? 'bg-crestix-orange text-white'
    : 'bg-white/95 text-[#1A2B4C]';
  const delay = `${Math.min(index * 70, 280)}ms`;

  return `
    <a href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer"
      class="news-media-card group block bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-[0_18px_50px_rgba(15,23,42,0.06)] hover:shadow-[0_28px_80px_rgba(15,23,42,0.12)] hover:-translate-y-1 transition-all duration-500"
      style="animation-delay:${delay};">
      <div class="relative aspect-[16/10] overflow-hidden bg-gray-100">
        <img src="${escapeHtml(image)}" alt="${title}" loading="lazy"
          class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
        <div class="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-80 transition-opacity duration-500"></div>
        <span class="absolute top-5 left-5 ${labelClass} text-[10px] font-black tracking-[0.22em] uppercase px-4 py-1.5 rounded-full shadow-sm">${label}</span>
        ${isYoutube ? `
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-16 h-16 rounded-full bg-crestix-orange text-white flex items-center justify-center shadow-[0_20px_50px_rgba(255,92,0,0.35)] transition-transform duration-500 group-hover:scale-110">
              <i class="fa-brands fa-youtube text-2xl"></i>
            </div>
          </div>
        ` : ''}
      </div>
      <div class="p-7 lg:p-8 flex flex-col min-h-[260px]">
        <time class="font-poppins text-[11px] font-black text-gray-400 tracking-[0.22em] mb-4">${date}</time>
        <h3 class="text-xl font-black text-crestix-charcoal leading-[1.55] tracking-tight mb-5 group-hover:text-crestix-orange transition-colors">${title}</h3>
        <p class="text-sm font-bold text-gray-500 leading-loose mb-8">${excerpt}</p>
        <div class="mt-auto pt-5 border-t border-gray-100 flex items-center justify-between">
          <span class="text-[10px] font-black tracking-[0.28em] uppercase text-gray-400">${action}</span>
          <i class="fa-solid fa-arrow-right-long text-crestix-orange transition-transform duration-300 group-hover:translate-x-1"></i>
        </div>
      </div>
    </a>
  `;
}

function createCrestoryCard(item, index) {
  const title = escapeHtml(item.title);
  const excerpt = escapeHtml(item.excerpt);
  const date = escapeHtml(getDisplayDate(item));
  const image = item.thumbnail || 'assets/images/office/crestix.png';
  const delay = `${Math.min(index * 60, 300)}ms`;

  return `
    <a href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer"
      class="crestory-article-card group block bg-white border border-gray-100 rounded-[1.75rem] overflow-hidden shadow-[0_18px_54px_rgba(15,23,42,0.06)] hover:shadow-[0_28px_80px_rgba(15,23,42,0.12)] hover:-translate-y-1 transition-all duration-500"
      style="animation-delay:${delay};">
      <div class="relative aspect-[16/10] overflow-hidden bg-gray-100">
        <img src="${escapeHtml(image)}" alt="${title}" loading="lazy"
          class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
        <span class="absolute top-5 left-5 bg-white/95 text-[#1A2B4C] text-[10px] font-black tracking-[0.22em] uppercase px-4 py-1.5 rounded-full shadow-sm">note</span>
      </div>
      <div class="p-7 flex flex-col min-h-[250px]">
        <time class="font-poppins text-[11px] font-black text-gray-400 tracking-[0.22em] mb-4">${date}</time>
        <h3 class="text-lg lg:text-xl font-black text-crestix-charcoal leading-[1.55] tracking-tight mb-4 group-hover:text-crestix-orange transition-colors">${title}</h3>
        <p class="crestory-card-excerpt text-sm font-bold text-gray-500 leading-loose mb-7">${excerpt}</p>
        <div class="mt-auto pt-5 border-t border-gray-100 flex items-center justify-between">
          <span class="text-[10px] font-black tracking-[0.28em] uppercase text-gray-400">Read note</span>
          <i class="fa-solid fa-arrow-right-long text-crestix-orange transition-transform duration-300 group-hover:translate-x-1"></i>
        </div>
      </div>
    </a>
  `;
}

function createFeaturedArticle(item) {
  if (!item) {
    return `
      <div class="bg-white border border-gray-100 rounded-[2rem] p-8 text-center">
        <p class="text-sm font-bold text-gray-500 leading-loose">現在表示できる固定記事がありません。</p>
      </div>
    `;
  }

  const title = escapeHtml(item.title);
  const excerpt = escapeHtml(item.excerpt);
  const date = escapeHtml(getDisplayDate(item));
  const image = item.thumbnail || 'assets/images/office/crestix.png';

  return `
    <a href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer"
      class="group grid grid-cols-1 lg:grid-cols-[1.12fr_0.88fr] bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-[0_24px_80px_rgba(15,23,42,0.08)] hover:shadow-[0_34px_100px_rgba(15,23,42,0.14)] hover:-translate-y-1 transition-all duration-500">
      <div class="relative min-h-[260px] lg:min-h-[420px] overflow-hidden bg-gray-100">
        <img src="${escapeHtml(image)}" alt="${title}" loading="lazy"
          class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
        <div class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
        <span class="absolute top-6 left-6 bg-crestix-orange text-white text-[10px] font-black tracking-[0.24em] uppercase px-4 py-2 rounded-full shadow-sm">Featured</span>
      </div>
      <div class="p-8 lg:p-12 flex flex-col justify-center">
        <div class="flex items-center gap-4 mb-6">
          <span class="w-10 h-px bg-crestix-orange"></span>
          <time class="font-poppins text-[11px] font-black text-gray-400 tracking-[0.24em]">${date}</time>
        </div>
        <h2 class="text-2xl lg:text-4xl font-black text-crestix-charcoal tracking-tight leading-[1.35] mb-6 group-hover:text-crestix-orange transition-colors">${title}</h2>
        <p class="text-sm lg:text-base font-bold text-gray-500 leading-loose mb-8">${excerpt}</p>
        <div class="mt-auto inline-flex items-center gap-3 text-crestix-orange font-black text-xs tracking-[0.22em] uppercase">
          Read on note
          <i class="fa-solid fa-arrow-right-long transition-transform duration-300 group-hover:translate-x-1"></i>
        </div>
      </div>
    </a>
  `;
}

async function loadNoteItems() {
  const apiUrl = `/api/note-rss?url=${encodeURIComponent(NOTE_RSS_URL)}`;

  try {
    const response = await fetch(apiUrl, { headers: { accept: 'application/json' } });
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data.items) && data.items.length) {
        return data.items.map((item) => ({ ...item, type: 'note' }));
      }
    }
  } catch (_) {
    // Static previews do not have an API route. Fall through to direct RSS.
  }

  try {
    const response = await fetch(NOTE_RSS_URL);
    if (!response.ok) throw new Error('RSS fetch failed');
    const xml = await response.text();
    const items = parseRss(xml);
    if (items.length) return items;
  } catch (_) {
    // note RSS may be blocked by CORS on static hosting. Use curated fallback.
  }

  return NOTE_FALLBACK_ITEMS;
}

function renderGrid(selector, items) {
  const grid = document.querySelector(selector);
  if (!grid) return;

  if (!items.length) {
    grid.innerHTML = `
      <div class="news-empty-state bg-white border border-gray-100 rounded-[2rem] p-8 text-center">
        <p class="text-sm font-bold text-gray-500 leading-loose">現在表示できるコンテンツがありません。</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = items.map(createMediaCard).join('');
}

function renderCrestoryGrid(selector, items) {
  const grid = document.querySelector(selector);
  if (!grid) return;

  if (!items.length) {
    grid.innerHTML = `
      <div class="crestory-empty-state bg-white border border-gray-100 rounded-[2rem] p-8 text-center">
        <p class="text-sm font-bold text-gray-500 leading-loose">現在表示できる記事がありません。</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = items.map(createCrestoryCard).join('');
}

function setupCrestoryCategories() {
  const buttons = document.querySelectorAll('[data-crestory-category]');
  if (!buttons.length) return;

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      buttons.forEach((item) => {
        const active = item === button;
        item.classList.toggle('bg-crestix-navy', active);
        item.classList.toggle('text-white', active);
        item.classList.toggle('shadow-lg', active);
        item.classList.toggle('bg-white', !active);
        item.classList.toggle('text-crestix-charcoal/60', !active);
      });
    });
  });
}

function setupTabs() {
  const tabs = document.querySelectorAll('[data-news-tab]');
  const panels = document.querySelectorAll('[data-news-panel]');
  if (!tabs.length || !panels.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.newsTab;

      tabs.forEach((item) => {
        const active = item === tab;
        item.classList.toggle('bg-crestix-navy', active);
        item.classList.toggle('text-white', active);
        item.classList.toggle('shadow-lg', active);
        item.classList.toggle('bg-white', !active);
        item.classList.toggle('text-crestix-charcoal/40', !active);
      });

      panels.forEach((panel) => {
        panel.classList.toggle('hidden', panel.dataset.newsPanel !== target);
      });
    });
  });
}

async function renderNewsFeeds() {
  if (!document.querySelector('[data-all-grid], [data-youtube-grid], [data-note-rss-grid]')) return;

  const status = document.querySelector('[data-note-rss-status]');
  const noteItems = await loadNoteItems();
  const allItems = [...YOUTUBE_ITEMS, ...noteItems]
    .sort((a, b) => getSortTime(b) - getSortTime(a))
    .slice(0, 4);

  renderGrid('[data-all-grid]', allItems);
  renderGrid('[data-youtube-grid]', YOUTUBE_ITEMS);
  renderGrid('[data-note-rss-grid]', noteItems);

  if (status) status.textContent = '';
}

async function renderCrestoryPage() {
  const grid = document.querySelector('[data-crestory-grid]');
  const featured = document.querySelector('[data-crestory-featured]');
  if (!grid && !featured) return;

  const status = document.querySelector('[data-crestory-status]');
  if (status) status.textContent = '記事を読み込んでいます。';

  try {
    const noteItems = await loadNoteItems();
    const items = noteItems
      .sort((a, b) => getSortTime(b) - getSortTime(a));

    if (featured) featured.innerHTML = createFeaturedArticle(items[0]);
    renderCrestoryGrid('[data-crestory-grid]', items);

    if (status) {
      status.textContent = items.length
        ? `${items.length}件の記事を表示しています。`
        : '現在表示できる記事がありません。';
    }
  } catch (_) {
    if (featured) featured.innerHTML = createFeaturedArticle(NOTE_FALLBACK_ITEMS[0]);
    renderCrestoryGrid('[data-crestory-grid]', NOTE_FALLBACK_ITEMS);
    if (status) status.textContent = '記事の取得に失敗したため、固定記事を表示しています。';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  setupCrestoryCategories();
  renderNewsFeeds();
  renderCrestoryPage();
});
