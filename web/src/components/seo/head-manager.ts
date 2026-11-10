/**
 * Minimal DOM head manager. Updates the tags rendered into index.html in place
 * (matched by key) so every route has exactly one of each tag.
 */
import { MANAGED_TAG_KEYS, type HeadTag } from './head-tags'
import { serializeJsonLd, type JsonLdObject } from './structured-data'

type TagKey = Pick<HeadTag, 'tag' | 'keyAttr' | 'keyValue'>

const selectorFor = (key: TagKey): string => `${key.tag}[${key.keyAttr}="${key.keyValue}"]`

/** Applies a full tag set: upserts the given tags and removes managed tags not in the set. */
export function applyHeadTags(title: string, tags: HeadTag[]): void {
  document.title = title
  const head = document.head
  for (const tag of tags) {
    let element = head.querySelector(selectorFor(tag))
    if (!element) {
      element = document.createElement(tag.tag)
      element.setAttribute(tag.keyAttr, tag.keyValue)
      head.appendChild(element)
    }
    element.setAttribute(tag.valueAttr, tag.value)
  }
  for (const key of MANAGED_TAG_KEYS) {
    const present = tags.some((tag) => tag.tag === key.tag && tag.keyValue === key.keyValue)
    if (!present) head.querySelectorAll(selectorFor(key)).forEach((element) => element.remove())
  }
}

/** Creates or replaces a JSON-LD <script> identified by id. */
export function upsertJsonLd(id: string, data: JsonLdObject): void {
  let script = document.getElementById(id)
  if (!(script instanceof HTMLScriptElement)) {
    script = document.createElement('script')
    script.id = id
    script.setAttribute('type', 'application/ld+json')
    document.head.appendChild(script)
  }
  script.textContent = serializeJsonLd(data)
}

/** Removes a JSON-LD <script> by id. */
export function removeJsonLd(id: string): void {
  document.getElementById(id)?.remove()
}
