"use client";

import { useActionState } from "react";

import { createGuest, rotateGuestLink, type GuestLinkState } from "./actions";

const initialState: GuestLinkState = { status: "idle" };
const inputClass = "min-h-11 rounded-xl border border-stone-300 px-3";

function Result({ state }: { state: GuestLinkState }) {
  if (!state.message) return null;
  return (
    <div
      className={`mt-3 rounded-xl p-3 text-sm ${state.status === "error" ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-900"}`}
    >
      <p>{state.message}</p>
      {state.shareUrl ? (
        <p className="mt-2 break-all font-mono text-xs">{state.shareUrl}</p>
      ) : null}
      {state.whatsappUrl ? (
        <a
          className="mt-3 inline-flex min-h-11 items-center rounded-lg bg-emerald-700 px-4 font-semibold text-white"
          href={state.whatsappUrl}
          target="_blank"
          rel="noreferrer"
        >
          Bagikan via WhatsApp
        </a>
      ) : null}
    </div>
  );
}

export function CreateGuestForm({ invitationId }: { invitationId: string }) {
  const [state, action, pending] = useActionState(createGuest, initialState);
  return (
    <form action={action} className="rounded-2xl border border-stone-200 p-5">
      <input type="hidden" name="invitationId" value={invitationId} />
      <h2 className="font-semibold text-stone-950">Tambah tamu</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_9rem_auto]">
        <label className="grid gap-1 text-sm">
          Nama tamu
          <input className={inputClass} name="name" maxLength={100} required />
        </label>
        <label className="grid gap-1 text-sm">
          Batas rombongan
          <input
            className={inputClass}
            name="partyLimit"
            type="number"
            min="1"
            max="10"
            defaultValue="1"
            required
          />
        </label>
        <button
          disabled={pending}
          className="min-h-11 self-end rounded-xl bg-rose-700 px-4 font-semibold text-white"
        >
          {pending ? "Menambah…" : "Tambah"}
        </button>
      </div>
      <Result state={state} />
    </form>
  );
}

export function GuestShareControls({
  invitationId,
  guestId,
}: {
  invitationId: string;
  guestId: string;
}) {
  const [state, action, pending] = useActionState(
    rotateGuestLink,
    initialState,
  );
  return (
    <form action={action}>
      <input type="hidden" name="invitationId" value={invitationId} />
      <input type="hidden" name="guestId" value={guestId} />
      <button
        disabled={pending}
        className="text-sm font-semibold text-emerald-800 hover:underline"
      >
        {pending ? "Membuat…" : "Buat tautan personal"}
      </button>
      <Result state={state} />
    </form>
  );
}
