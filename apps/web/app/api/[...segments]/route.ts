type RouteContext = { params: Promise<{ segments: string[] }> };

async function proxy(request: Request, { params }: RouteContext) {
  const path = (await params).segments.join('/');
  const route = `${request.method} ${path}`;
  const allowed = ['GET lectures', 'POST auth/login', 'GET timetable'].includes(route)
    || /^(POST|DELETE) timetable\/lectures\/[0-9]+$/.test(route);
  if (!allowed) return Response.json({ message: '지원하지 않는 API입니다.' }, { status: 404 });

  const headers = new Headers();
  const authorization = request.headers.get('authorization');
  if (authorization) headers.set('authorization', authorization);

  let body: string | undefined;
  if (route === 'POST auth/login') {
    body = await request.text();
    headers.set('content-type', request.headers.get('content-type') ?? 'application/json');
  }

  let upstream: Response;
  try {
    const apiUrl = process.env.API_URL ?? 'http://127.0.0.1:3001';
    upstream = await fetch(`${apiUrl}/api/${path}`, {
      method: request.method,
      body,
      headers,
      cache: 'no-store',
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(3500)]),
    });
    if (upstream.status === 204) return new Response(null, { status: 204 });
    if (upstream.status < 500 || upstream.status === 501) {
      return Response.json(await upstream.json(), {
        status: upstream.status,
        headers: { 'cache-control': 'no-store' },
      });
    }
  } catch {
    return Response.json({ message: 'API에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.' }, { status: 503 });
  }

  return Response.json({ message: 'API에서 요청을 처리하지 못했습니다.' }, { status: 502 });
}

export const GET = proxy;
export const POST = proxy;
export const DELETE = proxy;
