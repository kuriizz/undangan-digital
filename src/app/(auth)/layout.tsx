import Link from "next/link";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-100 px-5 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-6 inline-flex font-semibold tracking-wide text-rose-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose-700"
        >
          UndanganDigital
        </Link>
        <section className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm sm:p-9">
          {children}
        </section>
      </div>
    </main>
  );
}
