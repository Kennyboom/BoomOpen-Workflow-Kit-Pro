/**
 * JSON-LD builders (pure data, shared by the runtime head manager and the build-time
 * index.html renderer). Only factual fields: no ratings, no site search.
 */
import { KIT_VERSION } from '../../data/kitStats'
import {
  LOGO_IMAGE,
  REPO_URL,
  SITE_AUTHOR,
  SITE_NAME,
  SITE_SUMMARY,
  SITE_URL,
  getFullTitle,
  toAbsoluteUrl,
  type PageSEO,
} from './seo-config'

export type JsonLdValue = string | number | boolean | null | JsonLdValue[] | { [key: string]: JsonLdValue }
export type JsonLdObject = { [key: string]: JsonLdValue }

const ORGANIZATION_ID = `${SITE_URL}/#organization`
const WEBSITE_ID = `${SITE_URL}/#website`
const SOFTWARE_ID = `${SITE_URL}/#software`

/** Site-wide graph: SoftwareApplication + Organization + WebSite. */
export function buildSiteSchema(): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        '@id': SOFTWARE_ID,
        name: SITE_NAME,
        description: SITE_SUMMARY,
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Windows, macOS, Linux',
        softwareVersion: KIT_VERSION,
        url: SITE_URL,
        downloadUrl: REPO_URL,
        license: 'https://opensource.org/licenses/MIT',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        author: { '@id': ORGANIZATION_ID },
      },
      {
        '@type': 'Organization',
        '@id': ORGANIZATION_ID,
        name: SITE_AUTHOR,
        url: REPO_URL,
        logo: toAbsoluteUrl(LOGO_IMAGE),
        description: `${SITE_AUTHOR} builds ${SITE_NAME}, multi-agent orchestration for AI coding assistants.`,
        sameAs: [REPO_URL],
      },
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_SUMMARY,
        publisher: { '@id': ORGANIZATION_ID },
      },
    ],
  }
}

/** Per-route WebPage entry. */
export function buildWebPageSchema(page: PageSEO): JsonLdObject {
  const schema: JsonLdObject = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: getFullTitle(page),
    description: page.description,
    isPartOf: { '@id': WEBSITE_ID },
  }
  if (page.pathname) schema.url = toAbsoluteUrl(page.pathname)
  return schema
}

/** Serialises JSON-LD safely for embedding inside a <script> element. */
export function serializeJsonLd(data: JsonLdObject): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
