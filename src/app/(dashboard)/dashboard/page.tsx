import Link from "next/link";
import { redirect } from "next/navigation";

import { SubmitButton } from "@/components/submit-button";
import { signOut } from "@/features/auth/actions";
import { AuthMessage } from "@/features/auth/message";
import { requireUser } from "@/features/auth/session";

export default async function DashboardPage({
  searchParams,
}: PageProps<"/dashboard">) {
  const params = await searchParams;
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();
  const { data: invitation } = await supabase
    .from("invitations")
    .select("id, slug, status, draft_revision, draft_content")
    .maybeSingle();
  const { data: rsvpData } = invitation
    ? await supabase
        .from("rsvps")
        .select("id, guest_id, name, attendance, party_size, note, created_at")
        .eq("invitation_id", invitation.id)
        .order("created_at", { ascending: false })
    : { data: [] };
  const rsvps = rsvpData ?? [];

  if (!profile) {
    redirect("/onboarding");
  }

  return (
    <main className="min-h-screen bg-stone-100 px-5 py-10">
      <section className="mx-auto w-full max-w-3xl space-y-7 rounded-3xl border border-stone-200 bg-white p-7 shadow-sm sm:p-10">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-rose-700 uppercase">
              Dashboard pemilik
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">
              Halo, {profile.display_name}
            </h1>
            <p className="mt-2 text-stone-600">{user.email}</p>
          </div>
          <form action={signOut} className="w-full sm:w-auto">
            <SubmitButton pendingLabel="Keluar…">Keluar</SubmitButton>
          </form>
        </div>

        <AuthMessage error={params.error} success={params.success} />

        {invitation ? (
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-rose-800">
                  Undangan Anda
                </p>
                <h2 className="mt-1 text-xl font-semibold text-stone-950">
                  /i/{invitation.slug}
                </h2>
                <p className="mt-2 text-sm text-stone-600">
                  Status {invitation.status} · revisi{" "}
                  {invitation.draft_revision}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {invitation.status === "published" ? (
                  <Link
                    href={`/i/${invitation.slug}`}
                    className="inline-flex min-h-11 items-center rounded-xl border border-rose-200 bg-white px-5 font-semibold text-rose-900 hover:bg-rose-50"
                  >
                    Buka undangan
                  </Link>
                ) : null}
                <Link
                  href={`/dashboard/invitations/${invitation.id}/content`}
                  className="inline-flex min-h-11 items-center rounded-xl bg-rose-700 px-5 font-semibold text-white hover:bg-rose-800"
                >
                  Edit draft
                </Link>
                <Link
                  href={`/dashboard/invitations/${invitation.id}/guests`}
                  className="inline-flex min-h-11 items-center rounded-xl border border-stone-300 bg-white px-5 font-semibold text-stone-800 hover:bg-stone-100"
                >
                  Kelola tamu
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-6">
            <h2 className="font-semibold text-stone-900">
              Mulai undangan pertama Anda
            </h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Isi nama pasangan, slug, dan satu rangkaian acara untuk membuat
              draft pribadi.
            </p>
            <Link
              href="/dashboard/invitations/new"
              className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-rose-700 px-5 font-semibold text-white hover:bg-rose-800"
            >
              Buat undangan
            </Link>
          </div>
        )}

        {invitation ? (
          <section className="rounded-2xl border border-stone-200 bg-white p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-rose-800">RSVP</p>
                <h2 className="mt-1 text-xl font-semibold text-stone-950">
                  Respons tamu
                </h2>
              </div>
              <p className="text-sm text-stone-600">
                {rsvps.filter((rsvp) => rsvp.attendance === "attending").length}{" "}
                hadir
                {" · "}
                {
                  rsvps.filter((rsvp) => rsvp.attendance === "not_attending")
                    .length
                }{" "}
                tidak hadir
                {" · "}
                {rsvps.reduce((total, rsvp) => total + rsvp.party_size, 0)}{" "}
                orang
              </p>
            </div>
            {rsvps.length ? (
              <ul className="mt-5 divide-y divide-stone-200 border-y border-stone-200">
                {rsvps.map((rsvp) => (
                  <li key={rsvp.id} className="py-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-stone-950">
                        {rsvp.name}
                      </p>
                      <span className="text-sm font-medium text-stone-600">
                        {rsvp.attendance === "attending"
                          ? `Hadir · ${rsvp.party_size} orang`
                          : "Tidak hadir"}
                      </span>
                    </div>
                    {rsvp.note ? (
                      <p className="mt-2 text-sm leading-6 text-stone-600">
                        {rsvp.note}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm leading-6 text-stone-600">
                Belum ada RSVP yang masuk.
              </p>
            )}
          </section>
        ) : null}

        <div className="flex flex-wrap gap-5">
          <Link
            href="/onboarding"
            className="inline-flex text-sm font-semibold text-rose-800 hover:underline"
          >
            Ubah nama tampilan
          </Link>
          <Link
            href="/dashboard/settings"
            className="inline-flex text-sm font-semibold text-rose-800 hover:underline"
          >
            Pengaturan akun
          </Link>
        </div>
      </section>
    </main>
  );
}
