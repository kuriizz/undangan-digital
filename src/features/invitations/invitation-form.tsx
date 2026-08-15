"use client";

import { useActionState } from "react";

import {
  createInvitationDraft,
  saveInvitationDraft,
  type InvitationDraftFormState,
} from "./actions";
import { invitationTimezones, type InvitationDraftValues } from "./schemas";

type InvitationFormProps = {
  initialValues: InvitationDraftValues;
  mode: "create" | "edit";
};

const inputClassName =
  "min-h-11 w-full rounded-xl border border-stone-300 px-4 outline-none focus:border-rose-700 focus:ring-2 focus:ring-rose-100";
const initialInvitationDraftState: InvitationDraftFormState = {
  status: "idle",
};

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="text-sm text-red-700">{messages[0]}</p>;
}

export function InvitationForm({ initialValues, mode }: InvitationFormProps) {
  const action =
    mode === "create" ? createInvitationDraft : saveInvitationDraft;
  const [state, formAction, pending] = useActionState(
    action,
    initialInvitationDraftState,
  );
  const values = state.values ?? initialValues;

  return (
    <form action={formAction} className="space-y-8">
      {mode === "edit" ? (
        <input
          type="hidden"
          name="invitationId"
          value={initialValues.invitationId}
        />
      ) : null}

      {state.message ? (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className={`rounded-xl border px-4 py-3 text-sm ${
            state.status === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-stone-950">
          Identitas undangan
        </legend>
        <label className="block space-y-2 text-sm font-medium text-stone-800">
          <span>Slug undangan</span>
          <input
            name="slug"
            defaultValue={values.slug}
            minLength={3}
            maxLength={60}
            required
            aria-describedby="slug-help"
            className={inputClassName}
          />
          <span id="slug-help" className="block font-normal text-stone-500">
            Akan menjadi /i/slug-anda. Huruf kapital dan spasi dinormalisasi
            saat disimpan.
          </span>
          <FieldError messages={state.fieldErrors?.slug} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2 text-sm font-medium text-stone-800">
            <span>Nama pasangan pertama</span>
            <input
              name="partnerOneName"
              defaultValue={values.partnerOneName}
              maxLength={100}
              required
              className={inputClassName}
            />
            <FieldError messages={state.fieldErrors?.partnerOneName} />
          </label>
          <label className="block space-y-2 text-sm font-medium text-stone-800">
            <span>Nama pasangan kedua</span>
            <input
              name="partnerTwoName"
              defaultValue={values.partnerTwoName}
              maxLength={100}
              required
              className={inputClassName}
            />
            <FieldError messages={state.fieldErrors?.partnerTwoName} />
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-stone-950">
          Rangkaian acara pertama
        </legend>
        <label className="block space-y-2 text-sm font-medium text-stone-800">
          <span>Nama acara</span>
          <input
            name="eventName"
            defaultValue={values.eventName}
            maxLength={100}
            placeholder="Akad nikah"
            required
            className={inputClassName}
          />
          <FieldError messages={state.fieldErrors?.eventName} />
        </label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block space-y-2 text-sm font-medium text-stone-800">
            <span>Tanggal</span>
            <input
              name="eventDate"
              type="date"
              defaultValue={values.eventDate}
              required
              className={inputClassName}
            />
            <FieldError messages={state.fieldErrors?.eventDate} />
          </label>
          <label className="block space-y-2 text-sm font-medium text-stone-800">
            <span>Waktu</span>
            <input
              name="eventTime"
              type="time"
              defaultValue={values.eventTime}
              required
              className={inputClassName}
            />
            <FieldError messages={state.fieldErrors?.eventTime} />
          </label>
          <label className="block space-y-2 text-sm font-medium text-stone-800">
            <span>Zona waktu</span>
            <select
              name="timezone"
              defaultValue={values.timezone}
              required
              className={inputClassName}
            >
              {invitationTimezones.map((timezone) => (
                <option key={timezone} value={timezone}>
                  {timezone}
                </option>
              ))}
            </select>
            <FieldError messages={state.fieldErrors?.timezone} />
          </label>
        </div>
        <label className="block space-y-2 text-sm font-medium text-stone-800">
          <span>Nama lokasi</span>
          <input
            name="venueName"
            defaultValue={values.venueName}
            maxLength={150}
            required
            className={inputClassName}
          />
          <FieldError messages={state.fieldErrors?.venueName} />
        </label>
        <label className="block space-y-2 text-sm font-medium text-stone-800">
          <span>Alamat lengkap</span>
          <textarea
            name="address"
            defaultValue={values.address}
            maxLength={500}
            required
            rows={4}
            className={`${inputClassName} py-3`}
          />
          <FieldError messages={state.fieldErrors?.address} />
        </label>
        <label className="block space-y-2 text-sm font-medium text-stone-800">
          <span>Tautan peta (opsional)</span>
          <input
            name="mapUrl"
            type="url"
            defaultValue={values.mapUrl}
            maxLength={2048}
            placeholder="https://maps.google.com/..."
            className={inputClassName}
          />
          <FieldError messages={state.fieldErrors?.mapUrl} />
        </label>
      </fieldset>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-rose-700 px-5 py-3 font-semibold text-white transition hover:bg-rose-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
      >
        {pending
          ? "Menyimpan…"
          : mode === "create"
            ? "Buat draft undangan"
            : "Simpan perubahan"}
      </button>
    </form>
  );
}
