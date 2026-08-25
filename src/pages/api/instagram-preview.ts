export const prerender = false;

export const POST = async (context: any) => {
  if (import.meta.env.PROD) {
    return new Response('Not found', { status: 404 });
  }

  const { token } = await context.request.json();
  if (!token) {
    return new Response(
      JSON.stringify({ erro: 'Token do Apify obrigatório' }),
      { status: 400, headers: { 'content-type': 'application/json' } },
    );
  }

  const url =
    'https://api.apify.com/v2/acts/apify~instagram-post-scraper/runs/last/dataset/items?token=' +
    encodeURIComponent(token) +
    '&clean=true';

  const res = await fetch(url);
  if (!res.ok) {
    return new Response(
      JSON.stringify({
        erro:
          'Token inválido ou nenhum run encontrado — rode o actor apify/instagram-post-scraper no Apify primeiro',
      }),
      { status: 400, headers: { 'content-type': 'application/json' } },
    );
  }

  const items = await res.json();
  const posts = (Array.isArray(items) ? items : [])
    .map((it: any, i: number) => ({
      id: it.id ?? String(i),
      imagem: it.displayUrl ?? it.imageUrl ?? '',
      legenda: it.caption ?? '',
      timestamp: it.timestamp ?? '',
    }))
    .filter((p: any) => p.imagem);

  return new Response(JSON.stringify({ posts }), {
    headers: { 'content-type': 'application/json' },
  });
};
