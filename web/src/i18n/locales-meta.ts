import type { Locale } from '../types/ui-contract'

export interface LocaleMeta {
  readonly code: Locale
  readonly shortLabel: string
  readonly nativeName: string
  readonly englishName: string
  readonly dir: 'ltr' | 'rtl'
}

export const SUPPORTED_LOCALES: readonly LocaleMeta[] = [
  { code: 'en', shortLabel: 'EN', nativeName: 'English', englishName: 'English', dir: 'ltr' },
  { code: 'vi', shortLabel: 'VI', nativeName: 'Tiếng Việt', englishName: 'Vietnamese', dir: 'ltr' },
  { code: 'zh-CN', shortLabel: '简中', nativeName: '简体中文', englishName: 'Simplified Chinese', dir: 'ltr' },
  { code: 'zh-TW', shortLabel: '繁中', nativeName: '繁體中文', englishName: 'Traditional Chinese', dir: 'ltr' },
  { code: 'ja', shortLabel: 'JA', nativeName: '日本語', englishName: 'Japanese', dir: 'ltr' },
  { code: 'ko', shortLabel: 'KO', nativeName: '한국어', englishName: 'Korean', dir: 'ltr' },
  { code: 'es', shortLabel: 'ES', nativeName: 'Español', englishName: 'Spanish', dir: 'ltr' },
  { code: 'fr', shortLabel: 'FR', nativeName: 'Français', englishName: 'French', dir: 'ltr' },
  { code: 'de', shortLabel: 'DE', nativeName: 'Deutsch', englishName: 'German', dir: 'ltr' },
  { code: 'pt-BR', shortLabel: 'PT', nativeName: 'Português (Brasil)', englishName: 'Portuguese (Brazil)', dir: 'ltr' },
  { code: 'ru', shortLabel: 'RU', nativeName: 'Русский', englishName: 'Russian', dir: 'ltr' },
  { code: 'hi', shortLabel: 'HI', nativeName: 'हिन्दी', englishName: 'Hindi', dir: 'ltr' },
  { code: 'ar', shortLabel: 'AR', nativeName: 'العربية', englishName: 'Arabic', dir: 'rtl' },
  { code: 'id', shortLabel: 'ID', nativeName: 'Bahasa Indonesia', englishName: 'Indonesian', dir: 'ltr' },
  { code: 'th', shortLabel: 'TH', nativeName: 'ไทย', englishName: 'Thai', dir: 'ltr' },
]

const LOCALE_BY_CODE = new Map<Locale, LocaleMeta>(
  SUPPORTED_LOCALES.map((item) => [item.code, item]),
)

const LOCALE_BY_LOWER = new Map<string, Locale>(
  SUPPORTED_LOCALES.map((item) => [item.code.toLowerCase(), item.code]),
)

const PREFIX_LOCALE_MAP: Readonly<Record<string, Locale>> = {
  vi: 'vi',
  ja: 'ja',
  ko: 'ko',
  es: 'es',
  fr: 'fr',
  de: 'de',
  ru: 'ru',
  hi: 'hi',
  ar: 'ar',
  id: 'id',
  in: 'id',
  th: 'th',
  en: 'en',
}

export function isSupportedLocale(value: unknown): value is Locale {
  return typeof value === 'string' && LOCALE_BY_CODE.has(value as Locale)
}

export function resolveSupportedLocale(value: string | null | undefined): Locale | null {
  if (!value) {
    return null
  }
  const normalized = value.trim().replace(/_/g, '-')
  if (isSupportedLocale(normalized)) {
    return normalized
  }
  return LOCALE_BY_LOWER.get(normalized.toLowerCase()) ?? null
}

export function getLocaleMeta(locale: Locale): LocaleMeta {
  return LOCALE_BY_CODE.get(locale) ?? SUPPORTED_LOCALES[0]
}

export function matchNavigatorLocale(rawCandidates: readonly string[]): Locale {
  for (const candidate of rawCandidates) {
    if (typeof candidate !== 'string') {
      continue
    }
    const lower = candidate.trim().replace(/_/g, '-').toLowerCase()
    if (!lower) {
      continue
    }
    const exact = LOCALE_BY_LOWER.get(lower)
    if (exact) {
      return exact
    }
    if (lower.startsWith('zh')) {
      if (
        lower === 'zh-tw' ||
        lower === 'zh-hk' ||
        lower === 'zh-mo' ||
        lower.startsWith('zh-tw-') ||
        lower.startsWith('zh-hk-') ||
        lower.startsWith('zh-mo-') ||
        lower.includes('hant')
      ) {
        return 'zh-TW'
      }
      return 'zh-CN'
    }
    if (lower.startsWith('pt')) {
      return 'pt-BR'
    }
    const primary = lower.split('-')[0] ?? ''
    const mapped = PREFIX_LOCALE_MAP[primary]
    if (mapped) {
      return mapped
    }
  }
  return 'en'
}
