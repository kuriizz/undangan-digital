import { randomUUID } from "node:crypto";

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { createInvitationMetadata } from "@/features/invitations/metadata";
import { getPublishedInvitationBySlug } from "@/features/invitations/queries";
import { PublicRsvpForm } from "@/features/rsvp/public-rsvp-form";
import { ModernMinimalTemplate } from "@/features/templates/modern-minimal/modern-minimal-template";

export async function generateMetadata({
  params,
}: PageProps<"/i/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const invitation = await getPublishedInvitationBySlug(slug);

  if (!invitation) {
    return {
      title: "Undangan tidak ditemukan | UndanganDigital",
      robots: { index: false, follow: false },
    };
  }

  return createInvitationMetadata(invitation.document, { preview: false });
}

export default async function PublishedInvitationPage({
  params,
}: PageProps<"/i/[slug]">) {
  const { slug } = await params;
  const invitation = await getPublishedInvitationBySlug(slug);

  if (!invitation) notFound();

  return (
    <main className="min-h-screen bg-white">
      <ModernMinimalTemplate
        document={invitation.document}
        afterSections={
          <PublicRsvpForm
            slug={invitation.slug}
            idempotencyKey={randomUUID()}
          />
        }
      />
    </main>
  );
}
