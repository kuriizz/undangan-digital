import Link from "next/link";

import { SubmitButton } from "@/components/submit-button";
import { deleteAccount } from "@/features/account/actions";
import { AuthMessage } from "@/features/auth/message";
import { requireUser } from "@/features/auth/session";

export default async function SettingsPage({
  searchParams,
}: PageProps<"/dashboard/settings">) {
  await requireUser();
  const query = await searchParams;
  return (
    <main className="min-h-screen bg-stone-100 px-5 py-10">
      <div className="mx-auto max-w-3xl space-y-7">
        <section className="rounded-3xl bg-white p-7 shadow-sm sm:p-10">
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-rose-800 hover:underline"
          >
            ← Kembali ke dashboard
          </Link>
          <h1 className="mt-6 text-3xl font-semibold">Pengaturan akun</h1>
          <div className="mt-5">
            <AuthMessage error={query.error} success={query.success} />
          </div>
          <p className="mt-4 leading-7 text-stone-600">
            Pelajari cara data diproses pada{" "}
            <Link
              className="font-semibold text-rose-800 hover:underline"
              href="/privacy"
            >
              kebijakan privasi
            </Link>{" "}
            dan{" "}
            <Link
              className="font-semibold text-rose-800 hover:underline"
              href="/terms"
            >
              ketentuan layanan
            </Link>
            .
          </p>
        </section>

        <section className="rounded-3xl border border-red-200 bg-white p-7 shadow-sm sm:p-10">
          <h2 className="text-xl font-semibold text-red-900">
            Hapus akun permanen
          </h2>
          <p className="mt-3 leading-7 text-stone-700">
            Tindakan ini menghapus profil, undangan, daftar tamu, RSVP, ucapan,
            serta media dari sistem aktif. Tindakan tidak dapat dibatalkan.
          </p>
          <form action={deleteAccount} className="mt-6 space-y-4">
            <label className="grid gap-2 text-sm font-medium">
              Ketik <strong>HAPUS AKUN</strong> untuk mengonfirmasi
              <input
                className="min-h-11 rounded-xl border border-red-300 px-3"
                name="confirmation"
                autoComplete="off"
                required
              />
            </label>
            <SubmitButton pendingLabel="Menghapus…">
              Hapus akun saya
            </SubmitButton>
          </form>
        </section>
      </div>
    </main>
  );
}
