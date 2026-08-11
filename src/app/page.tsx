export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center bg-stone-50 px-6 py-20">
      <section className="w-full max-w-2xl rounded-3xl border border-stone-200 bg-white p-8 shadow-sm sm:p-12">
        <p className="mb-3 text-sm font-semibold tracking-[0.2em] text-rose-700 uppercase">
          UndanganDigital
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
          Fondasi teknis siap dikembangkan.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-stone-600 sm:text-lg">
          Repository telah disiapkan untuk membangun vertical slice pertama.
          Fitur produk belum dimulai pada fase ini.
        </p>
      </section>
    </main>
  );
}
