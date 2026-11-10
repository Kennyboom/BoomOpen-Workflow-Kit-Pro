/**
 * Describes the <head> tags for a page as plain data so the same list is rendered
 * into index.html at build time and kept up to date at runtime (no duplicates).
 */
import {
  DEFAULT_IMAGE,
  SITE_AUTHOR,
  SITE_KEYWORDS,
  SITE_NAME,
  getFullTitle,
  toAbsoluteUrl,
  type PageSEO,
} from './seo-config'

/** Element id of the site-wide JSON-LD graph (also rendered into index.html at build). */
export const SITE_JSON_LD_ID = 'ld-site'
/** Element id of the per-route WebPage JSON-LD. */
export const PAGE_JSON_LD_ID = 'ld-page'

export interface HeadTag {
  tag: 'meta' | 'link'
  /** Attribute that identifies the tag, e.g. name="description" or rel="canonical". */
  keyAttr: 'name' | 'property' | 'rel'
  keyValue: string
  /** Attribute that carries the value (content / href). */
  valueAttr: 'content' | 'href'
  value: string
}

const meta = (keyAttr: 'name' | 'property', keyValue: string, value: string): HeadTag => ({
  tag: 'meta',
  keyAttr,
  keyValue,
  valueAttr: 'content',
  value,
})

/** Every tag key the head manager owns; keys absent for a page are removed. */
export const MANAGED_TAG_KEYS: ReadonlyArray<Pick<HeadTag, 'tag' | 'keyAttr' | 'keyValue'>> = [
  { tag: 'meta', keyAttr: 'name', keyValue: 'description' },
  { tag: 'meta', keyAttr: 'name', keyValue: 'keywords' },
  { tag: 'meta', keyAttr: 'name', keyValue: 'author' },
  { tag: 'meta', keyAttr: 'name', keyValue: 'robots' },
  { tag: 'link', keyAttr: 'rel', keyValue: 'canonical' },
  { tag: 'meta', keyAttr: 'property', keyValue: 'og:type' },
  { tag: 'meta', keyAttr: 'property', keyValue: 'og:url' },
  { tag: 'meta', keyAttr: 'property', keyValue: 'og:title' },
  { tag: 'meta', keyAttr: 'property', keyValue: 'og:description' },
  { tag: 'meta', keyAttr: 'property', keyValue: 'og:image' },
  { tag: 'meta', keyAttr: 'property', keyValue: 'og:site_name' },
  { tag: 'meta', keyAttr: 'name', keyValue: 'twitter:card' },
  { tag: 'meta', keyAttr: 'name', keyValue: 'twitter:url' },
  { tag: 'meta', keyAttr: 'name', keyValue: 'twitter:title' },
  { tag: 'meta', keyAttr: 'name', keyValue: 'twitter:description' },
  { tag: 'meta', keyAttr: 'name', keyValue: 'twitter:image' },
]

/** Builds the meta/link tags for a page. */
export function buildHeadTags(page: PageSEO, image: string = DEFAULT_IMAGE): HeadTag[] {
  const title = getFullTitle(page)
  const imageUrl = toAbsoluteUrl(image)
  const tags: HeadTag[] = [
    meta('name', 'description', page.description),
    meta('name', 'keywords', SITE_KEYWORDS),
    meta('name', 'author', SITE_AUTHOR),
    meta('property', 'og:type', 'website'),
    meta('property', 'og:title', title),
    meta('property', 'og:description', page.description),
    meta('property', 'og:image', imageUrl),
    meta('property', 'og:site_name', SITE_NAME),
    meta('name', 'twitter:card', 'summary_large_image'),
    meta('name', 'twitter:title', title),
    meta('name', 'twitter:description', page.description),
    meta('name', 'twitter:image', imageUrl),
  ]
  if (page.noindex) tags.push(meta('name', 'robots', 'noindex, nofollow'))
  if (page.pathname) {
    const url = toAbsoluteUrl(page.pathname)
    tags.push(
      { tag: 'link', keyAttr: 'rel', keyValue: 'canonical', valueAttr: 'href', value: url },
      meta('property', 'og:url', url),
      meta('name', 'twitter:url', url),
    )
  }
  return tags
}
