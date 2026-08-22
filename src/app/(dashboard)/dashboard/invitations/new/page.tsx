import Link from "next/link";
import { redirect } from "next/navigation";

import { requireUser } from "@/features/auth/session";
import { InvitationForm } from "@/features/invitations/invitation-form";
import type { InvitationDraftValues } from "@/features/invitations/schemas";

const initialValues: InvitationDraftValues = {
  invitationId: "",
  slug: "",
  partnerOneName: "",
  partnerTwoName: "",
  story: "",
  giftBankName: "",
  giftAccountNumber: "",
  giftAccountHolder: "",
  closingMessage: "",
  contactName: "",
  contactPhone: "",
  eventsJson: JSON.stringify([
    {
      name: "Akad nikah",
      date: "",
      time: "09:00",
      timezone: "Asia/Jakarta",
      venueName: "",
      address: "",
      mapUrl: "",
    },
  ]),
  sectionsJson: JSON.stringify([
    "hero",
    "events",
    "story",
    "gallery",
    "map",
    "gifts",
    "closing",
  ]),
  templateKey: "modern-minimal",
  accent: "rose",
  typography: "elegant",
};

export default async function NewInvitationPage() {
  const { supabase } = await requireUser();
  const { data: invitation } = await supabase
    .from("invitations")
    .select("id")
    .maybeSingle();

  if (invitation) {
    redirect(`/dashboard/invitations/${invitation.id}/content`);
  }

  return (
    <main className="min-h-screen bg-stone-100 px-5 py-10">
      <section className="mx-auto w-full max-w-3xl space-y-7 rounded-3xl border border-stone-200 bg-white p-7 shadow-sm sm:p-10">
        <header>
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-rose-800 hover:underline"
          >
            ← Kembali ke dashboard
          </Link>
          <p className="mt-6 text-sm font-semibold tracking-[0.18em] text-rose-700 uppercase">
            Editor undangan
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">
            Buat draft undangan
          </h1>
          <p className="mt-2 leading-7 text-stone-600">
            Isi data pasangan, rangkaian acara, dan section undangan. Draft
            tidak berubah di halaman publik sampai diterbitkan.
          </p>
        </header>

        <InvitationForm mode="create" initialValues={initialValues} />
      </section>
    </main>
  );
}
