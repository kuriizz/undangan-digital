import { z } from "zod";

import { INVITATION_MEDIA_BUCKET } from "@/features/media/public-url";
import { createRequestFingerprint } from "@/lib/security/request-fingerprint";
import { createTrustedServerClient } from "@/lib/supabase/trusted-server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ mediaId: string }> },
) {
  const mediaId = z
    .string()
    .uuid()
    .safeParse((await context.params).mediaId);
  if (!mediaId.success) return new Response(null, { status: 404 });

  const supabase = createTrustedServerClient();
  const fingerprint = await createRequestFingerprint();
  if (!fingerprint) return new Response(null, { status: 503 });
  const { data: allowed } = await supabase.rpc("consume_public_rate_limit", {
    p_surface: "public-media",
    p_fingerprint_hash: fingerprint,
    p_window: "10 minutes",
    p_limit: 100,
  });
  if (!allowed) return new Response(null, { status: 429 });
  const { data, error } = await supabase.rpc("get_published_invitation_media", {
    p_media_id: mediaId.data,
  });
  const media = Array.isArray(data) ? data[0] : null;
  if (error || !media) return new Response(null, { status: 404 });

  const { data: file, error: downloadError } = await supabase.storage
    .from(INVITATION_MEDIA_BUCKET)
    .download(media.storage_path);
  if (downloadError || !file) return new Response(null, { status: 404 });

  return new Response(await file.arrayBuffer(), {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": media.mime_type,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
