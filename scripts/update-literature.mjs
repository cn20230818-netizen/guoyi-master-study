import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import crypto from 'node:crypto';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const generatedPath = resolve(root, 'src/data/literature-watch.generated.js');

const userAgent =
  'Mozilla/5.0 (compatible; GuoyiMasterLiteratureBot/1.0; +https://www.guoyinaobing.cn)';

const { masters } = await import(pathToFileURL(resolve(root, 'src/data/catalog.js')).href);
const { literatureWatchConfig } = await import(pathToFileURL(resolve(root, 'src/data/literature-watch-config.js')).href);

const blockedDomains = new Set([
  'duckduckgo.com',
  'www.baidu.com',
  'm.baidu.com',
  'zhidao.baidu.com',
  'wenku.baidu.com',
  'zhihu.com',
  'www.zhihu.com',
  'so.com',
  'www.so.com',
  'weibo.com',
  'www.weibo.com',
  'mp.weixin.qq.com',
]);

function hashText(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 12);
}

function stripTags(value) {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeDuckDuckGoUrl(rawUrl) {
  if (!rawUrl) {
    return null;
  }

  const decodedHtml = rawUrl.replace(/&amp;/g, '&');
  const absolute = decodedHtml.startsWith('//') ? `https:${decodedHtml}` : decodedHtml;

  try {
    const parsed = new URL(absolute);
    const redirectTarget = parsed.searchParams.get('uddg');
    return redirectTarget ? decodeURIComponent(redirectTarget) : absolute;
  } catch {
    return null;
  }
}

function normalizeUrl(url) {
  try {
    const parsed = new URL(url);
    parsed.hash = '';
    return parsed.toString();
  } catch {
    return null;
  }
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': userAgent,
      'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.text();
}

function extractDuckDuckGoResults(html) {
  const results = [];
  const regex = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
  let match;

  while ((match = regex.exec(html))) {
    const url = decodeDuckDuckGoUrl(match[1]);
    const title = stripTags(match[2]);

    if (!url || !title) {
      continue;
    }

    const snippetSegment = html.slice(match.index, Math.min(match.index + 1800, html.length));
    const snippetMatch = snippetSegment.match(/<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/);
    const snippet = snippetMatch ? stripTags(snippetMatch[1]) : '';
    const normalized = normalizeUrl(url);

    if (!normalized) {
      continue;
    }

    results.push({
      title,
      url: normalized,
      snippet,
    });
  }

  return results;
}

function domainAllowed(url, preferredDomains) {
  try {
    const hostname = new URL(url).hostname;

    if (blockedDomains.has(hostname)) {
      return false;
    }

    if (preferredDomains.length === 0) {
      return true;
    }

    return preferredDomains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

function detectPublishedAt(html) {
  const patterns = [
    /(\d{4}-\d{2}-\d{2})/,
    /(\d{4}\/\d{2}\/\d{2})/,
    /(\d{4}\.\d{2}\.\d{2})/,
    /(\d{4}年\d{1,2}月\d{1,2}日)/,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return '';
}

function buildCandidate(masterId, query, result, pageMeta, preferredDomains) {
  const hostname = new URL(result.url).hostname;
  const id = hashText(`${masterId}:${result.url}`);

  return {
    id,
    masterId,
    title: pageMeta.title || result.title,
    url: result.url,
    sourceDomain: hostname,
    sourceType: preferredDomains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`))
      ? '优先公开来源'
      : '公开网页线索',
    snippet: pageMeta.description || result.snippet || '待进一步人工核对页面摘要。',
    query,
    publishedAt: pageMeta.publishedAt,
    discoveredAt: new Date().toISOString(),
    reviewStatus: 'pending',
    note: '自动检索所得公开线索，需人工核验后再并入正式学术整理。',
  };
}

async function fetchPageMeta(url) {
  try {
    const html = await fetchText(url);
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const descriptionMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);

    return {
      title: titleMatch ? stripTags(titleMatch[1]) : '',
      description: descriptionMatch ? stripTags(descriptionMatch[1]) : '',
      publishedAt: detectPublishedAt(html),
    };
  } catch {
    return {
      title: '',
      description: '',
      publishedAt: '',
    };
  }
}

async function searchMaster(masterId, config) {
  const knownUrls = new Set(masters[masterId].sources.map((source) => normalizeUrl(source.url)).filter(Boolean));
  const seen = new Set();
  const items = [];

  for (const query of config.queries) {
    const queryUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    let html = '';

    try {
      html = await fetchText(queryUrl);
    } catch (error) {
      console.warn(`Failed search for ${masterId}: ${query}`, error.message);
      continue;
    }

    const results = extractDuckDuckGoResults(html);

    for (const result of results) {
      if (!domainAllowed(result.url, config.preferredDomains)) {
        continue;
      }

      if (knownUrls.has(result.url) || seen.has(result.url)) {
        continue;
      }

      seen.add(result.url);
      const pageMeta = await fetchPageMeta(result.url);
      items.push(buildCandidate(masterId, query, result, pageMeta, config.preferredDomains));

      if (items.length >= 6) {
        break;
      }
    }

    if (items.length >= 6) {
      break;
    }
  }

  return items;
}

const grouped = await Promise.all(
  Object.entries(literatureWatchConfig.masters).map(async ([masterId, config]) => searchMaster(masterId, config)),
);

const items = grouped.flat().sort((a, b) => {
  const aDate = a.publishedAt || a.discoveredAt;
  const bDate = b.publishedAt || b.discoveredAt;
  return aDate < bDate ? 1 : -1;
});

const payload = {
  generatedAt: new Date().toISOString(),
  note: literatureWatchConfig.note,
  items,
};

const fileText = `export const literatureWatch = ${JSON.stringify(payload, null, 2)};\n`;

await writeFile(generatedPath, fileText, 'utf8');
console.log(`Updated literature watch with ${items.length} pending items.`);
