import { getPublicSettings } from "@/lib/api/endpoints";

/**
 * /ads.txt for Google AdSense, built from the AdSense publisher ID in Website Settings
 * ("ca-pub-1234567890123456"). It answers 404 until that is set, so no placeholder is advertised.
 */
export async function GET(): Promise<Response> {
  const { adsenseClientId } = await getPublicSettings();
  const publisherId = adsenseClientId.replace(/^ca-/, "");

  if (!/^pub-\d+$/.test(publisherId)) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(`google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
