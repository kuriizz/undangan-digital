import Link from "next/link";

import { SubmitButton } from "@/components/submit-button";
import { requestPasswordReset } from "@/features/auth/actions";
import { AuthMessage } from "@/features/auth/message";

export default async function ForgotPasswordPage({
  searchParams,
}: PageProps<"/forgot-password">) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-950">
          Reset kata sandi
        </h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Kami akan mengirim tautan reset jika email terdaftar.
        </p>
      </header>

      <AuthMessage error={params.error} success={params.success} />

      <form action={requestPasswordReset} className="space-y-4">
        <label className="block space-y-2 text-sm font-medium text-stone-800">
          <span>Email</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className="min-h-11 w-full rounded-xl border border-stone-300 px-4 outline-none focus:border-rose-700 focus:ring-2 focus:ring-rose-100"
          />
        </label>
        <SubmitButton pendingLabel="Mengirim tautan…">
          Kirim tautan reset
        </SubmitButton>
      </form>

      <Link
        className="text-sm font-medium text-rose-800 hover:underline"
        href="/login"
      >
        Kembali ke halaman masuk
      </Link>
    </div>
  );
}
