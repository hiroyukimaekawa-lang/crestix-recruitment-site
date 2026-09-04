#!/usr/bin/env node
/**
 * seo.mjs — 技術SEO CLI（UI非破壊）
 *
 * 設計上の絶対条件:
 *   - <head> 内の対象SEOタグ / robots.txt / sitemap*.xml 以外は書き換えない
 *   - HTML全体をDOMライブラリで再シリアライズしない（フォーマット差分を出さない）
 *   - apply 前後で <head> 以外のバイト列が変わったら全体をアボートする
 *
 * 使い方: node scripts/seo.mjs <audit|apply|verify|jobs|images> [options]
 * 依存: Node 18+ 標準APIのみ
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const CONFIG_PATH = path.join(ROOT, 'seo.config.json');
const REPORT_DIR = path.join(ROOT, 'reports');
const BLOCK_BEGIN = '<!-- SEO:BEGIN managed by scripts/seo.mjs -->';
const BLOCK_END = '<!-- SEO:END -->';

/* ────────────────────────────── CLI utils ────────────────────────────── */

const ESC = String.fromCharCode(27);
const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const c = (code) => (s) => (useColor ? `${ESC}[${code}m${s}${ESC}[0m` : String(s));
const bold = c('1'), dim = c('2'), red = c('31'), green = c('32'), yellow = c('33'), cyan = c('36');

const argv = process.argv.slice(2);
const command = argv[0];
const flags = {
  dryRun: argv.includes('--dry-run'),
  json: argv.includes('--json'),
  noReport: argv.includes('--no-report'),
  url: (() => {
    const i = argv.indexOf('--url');
    return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1].replace(/\/+$/, '') : null;
  })(),
};

/** 全角文字を2カラムとして数える表示幅 */
function width(s) {
  let w = 0;
  for (const ch of String(s)) {
    const cp = ch.codePointAt(0);
    w += (cp >= 0x1100 && (cp <= 0x115f || cp === 0x2329 || cp === 0x232a ||
      (cp >= 0x2e80 && cp <= 0xa4cf && cp !== 0x303f) || (cp >= 0xac00 && cp <= 0xd7a3) ||
      (cp >= 0xf900 && cp <= 0xfaff) || (cp >= 0xfe30 && cp <= 0xfe6f) ||
      (cp >= 0xff00 && cp <= 0xff60) || (cp >= 0xffe0 && cp <= 0xffe6))) ? 2 : 1;
  }
  return w;
}
function pad(s, n) { return String(s) + ' '.repeat(Math.max(0, n - width(s))); }
function truncW(s, n) {
  s = String(s ?? '');
  if (width(s) <= n) return s;
  let out = '';
  for (const ch of s) { if (width(out + ch) > n - 1) break; out += ch; }
  return out + '…';
}
function table(headers, rows, maxWidths = []) {
  if (!rows.length) { console.log(dim('  (該当なし)')); return; }
  const cells = rows.map((r) => r.map((v, i) => truncW(v, maxWidths[i] ?? 60)));
  const w = headers.map((h, i) => Math.max(width(h), ...cells.map((r) => width(r[i] ?? ''))));
  console.log('  ' + headers.map((h, i) => bold(pad(h, w[i]))).join('  '));
  console.log('  ' + w.map((n) => '─'.repeat(n)).join('  '));
  for (const r of cells) console.log('  ' + r.map((v, i) => pad(v, w[i])).join('  '));
}
const mark = { OK: green('OK'), WARN: yellow('WARN'), FAIL: red('FAIL'), SKIP: dim('SKIP'), MISS: red('MISS'), ADD: green('+') };
function section(title) { console.log('\n' + bold(cyan('■ ' + title))); }
function die(msg) { console.error(red('ERROR: ') + msg); process.exit(1); }

/* ────────────────────────────── config ────────────────────────────── */

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) die(`seo.config.json が見つかりません: ${CONFIG_PATH}`);
  let cfg;
  try { cfg = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')); }
  catch (e) { die(`seo.config.json のJSONが不正です: ${e.message}`); }
  for (const k of ['siteName', 'companyName', 'baseUrl']) if (!cfg[k]) die(`seo.config.json に ${k} がありません`);
  cfg.baseUrl = String(cfg.baseUrl).replace(/\/+$/, '');
  cfg.locale ||= 'ja_JP';
  cfg.noindex ||= [];
  cfg.exclude ||= ['node_modules', 'wordpress', 'public_html', 'reports', '.git'];
  cfg.pages ||= {};
  cfg.jobs ||= {};
  if (cfg.searchConsoleVerification === undefined) cfg.searchConsoleVerification = null;
  return cfg;
}

/* ────────────────────────────── file discovery ────────────────────────────── */

function walk(dir, cfg, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    const rel = path.relative(ROOT, abs).split(path.sep).join('/');
    if (cfg.exclude.some((ex) => rel === ex || rel.startsWith(ex.replace(/\/+$/, '') + '/'))) continue;
    if (entry.isDirectory()) walk(abs, cfg, out);
    else out.push(rel);
  }
  return out;
}
const listFiles = (cfg) => walk(ROOT, cfg).sort();
const listHtml = (cfg) => listFiles(cfg).filter((f) => f.toLowerCase().endsWith('.html'));

const isJobPage = (rel) => /^job-[^/]+\.html$/.test(rel);
const isNoindex = (rel, cfg) => cfg.noindex.includes(rel);
const urlFor = (rel, cfg) => (rel === 'index.html' ? cfg.baseUrl + '/' : cfg.baseUrl + '/' + rel);

function gitDate(rel) {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', rel],
      { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    return out ? out.slice(0, 10) : null;
  } catch { return null; }
}

/* ────────────────────────────── HTML 読み取り（非破壊） ────────────────────────────── */

function regionOf(html, tag) {
  const open = new RegExp(`<${tag}\\b[^>]*>`, 'i').exec(html);
  if (!open) return null;
  const innerStart = open.index + open[0].length;
  const close = new RegExp(`</${tag}\\s*>`, 'i').exec(html.slice(innerStart));
  if (!close) return null;
  return { start: open.index, innerStart, innerEnd: innerStart + close.index, end: innerStart + close.index + close[0].length };
}

function decodeEntities(s) {
  return String(s)
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'").replace(/&apos;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}
function attrsOf(tag) {
  const out = {};
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
  let m;
  while ((m = re.exec(tag))) out[m[1].toLowerCase()] = decodeEntities(m[3] ?? m[4] ?? m[5] ?? '');
  return out;
}
const escapeAttr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const stripTags = (s) => decodeEntities(String(s).replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();

/** head 内の SEO 関連タグを収集する（読み取り専用） */
function readHead(html) {
  const region = regionOf(html, 'head');
  const raw = region ? html.slice(region.innerStart, region.innerEnd) : '';
  const metas = [...raw.matchAll(/<meta\b[^>]*>/gi)].map((m) => ({ raw: m[0], a: attrsOf(m[0]) }));
  const links = [...raw.matchAll(/<link\b[^>]*>/gi)].map((m) => ({ raw: m[0], a: attrsOf(m[0]) }));
  const jsonld = [...raw.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((m) => {
      let parsed = null, error = null;
      try { parsed = JSON.parse(m[1].trim()); } catch (e) { error = e.message; }
      return { raw: m[0], body: m[1].trim(), parsed, error };
    });
  const titleM = /<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(raw);
  const byName = (n) => metas.filter((x) => (x.a.name || '').toLowerCase() === n).map((x) => x.a.content ?? '');
  const byProp = (p) => metas.filter((x) => (x.a.property || '').toLowerCase() === p).map((x) => x.a.content ?? '');
  return {
    region, raw, metas, links, jsonld,
    titles: [...raw.matchAll(/<title\b[^>]*>[\s\S]*?<\/title>/gi)].map((x) => x[0]),
    title: titleM ? stripTags(titleM[1]) : null,
    description: byName('description'),
    robots: byName('robots'),
    verification: byName('google-site-verification'),
    twitterCard: byName('twitter:card'),
    canonical: links.filter((x) => (x.a.rel || '').toLowerCase() === 'canonical').map((x) => x.a.href ?? ''),
    og: Object.fromEntries(['og:title', 'og:description', 'og:type', 'og:url', 'og:image', 'og:site_name', 'og:locale']
      .map((p) => [p, byProp(p)])),
  };
}

/** body 内の情報（テキスト・リンク・画像）を収集する（読み取り専用） */
function readBody(html) {
  const region = regionOf(html, 'body');
  const raw = region ? html.slice(region.innerStart, region.innerEnd) : html;
  const clean = raw
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');
  return {
    region, raw, clean,
    h1s: [...clean.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => stripTags(m[1])).filter(Boolean),
    links: [...clean.matchAll(/<a\b[^>]*\bhref\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))[^>]*>/gi)]
      .map((m) => decodeEntities(m[2] ?? m[3] ?? m[4] ?? '').trim()).filter(Boolean),
    imgs: [...clean.matchAll(/<img\b[^>]*>/gi)].map((m) => attrsOf(m[0])),
    videos: [...clean.matchAll(/<(?:video|source)\b[^>]*>/gi)].map((m) => attrsOf(m[0])),
  };
}

/** main（無ければ body から nav/header/footer/aside/menu/modal を除いた領域） */
function contentRegion(bodyClean) {
  const main = regionOf(bodyClean, 'main');
  if (main) return bodyClean.slice(main.innerStart, main.innerEnd);
  return bodyClean
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<header[\s\S]*?<\/header>/gi, ' ')
    .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<aside[\s\S]*?<\/aside>/gi, ' ');
}

/* ────────────────────────── description（品質ゲート付き生成） ──────────────────────────
 * 方針: ナビ・ボタン文言を拾わない。信頼できる文が取れない場合は書き込まずWARNにする。
 *   1. seo.config.json の pages[<file>].description（手動指定・最優先）
 *   2. ページ本文中の明示的なリード文（p.job-lead / p.page-lead / .hero p など）
 *   3. main 内の最初の「文章として妥当な」段落
 *   いずれも満たさなければ null（= 生成しない / WARN）
 */

const DESC_BLOCKLIST = /(メニューを閉じる|CLOSE|MENU|詳細を見る|応募する|エントリー|一覧へ戻る|サイトマップ|プライバシーポリシー|Copyright|お問い合わせはこちら|Read more|View more|Scroll)/i;
const DESC_MIN = 30;
const DESC_MAX = 140;

function jpCharCount(s) {
  return (String(s).match(/[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff]/g) || []).length;
}

/** 段落テキストが description として信頼できるか */
function isTrustworthyDescription(text, html = '') {
  const t = String(text || '').trim();
  if (t.length < DESC_MIN) return false;
  if (t.length > 400) return false;
  if (DESC_BLOCKLIST.test(t)) return false;
  if (jpCharCount(t) < 15) return false;                 // 日本語サイト前提。英字ラベルの誤検出を防ぐ
  if (!/[。．.!？?]/.test(t) && t.length < 45) return false; // 文になっていない短い断片を除外
  const linkCount = (html.match(/<a\b/gi) || []).length;
  if (linkCount > 1) return false;                        // リンク集・ナビ由来を除外
  // <span data-x></span> のような空要素は実行時にJSで埋められるプレースホルダ。
  // 静的HTMLからは不完全な文しか取れないため採用しない。
  if (/<(span|em|strong|b|i)\b[^>]*>\s*<\/\1>/i.test(html)) return false;
  if (/[{}<>]|function\s*\(|=>/.test(t)) return false;
  return true;
}

function truncateDescription(text) {
  const t = String(text).replace(/\s+/g, ' ').trim();
  if (t.length <= DESC_MAX) return t;
  const cut = t.slice(0, DESC_MAX);
  const lastStop = Math.max(cut.lastIndexOf('。'), cut.lastIndexOf('．'));
  if (lastStop >= DESC_MIN) return cut.slice(0, lastStop + 1);
  return cut.slice(0, DESC_MAX - 1).trim() + '…';
}

/** @returns {{text: string, source: string} | null} */
function buildDescription(rel, body, cfg) {
  const entry = cfg.pages?.[rel];
  const manual = entry?.description;
  if (manual && String(manual).trim()) return { text: String(manual).trim(), source: 'config' };
  // description: null を明示 = 意図的に生成しない（WARNも出さない）
  if (entry && 'description' in entry && manual === null) return { text: null, source: 'config:skip' };

  const content = contentRegion(body.clean);

  const leadSelectors = [
    /<p\b[^>]*class="[^"]*\bjob-lead\b[^"]*"[^>]*>([\s\S]*?)<\/p>/i,
    /<p\b[^>]*class="[^"]*\b(?:page-lead|hero-lead|lead|hero-desc|section-lead)\b[^"]*"[^>]*>([\s\S]*?)<\/p>/i,
    /<p\b[^>]*class="[^"]*\bhero[^"]*"[^>]*>([\s\S]*?)<\/p>/i,
  ];
  for (const re of leadSelectors) {
    const m = re.exec(content);
    if (m) {
      const text = stripTags(m[1]);
      if (isTrustworthyDescription(text, m[0])) return { text: truncateDescription(text), source: 'page:lead' };
    }
  }

  // h1 以降の最初の妥当な段落
  const h1 = /<h1\b[^>]*>[\s\S]*?<\/h1>/i.exec(content);
  const scope = h1 ? content.slice(h1.index + h1[0].length) : content;
  for (const m of scope.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)) {
    const text = stripTags(m[1]);
    if (isTrustworthyDescription(text, m[0])) return { text: truncateDescription(text), source: 'page:paragraph' };
  }
  return null;
}

/* ────────────────────────── 求人ページの情報抽出（推測しない） ────────────────────────── */

const EMPLOYMENT_MAP = [
  [/正社員/, 'FULL_TIME'],
  [/契約社員/, 'CONTRACTOR'],
  [/業務委託/, 'CONTRACTOR'],
  [/(アルバイト|パート)/, 'PART_TIME'],
  [/インターン/, 'INTERN'],
  [/派遣/, 'TEMPORARY'],
];

/**
 * ページ上のラベル→値を読む。サイト内に複数のテンプレートがあるため、
 * 実在するマークアップのパターンのみを順に試す（値の推測はしない）。
 *   - <p class="job-summary-label">Label</p><p class="job-summary-value">Value</p>
 *   - <div class="req-label">Label</div><div class="req-value">Value</div>
 *   - <dt>Label</dt><dd>Value</dd>
 */
function summaryValue(content, label) {
  const l = label.replace(/[.*+?^${}()|[\]\\]/g, (ch) => '\\' + ch);
  const patterns = [
    `job-summary-label[^>]*>\\s*${l}\\s*<\\/p>\\s*<p[^>]*job-summary-value[^>]*>([\\s\\S]*?)<\\/p>`,
    `req-label[^>]*>\\s*${l}\\s*<\\/div>\\s*<div[^>]*req-value[^>]*>([\\s\\S]*?)<\\/div>`,
    `<dt[^>]*>\\s*${l}\\s*<\\/dt>\\s*<dd[^>]*>([\\s\\S]*?)<\\/dd>`,
  ];
  for (const src of patterns) {
    const m = new RegExp(src, 'i').exec(content);
    if (m) { const v = stripTags(m[1]); if (v) return v; }
  }
  return null;
}
/** ヒーロー部の `<span class="job-pill">…</span>` を読む */
function pillValues(content) {
  return [...content.matchAll(/<span\b[^>]*class="[^"]*\bjob-pill\b[^"]*"[^>]*>([\s\S]*?)<\/span>/gi)]
    .map((m) => stripTags(m[1])).filter(Boolean);
}

/**
 * ページ上に実在する情報 + seo.config.json の jobs[<file>] のみから JobPosting を組み立てる。
 * datePosted をファイル更新日 / Git 日付 / 実行日から補完することは禁止。
 */
function buildJobPosting(rel, body, head, cfg) {
  const content = contentRegion(body.clean);
  const meta = cfg.jobs?.[rel] || {};
  const missing = [];

  const title = meta.title || body.h1s[0] || head.title || null;
  if (!title) missing.push('title');

  const descSource = buildDescription(rel, body, cfg);
  const description = meta.description || descSource?.text || null;
  if (!description) missing.push('description');

  const pills = pillValues(content);
  const employmentRaw = meta.employmentType ? null : (summaryValue(content, 'Employment') || summaryValue(content, '雇用形態') ||
    pills.find((p) => EMPLOYMENT_MAP.some(([re]) => re.test(p))) || null);
  let employmentType = meta.employmentType || null;
  if (!employmentType && employmentRaw) {
    const hit = EMPLOYMENT_MAP.find(([re]) => re.test(employmentRaw));
    if (hit) employmentType = hit[1];
  }
  if (!employmentType) missing.push('employmentType');

  const locationRaw = meta.jobLocation || summaryValue(content, 'Location') || summaryValue(content, '勤務地') ||
    pills.find((p) => /(本社|東京|大阪|オフィス|勤務)/.test(p)) || null;
  if (!locationRaw) missing.push('jobLocation');

  const datePosted = meta.datePosted || null;   // ページ上に掲載日が無いため config のみを正とする
  if (!datePosted) missing.push('datePosted');

  if (missing.length) return { ok: false, missing, title, locationRaw, employmentType, datePosted };

  const org = cfg.organization || {};
  const posting = {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title,
    description,
    identifier: { '@type': 'PropertyValue', name: cfg.companyName, value: rel.replace(/^job-|\.html$/g, '') },
    datePosted,
    employmentType,
    hiringOrganization: {
      '@type': 'Organization', name: cfg.companyName, sameAs: cfg.baseUrl,
      ...(cfg.logo || cfg.ogImage ? { logo: absUrl(cfg.logo || cfg.ogImage, cfg) } : {}),
    },
    jobLocation: {
      '@type': 'Place',
      name: locationRaw,
      address: {
        '@type': 'PostalAddress',
        postalCode: org.postalCode,
        addressRegion: org.region,
        addressLocality: org.locality,
        streetAddress: org.streetAddress,
        addressCountry: org.country,
      },
    },
    url: urlFor(rel, cfg),
  };
  if (meta.validThrough) posting.validThrough = meta.validThrough;
  if (meta.baseSalary) posting.baseSalary = meta.baseSalary;
  if (meta.jobLocationType) posting.jobLocationType = meta.jobLocationType;
  // salary / validThrough / remote条件 は config に明示が無い限り出力しない（推測禁止）
  return { ok: true, missing: [], posting, title, locationRaw, employmentType, datePosted };
}

function buildOrganization(cfg) {
  const org = cfg.organization || {};
  const node = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: cfg.companyName,
    url: cfg.baseUrl + '/',
  };
  const logo = cfg.logo || cfg.ogImage;
  if (logo) node.logo = absUrl(logo, cfg);
  if (Object.keys(org).length) {
    node.address = {
      '@type': 'PostalAddress',
      postalCode: org.postalCode,
      addressRegion: org.region,
      addressLocality: org.locality,
      streetAddress: org.streetAddress,
      addressCountry: org.country,
    };
  }
  return node;
}

const absUrl = (p, cfg) => (/^https?:\/\//i.test(p) ? p : cfg.baseUrl + '/' + String(p).replace(/^\.?\//, ''));

/* ────────────────────────── 期待SEOタグの組み立て ────────────────────────── */

const ogTypeFor = (rel) => {
  if (rel === 'index.html') return 'website';
  if (/^member-/.test(rel)) return 'profile';
  if (/^(job|story|news)-/.test(rel)) return 'article';
  return 'website';
};

/**
 * そのページに「あるべき」SEOタグを列挙する。
 * key: 同一性判定キー / find: 既存タグ検出regex / html: 出力するタグ
 */
function desiredTags(rel, html, cfg, ctx) {
  const head = ctx.head, body = ctx.body;
  const items = [];
  const warnings = [];
  const noindex = isNoindex(rel, cfg);
  const url = urlFor(rel, cfg);

  const meta = (name, content) => ({
    key: `meta[name=${name}]`, label: name,
    find: new RegExp(`<meta\\b[^>]*\\bname\\s*=\\s*["']${name.replace(/[:]/g, '\\:')}["'][^>]*>`, 'i'),
    html: `<meta name="${name}" content="${escapeAttr(content)}">`,
  });
  const prop = (property, content) => ({
    key: `meta[property=${property}]`, label: property,
    find: new RegExp(`<meta\\b[^>]*\\bproperty\\s*=\\s*["']${property.replace(/[:]/g, '\\:')}["'][^>]*>`, 'i'),
    html: `<meta property="${property}" content="${escapeAttr(content)}">`,
  });

  // Search Console 認証タグ: index.html に1つだけ
  if (rel === 'index.html' && cfg.searchConsoleVerification) {
    items.push(meta('google-site-verification', cfg.searchConsoleVerification));
  }

  if (noindex) {
    // noindex ページは robots のみ（canonical / sitemap 対象外）
    items.push(meta('robots', 'noindex, follow'));
    return { items, warnings, noindex, url };
  }

  const title = head.title;
  if (!title) warnings.push('title が無いため og:title を生成できません');

  const descResult = buildDescription(rel, body, cfg);
  const desc = descResult && descResult.text ? descResult : null;
  if (!descResult) warnings.push('信頼できる description を生成できませんでした（seo.config.json の pages で指定してください）');
  else if (desc) items.push(meta('description', desc.text));

  // canonical: 既存が他ドメインを指している場合は意図的な指定とみなして上書きしない
  const existingCanonical = head.canonical[0] || null;
  const configCanonical = cfg.pages?.[rel]?.canonical || null;
  const crossOrigin = existingCanonical && !existingCanonical.startsWith(cfg.baseUrl + '/');
  if (configCanonical) {
    items.push({
      key: 'link[rel=canonical]', label: 'canonical',
      find: /<link\b[^>]*\brel\s*=\s*["']canonical["'][^>]*>/i,
      html: `<link rel="canonical" href="${escapeAttr(configCanonical)}">`,
    });
  } else if (crossOrigin) {
    warnings.push(`既存canonicalが別ドメインを指しています（上書きしません）: ${existingCanonical}`);
  } else {
    items.push({
      key: 'link[rel=canonical]', label: 'canonical',
      find: /<link\b[^>]*\brel\s*=\s*["']canonical["'][^>]*>/i,
      html: `<link rel="canonical" href="${escapeAttr(url)}">`,
    });
  }

  if (title) items.push(prop('og:title', title));
  if (desc) items.push(prop('og:description', desc.text));
  items.push(prop('og:type', ogTypeFor(rel)));
  items.push(prop('og:url', url));
  items.push(prop('og:site_name', cfg.siteName));
  items.push(prop('og:locale', cfg.locale));

  let ogImage = null;
  if (cfg.ogImage) {
    if (/^https?:\/\//i.test(cfg.ogImage)) ogImage = cfg.ogImage;
    else if (fs.existsSync(path.join(ROOT, cfg.ogImage))) ogImage = absUrl(cfg.ogImage, cfg);
    else warnings.push(`ogImage が存在しません: ${cfg.ogImage}`);
  }
  if (ogImage) items.push(prop('og:image', ogImage));

  items.push(meta('twitter:card', ogImage ? 'summary_large_image' : 'summary'));
  if (title) items.push(meta('twitter:title', title));
  if (desc) items.push(meta('twitter:description', desc.text));
  if (ogImage) items.push(meta('twitter:image', ogImage));

  // JSON-LD
  if (rel === 'index.html') {
    items.push(jsonLdItem('Organization', buildOrganization(cfg)));
  }
  if (isJobPage(rel)) {
    const jp = buildJobPosting(rel, body, head, cfg);
    if (jp.ok) items.push(jsonLdItem('JobPosting', jp.posting));
    else ctx.jobSkip = jp.missing;
  }
  return { items, warnings, noindex, url, description: desc };
}

function jsonLdItem(type, node) {
  return {
    key: `ld+json:${type}`, label: `JSON-LD ${type}`,
    find: new RegExp(`<script\\b[^>]*application\\/ld\\+json[^>]*>[\\s\\S]*?"@type"\\s*:\\s*"${type}"[\\s\\S]*?<\\/script>`, 'i'),
    html: `<script type="application/ld+json">\n${JSON.stringify(node, null, 2)}\n</script>`,
    multiline: true,
  };
}

/* ────────────────────────── head へのピンポイント適用 ──────────────────────────
 * HTML全体は再シリアライズしない。<head> の innerHTML だけを文字列操作する。
 *   - 既存タグがある → その1件をその場で置換し、重複分は削除
 *   - 既存タグが無い → <head> 末尾の管理ブロック（SEO:BEGIN〜SEO:END）に追加
 */

function headIndent(headInner) {
  const lines = headInner.split('\n').filter((l) => l.trim());
  for (let i = lines.length - 1; i >= 0; i--) {
    const m = /^(\s+)\S/.exec(lines[i]);
    if (m) return m[1];
  }
  return '    ';
}

function applyToHead(html, items) {
  const head = regionOf(html, 'head');
  if (!head) return { html, added: [], updated: [], removed: [], error: '<head> が見つかりません' };

  let inner = html.slice(head.innerStart, head.innerEnd);
  const indent = headIndent(inner);

  // 既存の管理ブロックを一旦除去（毎回作り直す）
  const bi = inner.indexOf(BLOCK_BEGIN);
  const be = inner.indexOf(BLOCK_END);
  if (bi >= 0 && be > bi) {
    const start = inner.lastIndexOf('\n', bi) >= 0 ? inner.lastIndexOf('\n', bi) : bi;
    inner = inner.slice(0, start) + inner.slice(be + BLOCK_END.length);
  }

  const added = [], updated = [], removed = [];
  const blockItems = [];

  for (const item of items) {
    const g = new RegExp(item.find.source, item.find.flags.includes('g') ? item.find.flags : item.find.flags + 'g');
    const matches = [...inner.matchAll(g)];
    if (matches.length === 0) { blockItems.push(item); added.push(item.label); continue; }
    // 重複は後ろから削除し、先頭1件のみを更新する
    for (let i = matches.length - 1; i >= 1; i--) {
      const m = matches[i];
      let s = m.index, e = m.index + m[0].length;
      const lineStart = inner.lastIndexOf('\n', s);
      if (lineStart >= 0 && !inner.slice(lineStart + 1, s).trim()) s = lineStart;
      inner = inner.slice(0, s) + inner.slice(e);
      removed.push(item.label + ' (重複)');
    }
    const first = matches[0];
    if (first[0] !== item.html) {
      inner = inner.slice(0, first.index) + item.html + inner.slice(first.index + first[0].length);
      updated.push(item.label);
    }
  }

  if (blockItems.length) {
    const body = blockItems
      .map((t) => indent + t.html.split('\n').join('\n' + indent))
      .join('\n');
    const trail = /\s*$/.exec(inner)[0];
    const core = inner.slice(0, inner.length - trail.length);
    inner = core + '\n' + indent + BLOCK_BEGIN + '\n' + body + '\n' + indent + BLOCK_END + (trail || '\n');
  }

  return { html: html.slice(0, head.innerStart) + inner + html.slice(head.innerEnd), added, updated, removed };
}

const sha256 = (s) => crypto.createHash('sha256').update(s, 'utf8').digest('hex');
/** <body ...> 開始タグ（属性含む）から </body> までを対象にする */
function bodyHash(html) {
  const b = regionOf(html, 'body');
  return sha256(b ? html.slice(b.start, b.end) : html);
}
/** <head> 以外のすべて（DOCTYPE・html属性・body・末尾まで）の指紋 */
function outsideHeadHash(html) {
  const h = regionOf(html, 'head');
  return sha256(h ? html.slice(0, h.start) + html.slice(h.end) : html);
}

/* ────────────────────────── robots.txt / sitemap ────────────────────────── */

function buildRobots(cfg) {
  return ['User-agent: *', 'Allow: /', '', `Sitemap: ${cfg.baseUrl}/sitemap.xml`, ''].join('\n');
}

/** canonical が別ドメインを指すページ（他サイトの複製・転送用ページ）はsitemapに載せない */
const crossCanonicalCache = new Map();
function hasCrossOriginCanonical(rel, cfg) {
  const key = rel + '|' + cfg.baseUrl;
  if (crossCanonicalCache.has(key)) return crossCanonicalCache.get(key);
  let v = false;
  try {
    const configured = cfg.pages?.[rel]?.canonical;
    const got = configured || readHead(fs.readFileSync(path.join(ROOT, rel), 'utf8')).canonical[0];
    v = !!got && !got.startsWith(cfg.baseUrl + '/');
  } catch { v = false; }
  crossCanonicalCache.set(key, v);
  return v;
}
function sitemapPages(cfg, htmlFiles) {
  return htmlFiles.filter((f) => !isNoindex(f, cfg) && !isJobPage(f) && !hasCrossOriginCanonical(f, cfg));
}
/**
 * 求人の掲載ステータス。seo.config.json の jobs["<file>"].status に明示が無ければ "unknown"。
 * unknown はsitemapに載せず、自動noindexもしない（seo:jobs で要確認として報告する）。
 */
const jobStatus = (rel, cfg) => String(cfg.jobs?.[rel]?.status || 'unknown').toLowerCase();

function sitemapJobs(cfg, htmlFiles) {
  return htmlFiles.filter((f) => isJobPage(f) && !isNoindex(f, cfg) && !hasCrossOriginCanonical(f, cfg) &&
    jobStatus(f, cfg) === 'active');
}
function urlsetXml(cfg, files) {
  const rows = files.map((f) => {
    const lastmod = gitDate(f);
    return ['  <url>', `    <loc>${escapeAttr(urlFor(f, cfg))}</loc>`,
      lastmod ? `    <lastmod>${lastmod}</lastmod>` : null, '  </url>']
      .filter(Boolean).join('\n');
  });
  return ['<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', ...rows, '</urlset>', ''].join('\n');
}
function sitemapIndexXml(cfg, names) {
  const rows = names.map((n) => ['  <sitemap>', `    <loc>${cfg.baseUrl}/${n}</loc>`, '  </sitemap>'].join('\n'));
  return ['<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', ...rows, '</sitemapindex>', ''].join('\n');
}

function plannedSiteFiles(cfg, htmlFiles) {
  const out = {};
  out['robots.txt'] = buildRobots(cfg);
  if (cfg.siteType === 'recruitment') {
    const jobs = sitemapJobs(cfg, htmlFiles);
    out['sitemap-pages.xml'] = urlsetXml(cfg, sitemapPages(cfg, htmlFiles));
    out['sitemap-jobs.xml'] = urlsetXml(cfg, jobs);
    // status:"active" の求人が0件のときは空のsitemapをindexに載せない
    out['sitemap.xml'] = sitemapIndexXml(cfg,
      jobs.length ? ['sitemap-pages.xml', 'sitemap-jobs.xml'] : ['sitemap-pages.xml']);
  } else {
    out['sitemap.xml'] = urlsetXml(cfg, sitemapPages(cfg, htmlFiles));
  }
  return out;
}

/* ────────────────────────── ページ解析（audit / apply 共通） ────────────────────────── */

function analyzePage(rel, cfg) {
  const html = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const head = readHead(html);
  const body = readBody(html);
  const ctx = { head, body, jobSkip: null };
  const plan = desiredTags(rel, html, cfg, ctx);
  return { rel, html, head, body, ctx, plan };
}

/**
 * 全ページを解析し、自動生成descriptionの重複を解消する。
 * 定型プロフィール文などが複数ページで同一になる場合、その説明文は出力せずWARNにする
 * （手動指定 = source 'config' は対象外）。
 */
function analyzeAll(cfg, htmlFiles = listHtml(cfg)) {
  const pages = htmlFiles.map((f) => analyzePage(f, cfg));
  const DESC_KEYS = ['meta[name=description]', 'meta[property=og:description]', 'meta[name=twitter:description]'];
  const byText = new Map();
  for (const p of pages) {
    const d = p.plan.description;
    if (!d || !d.text || d.source === 'config') continue;
    byText.set(d.text, (byText.get(d.text) || []).concat(p));
  }
  for (const [text, group] of byText) {
    if (group.length < 2) continue;
    for (const p of group) {
      p.plan.items = p.plan.items.filter((it) => !DESC_KEYS.includes(it.key));
      p.plan.description = null;
      p.plan.warnings.push(
        `他ページと同一の説明文のため description を出力しません（${group.length}ページで重複）: ${truncW(text, 40)}`);
    }
  }
  return pages;
}

function internalLinkTargets(rel, body) {
  const dir = path.posix.dirname(rel);
  const out = [];
  for (const href of body.links) {
    if (/^(https?:|mailto:|tel:|javascript:|data:|#)/i.test(href)) continue;
    const clean = href.split('#')[0].split('?')[0];
    if (!clean) continue;
    const target = path.posix.normalize(dir === '.' ? clean : dir + '/' + clean).replace(/^\.\//, '');
    out.push({ href, target });
  }
  return out;
}

function imageSize(abs) {
  try { return fs.statSync(abs).size; } catch { return 0; }
}
const fmtBytes = (n) => (n >= 1048576 ? (n / 1048576).toFixed(1) + 'MB' : Math.round(n / 1024) + 'KB');

/** 依存ライブラリ無しで画像の解像度を読む（PNG/JPEG/GIF/WebP/SVG） */
function imageDimensions(abs) {
  let buf;
  try { buf = fs.readFileSync(abs); } catch { return null; }
  const ext = path.extname(abs).toLowerCase();
  try {
    if (ext === '.png' && buf.length > 24 && buf.toString('ascii', 12, 16) === 'IHDR')
      return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
    if (ext === '.gif' && buf.length > 10)
      return { w: buf.readUInt16LE(6), h: buf.readUInt16LE(8) };
    if (ext === '.webp' && buf.toString('ascii', 0, 4) === 'RIFF') {
      const fmt = buf.toString('ascii', 12, 16);
      if (fmt === 'VP8X') return { w: (buf.readUIntLE(24, 3) & 0xffffff) + 1, h: (buf.readUIntLE(27, 3) & 0xffffff) + 1 };
      if (fmt === 'VP8 ') return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
      if (fmt === 'VP8L') {
        const b = buf.readUInt32LE(21);
        return { w: (b & 0x3fff) + 1, h: ((b >> 14) & 0x3fff) + 1 };
      }
    }
    if (ext === '.jpg' || ext === '.jpeg') {
      let i = 2;
      while (i < buf.length - 9) {
        if (buf[i] !== 0xff) { i++; continue; }
        const marker = buf[i + 1];
        const len = buf.readUInt16BE(i + 2);
        if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker))
          return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
        i += 2 + len;
      }
    }
    if (ext === '.svg') {
      const s = buf.toString('utf8', 0, 2000);
      const vb = /viewBox\s*=\s*["']\s*[\d.-]+\s+[\d.-]+\s+([\d.]+)\s+([\d.]+)/i.exec(s);
      if (vb) return { w: Math.round(+vb[1]), h: Math.round(+vb[2]) };
    }
  } catch { /* ignore */ }
  return null;
}

/* ────────────────────────── レポート出力 ────────────────────────── */

function writeReport(command, data, mdLines) {
  if (flags.noReport) return null;
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const json = { command, generatedAt: new Date().toISOString(), baseUrl: data.baseUrl, ...data };
  fs.writeFileSync(path.join(REPORT_DIR, 'seo-report.json'), JSON.stringify(json, null, 2) + '\n');
  fs.writeFileSync(path.join(REPORT_DIR, 'seo-report.md'),
    [`# SEO Report (${command})`, '', `- 生成日時: ${json.generatedAt}`, `- baseUrl: ${data.baseUrl}`, '', ...mdLines, ''].join('\n'));
  return path.relative(ROOT, path.join(REPORT_DIR, 'seo-report.json'));
}
const mdTable = (headers, rows) => [
  '| ' + headers.join(' | ') + ' |',
  '| ' + headers.map(() => '---').join(' | ') + ' |',
  ...rows.map((r) => '| ' + r.map((v) => String(v ?? '').replace(/\|/g, '\\|')).join(' | ') + ' |'),
];

/* ────────────────────────────── seo:audit ────────────────────────────── */

const YES = () => (useColor ? green('✓') : 'YES');
const NO = () => (useColor ? red('—') : 'NO');
const flag = (b) => (b ? YES() : NO());

function collectLinkIssues(pages, cfg) {
  const all = listFiles(cfg);
  const exists = new Set(all);
  const issues = [];
  for (const p of pages) {
    for (const { href, target } of internalLinkTargets(p.rel, p.body)) {
      if (exists.has(target)) continue;
      if (exists.has(target.replace(/\/$/, '/index.html'))) continue;
      if (fs.existsSync(path.join(ROOT, target))) continue;
      issues.push({ file: p.rel, href, target });
    }
  }
  return issues;
}

function collectMediaIssues(pages, cfg) {
  const imgAlt = [], lazy = [], missingImg = [];
  const usedImages = new Map();
  for (const p of pages) {
    for (const img of p.body.imgs) {
      const src = img.src || '';
      if (!src) continue;
      if (!('alt' in img) || !String(img.alt).trim()) imgAlt.push({ file: p.rel, src });
      if (!img.loading) lazy.push({ file: p.rel, src });
      if (!/^(https?:|data:)/i.test(src)) {
        const target = path.posix.normalize(path.posix.join(path.posix.dirname(p.rel), src.split('?')[0]));
        if (!fs.existsSync(path.join(ROOT, target))) missingImg.push({ file: p.rel, src });
        else usedImages.set(target, (usedImages.get(target) || []).concat(p.rel));
      }
    }
  }
  const mediaFiles = listFiles(cfg).filter((f) => /\.(png|jpe?g|webp|gif|svg|mp4|webm|mov)$/i.test(f));
  const largeImages = [], largeVideos = [];
  for (const f of mediaFiles) {
    const size = imageSize(path.join(ROOT, f));
    if (/\.(mp4|webm|mov)$/i.test(f)) { if (size > 5 * 1024 * 1024) largeVideos.push({ file: f, size }); }
    else if (size > 300 * 1024) largeImages.push({ file: f, size });
  }
  largeImages.sort((a, b) => b.size - a.size);
  largeVideos.sort((a, b) => b.size - a.size);
  return { imgAlt, lazy, missingImg, largeImages, largeVideos, usedImages, mediaFiles };
}

function jobAnalysis(cfg, pages) {
  const jobFiles = pages.filter((p) => isJobPage(p.rel)).map((p) => p.rel);
  const jobsPage = pages.find((p) => p.rel === 'jobs.html');
  const linkedFromJobs = new Set();
  const entryLinksFromJobsPage = new Set();
  if (jobsPage) {
    for (const href of jobsPage.body.links) {
      const clean = href.split('#')[0];
      if (/^job-[^/]+\.html/.test(clean)) linkedFromJobs.add(clean.split('?')[0]);
      if (/^entry\.html\?job=/.test(clean)) entryLinksFromJobsPage.add(clean.replace(/^entry\.html\?job=/, ''));
    }
  }
  const rows = pages.filter((p) => isJobPage(p.rel)).map((p) => {
    const jp = buildJobPosting(p.rel, p.body, p.head, cfg);
    const linksToEntry = p.body.links.some((h) => /^entry\.html/.test(h.split('#')[0]));
    const existingLd = p.head.jsonld.some((j) => j.parsed && String(j.parsed['@type']) === 'JobPosting');
    return {
      file: p.rel,
      title: p.body.h1s[0] || p.head.title || '',
      linkedFromJobsPage: linkedFromJobs.has(p.rel),
      linksToEntry,
      existingJobPosting: existingLd,
      jobPostingReady: jp.ok,
      missing: jp.missing,
      datePosted: jp.datePosted || null,
      employmentType: jp.employmentType || null,
      jobLocation: jp.locationRaw || null,
      inSitemap: sitemapJobs(cfg, pages.map((x) => x.rel)).includes(p.rel),
      status: jobStatus(p.rel, cfg),
    };
  });

  // jobs.html に載っているが詳細ページへリンクしていない求人（entry直リンクのみ）
  const orphanEntrySlugs = [...entryLinksFromJobsPage].filter(
    (slug) => !jobFiles.some((f) => f === `job-${slug}.html` || linkedFromJobs.has(f) && f.includes(slug)));

  // 重複求人候補
  const SYN = { cs: 'customer-success', fs: 'field-sales', is: 'inside-sales', mg: 'manager', hr: 'human-resources' };
  const tokenSet = (rel) => {
    const raw = rel.replace(/^job-|\.html$/g, '').split('-');
    const out = new Set();
    for (const t of raw) {
      const s = SYN[t] || t;
      for (const part of String(s).split('-')) if (part) out.add(part);
    }
    return out;
  };
  const isLeader = (rel, title) => /leader|リーダー/.test(rel + ' ' + (title || ''));
  // 「HD事業部 CSメンバー」と「HD CSメンバー」を同一とみなすための表記ゆれ吸収
  const normTitle = (s) => String(s)
    .replace(/(事業部|営業部|候補|募集)/g, '')
    .replace(/第[一二三1-3]/g, 'div')
    .replace(/[\s（）()・/／\-—ー、。]/g, '')
    .toLowerCase();
  const dupes = [];
  for (let i = 0; i < rows.length; i++) {
    for (let j = i + 1; j < rows.length; j++) {
      const a = rows[i], b = rows[j];
      const A = tokenSet(a.file), B = tokenSet(b.file);
      const inter = [...A].filter((x) => B.has(x)).length;
      const jac = inter / new Set([...A, ...B]).size;
      const sameTitle = a.title && normTitle(a.title) === normTitle(b.title);
      // リーダー職とメンバー職は別求人として扱う（誤検知防止）
      const sameLevel = isLeader(a.file, a.title) === isLeader(b.file, b.title);
      if (sameTitle || (sameLevel && jac >= 0.8)) {
        dupes.push({ a: a.file, b: b.file, reason: sameTitle ? 'H1が実質同一' : `slug類似度 ${(jac * 100).toFixed(0)}%` });
      }
    }
  }
  const notLinked = rows.filter((r) => !r.linkedFromJobsPage).map((r) => r.file);
  return { rows, dupes, notLinked, orphanEntrySlugs, linkedFromJobs: [...linkedFromJobs] };
}

function cmdAudit(cfg) {
  const htmlFiles = listHtml(cfg);
  const pages = analyzeAll(cfg, htmlFiles);

  section(`SEO監査: ${pages.length} ページ / baseUrl = ${cfg.baseUrl}`);
  const rows = pages.map((p) => {
    const h = p.head;
    const ogPresent = Object.values(h.og).filter((v) => v.length).length;
    const ldTypes = h.jsonld.map((j) => (j.parsed ? [].concat(j.parsed['@type'] || '?').join('/') : 'PARSE_ERROR'));
    return [
      p.rel,
      flag(!!h.title),
      flag(h.description.length > 0),
      flag(h.canonical.length > 0),
      h.robots.length ? h.robots[0] : (isNoindex(p.rel, cfg) ? red('未設定') : dim('-')),
      `${ogPresent}/7`,
      flag(h.twitterCard.length > 0),
      ldTypes.length ? ldTypes.join(',') : NO(),
      p.body.h1s.length === 1 ? YES() : (p.body.h1s.length === 0 ? NO() : yellow(`x${p.body.h1s.length}`)),
    ];
  });
  table(['ページ', 'title', 'desc', 'canon', 'robots', 'og', 'tw', 'JSON-LD', 'H1'], rows, [42, 6, 6, 6, 16, 6, 4, 22, 6]);

  // 重複チェック
  const dupOf = (fn) => {
    const map = new Map();
    for (const p of pages) { const v = fn(p); if (!v) continue; map.set(v, (map.get(v) || []).concat(p.rel)); }
    return [...map.entries()].filter(([, files]) => files.length > 1);
  };
  const dupTitle = dupOf((p) => p.head.title);
  const dupDesc = dupOf((p) => p.head.description[0]);
  const dupCanon = dupOf((p) => p.head.canonical[0]);
  section('重複チェック');
  console.log(`  duplicate title:       ${dupTitle.length ? red(dupTitle.length + ' 件') : green('0 件')}`);
  for (const [v, f] of dupTitle) console.log(`    ${dim(truncW(v, 50))} → ${f.join(', ')}`);
  console.log(`  duplicate description: ${dupDesc.length ? red(dupDesc.length + ' 件') : green('0 件')}`);
  for (const [v, f] of dupDesc) console.log(`    ${dim(truncW(v, 50))} → ${f.join(', ')}`);
  console.log(`  duplicate canonical:   ${dupCanon.length ? red(dupCanon.length + ' 件') : green('0 件')}`);
  for (const [v, f] of dupCanon) console.log(`    ${dim(truncW(v, 50))} → ${f.join(', ')}`);

  // description 生成可否
  const descWarn = pages.filter((p) => p.plan.warnings.some((w) => w.includes('description')));
  section('description 生成可否（apply時）');
  console.log(`  自動生成可: ${green(String(pages.length - descWarn.length))} / 生成不可(WARN): ${descWarn.length ? yellow(String(descWarn.length)) : '0'}`);
  if (descWarn.length) {
    table(['ページ', 'WARN'], descWarn.map((p) => [p.rel, '信頼できる説明文を抽出できません → seo.config.json の pages で指定']), [42, 70]);
  }

  // リンク・メディア
  const links = collectLinkIssues(pages, cfg);
  const media = collectMediaIssues(pages, cfg);
  section('内部リンク切れ');
  table(['ページ', 'href', '解決先'], links.slice(0, 40).map((i) => [i.file, i.href, i.target]), [30, 40, 40]);
  if (links.length > 40) console.log(dim(`  … 他 ${links.length - 40} 件`));

  section('画像・動画');
  console.log(`  img alt 未設定: ${media.imgAlt.length ? yellow(String(media.imgAlt.length)) : green('0')} 件`);
  for (const i of media.imgAlt.slice(0, 10)) console.log(`    ${i.file} → ${i.src}`);
  console.log(`  loading="lazy" 未設定: ${media.lazy.length ? yellow(String(media.lazy.length)) : green('0')} 件`);
  console.log(`  存在しない画像参照: ${media.missingImg.length ? red(String(media.missingImg.length)) : green('0')} 件`);
  for (const i of media.missingImg.slice(0, 10)) console.log(`    ${i.file} → ${i.src}`);
  console.log(`  大きい画像 (>300KB): ${media.largeImages.length ? yellow(String(media.largeImages.length)) : green('0')} 件`);
  table(['画像', 'サイズ'], media.largeImages.slice(0, 10).map((i) => [i.file, fmtBytes(i.size)]), [50, 10]);
  console.log(`  大きい動画 (>5MB): ${media.largeVideos.length ? yellow(String(media.largeVideos.length)) : green('0')} 件`);
  table(['動画', 'サイズ'], media.largeVideos.slice(0, 10).map((i) => [i.file, fmtBytes(i.size)]), [50, 10]);

  let jobs = null;
  if (cfg.siteType === 'recruitment') {
    jobs = jobAnalysis(cfg, pages);
    section(`採用サイト監査: job-*.html ${jobs.rows.length} 件`);
    table(['求人ページ', 'JobPosting', 'datePosted', 'employmentType', 'jobLocation', 'jobs.htmlリンク', 'entryリンク'],
      jobs.rows.map((r) => [
        r.file,
        r.existingJobPosting ? YES() : (r.jobPostingReady ? yellow('未設定(生成可)') : red('未設定(不足)')),
        r.datePosted || NO(), r.employmentType || NO(), r.jobLocation || NO(),
        flag(r.linkedFromJobsPage), flag(r.linksToEntry),
      ]), [36, 16, 12, 16, 14, 16, 12]);
    console.log(`\n  jobs.html から詳細ページへリンクされていない求人: ${jobs.notLinked.length ? yellow(String(jobs.notLinked.length)) : green('0')} 件`);
    console.log(`  重複求人候補: ${jobs.dupes.length ? yellow(String(jobs.dupes.length)) : green('0')} 組  ${dim('（seo:jobs で詳細）')}`);
  }

  const md = [
    '## ページ別サマリ', '',
    ...mdTable(['ページ', 'title', 'description', 'canonical', 'robots', 'og数', 'JSON-LD'],
      pages.map((p) => [p.rel, p.head.title ? 'OK' : 'MISS', p.head.description.length ? 'OK' : 'MISS',
        p.head.canonical.length ? 'OK' : 'MISS', p.head.robots[0] || '-',
        Object.values(p.head.og).filter((v) => v.length).length,
        p.head.jsonld.map((j) => (j.parsed ? [].concat(j.parsed['@type']).join('/') : 'ERROR')).join(',') || '-'])),
    '', '## 内部リンク切れ', '',
    ...(links.length ? mdTable(['ページ', 'href'], links.map((i) => [i.file, i.href])) : ['なし']),
    '', '## description 生成不可（WARN）', '',
    ...(descWarn.length ? descWarn.map((p) => `- ${p.rel}`) : ['なし']),
  ];
  const rp = writeReport('audit', {
    baseUrl: cfg.baseUrl,
    pages: pages.map((p) => ({
      file: p.rel, url: urlFor(p.rel, cfg), title: p.head.title,
      description: p.head.description[0] || null, canonical: p.head.canonical[0] || null,
      robots: p.head.robots[0] || null, og: p.head.og, twitterCard: p.head.twitterCard[0] || null,
      jsonld: p.head.jsonld.map((j) => (j.parsed ? j.parsed['@type'] : 'PARSE_ERROR')),
      h1: p.body.h1s, warnings: p.plan.warnings, noindex: isNoindex(p.rel, cfg),
    })),
    duplicates: { title: dupTitle, description: dupDesc, canonical: dupCanon },
    brokenLinks: links, media: {
      imgAltMissing: media.imgAlt, lazyMissing: media.lazy.length, missingImages: media.missingImg,
      largeImages: media.largeImages, largeVideos: media.largeVideos,
    },
    jobs,
  }, md);
  if (rp) console.log('\n' + dim(`レポート: ${rp} / reports/seo-report.md`));
}

/* ────────────────────────────── seo:apply ────────────────────────────── */

function groupLabels(labels) {
  const out = [];
  const push = (v) => { if (v && !out.includes(v)) out.push(v); };
  for (const l of labels) {
    if (l === 'description') push('meta description');
    else if (l === 'canonical') push('canonical');
    else if (l === 'robots') push('noindex');
    else if (l === 'google-site-verification') push('Search Console verification');
    else if (l.startsWith('og:')) push('OGP');
    else if (l.startsWith('twitter:')) push('Twitter Card');
    else if (l.startsWith('JSON-LD ')) push(l.replace('JSON-LD ', '') + ' JSON-LD');
    else push(l);
  }
  return out;
}

function cmdApply(cfg) {
  const dry = flags.dryRun;
  const htmlFiles = listHtml(cfg);
  const pages = analyzeAll(cfg, htmlFiles);

  section(dry ? 'seo:apply --dry-run（ファイルは変更しません）' : 'seo:apply');

  const planned = [];
  const guardFailures = [];
  const warnings = [];
  const jobSkips = [];

  for (const p of pages) {
    if (p.ctx.jobSkip) jobSkips.push({ file: p.rel, missing: p.ctx.jobSkip });
    for (const w of p.plan.warnings) warnings.push({ file: p.rel, warning: w });
    if (!p.plan.items.length) continue;

    const res = applyToHead(p.html, p.plan.items);
    if (res.error) { warnings.push({ file: p.rel, warning: res.error }); continue; }

    // UI保護: <head> 以外が1バイトでも変わっていないか
    const beforeBody = bodyHash(p.html), afterBody = bodyHash(res.html);
    const beforeOutside = outsideHeadHash(p.html), afterOutside = outsideHeadHash(res.html);
    if (beforeBody !== afterBody) guardFailures.push({ file: p.rel, kind: 'body' });
    else if (beforeOutside !== afterOutside) guardFailures.push({ file: p.rel, kind: 'outside-head' });

    const changed = res.html !== p.html;
    planned.push({
      file: p.rel, html: res.html, changed,
      added: groupLabels(res.added), updated: groupLabels(res.updated), removed: res.removed,
      description: p.plan.description?.text || null, descriptionSource: p.plan.description?.source || null,
      bodyHash: afterBody,
    });
  }

  if (guardFailures.length) {
    for (const g of guardFailures) {
      console.error(red(`ERROR: Body content changed: ${g.file}`) + dim(` (${g.kind})`));
    }
    console.error(red('SEO apply aborted.'));
    process.exit(1);
  }

  // 出力（変更のあるページのみ）
  for (const p of planned) {
    if (!p.added.length && !p.updated.length && !p.removed.length) continue;
    console.log(`\n${bold('[' + p.file + ']')}`);
    for (const l of p.added) console.log(green('  + ') + l);
    for (const l of p.updated) console.log(cyan('  ~ ') + l + dim(' (更新)'));
    for (const l of p.removed) console.log(yellow('  - ') + l + dim(' (削除)'));
  }
  const noop = planned.filter((p) => !p.changed).length;
  if (noop) console.log(dim(`\n(変更不要: ${noop} ページ)`));

  // robots.txt / sitemap
  const siteFiles = plannedSiteFiles(cfg, htmlFiles);
  const siteOps = [];
  for (const [name, content] of Object.entries(siteFiles)) {
    const abs = path.join(ROOT, name);
    const exists = fs.existsSync(abs);
    const same = exists && fs.readFileSync(abs, 'utf8') === content;
    siteOps.push({ name, content, op: same ? 'UNCHANGED' : exists ? 'UPDATE' : 'CREATE' });
  }
  for (const o of siteOps) {
    if (o.op === 'UNCHANGED') continue;
    console.log(`\n${bold('[' + o.name + ']')}\n  ${o.op === 'CREATE' ? green('CREATE') : cyan('UPDATE')}`);
  }

  if (jobSkips.length) {
    console.log('');
    for (const s of jobSkips) {
      console.log(yellow('SKIP JobPosting:') + `\n${s.file}\nReason: ${s.missing.join(', ')} missing`);
    }
  }
  if (warnings.length) {
    section('WARN');
    table(['ページ', '内容'], warnings.map((w) => [w.file, w.warning]), [36, 80]);
  }

  if (dry) {
    console.log('\n' + dim('--dry-run のためファイルは変更していません。'));
  } else {
    let written = 0;
    for (const p of planned) {
      if (!p.changed) continue;
      fs.writeFileSync(path.join(ROOT, p.file), p.html);
      written++;
    }
    for (const o of siteOps) {
      if (o.op === 'UNCHANGED') continue;
      fs.writeFileSync(path.join(ROOT, o.name), o.content);
    }
    // 適用後の再検証（書き込み結果を読み直して body hash を突き合わせる）
    const baseline = {};
    for (const p of planned) {
      const after = fs.readFileSync(path.join(ROOT, p.file), 'utf8');
      const h = bodyHash(after);
      if (h !== p.bodyHash) {
        console.error(red(`ERROR: Body content changed: ${p.file}`));
        console.error(red('SEO apply aborted.'));
        process.exit(1);
      }
      baseline[p.file] = h;
    }
    fs.mkdirSync(REPORT_DIR, { recursive: true });
    fs.writeFileSync(path.join(REPORT_DIR, 'seo-body-hashes.json'),
      JSON.stringify({ generatedAt: new Date().toISOString(), hashes: baseline }, null, 2) + '\n');
    console.log(`\n${green('適用完了')}: HTML ${written} ファイル / サイトファイル ${siteOps.filter((o) => o.op !== 'UNCHANGED').length} 件`);
    console.log(dim('body hash 検証: 全ページ一致（UI・本文の変更なし）'));
  }

  const md = [
    '## 変更計画', '',
    ...planned.filter((p) => p.added.length || p.updated.length || p.removed.length)
      .flatMap((p) => [`### ${p.file}`, ...p.added.map((l) => `- + ${l}`), ...p.updated.map((l) => `- ~ ${l}`), ...p.removed.map((l) => `- - ${l}`), '']),
    '## サイトファイル', '',
    ...mdTable(['ファイル', '操作'], siteOps.map((o) => [o.name, o.op])),
    '', '## SKIP JobPosting', '',
    ...(jobSkips.length ? jobSkips.map((s) => `- ${s.file}: ${s.missing.join(', ')} missing`) : ['なし']),
    '', '## WARN', '',
    ...(warnings.length ? warnings.map((w) => `- ${w.file}: ${w.warning}`) : ['なし']),
  ];
  const rp = writeReport(dry ? 'apply --dry-run' : 'apply', {
    baseUrl: cfg.baseUrl,
    changes: planned.map((p) => ({ file: p.file, added: p.added, updated: p.updated, removed: p.removed,
      description: p.description, descriptionSource: p.descriptionSource })),
    siteFiles: siteOps.map((o) => ({ name: o.name, op: o.op })),
    jobSkips, warnings, bodyGuard: 'passed',
  }, md);
  if (rp) console.log(dim(`レポート: ${rp} / reports/seo-report.md`));
}

/* ────────────────────────────── seo:jobs ────────────────────────────── */

function cmdJobs(cfg) {
  if (cfg.siteType !== 'recruitment') die('siteType が recruitment ではありません');
  const pages = analyzeAll(cfg);
  const j = jobAnalysis(cfg, pages);
  const inSitemap = sitemapJobs(cfg, pages.map((p) => p.rel));

  section(`求人ページ一覧: ${j.rows.length} 件`);
  table(['求人ページ', 'H1', 'status', 'sitemap-jobs'],
    j.rows.map((r) => [r.file, r.title, r.status === 'unknown' ? yellow('unknown') : r.status, flag(inSitemap.includes(r.file))]),
    [36, 34, 10, 12]);

  const byStatus = { active: [], unknown: [], other: [] };
  for (const r of j.rows) (byStatus[r.status] ? byStatus[r.status] : byStatus.other).push(r.file);
  section('掲載ステータス');
  console.log(`  active (sitemap-jobs.xml に掲載): ${byStatus.active.length ? green(String(byStatus.active.length)) : red('0')} 件`);
  for (const f of byStatus.active) console.log('    ' + f);
  console.log(`  ${yellow('unknown（要確認: 正式求人か未確定）')}: ${byStatus.unknown.length} 件 ${dim('※sitemap未掲載 / 自動noindexもしません')}`);
  for (const f of byStatus.unknown) console.log('    ' + f);
  if (byStatus.other.length) {
    console.log(`  その他 (draft/duplicate/inactive/closed): ${byStatus.other.length} 件`);
    for (const f of byStatus.other) console.log(`    ${f} (${jobStatus(f, cfg)})`);
  }
  if (!byStatus.active.length) {
    console.log(dim('\n  正式求人が確定したら seo.config.json で status を active にしてください:'));
    console.log(dim('    "jobs": { "job-xxx.html": { "status": "active", "datePosted": "2026-04-01" } }'));
  }

  section('jobs.html との導線');
  console.log(`  jobs.html から詳細ページへリンクされている求人: ${j.linkedFromJobs.length} 件`);
  for (const f of j.linkedFromJobs) console.log('    ' + f);
  console.log(`\n  ${yellow('詳細ページへリンクされていない求人')}: ${j.notLinked.length} 件`);
  for (const f of j.notLinked) console.log('    ' + f);
  if (j.orphanEntrySlugs.length) {
    console.log(`\n  ${yellow('jobs.html に掲載されているが entry.html 直リンクのみの職種')}: ${j.orphanEntrySlugs.length} 件`);
    for (const s of j.orphanEntrySlugs) console.log('    ' + s);
  }

  section('重複求人候補（自動削除・統合はしません）');
  table(['候補A', '候補B', '判定理由'], j.dupes.map((d) => [d.a, d.b, d.reason]), [36, 36, 24]);

  section('JobPosting 設定状況');
  const done = j.rows.filter((r) => r.existingJobPosting);
  const ready = j.rows.filter((r) => !r.existingJobPosting && r.jobPostingReady);
  const blocked = j.rows.filter((r) => !r.existingJobPosting && !r.jobPostingReady);
  console.log(`  設定済み: ${done.length} 件 / apply で生成可: ${ready.length} 件 / 情報不足でSKIP: ${blocked.length} 件`);
  if (blocked.length) {
    console.log('');
    for (const r of blocked) console.log(yellow('SKIP JobPosting:') + `\n${r.file}\nReason: ${r.missing.join(', ')} missing`);
    console.log(dim('\n  ※ datePosted は推測しません。seo.config.json の jobs["<file>"].datePosted に正式な掲載日を設定してください。'));
    console.log(dim('     例: "jobs": { "job-ai-medical-field-sales.html": { "datePosted": "2026-04-01", "status": "active" } }'));
  }

  const md = [
    '## 求人ページ', '',
    ...mdTable(['ファイル', 'H1', 'JobPosting', '不足項目', 'jobs.htmlリンク', 'sitemap-jobs'],
      j.rows.map((r) => [r.file, r.title, r.existingJobPosting ? '設定済' : (r.jobPostingReady ? '生成可' : 'SKIP'),
        r.missing.join(', ') || '-', r.linkedFromJobsPage ? 'YES' : 'NO', inSitemap.includes(r.file) ? 'YES' : 'NO'])),
    '', '## 重複求人候補', '',
    ...(j.dupes.length ? mdTable(['候補A', '候補B', '理由'], j.dupes.map((d) => [d.a, d.b, d.reason])) : ['なし']),
    '', '## 詳細ページへリンクされていない求人', '',
    ...(j.notLinked.length ? j.notLinked.map((f) => `- ${f}`) : ['なし']),
  ];
  const rp = writeReport('jobs', { baseUrl: cfg.baseUrl, jobs: j, sitemapJobs: inSitemap }, md);
  if (rp) console.log('\n' + dim(`レポート: ${rp} / reports/seo-report.md`));
}

/* ────────────────────────────── seo:images（レポート専用） ────────────────────────────── */

function recommendation(file, size, dim) {
  const ext = path.extname(file).toLowerCase();
  const isVideo = /\.(mp4|webm|mov)$/i.test(file);
  if (isVideo) {
    if (size > 10 * 1024 * 1024) return { text: 'H.264/AV1 再エンコード + poster指定 + preload="none"', ratio: 0.7 };
    if (size > 3 * 1024 * 1024) return { text: '再エンコード + preload="none"', ratio: 0.5 };
    return { text: '対応不要', ratio: 0 };
  }
  if (ext === '.svg') return { text: size > 100 * 1024 ? 'SVG最適化(svgo)' : '対応不要', ratio: size > 100 * 1024 ? 0.4 : 0 };
  const wide = dim && dim.w > 2400;
  if (size > 1024 * 1024) return { text: `WebP変換${wide ? ' + 長辺2000pxへリサイズ' : ''}`, ratio: wide ? 0.85 : 0.7 };
  if (size > 300 * 1024) return { text: `WebP変換${wide ? ' + リサイズ' : ''}`, ratio: 0.6 };
  if (wide) return { text: '長辺2000pxへリサイズ', ratio: 0.4 };
  return { text: '対応不要', ratio: 0 };
}

function cmdImages(cfg) {
  const pages = analyzeAll(cfg);
  const media = collectMediaIssues(pages, cfg);

  // HTML / CSS / JS からの参照ページを収集
  const textFiles = listFiles(cfg).filter((f) => /\.(html|css|js)$/i.test(f));
  const contents = textFiles.map((f) => ({ f, s: fs.readFileSync(path.join(ROOT, f), 'utf8') }));
  const usedBy = (file) => {
    const base = path.posix.basename(file);
    return contents.filter((c) => c.s.includes(base)).map((c) => c.f);
  };

  const rows = media.mediaFiles.map((f) => {
    const abs = path.join(ROOT, f);
    const size = imageSize(abs);
    const dim = imageDimensions(abs);
    const rec = recommendation(f, size, dim);
    const users = usedBy(f);
    return { file: f, size, dim, rec, users, saving: Math.round(size * rec.ratio) };
  }).sort((a, b) => b.size - a.size);

  const totalSize = rows.reduce((n, r) => n + r.size, 0);
  const totalSaving = rows.reduce((n, r) => n + r.saving, 0);

  section(`メディア監査: ${rows.length} ファイル / 合計 ${fmtBytes(totalSize)}`);
  console.log(dim('  ※ このコマンドはレポート専用です。seo:apply も含め、画像・動画を書き換えることはありません。\n'));
  table(['ファイル', 'サイズ', '解像度', '使用ページ', '推奨最適化', '推定削減'],
    rows.filter((r) => r.rec.ratio > 0 || r.users.length === 0).slice(0, 60).map((r) => [
      r.file, fmtBytes(r.size), r.dim ? `${r.dim.w}x${r.dim.h}` : '-',
      r.users.length ? (r.users.length > 2 ? `${r.users.length} ページ` : r.users.join(', ')) : yellow('未参照'),
      r.rec.text, r.saving ? fmtBytes(r.saving) : '-',
    ]), [44, 8, 12, 26, 38, 10]);

  const unused = rows.filter((r) => r.users.length === 0);
  console.log(`\n  推定削減量 合計: ${bold(fmtBytes(totalSaving))} ${dim(`(${Math.round(totalSaving / totalSize * 100)}%)`)}`);
  console.log(`  未参照ファイル: ${unused.length ? yellow(String(unused.length)) : green('0')} 件 ${dim('(削除は自動実行しません)')}`);

  const md = ['## メディア一覧', '',
    ...mdTable(['ファイル', 'サイズ', '解像度', '使用ページ数', '推奨最適化', '推定削減'],
      rows.map((r) => [r.file, fmtBytes(r.size), r.dim ? `${r.dim.w}x${r.dim.h}` : '-', r.users.length, r.rec.text, r.saving ? fmtBytes(r.saving) : '-'])),
    '', `合計 ${fmtBytes(totalSize)} / 推定削減 ${fmtBytes(totalSaving)}`];
  const rp = writeReport('images', {
    baseUrl: cfg.baseUrl, totalSize, totalSaving,
    media: rows.map((r) => ({ file: r.file, size: r.size, dimensions: r.dim, usedBy: r.users, recommendation: r.rec.text, estimatedSaving: r.saving })),
  }, md);
  if (rp) console.log(dim(`レポート: ${rp} / reports/seo-report.md`));
}

/* ────────────────────────────── seo:verify ────────────────────────────── */

function xmlWellFormed(text) {
  const stack = [];
  const re = /<(\/?)([A-Za-z_][\w:.-]*)([^>]*?)(\/?)>/g;
  let m;
  while ((m = re.exec(text))) {
    if (m[3].startsWith('?') || m[2].toLowerCase() === 'xml') continue;
    if (m[1] === '/') { if (stack.pop() !== m[2]) return `閉じタグ不一致: </${m[2]}>`; }
    else if (!m[4]) stack.push(m[2]);
  }
  return stack.length ? `閉じられていないタグ: <${stack[stack.length - 1]}>` : null;
}

function cmdVerify(cfg) {
  const results = [];
  const add = (status, name, detail = '') => { results.push({ status, name, detail }); };
  const htmlFiles = listHtml(cfg);
  const pages = analyzeAll(cfg, htmlFiles);

  section('ローカル検証');

  // 1. SEOタグ重複
  const dupTagPages = [];
  for (const p of pages) {
    const dups = [];
    if (p.head.titles.length > 1) dups.push(`title x${p.head.titles.length}`);
    if (p.head.description.length > 1) dups.push(`description x${p.head.description.length}`);
    if (p.head.canonical.length > 1) dups.push(`canonical x${p.head.canonical.length}`);
    if (p.head.robots.length > 1) dups.push(`robots x${p.head.robots.length}`);
    if (p.head.verification.length > 1) dups.push(`google-site-verification x${p.head.verification.length}`);
    for (const [k, v] of Object.entries(p.head.og)) if (v.length > 1) dups.push(`${k} x${v.length}`);
    if (dups.length) dupTagPages.push({ file: p.rel, dups });
  }
  add(dupTagPages.length ? 'FAIL' : 'OK', 'SEOタグ重複なし',
    dupTagPages.map((d) => `${d.file}: ${d.dups.join(', ')}`).join(' / '));

  // 2. canonical
  const canonMissing = [], canonWrong = [], canonCross = [];
  for (const p of pages) {
    if (isNoindex(p.rel, cfg)) continue;
    const want = urlFor(p.rel, cfg);
    const got = p.head.canonical[0];
    if (!got) canonMissing.push(p.rel);
    else if (got !== want) {
      const configured = cfg.pages?.[p.rel]?.canonical;
      if (configured && got === configured) continue;
      if (!got.startsWith(cfg.baseUrl + '/')) canonCross.push(`${p.rel}: ${got}`);
      else canonWrong.push(`${p.rel}: ${got} ≠ ${want}`);
    }
  }
  add(canonMissing.length ? 'FAIL' : 'OK', 'canonical 存在', canonMissing.join(', '));
  add(canonWrong.length ? 'FAIL' : 'OK', 'canonical URL 正常', canonWrong.join(' / '));
  if (canonCross.length) add('WARN', '別ドメインを指すcanonical（意図的か要確認・自動変更なし）', canonCross.join(' / '));

  // 3. noindex 対象
  const noindexBad = [];
  for (const rel of cfg.noindex) {
    const p = pages.find((x) => x.rel === rel);
    if (!p) { noindexBad.push(`${rel}: ファイルなし`); continue; }
    if (!p.head.robots.some((r) => /noindex/i.test(r))) noindexBad.push(`${rel}: robots未設定`);
    // 別ドメインを指す既存canonical（転送用スタブ等）は意図的な指定として許容する
    if (p.head.canonical.some((h) => h.startsWith(cfg.baseUrl + '/'))) noindexBad.push(`${rel}: 自己参照canonicalが付与されています`);
  }
  const noindexInSitemap = [];
  add(noindexBad.length ? 'FAIL' : 'OK', 'noindex 対象', noindexBad.join(' / '));

  // 4. XML validity / sitemap
  const expected = plannedSiteFiles(cfg, htmlFiles);
  for (const name of Object.keys(expected).filter((n) => n.endsWith('.xml'))) {
    const abs = path.join(ROOT, name);
    if (!fs.existsSync(abs)) { add('FAIL', `${name} 存在`, '未生成'); continue; }
    const text = fs.readFileSync(abs, 'utf8');
    const err = xmlWellFormed(text);
    add(err ? 'FAIL' : 'OK', `${name} XML validity`, err || '');
    const locs = [...text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    const bad = locs.filter((l) => !l.startsWith(cfg.baseUrl + '/'));
    add(bad.length ? 'FAIL' : 'OK', `${name} URL整合`, bad.slice(0, 3).join(', '));
    for (const rel of cfg.noindex) if (locs.includes(urlFor(rel, cfg))) noindexInSitemap.push(`${name}: ${rel}`);
  }
  add(noindexInSitemap.length ? 'FAIL' : 'OK', 'noindexページがsitemapに含まれない', noindexInSitemap.join(' / '));

  // 5. robots.txt
  const robotsAbs = path.join(ROOT, 'robots.txt');
  if (!fs.existsSync(robotsAbs)) add('FAIL', 'robots.txt', '未生成');
  else {
    const t = fs.readFileSync(robotsAbs, 'utf8');
    add(/User-agent:/i.test(t) && t.includes(`${cfg.baseUrl}/sitemap.xml`) ? 'OK' : 'FAIL', 'robots.txt', t.split('\n').filter(Boolean).join(' / '));
  }

  // 6. JSON-LD / JobPosting validity
  const ldErrors = [], jpErrors = [];
  for (const p of pages) {
    for (const j of p.head.jsonld) {
      if (j.error) { ldErrors.push(`${p.rel}: ${j.error}`); continue; }
      const types = [].concat(j.parsed['@type'] || []);
      if (!j.parsed['@context']) ldErrors.push(`${p.rel}: @context なし`);
      if (types.includes('JobPosting')) {
        for (const k of ['title', 'description', 'datePosted', 'employmentType', 'hiringOrganization', 'jobLocation'])
          if (!j.parsed[k]) jpErrors.push(`${p.rel}: JobPosting.${k} なし`);
      }
    }
  }
  add(ldErrors.length ? 'FAIL' : 'OK', 'JSON-LD validity', ldErrors.join(' / '));
  add(jpErrors.length ? 'FAIL' : 'OK', 'JobPosting validity', jpErrors.join(' / '));

  // 7. Search Console 認証タグ
  if (cfg.searchConsoleVerification) {
    const idx = pages.find((p) => p.rel === 'index.html');
    const v = idx ? idx.head.verification : [];
    const others = pages.filter((p) => p.rel !== 'index.html' && p.head.verification.length).map((p) => p.rel);
    if (!idx) add('FAIL', 'google-site-verification', 'index.html がありません');
    else if (v.length !== 1) add(v.length ? 'FAIL' : 'FAIL', 'google-site-verification が1件', `${v.length} 件`);
    else if (v[0] !== cfg.searchConsoleVerification) add('FAIL', 'google-site-verification 値一致', `${v[0]} ≠ ${cfg.searchConsoleVerification}`);
    else add('OK', 'google-site-verification (index.html に1件・値一致)', v[0]);
    if (others.length) add('WARN', '他ページの認証タグ', others.join(', '));
  } else {
    const any = pages.filter((p) => p.head.verification.length).map((p) => p.rel);
    add(any.length ? 'WARN' : 'OK', 'Search Console 認証タグ（config未設定）', any.join(', '));
  }

  // 7.4 sitemap-jobs.xml には status:"active" の求人のみ
  if (cfg.siteType === 'recruitment') {
    const jobFiles = htmlFiles.filter(isJobPage);
    const active = jobFiles.filter((f) => jobStatus(f, cfg) === 'active');
    const unknown = jobFiles.filter((f) => jobStatus(f, cfg) === 'unknown');
    const abs = path.join(ROOT, 'sitemap-jobs.xml');
    const locs = fs.existsSync(abs)
      ? [...fs.readFileSync(abs, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]) : [];
    const unexpected = locs.filter((l) => !active.some((f) => urlFor(f, cfg) === l));
    add(unexpected.length ? 'FAIL' : 'OK', 'sitemap-jobs.xml は status:"active" の求人のみ', unexpected.join(', '));
    if (unknown.length) add('WARN', `status未確定(unknown)の求人`, `${unknown.length} 件（sitemap未掲載・要確認）`);
    if (!active.length) add('WARN', 'status:"active" の求人が0件', 'sitemap-jobs.xml は空・sitemap.xml のindexからも除外されます');
  }

  // 7.5 OGP画像の実用性（サイズ・解像度）
  if (cfg.ogImage && !/^https?:\/\//i.test(cfg.ogImage)) {
    const abs = path.join(ROOT, cfg.ogImage);
    if (!fs.existsSync(abs)) add('FAIL', 'og:image ファイル存在', cfg.ogImage);
    else {
      const size = imageSize(abs), dim = imageDimensions(abs);
      const tooBig = size > 1024 * 1024, tooWide = dim && dim.w > 4000;
      add(tooBig || tooWide ? 'WARN' : 'OK', 'og:image のサイズ',
        `${cfg.ogImage} ${fmtBytes(size)}${dim ? ` ${dim.w}x${dim.h}` : ''}` +
        (tooBig || tooWide ? ' → SNS表示用に 1200x630 / 1MB以下の画像を用意してください' : ''));
    }
  }

  // 8. リンク切れ / 画像
  const links = collectLinkIssues(pages, cfg);
  add(links.length ? 'FAIL' : 'OK', 'broken links', links.slice(0, 5).map((l) => `${l.file} → ${l.href}`).join(' / ') + (links.length > 5 ? ` (他${links.length - 5}件)` : ''));
  const media = collectMediaIssues(pages, cfg);
  add(media.missingImg.length ? 'FAIL' : 'OK', '存在しない画像参照',
    media.missingImg.slice(0, 5).map((i) => `${i.file} → ${i.src}`).join(' / '));

  // 9. body hash（apply時のベースラインと比較）
  const hashPath = path.join(REPORT_DIR, 'seo-body-hashes.json');
  if (!fs.existsSync(hashPath)) add('WARN', 'body hash', 'ベースラインなし（seo:apply 実行後に記録されます）');
  else {
    const base = JSON.parse(fs.readFileSync(hashPath, 'utf8')).hashes || {};
    const changed = pages.filter((p) => base[p.rel] && base[p.rel] !== bodyHash(p.html)).map((p) => p.rel);
    add(changed.length ? 'FAIL' : 'OK', 'body hash（apply後にbodyが変更されていない）', changed.join(', '));
  }

  for (const r of results) {
    const s = r.status === 'OK' ? green('OK  ') : r.status === 'WARN' ? yellow('WARN') : red('FAIL');
    console.log(`  ${s} ${r.name}${r.detail ? dim('  ' + truncW(r.detail, 110)) : ''}`);
  }

  const remote = [];
  const finish = () => {
    const failed = [...results, ...remote].filter((r) => r.status === 'FAIL');
    const warned = [...results, ...remote].filter((r) => r.status === 'WARN');
    console.log(`\n  ${failed.length ? red(`FAIL ${failed.length}`) : green('FAIL 0')} / ${warned.length ? yellow(`WARN ${warned.length}`) : 'WARN 0'} / OK ${[...results, ...remote].filter((r) => r.status === 'OK').length}`);
    const md = ['## ローカル検証', '', ...mdTable(['結果', '項目', '詳細'], results.map((r) => [r.status, r.name, r.detail])),
      ...(remote.length ? ['', '## 本番URL検証', '', ...mdTable(['結果', '項目', '詳細'], remote.map((r) => [r.status, r.name, r.detail]))] : [])];
    const rp = writeReport('verify', { baseUrl: cfg.baseUrl, local: results, remote }, md);
    if (rp) console.log(dim(`レポート: ${rp} / reports/seo-report.md`));
    if (failed.length) process.exitCode = 1;
  };

  if (!flags.url) { finish(); return; }

  // 本番URL検証
  const base = flags.url;
  const targets = ['/', 'robots.txt', 'sitemap.xml', ...(cfg.siteType === 'recruitment' ? ['sitemap-pages.xml', 'sitemap-jobs.xml'] : [])];
  (async () => {
    section(`本番URL検証: ${base}`);
    for (const t of targets) {
      const url = t === '/' ? base + '/' : `${base}/${t}`;
      let res, text = '';
      try {
        res = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'seo.mjs/1.0 (+verify)' } });
        text = await res.text();
      } catch (e) {
        remote.push({ status: 'FAIL', name: `GET ${t}`, detail: e.message });
        continue;
      }
      remote.push({ status: res.status === 200 ? 'OK' : 'FAIL', name: `GET ${t}`, detail: `HTTP ${res.status}${res.url !== url ? ' → ' + res.url : ''}` });
      if (res.status !== 200) continue;

      if (t === '/') {
        const head = readHead(text);
        const v = head.verification;
        remote.push({ status: v.length === 1 ? 'OK' : 'FAIL', name: '本番 google-site-verification が1件', detail: `${v.length} 件` });
        remote.push({
          status: v[0] === cfg.searchConsoleVerification ? 'OK' : 'FAIL',
          name: '本番 認証値が完全一致', detail: v[0] ? `${v[0]}` : '認証タグなし',
        });
        remote.push({
          status: head.canonical[0] === cfg.baseUrl + '/' ? 'OK' : 'FAIL',
          name: `本番 canonical = ${cfg.baseUrl}/`, detail: head.canonical[0] || 'canonicalなし',
        });
        remote.push({ status: head.description[0] ? 'OK' : 'WARN', name: '本番 meta description', detail: truncW(head.description[0] || 'なし', 60) });
      } else if (t.endsWith('.xml')) {
        const err = xmlWellFormed(text);
        remote.push({ status: err ? 'FAIL' : 'OK', name: `本番 ${t} XML validity`, detail: err || `${(text.match(/<loc>/g) || []).length} URL` });
      } else if (t === 'robots.txt') {
        remote.push({ status: /Sitemap:/i.test(text) ? 'OK' : 'FAIL', name: '本番 robots.txt に Sitemap 行', detail: text.split('\n').filter((l) => /Sitemap:/i.test(l)).join(' ') });
      }
    }
    for (const r of remote) {
      const s = r.status === 'OK' ? green('OK  ') : r.status === 'WARN' ? yellow('WARN') : red('FAIL');
      console.log(`  ${s} ${r.name}${r.detail ? dim('  ' + truncW(r.detail, 110)) : ''}`);
    }
    finish();
  })();
}

/* ────────────────────────────── selftest（UI保護の動作確認） ────────────────────────────── */

function cmdSelftest(cfg) {
  let pass = 0, fail = 0;
  const check = (name, cond, detail = '') => {
    if (cond) { pass++; console.log('  ' + green('OK  ') + ' ' + name); }
    else { fail++; console.log('  ' + red('FAIL') + ' ' + name + (detail ? dim('  ' + detail) : '')); }
  };
  section('selftest: head編集がbodyを変更しないこと');

  const sample = [
    '<!DOCTYPE html>', '<html lang="ja">', '<head>', '    <meta charset="UTF-8">',
    '    <title>テストページ | Crestix</title>', '</head>',
    '<body class="x">', '<nav><a href="index.html">Top</a><span>CLOSE</span></nav>',
    '<main><h1>テスト</h1>',
    '<p class="job-lead">この段落は説明文として十分な長さを持つ日本語の文章です。品質ゲートを通過します。</p>',
    '<p><span data-role></span>としての仕事について記載します。プレースホルダを含むため採用されません。</p>',
    '</main>', '<footer>Copyright</footer>', '</body>', '</html>', ''].join('\n');

  const items = [
    { key: 'k1', label: 'description', find: /<meta\b[^>]*\bname\s*=\s*["']description["'][^>]*>/i, html: '<meta name="description" content="テスト">' },
    { key: 'k2', label: 'canonical', find: /<link\b[^>]*\brel\s*=\s*["']canonical["'][^>]*>/i, html: '<link rel="canonical" href="https://example.com/">' },
  ];
  const r1 = applyToHead(sample, items);
  check('head へタグを追加してもbody hashが変わらない', bodyHash(sample) === bodyHash(r1.html));
  check('head 以外のバイト列が変わらない', outsideHeadHash(sample) === outsideHeadHash(r1.html));
  check('description / canonical が追加される', /name="description"/.test(r1.html) && /rel="canonical"/.test(r1.html));

  const r2 = applyToHead(r1.html, items);
  check('再適用しても重複しない（冪等）',
    (r2.html.match(/name="description"/g) || []).length === 1 && r2.html === r1.html);

  const dup = r1.html.replace('</head>', '<meta name="description" content="重複">\n</head>');
  const r3 = applyToHead(dup, items);
  check('既存の重複タグを1件に集約する', (r3.html.match(/name="description"/g) || []).length === 1);

  const broken = r1.html.replace('<h1>テスト</h1>', '<h1>テスト改変</h1>');
  check('body改変を body hash で検出できる', bodyHash(r1.html) !== bodyHash(broken));

  section('selftest: description 品質ゲート');
  const body = readBody(sample);
  const d = buildDescription('dummy.html', body, { pages: {} });
  check('ナビ・ボタン文言を description にしない', !!d && !/CLOSE|Top/.test(d.text), d ? d.text : '(なし)');
  check('リード文を採用する', !!d && d.text.startsWith('この段落は'), d ? d.text : '(なし)');
  check('JS埋め込みプレースホルダ段落を採用しない', !!d && !d.text.includes('としての仕事'));
  check('短すぎる断片を弾く', !isTrustworthyDescription('応募する'));
  check('ナビ由来の文言を弾く', !isTrustworthyDescription('メニューを閉じる 詳細を見る 応募する 一覧へ戻る サイトマップ プライバシーポリシー'));

  section('selftest: JobPosting は情報不足なら生成しない');
  const jobHtml = sample.replace('<h1>テスト</h1>', '<h1>テスト職種</h1>')
    .replace('</main>', '<div class="job-summary-row"><p class="job-summary-label">Employment</p><p class="job-summary-value">正社員</p></div><div class="job-summary-row"><p class="job-summary-label">Location</p><p class="job-summary-value">東京本社</p></div></main>');
  const jb = readBody(jobHtml), jh = readHead(jobHtml);
  const noDate = buildJobPosting('job-test.html', jb, jh, { ...cfg, jobs: {} });
  check('datePosted が無ければ SKIP', !noDate.ok && noDate.missing.includes('datePosted'), noDate.missing.join(','));
  const withDate = buildJobPosting('job-test.html', jb, jh, { ...cfg, jobs: { 'job-test.html': { datePosted: '2026-04-01' } } });
  check('config の datePosted があれば生成', withDate.ok && withDate.posting.datePosted === '2026-04-01');
  check('salary / validThrough を推測しない', withDate.ok && !withDate.posting.baseSalary && !withDate.posting.validThrough);
  check('employmentType をページから取得', withDate.ok && withDate.posting.employmentType === 'FULL_TIME');

  console.log('\n  ' + (fail ? red('FAIL ' + fail) : green('FAIL 0')) + ' / OK ' + pass);
  if (fail) process.exitCode = 1;
}

/* ────────────────────────────── dispatch ────────────────────────────── */

function usage() {
  console.log(`
${bold('技術SEO CLI')}  node scripts/seo.mjs <command> [options]

  ${cyan('audit')}                 全HTMLのSEO状態を監査して表示（ファイルは変更しない）
  ${cyan('apply')} [--dry-run]     <head> / robots.txt / sitemap*.xml を適用（--dry-run は表示のみ）
  ${cyan('verify')} [--url <URL>]  適用結果を検証（--url 指定時は本番URLも検証）
  ${cyan('jobs')}                  求人ページ専用監査（削除・統合は自動実行しない）
  ${cyan('images')} [--dry-run]    画像・動画の最適化候補をレポート（常に変更しない）

  ${cyan('selftest')}              UI保護（body非改変）と品質ゲートの動作確認

  共通オプション: --no-report（reports/ へ出力しない）

  設定: seo.config.json
  変更対象: <head>内のSEOタグ / robots.txt / sitemap.xml / sitemap-pages.xml / sitemap-jobs.xml
  body・CSS・JS・レイアウトは一切変更しません。
`);
}

function main() {
  if (!command || ['-h', '--help', 'help'].includes(command)) { usage(); return; }
  const cfg = loadConfig();
  switch (command) {
    case 'audit': return cmdAudit(cfg);
    case 'apply': return cmdApply(cfg);
    case 'verify': return cmdVerify(cfg);
    case 'jobs': return cmdJobs(cfg);
    case 'images': return cmdImages(cfg);
    case 'selftest': return cmdSelftest(cfg);
    default: usage(); die(`不明なコマンド: ${command}`);
  }
}

main();
