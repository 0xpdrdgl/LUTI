export const prerender = false;

export const GET = async (context: any) => {
  if (import.meta.env.PROD) {
    return new Response('Not found', { status: 404 });
  }

  const url = context.url.searchParams.get('url');
  if (!url || (!url.includes('cdninstagram') && !url.includes('fbcdn') && !url.includes('instagram'))) {
    return new Response('Not found', { status: 404 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        referer: 'https://www.instagram.com/',
      },
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) return new Response('Not found', { status: 404 });

    const buffer = await res.arrayBuffer();
    return new Response(buffer, {
      headers: {
        'content-type': res.headers.get('content-type') || 'image/jpeg',
        'cache-control': 'public, max-age=3600',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
};
