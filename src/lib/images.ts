export function assetSrc(
  value: string | null | undefined,
  base: string,
): string | null {
  if (!value) return null;
  return value.startsWith('/') ? value : `${base}${value}`;
}

export const projetosImage = (value: string | null | undefined) =>
  assetSrc(value, '/images/projetos/');

export const siteImage = (value: string | null | undefined) =>
  assetSrc(value, '/images/');
