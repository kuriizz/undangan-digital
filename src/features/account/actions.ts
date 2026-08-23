"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { requireUser } from "@/features/auth/session";
import { INVITATION_MEDIA_BUCKET } from "@/features/media/public-url";
import { reportOperationalError } from "@/lib/observability/report-error";
import { createTrustedServerClient } from "@/lib/supabase/trusted-server";

const deleteAccountSchema = z.object({
  confirmation: z.literal("HAPUS AKUN"),
});

export async function deleteAccount(formData: FormData) {
  const parsed = deleteAccountSchema.safeParse({
    confirmation: formData.get("confirmation"),
  });
  if (!parsed.success) {
    redirect(
      "/dashboard/settings?error=Ketik%20HAPUS%20AKUN%20untuk%20mengonfirmasi.",
    );
  }

  const { supabase } = await requireUser();
  const trusted = createTrustedServerClient();
  const { data: media, error: mediaError } = await supabase
    .from("invitation_media")
    .select("storage_path");
  if (mediaError) {
    redirect(
      "/dashboard/settings?error=Data%20akun%20belum%20dapat%20diperiksa.",
    );
  }

  const { error } = await supabase.rpc("delete_own_account");
  if (error) {
    redirect("/dashboard/settings?error=Akun%20belum%20dapat%20dihapus.");
  }

  const storagePaths = (media ?? []).map((item) => item.storage_path);
  if (storagePaths.length) {
    const { error: storageError } = await trusted.storage
      .from(INVITATION_MEDIA_BUCKET)
      .remove(storagePaths);
    if (storageError) {
      reportOperationalError("account-media-purge-failed", storageError, {
        mediaCount: storagePaths.length,
      });
    }
  }

  redirect("/login?success=Akun%20dan%20data%20Anda%20telah%20dihapus.");
}
