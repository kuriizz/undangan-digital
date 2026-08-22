import Link from "next/link";
import { notFound } from "next/navigation";

import { SubmitButton } from "@/components/submit-button";
import { requireUser } from "@/features/auth/session";
import {
  deleteGuest,
  moderateWish,
  updateGuest,
} from "@/features/guests/actions";
import {
  CreateGuestForm,
  GuestShareControls,
} from "@/features/guests/guest-link-controls";

export default async function GuestsPage({
  params,
}: PageProps<"/dashboard/invitations/[id]/guests">) {
  const { id } = await params;
  const { supabase } = await requireUser();
  const [
    { data: invitation },
    { data: guests },
    { data: wishes },
    { data: rsvps },
  ] = await Promise.all([
    supabase.from("invitations").select("id, slug").eq("id", id).maybeSingle(),
    supabase
      .from("guests")
      .select("id, name, party_limit, created_at")
      .eq("invitation_id", id)
      .order("name"),
    supabase
      .from("wishes")
      .select("id, name, message, status, created_at")
      .eq("invitation_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("rsvps")
      .select("guest_id")
      .eq("invitation_id", id)
      .not("guest_id", "is", null),
  ]);
  if (!invitation) notFound();
  const answered = new Set((rsvps ?? []).map((rsvp) => rsvp.guest_id));

  return (
    <main className="min-h-screen bg-stone-100 px-5 py-10">
      <div className="mx-auto max-w-4xl space-y-7">
        <header className="rounded-3xl bg-white p-7 shadow-sm sm:p-10">
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-rose-800 hover:underline"
          >
            ← Kembali ke dashboard
          </Link>
          <p className="mt-6 text-sm font-semibold tracking-widest text-rose-700 uppercase">
            Tamu dan ucapan
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Kelola daftar tamu</h1>
          <p className="mt-3 text-stone-600">
            Tautan personal hanya ditampilkan saat dibuat atau dirotasi. Simpan
            dan bagikan saat itu juga.
          </p>
        </header>

        <CreateGuestForm invitationId={id} />

        <section className="rounded-3xl bg-white p-7 shadow-sm">
          <div className="flex flex-wrap justify-between gap-3">
            <h2 className="text-xl font-semibold">Daftar tamu</h2>
            <p className="text-sm text-stone-600">
              {guests?.length ?? 0} terdaftar ·{" "}
              {(guests ?? []).filter((guest) => !answered.has(guest.id)).length}{" "}
              belum menjawab
            </p>
          </div>
          {guests?.length ? (
            <ul className="mt-5 divide-y divide-stone-200">
              {guests.map((guest) => (
                <li key={guest.id} className="py-5">
                  <form
                    action={updateGuest}
                    className="grid gap-3 sm:grid-cols-[1fr_8rem_auto]"
                  >
                    <input type="hidden" name="invitationId" value={id} />
                    <input type="hidden" name="guestId" value={guest.id} />
                    <label className="grid gap-1 text-sm">
                      Nama
                      <input
                        name="name"
                        defaultValue={guest.name}
                        maxLength={100}
                        required
                        className="min-h-11 rounded-xl border px-3"
                      />
                    </label>
                    <label className="grid gap-1 text-sm">
                      Batas
                      <input
                        name="partyLimit"
                        type="number"
                        min="1"
                        max="10"
                        defaultValue={guest.party_limit}
                        required
                        className="min-h-11 rounded-xl border px-3"
                      />
                    </label>
                    <SubmitButton pendingLabel="Menyimpan…">
                      Simpan
                    </SubmitButton>
                  </form>
                  <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${answered.has(guest.id) ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"}`}
                    >
                      {answered.has(guest.id)
                        ? "Sudah menjawab"
                        : "Belum menjawab"}
                    </span>
                    <GuestShareControls invitationId={id} guestId={guest.id} />
                    <form action={deleteGuest}>
                      <input type="hidden" name="invitationId" value={id} />
                      <input type="hidden" name="guestId" value={guest.id} />
                      <button className="text-sm font-semibold text-red-700 hover:underline">
                        Hapus tamu
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-stone-600">
              Belum ada tamu terdaftar.
            </p>
          )}
        </section>

        <section className="rounded-3xl bg-white p-7 shadow-sm">
          <h2 className="text-xl font-semibold">Moderasi ucapan</h2>
          {wishes?.length ? (
            <ul className="mt-5 divide-y divide-stone-200">
              {wishes.map((wish) => (
                <li key={wish.id} className="py-4">
                  <div className="flex justify-between gap-3">
                    <strong>{wish.name}</strong>
                    <span className="text-xs font-semibold uppercase text-stone-500">
                      {wish.status}
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-line text-sm text-stone-700">
                    {wish.message}
                  </p>
                  <form
                    action={moderateWish}
                    className="mt-3 flex flex-wrap gap-4"
                  >
                    <input type="hidden" name="invitationId" value={id} />
                    <input type="hidden" name="wishId" value={wish.id} />
                    <button
                      name="intent"
                      value="approved"
                      className="text-sm font-semibold text-emerald-800"
                    >
                      Setujui
                    </button>
                    <button
                      name="intent"
                      value="hidden"
                      className="text-sm font-semibold text-amber-800"
                    >
                      Sembunyikan
                    </button>
                    <button
                      name="intent"
                      value="delete"
                      className="text-sm font-semibold text-red-700"
                    >
                      Hapus
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-stone-600">
              Belum ada ucapan masuk.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
