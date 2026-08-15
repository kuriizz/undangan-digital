import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SubmitButton } from "@/components/submit-button";
import { AuthMessage } from "@/features/auth/message";
import {
  publishInvitation,
  unpublishInvitation,
} from "@/features/invitations/actions";
import { createInvitationMetadata } from "@/features/invitations/metadata";
import { getOwnedInvitationPreview } from "@/features/invitations/queries";
import { ModernMinimalTemplate } from "@/features/templates/modern-minimal/modern-minimal-template";

export async function generateMetadata({
  params,
}: PageProps<"/dashboard/invitations/[id]/preview">): Promise<Metadata> {
  const { id } = await params;
  const invitation = await getOwnedInvitationPreview(id);

  if (!invitation) {
    return {
      title: "Preview tidak ditemukan | UndanganDigital",
      robots: { index: false, follow: false },
    };
  }

  return createInvitationMetadata(invitation.document, { preview: true });
}

export default async function InvitationPreviewPage({
  params,
  searchParams,
}: PageProps<"/dashboard/invitations/[id]/preview">) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const invitation = await getOwnedInvitationPreview(id);

  if (!invitation) notFound();

  return (
    <main className="min-h-screen bg-stone-200">
      <aside className="sticky top-0 z-20 border-b border-amber-300 bg-amber-100 px-4 py-3 text-amber-950 shadow-sm">
        <div className="mx-auto max-w-5xl space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm">
              <strong>Mode preview</strong> · Draft revisi{" "}
              {invitation.draftRevision}. Halaman ini hanya dapat dilihat oleh
              Anda.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/dashboard/invitations/${invitation.id}/content`}
                className="inline-flex min-h-9 items-center rounded-lg border border-amber-400 bg-white px-4 text-sm font-semibold hover:bg-amber-50"
              >
                Kembali mengedit
              </Link>
              <form action={publishInvitation}>
                <input
                  type="hidden"
                  name="invitationId"
                  value={invitation.id}
                />
                <SubmitButton pendingLabel="Menerbitkan…">
                  {invitation.status === "published"
                    ? "Terbitkan ulang"
                    : "Terbitkan"}
                </SubmitButton>
              </form>
              {invitation.status === "published" ? (
                <form action={unpublishInvitation}>
                  <input
                    type="hidden"
                    name="invitationId"
                    value={invitation.id}
                  />
                  <SubmitButton pendingLabel="Menonaktifkan…">
                    Nonaktifkan
                  </SubmitButton>
                </form>
              ) : null}
            </div>
          </div>
          {invitation.status === "published" &&
          invitation.publishedRevision !== invitation.draftRevision ? (
            <p className="text-sm font-medium">
              Perubahan terbaru masih berupa draft. Terbitkan ulang untuk
              memperbarui halaman publik.
            </p>
          ) : null}
          <AuthMessage error={query.error} success={query.success} />
        </div>
      </aside>
      <div className="mx-auto max-w-5xl bg-white shadow-xl">
        <ModernMinimalTemplate document={invitation.document} />
      </div>
    </main>
  );
}
