import { useEffect } from 'react'
import { KIT_STATS } from '../../data/kitStats'
import {
  DEFAULT_OG_IMAGE,
  REPO_URL,
  SITE_NAME,
  SITE_URL,
  formatDocumentTitle,
  getRouteSeo,
  toCanonicalUrl,
  type Locale,
  type PageRouteId,
  type PageSeoEntry,
} from '../../data/seoRoutes'
import { useLanguage } from '../../i18n/context'

const JSON_LD_ELEMENT_ID = 'boomopen-jsonld'
const VI_OG_IMAGE = '/media/poster_vi.png'

export interface SEOProps {
  readonly routeId: PageRouteId
}

function upsertMetaTag(attrName: 'name' | 'property', attrValue: string, content: string): void {
  const selector = `meta[${attrName}="${attrValue}"]`
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attrName, attrValue)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

function removeHeadElement(selector: string): void {
  const existing = document.head.querySelector(selector)
  if (existing) {
    existing.remove()
  }
}

function upsertCanonicalLink(href: string | null): void {
  const selector = 'link[rel="canonical"]'
  if (!href) {
    removeHeadElement(selector)
    return
  }
  let link = document.head.querySelector<HTMLLinkElement>(selector)
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', href)
}

function buildLocalizedJsonLd(entry: PageSeoEntry, locale: Locale): Record<string, unknown> {
  const canonicalUrl = toCanonicalUrl(entry.pathname ?? '/')
  const localizedDescription = entry.description[locale]

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
        description: localizedDescription,
      },
      {
        '@type': 'WebPage',
        '@id': `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: formatDocumentTitle(entry, locale),
        description: localizedDescription,
        inLanguage: locale,
        isPartOf: { '@id': `${SITE_URL}/#software` },
      },
    ],
  }
}

function upsertJsonLdScript(entry: PageSeoEntry, locale: Locale): void {
  let script = document.getElementById(JSON_LD_ELEMENT_ID) as HTMLScriptElement | null
  if (!script) {
    script = document.createElement('script')
    script.id = JSON_LD_ELEMENT_ID
    script.type = 'application/ld+json'
    document.head.appendChild(script)
  }
  script.textContent = JSON.stringify(buildLocalizedJsonLd(entry, locale)).replace(/</g, '\\u003c')
}

/**
 * Synchronizes document `<head>` tags, canonical link, Open Graph metadata,
 * and localized JSON-LD across AnimatePresence route transitions and `EN / VI` toggles.
 */
export function SEO({ routeId }: SEOProps): null {
  const { locale } = useLanguage()

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }
    const entry = getRouteSeo(routeId)
    const title = formatDocumentTitle(entry, locale)
    const description = entry.description[locale]
    const robots = entry.noindex ? 'noindex, nofollow' : 'index, follow'
    const canonicalUrl = entry.pathname ? toCanonicalUrl(entry.pathname) : null
    const ogImage = `${SITE_URL}${locale === 'vi' ? VI_OG_IMAGE : DEFAULT_OG_IMAGE}`

    document.documentElement.lang = locale
    document.title = title

    upsertMetaTag('name', 'description', description)
    upsertMetaTag('name', 'robots', robots)
    upsertCanonicalLink(canonicalUrl)

    upsertMetaTag('property', 'og:site_name', SITE_NAME)
    upsertMetaTag('property', 'og:title', title)
    upsertMetaTag('property', 'og:description', description)
    upsertMetaTag('property', 'og:type', 'website')
    upsertMetaTag('property', 'og:image', ogImage)

    if (canonicalUrl) {
      upsertMetaTag('property', 'og:url', canonicalUrl)
    } else {
      removeHeadElement('meta[property="og:url"]')
    }

    upsertMetaTag('name', 'twitter:card', 'summary_large_image')
    upsertMetaTag('name', 'twitter:title', title)
    upsertMetaTag('name', 'twitter:description', description)
    upsertMetaTag('name', 'twitter:image', ogImage)

    upsertJsonLdScript(entry, locale)
  }, [routeId, locale])

  return null
}
