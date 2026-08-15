import { SubmitButton } from "@/components/submit-button";
import { updatePassword } from "@/features/auth/actions";
import { AuthMessage } from "@/features/auth/message";
import { requireUser } from "@/features/auth/session";

export default async function UpdatePasswordPage({
  searchParams,
}: PageProps<"/update-password">) {
  const params = await searchParams;
  await requireUser();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-950">
          Buat kata sandi baru
        </h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Gunakan minimal 8 karakter yang tidak mudah ditebak.
        </p>
      </header>

      <AuthMessage error={params.error} success={params.success} />

      <form action={updatePassword} className="space-y-4">
        <label className="block space-y-2 text-sm font-medium text-stone-800">
          <span>Kata sandi baru</span>
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
          <span>Ulangi kata sandi baru</span>
          <input
            name="passwordConfirmation"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            className="min-h-11 w-full rounded-xl border border-stone-300 px-4 outline-none focus:border-rose-700 focus:ring-2 focus:ring-rose-100"
          />
        </label>
        <SubmitButton pendingLabel="Menyimpan…">Simpan kata sandi</SubmitButton>
      </form>
    </div>
  );
}
