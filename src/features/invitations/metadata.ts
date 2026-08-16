import type { Metadata } from "next";

import type { InvitationDocument } from "./content";

export function createInvitationMetadata(
  document: InvitationDocument,
  options: { preview: boolean },
): Metadata {
  const names = `${document.couple.partnerOneName} & ${document.couple.partnerTwoName}`;
  const title = options.preview
    ? `Preview ${names} | UndanganDigital`
    : `${names} | Undangan Pernikahan`;
  const firstEvent = document.events[0];
  const description = `Undangan pernikahan ${names}. ${firstEvent.name} di ${firstEvent.venueName}.`;

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
