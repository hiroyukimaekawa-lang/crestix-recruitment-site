(function () {
  const API_URL = 'https://crestory.crestix.jp/wp-json/wp/v2/crestory?_embed=1&per_page=6&orderby=date&order=desc';
  const FALLBACK_ITEMS = [
    {
      title: '大きすぎる旗を、本気で掲げる。',
      link: 'https://crestory.crestix.jp/',
      thumbnail: 'https://assets.st-note.com/production/uploads/images/287837610/rectangle_large_type_2_7550fd6fcc3b69c8b1fd7ed5244f5799.png?width=800'
    },
    {
      title: '売上を作る最前線へ。',
      link: 'https://crestory.crestix.jp/%e3%80%8c%e3%82%82%e3%81%a3%e3%81%a8%e3%81%a7%e3%81%8d%e3%82%8b%e3%81%af%e3%81%9a%e3%80%8d%e3%82%92%e8%a8%bc%e6%98%8e%e3%81%99%e3%82%8b%e3%81%9f%e3%82%81%e3%81%ab%e3%80%81%e5%83%95%e3%81%af%e4%b8%8a/',
      thumbnail: 'assets/images/office/crestix1.png'
    },
    {
      title: 'Crestixで働く人のリアル',
      link: 'https://crestory.crestix.jp/',
      thumbnail: 'assets/images/office/crestix.png'
    }
  ];

  function escapeHtml(text) {
    return String(text || '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[char]));
  }

  function stripHtml(text) {
    const div = document.createElement('div');
    div.innerHTML = text || '';
    return div.textContent || div.innerText || '';
  }

  function getFeaturedImage(post) {
    const media = post?._embedded?.['wp:featuredmedia']?.[0];
    return media?.media_details?.sizes?.large?.source_url
      || media?.media_details?.sizes?.medium_large?.source_url
      || media?.source_url
      || post?.yoast_head_json?.og_image?.[0]?.url
      || post?.jetpack_featured_media_url
      || post?.meta?.crestory_ogp_image
      || '';
  }

  function hasYoutubeCategory(post) {
    const terms = (post._embedded?.['wp:term'] || []).flat();
    return terms.some((t) => t.slug === 'youtube');
  }

  function normalizePost(post) {
    return {
      title: stripHtml(post?.title?.rendered || 'CRESTORY'),
      link: post?.link || 'https://crestory.crestix.jp/',
      thumbnail: getFeaturedImage(post) || ''
    };
  }

  function buildCard(item) {
    const title = escapeHtml(item.title);
    const image = escapeHtml(item.thumbnail);
    const link = escapeHtml(item.link);

    return `
      <a class="corp-crestory__card" href="${link}" target="_blank" rel="noopener noreferrer" aria-label="${title}">
        <div class="corp-crestory__thumb">
          <img src="${image}" alt="${title}" loading="lazy">
        </div>
      </a>
    `;
  }

  function render(items) {
    const grid = document.querySelector('[data-crestory-latest-thumbs]');
    if (!grid) return;
    grid.innerHTML = items.slice(0, 3).map(buildCard).join('');
  }

  async function init() {
    const grid = document.querySelector('[data-crestory-latest-thumbs]');
    if (!grid) return;

    try {
      const res = await fetch(API_URL, { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error('Failed to load CRESTORY posts');
      const posts = await res.json();

      const filtered = posts
        .filter((p) => !hasYoutubeCategory(p))
        .map(normalizePost)
        .filter((item) => item.thumbnail);

      render(filtered.length ? filtered : FALLBACK_ITEMS);
    } catch (error) {
      render(FALLBACK_ITEMS);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
