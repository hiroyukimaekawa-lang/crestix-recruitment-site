const DEFAULT_RSS_URL = 'https://note.com/crestory_crestix/rss/';

function stripCdata(value = '') {
  return value.replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '').trim();
}

function decodeEntities(value = '') {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

function pick(block, tagName) {
  const match = block.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i'));
  return decodeEntities(stripCdata(match?.[1] || ''));
}

function pickThumbnail(block) {
  const media = block.match(/<media:thumbnail[^>]+url=["']([^"']+)["'][^>]*>/i);
  if (media?.[1]) return decodeEntities(media[1]);

  const description = pick(block, 'description');
  const image = description.match(/<img[^>]+src=["']([^"']+)["']/i);
  return image?.[1] || '';
}

function stripHtml(value = '') {
  return decodeEntities(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/続きをみる/g, '')
    .trim();
}

function parseRss(xml) {
  const blocks = xml.match(/<item\b[\s\S]*?<\/item>/gi) || [];

  return blocks.map((block) => {
    const description = pick(block, 'description');

    return {
      title: pick(block, 'title'),
      link: pick(block, 'link'),
      pubDate: pick(block, 'pubDate'),
      thumbnail: pickThumbnail(block),
      excerpt: stripHtml(description).slice(0, 120)
    };
  }).filter((item) => item.title && item.link);
}

async function handler(req, res) {
  const url = typeof req.query?.url === 'string' ? req.query.url : DEFAULT_RSS_URL;

  if (!url.startsWith('https://note.com/')) {
    res.status(400).json({ error: 'Unsupported RSS URL' });
    return;
  }

  try {
    const response = await fetch(url, {
      headers: {
        accept: 'application/rss+xml, application/xml, text/xml'
      }
    });

    if (!response.ok) {
      res.status(response.status).json({ error: 'RSS fetch failed' });
      return;
    }

    const xml = await response.text();
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({ items: parseRss(xml) });
  } catch (error) {
    res.status(500).json({ error: 'RSS fetch failed' });
  }
}

module.exports = handler;
