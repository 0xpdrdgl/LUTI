const MEDIA_EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
}

export function extFromMime(mime: string): string | null {
  return MEDIA_EXT_BY_TYPE[mime] ?? null
}

const DIACRITICS_RE = new RegExp('[̀-ͯ]', 'g')

export function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .normalize('NFD')
      .replace(DIACRITICS_RE, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'projeto'
  )
}
