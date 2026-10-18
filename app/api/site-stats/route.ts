import { NextResponse } from 'next/server';

type VercelAnalyticsResponse = {
  data?: {
    pageviews?: unknown;
    visitors?: unknown;
  };
};

async function getPlayerCount() {
  const workerUrl = process.env.CLOUDFLARE_API_URL;
  if (!workerUrl) return null;

  try {
    const response = await fetch(new URL('/stats', workerUrl), { cache: 'no-store' });
    if (!response.ok) return null;
    const result: unknown = await response.json();
    if (!result || typeof result !== 'object') return null;
    const online = (result as Record<string, unknown>).online;
    return Number.isSafeInteger(online) && Number(online) >= 0 ? Number(online) : null;
  } catch {
    return null;
  }
}

async function getVercelPageviews() {
  const token = process.env.VERCEL_WEB_ANALYTICS_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  if (!token || !projectId) return null;

  const endpoint = new URL('https://api.vercel.com/v1/query/web-analytics/visits/count');
  endpoint.searchParams.set('projectId', projectId);
  if (process.env.VERCEL_TEAM_ID) endpoint.searchParams.set('teamId', process.env.VERCEL_TEAM_ID);

  try {
    const response = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 60 },
    });
    if (!response.ok) return null;
    const result = await response.json() as VercelAnalyticsResponse;
    const pageviews = result.data?.pageviews;
    return Number.isSafeInteger(pageviews) && Number(pageviews) >= 0 ? Number(pageviews) : null;
  } catch {
    return null;
  }
}

export async function GET() {
  const [online, visits] = await Promise.all([getPlayerCount(), getVercelPageviews()]);
  return NextResponse.json({ online, visits }, { headers: { 'Cache-Control': 'no-store' } });
}
