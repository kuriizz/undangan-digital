import { randomUUID } from "node:crypto";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { createInvitationMetadata } from "@/features/invitations/metadata";
import {
  getPersonalizedGuest,
  getPublishedInvitationBySlug,
  getPublicWishes,
} from "@/features/invitations/queries";
import { PublicRsvpForm } from "@/features/rsvp/public-rsvp-form";
import { InvitationTemplate } from "@/features/templates/invitation-template";

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

  return createInvitationMetadata(invitation.document, {
    preview: false,
    slug: invitation.slug,
  });
}

export default async function PublishedInvitationPage({
  params,
  searchParams,
}: PageProps<"/i/[slug]">) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const [invitation, guest, wishes] = await Promise.all([
    getPublishedInvitationBySlug(slug),
    getPersonalizedGuest(
      slug,
      typeof query.to === "string" ? query.to : undefined,
    ),
    getPublicWishes(slug),
  ]);

  if (!invitation) notFound();

  return (
    <main className="min-h-screen bg-white">
      <InvitationTemplate
        document={invitation.document}
        afterSections={
          <>
            <PublicRsvpForm
              slug={invitation.slug}
              idempotencyKey={randomUUID()}
              guestName={guest?.name}
              guestToken={guest ? (query.to as string) : undefined}
              partyLimit={guest?.partyLimit}
            />
            {wishes.length ? (
              <section className="bg-white px-5 py-20 sm:py-28">
                <div className="mx-auto max-w-3xl">
                  <h2 className="text-center font-serif text-4xl text-stone-950">
                    Ucapan dan doa
                  </h2>
                  <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                    {wishes.map((wish) => (
                      <li
                        key={`${wish.name}-${wish.created_at}`}
                        className="rounded-2xl border border-stone-200 bg-stone-50 p-5"
                      >
                        <p className="whitespace-pre-line leading-7 text-stone-700">
                          {wish.message}
                        </p>
                        <p className="mt-3 text-sm font-semibold text-stone-950">
                          — {wish.name}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            ) : null}
            <div className="bg-white px-5 pb-10 text-center text-xs text-stone-500">
              <Link
                className="hover:text-rose-800 hover:underline"
                href={`/report-abuse?slug=${encodeURIComponent(invitation.slug)}`}
              >
                Laporkan undangan ini
              </Link>
            </div>
          </>
        }
      />
    </main>
  );
}
