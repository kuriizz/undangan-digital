import { z } from "zod";

import { INVITATION_MEDIA_BUCKET } from "@/features/media/public-url";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ mediaId: string }> },
) {
  const mediaId = z
    .string()
    .uuid()
    .safeParse((await context.params).mediaId);
  if (!mediaId.success) return new Response(null, { status: 404 });

  const supabase = await createClient();
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
