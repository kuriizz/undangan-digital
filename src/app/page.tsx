import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center bg-stone-50 px-6 py-20">
      <section className="w-full max-w-2xl rounded-3xl border border-stone-200 bg-white p-8 shadow-sm sm:p-12">
        <p className="mb-3 text-sm font-semibold tracking-[0.2em] text-rose-700 uppercase">
          UndanganDigital
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
          Mulai undangan digital Anda.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-stone-600 sm:text-lg">
          Buat akun untuk menyiapkan profil pemilik. Editor undangan akan hadir
          pada tahap berikutnya.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/register"
            className="inline-flex min-h-11 items-center rounded-xl bg-rose-700 px-5 font-semibold text-white hover:bg-rose-800"
          >
            Buat akun
          </Link>
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center rounded-xl border border-stone-300 px-5 font-semibold text-stone-800 hover:bg-stone-100"
          >
            Masuk
          </Link>
        </div>
      </section>
    </main>
  );
}
