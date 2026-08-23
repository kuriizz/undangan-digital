import { randomUUID } from "node:crypto";

import { z } from "zod";

import { INVITATION_MEDIA_BUCKET } from "@/features/media/public-url";
import { reportOperationalError } from "@/lib/observability/report-error";
import { createRequestFingerprint } from "@/lib/security/request-fingerprint";
import { createClient } from "@/lib/supabase/server";
import { createTrustedServerClient } from "@/lib/supabase/trusted-server";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const mediaInputSchema = z.object({
  invitationId: z.string().uuid(),
  kind: z.enum(["cover", "gallery"]),
  altText: z.string().trim().max(150),
});

const fileExtensions = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

async function hasValidSignature(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (file.type === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (file.type === "image/png") {
    return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every(
      (byte, index) => bytes[index] === byte,
    );
  }
  return (
    file.type === "image/webp" &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  );
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const invitationId = z
    .string()
    .uuid()
    .safeParse((await context.params).id);
  if (!invitationId.success) {
    return Response.json({ message: "Undangan tidak valid." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ message: "Sesi telah berakhir." }, { status: 401 });
  }

  const fingerprint = await createRequestFingerprint();
  if (!fingerprint) {
    return Response.json(
      { message: "Layanan upload belum tersedia." },
      { status: 503 },
    );
  }
  const trusted = createTrustedServerClient();
  const { data: uploadAllowed, error: rateLimitError } = await trusted.rpc(
    "consume_public_rate_limit",
    {
      p_surface: "media-upload",
      p_fingerprint_hash: fingerprint,
      p_window: "1 hour",
      p_limit: 20,
    },
  );
  if (rateLimitError) {
    reportOperationalError("media-upload-rate-limit-failed", rateLimitError);
    return Response.json(
      { message: "Layanan upload belum tersedia." },
      { status: 503 },
    );
  }
  if (!uploadAllowed) {
    return Response.json(
      {
        message:
          "Terlalu banyak percobaan upload. Coba kembali dalam satu jam.",
      },
      { status: 429 },
    );
  }

  const formData = await request.formData();
  const input = mediaInputSchema.safeParse({
    invitationId: invitationId.data,
    kind: formData.get("kind"),
    altText: formData.get("altText") ?? "",
  });
  const file = formData.get("file");

  if (!input.success || !(file instanceof File)) {
    return Response.json(
      { message: "Data upload tidak valid." },
      { status: 400 },
    );
  }
  if (
    file.size < 1 ||
    file.size > MAX_FILE_SIZE ||
    !(file.type in fileExtensions) ||
    !(await hasValidSignature(file))
  ) {
    return Response.json(
      { message: "File harus berupa JPEG, PNG, atau WebP maksimal 5 MB." },
      { status: 400 },
    );
  }

  const [{ data: invitation }, { data: existingMedia }] = await Promise.all([
    supabase
      .from("invitations")
      .select("id")
      .eq("id", input.data.invitationId)
      .maybeSingle(),
    supabase
      .from("invitation_media")
      .select("kind, sort_order")
      .eq("invitation_id", input.data.invitationId),
  ]);
  if (!invitation) {
    return Response.json(
      { message: "Undangan tidak ditemukan." },
      { status: 404 },
    );
  }

  const media = existingMedia ?? [];
  const galleryCount = media.filter((item) => item.kind === "gallery").length;
  if (
    (input.data.kind === "cover" &&
      media.some((item) => item.kind === "cover")) ||
    (input.data.kind === "gallery" && galleryCount >= 10)
  ) {
    return Response.json(
      { message: "Batas media sudah tercapai." },
      { status: 409 },
    );
  }

  const mediaId = randomUUID();
  const extension = fileExtensions[file.type as keyof typeof fileExtensions];
  const storagePath = `${user.id}/${input.data.invitationId}/${mediaId}.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from(INVITATION_MEDIA_BUCKET)
    .upload(storagePath, file, { contentType: file.type, upsert: false });
  if (uploadError) {
    reportOperationalError("media-storage-upload-failed", uploadError, {
      kind: input.data.kind,
    });
    return Response.json(
      { message: "File belum dapat diunggah." },
      { status: 400 },
    );
  }

  const { error: metadataError } = await supabase
    .from("invitation_media")
    .insert({
      id: mediaId,
      invitation_id: input.data.invitationId,
      owner_id: user.id,
      kind: input.data.kind,
      storage_path: storagePath,
      mime_type: file.type,
      size_bytes: file.size,
      alt_text: input.data.altText,
      sort_order: input.data.kind === "cover" ? 0 : galleryCount,
    });
  if (metadataError) {
    await supabase.storage.from(INVITATION_MEDIA_BUCKET).remove([storagePath]);
    reportOperationalError("media-metadata-create-failed", metadataError, {
      kind: input.data.kind,
    });
    return Response.json(
      { message: "Batas media sudah tercapai." },
      { status: 409 },
    );
  }

  return Response.json({ message: "Foto berhasil diunggah." }, { status: 201 });
}
