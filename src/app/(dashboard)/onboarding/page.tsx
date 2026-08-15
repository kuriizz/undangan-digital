import { SubmitButton } from "@/components/submit-button";
import { updateProfile } from "@/features/auth/actions";
import { AuthMessage } from "@/features/auth/message";
import { requireUser } from "@/features/auth/session";

export default async function OnboardingPage({
  searchParams,
}: PageProps<"/onboarding">) {
  const params = await searchParams;
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-100 px-5 py-12">
      <section className="w-full max-w-md space-y-6 rounded-3xl border border-stone-200 bg-white p-7 shadow-sm sm:p-9">
        <header>
          <p className="text-sm font-semibold tracking-[0.18em] text-rose-700 uppercase">
            Profil pemilik
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
            Lengkapi profil
          </h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">{user.email}</p>
        </header>

        <AuthMessage error={params.error} success={params.success} />

        <form action={updateProfile} className="space-y-4">
          <label className="block space-y-2 text-sm font-medium text-stone-800">
            <span>Nama tampilan</span>
            <input
              name="displayName"
              autoComplete="name"
              defaultValue={profile?.display_name ?? ""}
              maxLength={100}
              required
              className="min-h-11 w-full rounded-xl border border-stone-300 px-4 outline-none focus:border-rose-700 focus:ring-2 focus:ring-rose-100"
            />
          </label>
          <SubmitButton pendingLabel="Menyimpan…">Simpan profil</SubmitButton>
        </form>
      </section>
    </main>
  );
}
