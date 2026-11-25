/**
 * Vite build & dev plugin for BoomOpen Workflow Kit Pro (v5.5.0):
 * 1. Serves `/media/*` trailers & posters directly from `../assets/media/*` in dev
 *    with full HTTP `Range` (`206 Partial Content`) support for smooth 1080p scrubbing.
 * 2. Copies `../assets/media/*` into `dist/media/*` on production build (zero Git duplication).
 * 3. Injects route-specific `<head>` tags + `SoftwareApplication`, `Organization` & `WebPage`
 *    JSON-LD into `index.html` and pre-renders static per-route HTML + `sitemap.xml`,
 *    `robots.txt`, and `llms.txt`.
 */
import fs from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import path from 'node:path'
import type { Plugin } from 'vite'
import { KIT_STATS } from '../src/data/kitStats'
import {
  DEFAULT_OG_IMAGE,
  INDEXABLE_SEO_ROUTES,
  REPO_URL,
  SITE_NAME,
  SITE_URL,
  formatDocumentTitle,
  getRouteSeo,
  getRouteSeoByPath,
  toCanonicalUrl,
  type PageSeoEntry,
} from '../src/data/seoRoutes'
import { renderLlmsTxt, renderRobotsTxt, renderSitemapXml } from './kit-stats.mjs'

const SEO_PLACEHOLDER = '<!--app-seo-->'
const SEO_START = '<!-- seo:start -->'
const SEO_END = '<!-- seo:end -->'
const SITEMAP_FILE = 'sitemap.xml'
const ROBOTS_FILE = 'robots.txt'
const LLMS_FILE = 'llms.txt'
const NOT_FOUND_FILE = '404.html'

const MEDIA_CONTENT_TYPES: Readonly<Record<string, string>> = {
  'boomopen_v55_trailer_en.mp4': 'video/mp4',
  'boomopen_v55_trailer_vi.mp4': 'video/mp4',
  'poster_en.png': 'image/png',
  'poster_vi.png': 'image/png',
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function serializeJsonLd(schema: Record<string, unknown>): string {
  return JSON.stringify(schema).replace(/</g, '\\u003c')
}

function buildJsonLdGraph(entry: PageSeoEntry): Record<string, unknown> {
  const canonicalUrl = toCanonicalUrl(entry.pathname ?? '/')
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        sameAs: [REPO_URL],
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${SITE_URL}/#software`,
        name: SITE_NAME,
        softwareVersion: KIT_STATS.version,
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Windows, macOS, Linux',
        url: SITE_URL,
        downloadUrl: REPO_URL,
        author: { '@id': `${SITE_URL}/#organization` },
        description: entry.description.en,
      },
      {
        '@type': 'WebPage',
        '@id': `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: formatDocumentTitle(entry, 'en'),
        description: entry.description.en,
        inLanguage: ['en', 'vi'],
        isPartOf: { '@id': `${SITE_URL}/#software` },
      },
    ],
  }
}

export function renderSeoHead(entry: PageSeoEntry): string {
  const title = escapeHtml(formatDocumentTitle(entry, 'en'))
  const description = escapeHtml(entry.description.en)
  const ogImage = `${SITE_URL}${DEFAULT_OG_IMAGE}`
  const robots = entry.noindex ? 'noindex, nofollow' : 'index, follow'
  const canonicalUrl = entry.pathname ? toCanonicalUrl(entry.pathname) : null

  const tags = [
    SEO_START,
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<meta name="robots" content="${robots}" />`,
    ...(canonicalUrl ? [`<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`] : []),
    `<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    '<meta property="og:type" content="website" />',
    ...(canonicalUrl ? [`<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`] : []),
    `<meta property="og:image" content="${escapeHtml(ogImage)}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${escapeHtml(ogImage)}" />`,
    `<script type="application/ld+json" id="boomopen-jsonld">${serializeJsonLd(buildJsonLdGraph(entry))}</script>`,
    SEO_END,
  ]
  return tags.join('\n    ')
}

export function renderSitemap(): string {
  return renderSitemapXml(SITE_URL)
}

export function renderRobots(): string {
  return renderRobotsTxt(SITE_URL)
}

function injectOrReplaceSeoBlock(html: string, entry: PageSeoEntry): string | null {
  const rendered = renderSeoHead(entry)
  if (html.includes(SEO_PLACEHOLDER)) {
    return html.replace(SEO_PLACEHOLDER, rendered)
  }
  const start = html.indexOf(SEO_START)
  const end = html.indexOf(SEO_END)
  if (start !== -1 && end !== -1 && end > start) {
    return `${html.slice(0, start)}${rendered}${html.slice(end + SEO_END.length)}`
  }
  return null
}

function resolveRequestPathname(rawUrl: string | undefined): string {
  const pathname = (rawUrl ?? '/').split('?')[0].split('#')[0]
  return pathname === '/index.html' ? '/' : pathname
}

function pipeStreamSafely(filePath: string, res: ServerResponse, options?: { start: number; end: number }): void {
  const stream = fs.createReadStream(filePath, options)
  stream.on('error', () => {
    if (!res.writableEnded) {
      res.end()
    }
  })
  res.on('close', () => {
    stream.destroy()
  })
  stream.pipe(res)
}

function sendUnsatisfiableRange(res: ServerResponse, total: number): true {
  res.statusCode = 416
  res.setHeader('Content-Range', `bytes */${total}`)
  res.end()
  return true
}

export function serveMediaWithRange(
  mediaRoot: string,
  req: IncomingMessage,
  res: ServerResponse,
): boolean {
  const pathname = resolveRequestPathname(req.url)
  if (!pathname.startsWith('/media/')) {
    return false
  }
  const fileName = pathname.slice('/media/'.length)
  const contentType = MEDIA_CONTENT_TYPES[fileName]
  if (!contentType) {
    return false
  }
  const filePath = path.join(mediaRoot, fileName)
  if (!fs.existsSync(filePath)) {
    return false
  }

  const total = fs.statSync(filePath).size
  res.setHeader('Accept-Ranges', 'bytes')
  res.setHeader('Content-Type', contentType)
  res.setHeader('Cache-Control', 'public, max-age=3600')

  if (req.method === 'HEAD') {
    res.statusCode = 200
    res.setHeader('Content-Length', String(total))
    res.end()
    return true
  }

  const rangeHeader = req.headers.range
  if (typeof rangeHeader === 'string' && rangeHeader.trim().length > 0) {
    const trimmed = rangeHeader.trim()
    if (!trimmed.startsWith('bytes=')) {
      return sendUnsatisfiableRange(res, total)
    }
    const match = /^bytes=(\d*)-(\d*)$/.exec(trimmed)
    if (!match || total <= 0) {
      return sendUnsatisfiableRange(res, total)
    }
    const rawStart = match[1] ?? ''
    const rawEnd = match[2] ?? ''
    if (rawStart === '' && rawEnd === '') {
      return sendUnsatisfiableRange(res, total)
    }

    let start = 0
    let end = total - 1
    if (rawStart === '') {
      const suffixLength = Number.parseInt(rawEnd, 10)
      if (!Number.isFinite(suffixLength) || suffixLength <= 0) {
        return sendUnsatisfiableRange(res, total)
      }
      start = Math.max(0, total - suffixLength)
      end = total - 1
    } else {
      start = Number.parseInt(rawStart, 10)
      end = rawEnd ? Math.min(Number.parseInt(rawEnd, 10), total - 1) : total - 1
      if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || start > end || start >= total) {
        return sendUnsatisfiableRange(res, total)
      }
    }

    res.statusCode = 206
    res.setHeader('Content-Range', `bytes ${start}-${end}/${total}`)
    res.setHeader('Content-Length', String(end - start + 1))
    pipeStreamSafely(filePath, res, { start, end })
    return true
  }

  res.statusCode = 200
  res.setHeader('Content-Length', String(total))
  pipeStreamSafely(filePath, res)
  return true
}

function copyMediaAssetsToDist(mediaRoot: string, outDir: string): void {
  const targetMediaDir = path.join(outDir, 'media')
  fs.mkdirSync(targetMediaDir, { recursive: true })
  for (const fileName of Object.keys(MEDIA_CONTENT_TYPES)) {
    const srcPath = path.join(mediaRoot, fileName)
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, path.join(targetMediaDir, fileName))
    }
  }
}

function emitPreRenderedRoutes(baseHtml: string, outDir: string): void {
  const notFoundHtml = injectOrReplaceSeoBlock(baseHtml, getRouteSeo('notFound'))
  if (notFoundHtml === null) {
    throw new Error('Built index.html is missing <!--app-seo--> or <!-- seo:start/end --> markers')
  }
  fs.writeFileSync(path.join(outDir, NOT_FOUND_FILE), notFoundHtml, 'utf8')

  for (const route of INDEXABLE_SEO_ROUTES) {
    const slug = (route.pathname ?? '/').replace(/^\/+|\/+$/g, '')
    if (!slug) {
      continue
    }
    const routeHtml = injectOrReplaceSeoBlock(baseHtml, route)
    if (routeHtml === null) {
      throw new Error(`Failed to render SEO head for /${slug}`)
    }
    const nestedIndex = path.join(outDir, slug, 'index.html')
    fs.mkdirSync(path.dirname(nestedIndex), { recursive: true })
    fs.writeFileSync(nestedIndex, routeHtml, 'utf8')
    fs.writeFileSync(path.join(outDir, `${slug}.html`), routeHtml, 'utf8')
  }
}

export function sitePlugin(): Plugin {
  let root = process.cwd()
  let outDir = path.resolve(root, 'dist')

  return {
    name: 'boomopen-site',
    configResolved(config) {
      root = config.root
      outDir = path.resolve(config.root, config.build.outDir)
    },
    transformIndexHtml(html, ctx) {
      const targetEntry = ctx.server
        ? getRouteSeoByPath(resolveRequestPathname(ctx.originalUrl))
        : getRouteSeo('home')
      const transformed = injectOrReplaceSeoBlock(html, targetEntry)
      if (transformed === null) {
        throw new Error(`index.html must include ${SEO_PLACEHOLDER} or ${SEO_START}...${SEO_END}`)
      }
      return transformed
    },
    configureServer(server) {
      const mediaRoot = path.resolve(root, '..', 'assets', 'media')
      server.middlewares.use((req, res, next) => {
        if (serveMediaWithRange(mediaRoot, req, res)) {
          return
        }
        const reqPath = resolveRequestPathname(req.url)
        if (reqPath === `/${SITEMAP_FILE}`) {
          res.setHeader('Content-Type', 'application/xml; charset=utf-8')
          res.end(renderSitemap())
          return
        }
        if (reqPath === `/${ROBOTS_FILE}`) {
          res.setHeader('Content-Type', 'text/plain; charset=utf-8')
          res.end(renderRobots())
          return
        }
        if (reqPath === `/${LLMS_FILE}`) {
          res.setHeader('Content-Type', 'text/plain; charset=utf-8')
          res.end(renderLlmsTxt(KIT_STATS, SITE_URL))
          return
        }
        next()
      })
    },
    writeBundle() {
      const indexPath = path.join(outDir, 'index.html')
      if (fs.existsSync(indexPath)) {
        const baseHtml = fs.readFileSync(indexPath, 'utf8')
        emitPreRenderedRoutes(baseHtml, outDir)
      }
      fs.writeFileSync(path.join(outDir, SITEMAP_FILE), renderSitemap(), 'utf8')
      fs.writeFileSync(path.join(outDir, ROBOTS_FILE), renderRobots(), 'utf8')
      fs.writeFileSync(path.join(outDir, LLMS_FILE), renderLlmsTxt(KIT_STATS, SITE_URL), 'utf8')
      copyMediaAssetsToDist(path.resolve(root, '..', 'assets', 'media'), outDir)
    },
  }
}
