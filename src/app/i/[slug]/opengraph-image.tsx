import { ImageResponse } from "next/og";

import { getPublishedInvitationBySlug } from "@/features/invitations/queries";

export const alt = "Pratinjau undangan pernikahan";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const invitation = await getPublishedInvitationBySlug(slug);
  const names = invitation
    ? `${invitation.document.couple.partnerOneName} & ${invitation.document.couple.partnerTwoName}`
    : "UndanganDigital";
  const event = invitation?.document.events[0];

  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "linear-gradient(135deg, #fff1f2, #fffbeb)",
        color: "#1c1917",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "center",
        padding: "72px",
        textAlign: "center",
        width: "100%",
      }}
    >
      <div
        style={{
          color: "#be123c",
          display: "flex",
          fontSize: 24,
          letterSpacing: 8,
        }}
      >
        UNDANGAN PERNIKAHAN
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 72,
          fontWeight: 700,
          marginTop: 38,
        }}
      >
        {names}
      </div>
      {event ? (
        <div style={{ display: "flex", fontSize: 30, marginTop: 32 }}>
          {event.name} · {event.venueName}
        </div>
      ) : null}
      <div
        style={{
          color: "#78716c",
          display: "flex",
          fontSize: 22,
          marginTop: 52,
        }}
      >
        UndanganDigital
      </div>
    </div>,
    size,
  );
}
