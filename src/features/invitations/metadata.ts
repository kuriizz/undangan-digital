import type { Metadata } from "next";

import type { InvitationDocumentV1 } from "./content";

export function createInvitationMetadata(
  document: InvitationDocumentV1,
  options: { preview: boolean },
): Metadata {
  const names = `${document.couple.partnerOneName} & ${document.couple.partnerTwoName}`;
  const title = options.preview
    ? `Preview ${names} | UndanganDigital`
    : `${names} | Undangan Pernikahan`;
  const description = `Undangan pernikahan ${names}. ${document.event.name} di ${document.event.venueName}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "id_ID",
    },
    robots: options.preview
      ? {
          index: false,
          follow: false,
          noarchive: true,
        }
      : undefined,
  };
}
