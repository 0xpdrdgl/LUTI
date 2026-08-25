// Reúne todas as imagens de um post (carrosséis incluídos)
// Compatível com múltiplos actors do Apify: instagram-post-scraper, instagram-scraper, instagram-scraper-2, etc.
function extrairImagens(it: any): string[] {
  const imgs: string[] = [];

  // 1. Formato antigo (instagram-post-scraper)
  if (Array.isArray(it.imageUrls)) imgs.push(...it.imageUrls.filter(Boolean));
  else if (Array.isArray(it.images))
    imgs.push(...it.images.map((x: any) => (typeof x === 'string' ? x : x?.url)).filter(Boolean));
  else if (it.displayUrl) imgs.push(it.displayUrl);

  // 2. Carrossel via childPosts (formato antigo)
  if (Array.isArray(it.childPosts)) {
    for (const c of it.childPosts) {
      if (c?.displayUrl) imgs.push(c.displayUrl);
    }
  }

  // 2. Novo actor instagram-scraper / instagram-scraper-2
  if (Array.isArray(it.images))
    imgs.push(...it.images.map((x: any) => (typeof x === 'string' ? x : x?.url)).filter(Boolean));
  if (Array.isArray(it.imageUrls))
    imgs.push(...it.imageUrls.filter(Boolean));

  // 2. Carrossel via childPosts (formato antigo)
  if (Array.isArray(it.childPosts)) {
    for (const c of it.childPosts) {
      if (c?.displayUrl) imgs.push(c.displayUrl);
    }
  }

  // 3. Novos campos do instagram-scraper / instagram-scraper-2
  if (Array.isArray(it.images))
    imgs.push(...it.images.map((x: any) => (typeof x === 'string' ? x : x?.url)).filter(Boolean));
  if (Array.isArray(it.imageUrls))
    imgs.push(...it.imageUrls.filter(Boolean));

  // 3. Carrossel via sidecar / children / edge_media_to_sidecar
  if (Array.isArray(it.sidecar)) {
    for (const c of it.sidecar) {
      if (c?.displayUrl) imgs.push(c.displayUrl);
    }
  }
  if (Array.isArray(it.edge_media_to_sidecar)) {
    for (const c of it.edge_media_to_sidecar) {
      if (c?.node?.displayUrl) imgs.push(c.node.displayUrl);
    }
  }
  if (Array.isArray(it.children)) {
    for (const c of it.children) {
      if (c?.displayUrl) imgs.push(c.displayUrl);
    }
  }
  if (Array.isArray(it.children)) {
    for (const c of it.children) {
      if (c?.displayUrl) imgs.push(c.displayUrl);
    }
  }
  if (Array.isArray(it.items)) {
    for (const c of it.items) {
      if (c?.displayUrl) imgs.push(c.displayUrl);
    }
  }

  // 5. displayUrl / url / src (fallback final)
  if (it.displayUrl) imgs.push(it.displayUrl);
  if (it.url) imgs.push(it.url);
  if (it.src) imgs.push(it.src);

  return [...new Set(imgs)]; // dedupe
}

export const POST = async (context: any) => {
  if (import.meta.env.PROD) {
    return new Response('Not found', { status: 404 });
  }

  const body = await context.request.json();
  let items = body?.items;

  if (!items && body?.token) {
    const url =
      'https://api.apify.com/v2/acts/apify~instagram-post-scraper/runs/last/dataset/items?token=' +
      encodeURIComponent(body.token) +
      '&clean=true';
    const res = await fetch(url);
    if (!res.ok) {
      return new Response(
        JSON.stringify({
          erro: 'Token inválido ou nenhum run encontrado — rode o actor apify/instagram-post-scraper primeiro',
        }),
        { status: 400, headers: { 'content-type': 'application/json' } },
      );
    }
    items = await res.json();
  }

  if (!Array.isArray(items)) {
    return new Response(
      JSON.stringify({ erro: 'Nenhum item pra processar' }),
      { status: 400, headers: { 'content-type': 'application/json' } },
    );
  }

  const posts = items
    .map((it: any, i: number) => {
      const imgs = extrairImagens(it);
      return {
        id: it.id ?? String(i),
        imagem: imgs[0] ?? '',
        imagensExtras: imgs.slice(1),
        legenda: it.caption ?? '',
        timestamp: it.timestamp ?? '',
      };
    })
    .filter((p: any) => p.imagem);

  return new Response(JSON.stringify({ posts }), {
    headers: { 'content-type': 'application/json' },
  });
};
