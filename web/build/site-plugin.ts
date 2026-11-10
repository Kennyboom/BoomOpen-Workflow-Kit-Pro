/**
 * Vite plugin that renders the SEO <head>, sitemap.xml, robots.txt and 404.html from
 * src/components/seo/seo-config.ts, so the site origin and route list live in one place.
 */
import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'
import {
  PAGE_JSON_LD_ID,
  SITE_JSON_LD_ID,
  buildHeadTags,
  type HeadTag,
} from '../src/components/seo/head-tags'
import {
  INDEXABLE_PAGES,
  NOT_FOUND_SEO,
  SITE_URL,
  SPA_PATHS,
  getPageSEO,
  getFullTitle,
  pageSEO,
  toAbsoluteUrl,
  type PageSEO,
} from '../src/components/seo/seo-config'
import { buildSiteSchema, buildWebPageSchema, serializeJsonLd } from '../src/components/seo/structured-data'

const SEO_PLACEHOLDER = '<!--app-seo-->'
const SEO_START = '<!-- seo:start -->'
const SEO_END = '<!-- seo:end -->'
const SITEMAP_FILE = 'sitemap.xml'
const ROBOTS_FILE = 'robots.txt'
const NOT_FOUND_FILE = '404.html'

const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const renderTag = (tag: HeadTag): string =>
  `<${tag.tag} ${tag.keyAttr}="${escapeHtml(tag.keyValue)}" ${tag.valueAttr}="${escapeHtml(tag.value)}" />`

/** Renders the managed head block (title, meta, canonical, JSON-LD) for a page. */
export function renderSeoHead(page: PageSEO): string {
  const lines = [
    SEO_START,
    `<title>${escapeHtml(getFullTitle(page))}</title>`,
    ...buildHeadTags(page).map(renderTag),
    `<script type="application/ld+json" id="${SITE_JSON_LD_ID}">${serializeJsonLd(buildSiteSchema())}</script>`,
    `<script type="application/ld+json" id="${PAGE_JSON_LD_ID}">${serializeJsonLd(buildWebPageSchema(page))}</script>`,
    SEO_END,
  ]
  return lines.join('\n    ')
}

export function renderSitemap(): string {
  const urls = INDEXABLE_PAGES.map((page) =>
    [
      '  <url>',
      `    <loc>${toAbsoluteUrl(page.pathname ?? '/')}</loc>`,
      `    <priority>${(page.priority ?? 0.5).toFixed(1)}</priority>`,
      '  </url>',
    ].join('\n'),
  )
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n')
}

export function renderRobots(): string {
  return ['User-agent: *', 'Allow: /', '', `Sitemap: ${SITE_URL}/${SITEMAP_FILE}`, ''].join('\n')
}

/**
 * Static HTML file served for a SPA route: '/' → index.html, '/features/agent-teams' →
 * features/agent-teams.html. Each one carries that route's own title, canonical, Open Graph and
 * JSON-LD, so crawlers and link unfurlers that do not run JavaScript see the right page.
 */
export function routeHtmlFile(route: string): string {
  return route === '/' ? 'index.html' : `${route.replace(/^\/+/, '')}.html`
}

/** Route a dev-server request maps to ('/index.html' is the home page). */
function requestRoute(url: string | undefined): string {
  const pathname = (url ?? '/').split('?')[0].split('#')[0]
  return pathname === '/index.html' ? '/' : pathname
}

function readRewrites(root: string): Array<{ source: unknown; destination: unknown }> | null {
  const file = path.join(root, 'vercel.json')
  if (!fs.existsSync(file)) return null
  const config: unknown = JSON.parse(fs.readFileSync(file, 'utf8'))
  const rewrites = typeof config === 'object' && config !== null ? Reflect.get(config, 'rewrites') : undefined
  if (!Array.isArray(rewrites)) return []
  return rewrites.map((rule: unknown) =>
    typeof rule === 'object' && rule !== null
      ? { source: Reflect.get(rule, 'source'), destination: Reflect.get(rule, 'destination') }
      : { source: '', destination: '' },
  )
}

/** Fails the build when vercel.json does not rewrite every SPA route to its own HTML file. */
function checkVercelRewrites(root: string): string | null {
  const rewrites = readRewrites(root)
  if (rewrites === null) return null
  const wrong = SPA_PATHS.filter((route) => route !== '/').filter(
    (route) => !rewrites.some((rule) => rule.source === route && rule.destination === `/${routeHtmlFile(route)}`),
  )
  return wrong.length
    ? `vercel.json must rewrite each SPA route to its own HTML file; fix: ${wrong.map((r) => `${r} → /${routeHtmlFile(r)}`).join(', ')}`
    : null
}

/** The built index.html with its SEO block replaced by the one for page. */
function withSeoHead(html: string, page: PageSEO): string | null {
  const start = html.indexOf(SEO_START)
  const end = html.indexOf(SEO_END)
  if (start === -1 || end === -1) return null
  return html.slice(0, start) + renderSeoHead(page) + html.slice(end + SEO_END.length)
}

export function sitePlugin(): Plugin {
  let outDir = 'dist'
  let root = process.cwd()
  return {
    name: 'boomopen-site',
    configResolved(config) {
      root = config.root
      outDir = path.resolve(config.root, config.build.outDir)
    },
    transformIndexHtml(html, ctx) {
      if (!html.includes(SEO_PLACEHOLDER)) {
        throw new Error(`index.html must contain ${SEO_PLACEHOLDER}`)
      }
      // Dev server: the head of the requested route (parity with the per-route files of a build).
      const page = ctx.server ? getPageSEO(requestRoute(ctx.originalUrl)) : pageSEO.home
      return html.replace(SEO_PLACEHOLDER, renderSeoHead(page))
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0]
        if (url === `/${SITEMAP_FILE}` || url === `/${ROBOTS_FILE}`) {
          const isSitemap = url === `/${SITEMAP_FILE}`
          res.setHeader('Content-Type', isSitemap ? 'application/xml' : 'text/plain')
          res.end(isSitemap ? renderSitemap() : renderRobots())
          return
        }
        next()
      })
    },
    buildStart() {
      const problem = checkVercelRewrites(root)
      if (problem) this.error(problem)
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: SITEMAP_FILE, source: renderSitemap() })
      this.emitFile({ type: 'asset', fileName: ROBOTS_FILE, source: renderRobots() })
    },
    writeBundle() {
      const html = fs.readFileSync(path.join(outDir, 'index.html'), 'utf8')
      const pages: Array<[string, PageSEO]> = [
        [NOT_FOUND_FILE, NOT_FOUND_SEO],
        ...SPA_PATHS.filter((route) => route !== '/').map((route): [string, PageSEO] => [routeHtmlFile(route), getPageSEO(route)]),
      ]
      for (const [fileName, page] of pages) {
        const rendered = withSeoHead(html, page)
        if (rendered === null) this.error('built index.html lost its SEO markers')
        const target = path.join(outDir, ...fileName.split('/'))
        fs.mkdirSync(path.dirname(target), { recursive: true })
        fs.writeFileSync(target, rendered)
      }
    },
  }
}
