import { getLiveSnapshot } from "@/lib/data/live";

export const revalidate = 60;

export async function GET() {
  const snapshot = await getLiveSnapshot();

  return Response.json(snapshot, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
    },
  });
}
