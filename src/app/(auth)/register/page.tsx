import Link from "next/link";

import { SubmitButton } from "@/components/submit-button";
import { register } from "@/features/auth/actions";
import { AuthMessage } from "@/features/auth/message";

export default async function RegisterPage({
  searchParams,
}: PageProps<"/register">) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-950">
          Buat akun baru
        </h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Satu akun dapat memiliki satu undangan selama MVP.
        </p>
      </header>

      <AuthMessage error={params.error} success={params.success} />

      <form action={register} className="space-y-4">
        <label className="block space-y-2 text-sm font-medium text-stone-800">
          <span>Nama tampilan</span>
          <input
            name="displayName"
            autoComplete="name"
            maxLength={100}
            required
            className="min-h-11 w-full rounded-xl border border-stone-300 px-4 outline-none focus:border-rose-700 focus:ring-2 focus:ring-rose-100"
          />
        </label>
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
        <label className="block space-y-2 text-sm font-medium text-stone-800">
          <span>Kata sandi</span>
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            className="min-h-11 w-full rounded-xl border border-stone-300 px-4 outline-none focus:border-rose-700 focus:ring-2 focus:ring-rose-100"
          />
        </label>
        <label className="block space-y-2 text-sm font-medium text-stone-800">
          <span>Ulangi kata sandi</span>
          <input
            name="passwordConfirmation"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            className="min-h-11 w-full rounded-xl border border-stone-300 px-4 outline-none focus:border-rose-700 focus:ring-2 focus:ring-rose-100"
          />
        </label>
        <SubmitButton pendingLabel="Membuat akun…">Daftar</SubmitButton>
      </form>

      <p className="text-sm text-stone-600">
        Sudah punya akun?{" "}
        <Link
          className="font-medium text-rose-800 hover:underline"
          href="/login"
        >
          Masuk
        </Link>
      </p>
    </div>
  );
}
