import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { applyHeadTags, upsertJsonLd } from './head-manager'
import { PAGE_JSON_LD_ID, SITE_JSON_LD_ID, buildHeadTags } from './head-tags'
import { getFullTitle, getPageSEO, type PageSEO } from './seo-config'
import { buildSiteSchema, buildWebPageSchema } from './structured-data'

export interface SEOProps extends PageSEO {
  image?: string
}

/**
 * Applies title, meta, canonical, Open Graph and JSON-LD for one page.
 * Renders nothing: it updates the tags that index.html already contains.
 */
export function SEO({ image, ...page }: SEOProps) {
  const { title, description, pathname, noindex } = page

  useEffect(() => {
    const current: PageSEO = { title, description, pathname, noindex }
    applyHeadTags(getFullTitle(current), buildHeadTags(current, image))
    upsertJsonLd(SITE_JSON_LD_ID, buildSiteSchema())
    upsertJsonLd(PAGE_JSON_LD_ID, buildWebPageSchema(current))
  }, [title, description, pathname, noindex, image])

  return null
}

/** Picks the SEO entry for the current route (unknown routes get a noindex 404 entry). */
export function RouteSEO() {
  const location = useLocation()
  return <SEO {...getPageSEO(location.pathname)} />
}
