import { z } from "zod";

import { INVITATION_MEDIA_BUCKET } from "@/features/media/public-url";
import { createClient } from "@/lib/supabase/server";

const paramsSchema = z.object({
  id: z.string().uuid(),
  mediaId: z.string().uuid(),
});

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string; mediaId: string }> },
) {
  const input = paramsSchema.safeParse(await context.params);
  if (!input.success) return new Response(null, { status: 400 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response(null, { status: 401 });

  const { data: media } = await supabase
    .from("invitation_media")
    .select("storage_path, mime_type")
    .eq("id", input.data.mediaId)
    .eq("invitation_id", input.data.id)
    .maybeSingle();
  if (!media) return new Response(null, { status: 404 });

  const { data: file, error } = await supabase.storage
    .from(INVITATION_MEDIA_BUCKET)
    .download(media.storage_path);
  if (error || !file) return new Response(null, { status: 404 });

  return new Response(await file.arrayBuffer(), {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Type": media.mime_type,
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string; mediaId: string }> },
) {
  const input = paramsSchema.safeParse(await context.params);
  if (!input.success) {
    return Response.json({ message: "Media tidak valid." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ message: "Sesi telah berakhir." }, { status: 401 });
  }

  const { data: media } = await supabase
    .from("invitation_media")
    .select("id, storage_path")
    .eq("id", input.data.mediaId)
    .eq("invitation_id", input.data.id)
    .maybeSingle();
  if (!media) {
    return Response.json(
      { message: "Media tidak ditemukan." },
      { status: 404 },
    );
  }

  const { error: storageError } = await supabase.storage
    .from(INVITATION_MEDIA_BUCKET)
    .remove([media.storage_path]);
  if (storageError) {
    return Response.json(
      { message: "File belum dapat dihapus." },
      { status: 400 },
    );
  }

  const { error: metadataError } = await supabase
    .from("invitation_media")
    .delete()
    .eq("id", media.id);
  if (metadataError) {
    return Response.json(
      { message: "Media belum dapat dihapus." },
      { status: 400 },
    );
  }

  return Response.json({ message: "Foto berhasil dihapus." });
}
