"use client";

import { useActionState, useState } from "react";

import { submitPublicRsvp, type PublicRsvpFormState } from "./actions";

type PublicRsvpFormProps = {
  guestName?: string;
  guestToken?: string;
  idempotencyKey: string;
  partyLimit?: number;
  slug: string;
};

const initialState: PublicRsvpFormState = { status: "idle" };
const fieldClassName =
  "min-h-11 w-full rounded-xl border border-stone-300 bg-white px-4 text-stone-900 outline-none focus:border-stone-700 focus:ring-2 focus:ring-stone-200";

function FieldError({ messages }: { messages?: string[] }) {
  return messages?.[0] ? (
    <p className="text-sm text-red-700">{messages[0]}</p>
  ) : null;
}

export function PublicRsvpForm({
  guestName,
  guestToken = "",
  idempotencyKey,
  partyLimit = 10,
  slug,
}: PublicRsvpFormProps) {
  const [state, formAction, pending] = useActionState(
    submitPublicRsvp,
    initialState,
  );
  const [attendance, setAttendance] = useState(
    state.values?.attendance ?? "attending",
  );

  return (
    <section className="bg-stone-100 px-5 py-20 sm:py-28" id="rsvp">
      <div className="mx-auto max-w-xl rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-10">
        <p className="text-center text-xs font-semibold tracking-[0.24em] text-rose-800 uppercase">
          Konfirmasi kehadiran
        </p>
        <h2 className="mt-3 text-center font-serif text-4xl text-stone-950">
          RSVP
        </h2>
        <p className="mt-3 text-center text-sm leading-6 text-stone-600">
          {guestName
            ? `Undangan ini ditujukan untuk ${guestName}, maksimal ${partyLimit} orang.`
            : "Satu pengiriman dapat mewakili maksimal 10 orang."}
        </p>

        {state.message ? (
          <p
            role={state.status === "error" ? "alert" : "status"}
            className={`mt-6 rounded-xl border px-4 py-3 text-sm ${
              state.status === "error"
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            {state.message}
          </p>
        ) : null}

        <form action={formAction} className="mt-7 space-y-5">
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="guestToken" value={guestToken} />
          <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
          <label className="block space-y-2 text-sm font-medium text-stone-800">
            <span>Nama</span>
            <input
              name="name"
              defaultValue={guestName ?? state.values?.name}
              readOnly={Boolean(guestName)}
              maxLength={100}
              required
              className={fieldClassName}
            />
            <FieldError messages={state.fieldErrors?.name} />
          </label>
          <label className="block space-y-2 text-sm font-medium text-stone-800">
            <span>Kehadiran</span>
            <select
              name="attendance"
              value={attendance}
              onChange={(event) => setAttendance(event.target.value)}
              className={fieldClassName}
            >
              <option value="attending">Hadir</option>
              <option value="not_attending">Tidak hadir</option>
            </select>
            <FieldError messages={state.fieldErrors?.attendance} />
          </label>
          <label className="block space-y-2 text-sm font-medium text-stone-800">
            <span>Jumlah hadir</span>
            <input
              key={attendance}
              name="partySize"
              type="number"
              min={attendance === "attending" ? 1 : 0}
              max={attendance === "attending" ? partyLimit : 0}
              defaultValue={
                attendance === "attending" ? (state.values?.partySize ?? 1) : 0
              }
              readOnly={attendance === "not_attending"}
              required
              className={fieldClassName}
            />
            <FieldError messages={state.fieldErrors?.partySize} />
          </label>
          <label className="block space-y-2 text-sm font-medium text-stone-800">
            <span>Ucapan untuk pasangan (opsional)</span>
            <textarea
              name="wish"
              defaultValue={state.values?.wish}
              maxLength={500}
              rows={4}
              className={`${fieldClassName} py-3`}
            />
            <span className="block font-normal text-stone-500">
              Ucapan tampil setelah disetujui pemilik undangan.
            </span>
            <FieldError messages={state.fieldErrors?.wish} />
          </label>
          <label className="block space-y-2 text-sm font-medium text-stone-800">
            <span>Catatan (opsional)</span>
            <textarea
              name="note"
              defaultValue={state.values?.note}
              maxLength={500}
              rows={4}
              className={`${fieldClassName} py-3`}
            />
            <FieldError messages={state.fieldErrors?.note} />
          </label>
          <button
            type="submit"
            disabled={pending || state.status === "success"}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-stone-950 px-5 font-semibold text-white hover:bg-stone-800 disabled:cursor-wait disabled:opacity-60"
          >
            {pending ? "Mengirim…" : "Kirim RSVP"}
          </button>
        </form>
      </div>
    </section>
  );
}
