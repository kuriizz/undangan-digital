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

        <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-6">
          <h2 className="font-semibold text-stone-900">Profil akun</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Autentikasi dan isolasi kepemilikan sudah aktif. Pembuatan undangan
            baru dimulai pada P1.2.
          </p>
          <Link
            href="/onboarding"
            className="mt-4 inline-flex font-semibold text-rose-800 hover:underline"
          >
            Ubah nama tampilan
          </Link>
        </div>
      </section>
    </main>
  );
}
