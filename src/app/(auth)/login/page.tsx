import Link from "next/link";

import { SubmitButton } from "@/components/submit-button";
import { signIn } from "@/features/auth/actions";
import { AuthMessage } from "@/features/auth/message";
import { safeRedirectPath } from "@/features/auth/navigation";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = safeRedirectPath(params.next);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-950">
          Masuk ke akun
        </h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Kelola undangan dan data tamu Anda dengan aman.
        </p>
      </header>

      <AuthMessage error={params.error} success={params.success} />

      <form action={signIn} className="space-y-4">
        <input type="hidden" name="next" value={next} />
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
            autoComplete="current-password"
            required
            className="min-h-11 w-full rounded-xl border border-stone-300 px-4 outline-none focus:border-rose-700 focus:ring-2 focus:ring-rose-100"
          />
        </label>
        <SubmitButton pendingLabel="Sedang masuk…">Masuk</SubmitButton>
      </form>

      <div className="flex flex-wrap justify-between gap-3 text-sm">
        <Link
          className="font-medium text-rose-800 hover:underline"
          href="/register"
        >
          Buat akun
        </Link>
        <Link
          className="font-medium text-rose-800 hover:underline"
          href="/forgot-password"
        >
          Lupa kata sandi?
        </Link>
      </div>
    </div>
  );
}
