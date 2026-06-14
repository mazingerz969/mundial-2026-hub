import { getLiveSnapshot } from "@/lib/data/live";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 30;

export async function GET() {
  const snapshot = await getLiveSnapshot();

  return Response.json(snapshot, {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
    },
  });
}
