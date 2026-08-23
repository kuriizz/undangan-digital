import type { Metadata } from "next";

import type { InvitationDocument } from "./content";

export function createInvitationMetadata(
  document: InvitationDocument,
  options: { preview: boolean; slug?: string },
): Metadata {
  const names = `${document.couple.partnerOneName} & ${document.couple.partnerTwoName}`;
  const title = options.preview
    ? `Preview ${names} | UndanganDigital`
    : `${names} | Undangan Pernikahan`;
  const firstEvent = document.events[0];
  const description = `Undangan pernikahan ${names}. ${firstEvent.name} di ${firstEvent.venueName}.`;

  const canonical = options.slug ? `/i/${options.slug}` : undefined;
  const image = options.slug ? `/i/${options.slug}/opengraph-image` : undefined;

  return {
    title,
    description,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "id_ID",
      url: canonical,
      images: image ? [{ url: image, width: 1200, height: 630 }] : undefined,
    },
    twitter: image
      ? { card: "summary_large_image", title, description, images: [image] }
      : undefined,
    robots: options.preview
      ? {
          index: false,
          follow: false,
          noarchive: true,
        }
      : undefined,
  };
}
