"use client";

import { useActionState } from "react";

import { submitAbuseReport, type AbuseReportState } from "./actions";

const initialState: AbuseReportState = { status: "idle" };
const fieldClass = "min-h-11 rounded-xl border border-stone-300 px-3";

export function AbuseReportForm({
  idempotencyKey,
  initialSlug,
}: {
  idempotencyKey: string;
  initialSlug: string;
}) {
  const [state, action, pending] = useActionState(
    submitAbuseReport,
    initialState,
  );

  if (state.status === "success") {
    return (
      <p
        className="rounded-xl bg-emerald-50 p-4 text-emerald-900"
        role="status"
      >
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
      <label className="grid gap-2 text-sm font-medium">
        Slug undangan
        <input
          className={fieldClass}
          name="slug"
          defaultValue={state.values?.slug ?? initialSlug}
          minLength={3}
          maxLength={60}
          required
        />
        {state.fieldErrors?.slug?.map((message) => (
          <span key={message} className="text-red-700">
            {message}
          </span>
        ))}
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Jenis laporan
        <select
          className={fieldClass}
          name="category"
          defaultValue={state.values?.category ?? "privacy"}
        >
          <option value="privacy">Privasi atau data personal</option>
          <option value="fraud">Penipuan atau penyamaran</option>
          <option value="harassment">Pelecehan atau konten berbahaya</option>
          <option value="copyright">Hak cipta</option>
          <option value="other">Lainnya</option>
        </select>
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Penjelasan
        <textarea
          className={`${fieldClass} py-3`}
          name="details"
          defaultValue={state.values?.details}
          minLength={10}
          maxLength={1000}
          rows={6}
          required
        />
        {state.fieldErrors?.details?.map((message) => (
          <span key={message} className="text-red-700">
            {message}
          </span>
        ))}
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Email kontak (opsional)
        <input
          className={fieldClass}
          name="contactEmail"
          type="email"
          defaultValue={state.values?.contactEmail}
          maxLength={254}
        />
      </label>
      <label
        aria-hidden="true"
        className="absolute -left-[10000px] h-px w-px overflow-hidden"
      >
        Situs web
        <input name="website" type="text" autoComplete="off" tabIndex={-1} />
      </label>
      {state.message ? (
        <p
          className="rounded-xl bg-red-50 p-3 text-sm text-red-800"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}
      <button
        className="min-h-11 rounded-xl bg-rose-700 px-5 font-semibold text-white disabled:opacity-60"
        disabled={pending}
      >
        {pending ? "Mengirim…" : "Kirim laporan"}
      </button>
    </form>
  );
}
