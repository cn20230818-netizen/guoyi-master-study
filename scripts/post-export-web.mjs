import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const dist = resolve(root, 'dist');
const siteUrl = 'https://www.guoyinaobing.cn';
const customDomain = 'www.guoyinaobing.cn';
const sharedDescription =
  '三位国医大师脑病辨证路径、公开医案脉络与学术思维研习平台，供中医学习、教学与研究浏览。';
const sharedKeywords = '国医大师,脑病,中医,学术传承,辨证思维,张学文,刘祖贻,凃晋文,研习,公开医案';

const copies = [
  ['web-static/privacy-policy.html', 'dist/privacy-policy.html'],
  ['web-static/support.html', 'dist/support.html'],
  ['web-static/b1828553539d3c95ec6ff1448bd0c061.txt', 'dist/b1828553539d3c95ec6ff1448bd0c061.txt'],
];

const routePages = [
  {
    routePath: '/',
    directory: '',
    prefix: './',
    title: '国医大师脑病学术传承馆｜张学文、刘祖贻、凃晋文三家学脉研习',
    description:
      '以公开文献、官方转载医案与代表性学术思想为基础，重构张学文、刘祖贻、凃晋文三位国医大师的脑病辨证路径，用于学术学习、教学演示与研究浏览。',
  },
  {
    routePath: '/masters',
    directory: 'masters',
    prefix: '../',
    title: '三位国医大师总览｜国医大师脑病学术传承馆',
    description: '对照浏览张学文、刘祖贻、凃晋文三家学脉的核心命题、病机主轴与学术差异。',
  },
  {
    routePath: '/masters/zhang',
    directory: 'masters/zhang',
    prefix: '../../',
    title: '张学文｜国医大师脑病学术传承馆',
    description: '聚焦张学文“脑当为脏”“颅脑水瘀”学说，梳理中风、痫证、眩晕与痴呆的脑病辨治主轴。',
  },
  {
    routePath: '/masters/liu',
    directory: 'masters/liu',
    prefix: '../../',
    title: '刘祖贻｜国医大师脑病学术传承馆',
    description: '聚焦刘祖贻“六辨七治”“本虚标实”体系，理解脑病恢复期、后遗期与用药规律的层级拆解。',
  },
  {
    routePath: '/masters/tu',
    directory: 'masters/tu',
    prefix: '../../',
    title: '凃晋文｜国医大师脑病学术传承馆',
    description: '聚焦凃晋文急慢并治、痰瘀热风同参的脑病思路，观察眩晕、痴呆、失眠等过渡病门的机变。',
  },
  {
    routePath: '/study',
    directory: 'study',
    prefix: '../',
    title: '脑病研习入口｜国医大师脑病学术传承馆',
    description: '以急重风险、病门、病势、主症与本虚标实五步法，演练三位国医大师的脑病辨机路径。',
  },
  {
    routePath: '/method',
    directory: 'method',
    prefix: '../',
    title: '研究方法与资料边界｜国医大师脑病学术传承馆',
    description: '集中说明本站资料来源、整理原则、证据类型、使用说明与学习边界。',
  },
];

function relativizeAssets(html, prefix) {
  return html.replace(/((?:href|src)=["'])\/(?!\/)/g, `$1${prefix}`);
}

function injectMeta(html, page) {
  const canonical = `${siteUrl}${page.routePath === '/' ? '/' : page.routePath}`;
  const metaBlock = [
    `<meta name="description" content="${page.description}" />`,
    `<meta name="keywords" content="${sharedKeywords}" />`,
    '<meta name="robots" content="index,follow" />',
    `<link rel="canonical" href="${canonical}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="国医大师脑病学术传承馆" />`,
    `<meta property="og:title" content="${page.title}" />`,
    `<meta property="og:description" content="${page.description}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta name="twitter:card" content="summary" />`,
    `<meta name="twitter:title" content="${page.title}" />`,
    `<meta name="twitter:description" content="${page.description}" />`,
  ].join('\n    ');

  return html
    .replace(/<html lang="en">/, '<html lang="zh-CN">')
    .replace(/<title>.*?<\/title>/, `<title>${page.title}</title>`)
    .replace('</title>', `</title>\n    ${metaBlock}`);
}

function withSpaFallback(html, page) {
  const fallbackScript = `<script>window.__SITE_ROUTE__=${JSON.stringify(page.routePath)};</script>`;
  return html.replace('</head>', `  ${fallbackScript}\n  </head>`);
}

function buildRouteHtml(indexHtml, page) {
  const withMeta = injectMeta(indexHtml, page);
  const withRoute = withSpaFallback(withMeta, page);
  return relativizeAssets(withRoute, page.prefix);
}

const indexPath = resolve(dist, 'index.html');
const rawIndexHtml = await readFile(indexPath, 'utf8');

for (const [source, target] of copies) {
  const sourcePath = resolve(root, source);
  const targetPath = resolve(root, target);
  await mkdir(dirname(targetPath), { recursive: true });
  await copyFile(sourcePath, targetPath);
}

for (const page of routePages) {
  const outputPath = page.directory
    ? resolve(dist, page.directory, 'index.html')
    : resolve(dist, 'index.html');
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, buildRouteHtml(rawIndexHtml, page));
}

const rootHtml = buildRouteHtml(rawIndexHtml, routePages[0]);
const fallbackHtml = rootHtml.replace(
  '</head>',
  '  <script>window.__SITE_ROUTE__=window.location.pathname;</script>\n  </head>',
);

const sitemapEntries = [
  ...routePages.map((page) => `<url><loc>${siteUrl}${page.routePath === '/' ? '/' : page.routePath}</loc></url>`),
  `<url><loc>${siteUrl}/privacy-policy.html</loc></url>`,
  `<url><loc>${siteUrl}/support.html</loc></url>`,
].join('\n  ');

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  ${sitemapEntries}\n</urlset>\n`;

const robotsTxt = `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`;

await writeFile(resolve(dist, '404.html'), fallbackHtml);
await writeFile(resolve(dist, '.nojekyll'), '');
await writeFile(resolve(dist, 'CNAME'), `${customDomain}\n`);
await writeFile(resolve(dist, 'sitemap.xml'), sitemapXml);
await writeFile(resolve(dist, 'robots.txt'), robotsTxt);

console.log('Prepared dist/ for GitHub Pages deployment.');
