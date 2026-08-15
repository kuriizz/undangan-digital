import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

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
}: PageProps<"/dashboard/invitations/[id]/preview">) {
  const { id } = await params;
  const invitation = await getOwnedInvitationPreview(id);

  if (!invitation) notFound();

  return (
    <main className="min-h-screen bg-stone-200">
      <aside className="sticky top-0 z-20 border-b border-amber-300 bg-amber-100 px-4 py-3 text-amber-950 shadow-sm">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <p className="text-sm">
            <strong>Mode preview</strong> · Draft revisi{" "}
            {invitation.draftRevision}. Halaman ini hanya dapat dilihat oleh
            Anda.
          </p>
          <Link
            href={`/dashboard/invitations/${invitation.id}/content`}
            className="inline-flex min-h-9 items-center rounded-lg border border-amber-400 bg-white px-4 text-sm font-semibold hover:bg-amber-50"
          >
            Kembali mengedit
          </Link>
        </div>
      </aside>
      <div className="mx-auto max-w-5xl bg-white shadow-xl">
        <ModernMinimalTemplate document={invitation.document} />
      </div>
    </main>
  );
}
