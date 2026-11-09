'use client';

import { useEffect, useState } from 'react';

export async function request<T>(
  path: string,
  { token, ...init }: RequestInit & { token?: string } = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  if (token) headers.set('authorization', `Bearer ${token}`);
  const response = await fetch(`/api/${path}`, {
    ...init,
    headers,
    cache: 'no-store',
    signal: init.signal ?? AbortSignal.timeout(5000),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = typeof body?.message === 'string' ? body.message : `API 요청 실패 (${response.status})`;
    throw new Error(message);
  }
  return response.status === 204 ? undefined as T : response.json();
}

type Result<T> = { key: string; data?: T; error?: string };

export function useApi<T>(path: string, token?: string, externalRevision = 0) {
  const key = `${path}|${token ?? ''}`;
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<Result<T>>();

  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    async function load() {
      try {
        const data = await request<T>(path, {
          token,
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(5000)]),
        });
        if (!controller.signal.aborted) setResult({ key, data });
      } catch (error) {
        if (!controller.signal.aborted) {
          setResult((previous) => ({
            key,
            data: previous?.key === key ? previous.data : undefined,
            error: error instanceof Error ? error.message : '요청에 실패했습니다.',
          }));
        }
      } finally {
        if (!controller.signal.aborted) timer = setTimeout(load, 10_000);
      }
    }

    void load();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [externalRevision, key, path, revision, token]);

  return {
    data: result?.key === key ? result.data : undefined,
    error: result?.key === key ? result.error : undefined,
    refresh: () => setRevision((value) => value + 1),
  };
}
