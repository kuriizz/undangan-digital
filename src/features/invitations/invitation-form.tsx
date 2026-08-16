"use client";

import { useActionState, useState } from "react";

import {
  createInvitationDraft,
  saveInvitationDraft,
  type InvitationDraftFormState,
} from "./actions";
import {
  invitationAccentKeys,
  invitationSectionKeys,
  invitationTypographyKeys,
} from "./content";
import {
  invitationTimezones,
  type InvitationDraftValues,
  type InvitationEventEditor,
} from "./schemas";

type InvitationFormProps = {
  initialValues: InvitationDraftValues;
  mode: "create" | "edit";
};

const inputClassName =
  "min-h-11 w-full rounded-xl border border-stone-300 px-4 outline-none focus:border-rose-700 focus:ring-2 focus:ring-rose-100";
const initialInvitationDraftState: InvitationDraftFormState = {
  status: "idle",
};

const sectionLabels = {
  hero: "Sampul",
  events: "Rangkaian acara",
  story: "Cerita pasangan",
  gallery: "Galeri foto",
  map: "Peta lokasi",
  gifts: "Informasi hadiah",
  closing: "Penutup",
} as const;

const emptyEvent: InvitationEventEditor = {
  name: "Resepsi",
  date: "",
  time: "11:00",
  timezone: "Asia/Jakarta",
  venueName: "",
  address: "",
  mapUrl: "",
};

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="text-sm text-red-700">{messages[0]}</p>;
}

function parseInitialEvents(value: string) {
  try {
    const events = JSON.parse(value) as InvitationEventEditor[];
    return events.length ? events : [emptyEvent];
  } catch {
    return [emptyEvent];
  }
}

function parseInitialSections(value: string) {
  try {
    const sections = JSON.parse(
      value,
    ) as (typeof invitationSectionKeys)[number][];
    return sections.includes("hero") ? sections : [...invitationSectionKeys];
  } catch {
    return [...invitationSectionKeys];
  }
}

export function InvitationForm({ initialValues, mode }: InvitationFormProps) {
  const action =
    mode === "create" ? createInvitationDraft : saveInvitationDraft;
  const [state, formAction, pending] = useActionState(
    action,
    initialInvitationDraftState,
  );
  const values = state.values ?? initialValues;
  const [events, setEvents] = useState(() =>
    parseInitialEvents(initialValues.eventsJson),
  );
  const [sections, setSections] = useState(() =>
    parseInitialSections(initialValues.sectionsJson),
  );

  function updateEvent(
    index: number,
    key: keyof InvitationEventEditor,
    value: string,
  ) {
    setEvents((current) =>
      current.map((event, eventIndex) =>
        eventIndex === index ? { ...event, [key]: value } : event,
      ),
    );
  }

  function toggleSection(
    section: (typeof invitationSectionKeys)[number],
    visible: boolean,
  ) {
    if (section === "hero") return;
    setSections((current) =>
      visible
        ? [...current, section]
        : current.filter((candidate) => candidate !== section),
    );
  }

  function moveSection(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    setSections((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <form action={formAction} className="space-y-10">
      {mode === "edit" ? (
        <input
          type="hidden"
          name="invitationId"
          value={initialValues.invitationId}
        />
      ) : null}
      <input type="hidden" name="eventsJson" value={JSON.stringify(events)} />
      <input
        type="hidden"
        name="sectionsJson"
        value={JSON.stringify(sections)}
      />

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
          Tampilan Modern Minimal
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2 text-sm font-medium text-stone-800">
            <span>Warna aksen</span>
            <select
              name="accent"
              defaultValue={values.accent}
              className={inputClassName}
            >
              {invitationAccentKeys.map((accent) => (
                <option key={accent} value={accent}>
                  {accent === "rose"
                    ? "Mawar"
                    : accent === "sage"
                      ? "Sage"
                      : "Emas"}
                </option>
              ))}
            </select>
            <FieldError messages={state.fieldErrors?.accent} />
          </label>
          <label className="block space-y-2 text-sm font-medium text-stone-800">
            <span>Gaya tipografi</span>
            <select
              name="typography"
              defaultValue={values.typography}
              className={inputClassName}
            >
              {invitationTypographyKeys.map((typography) => (
                <option key={typography} value={typography}>
                  {typography === "modern" ? "Modern" : "Elegan"}
                </option>
              ))}
            </select>
            <FieldError messages={state.fieldErrors?.typography} />
          </label>
        </div>
        <div className="space-y-3 rounded-2xl bg-stone-50 p-4">
          <p className="text-sm font-semibold text-stone-900">
            Urutan dan visibility section
          </p>
          <p className="text-sm text-stone-600">
            Sampul wajib tampil. Gunakan panah untuk mengubah urutan section
            yang aktif.
          </p>
          {invitationSectionKeys.map((section) => {
            const index = sections.indexOf(section);
            const visible = index >= 0;
            return (
              <div
                key={section}
                className="flex min-h-11 items-center gap-3 rounded-xl border border-stone-200 bg-white px-3"
              >
                <input
                  id={`section-${section}`}
                  type="checkbox"
                  checked={visible}
                  disabled={section === "hero"}
                  onChange={(event) =>
                    toggleSection(section, event.currentTarget.checked)
                  }
                  className="size-4 accent-rose-700"
                />
                <label
                  htmlFor={`section-${section}`}
                  className="flex-1 text-sm font-medium text-stone-800"
                >
                  {sectionLabels[section]}
                </label>
                {visible ? (
                  <span className="text-xs text-stone-500">#{index + 1}</span>
                ) : null}
                <button
                  type="button"
                  disabled={!visible || index === 0}
                  onClick={() => moveSection(index, -1)}
                  aria-label={`Naikkan ${sectionLabels[section]}`}
                  className="rounded p-2 disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={!visible || index === sections.length - 1}
                  onClick={() => moveSection(index, 1)}
                  aria-label={`Turunkan ${sectionLabels[section]}`}
                  className="rounded p-2 disabled:opacity-30"
                >
                  ↓
                </button>
              </div>
            );
          })}
          <FieldError messages={state.fieldErrors?.sectionsJson} />
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="text-lg font-semibold text-stone-950">
          Rangkaian acara
        </legend>
        {events.map((event, index) => (
          <div
            key={index}
            className="space-y-4 rounded-2xl border border-stone-200 p-5"
          >
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-semibold text-stone-900">
                Acara {index + 1}
              </h3>
              {events.length > 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setEvents((current) =>
                      current.filter((_, eventIndex) => eventIndex !== index),
                    )
                  }
                  className="text-sm font-semibold text-red-700 hover:underline"
                >
                  Hapus acara
                </button>
              ) : null}
            </div>
            <label className="block space-y-2 text-sm font-medium text-stone-800">
              <span>Nama acara</span>
              <input
                value={event.name}
                onChange={(input) =>
                  updateEvent(index, "name", input.currentTarget.value)
                }
                maxLength={100}
                required
                className={inputClassName}
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block space-y-2 text-sm font-medium text-stone-800">
                <span>Tanggal</span>
                <input
                  type="date"
                  value={event.date}
                  onChange={(input) =>
                    updateEvent(index, "date", input.currentTarget.value)
                  }
                  required
                  className={inputClassName}
                />
              </label>
              <label className="block space-y-2 text-sm font-medium text-stone-800">
                <span>Waktu</span>
                <input
                  type="time"
                  value={event.time}
                  onChange={(input) =>
                    updateEvent(index, "time", input.currentTarget.value)
                  }
                  required
                  className={inputClassName}
                />
              </label>
              <label className="block space-y-2 text-sm font-medium text-stone-800">
                <span>Zona waktu</span>
                <select
                  value={event.timezone}
                  onChange={(input) =>
                    updateEvent(index, "timezone", input.currentTarget.value)
                  }
                  className={inputClassName}
                >
                  {invitationTimezones.map((timezone) => (
                    <option key={timezone} value={timezone}>
                      {timezone.replace("Asia/", "")}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block space-y-2 text-sm font-medium text-stone-800">
              <span>Nama lokasi</span>
              <input
                value={event.venueName}
                onChange={(input) =>
                  updateEvent(index, "venueName", input.currentTarget.value)
                }
                maxLength={150}
                required
                className={inputClassName}
              />
            </label>
            <label className="block space-y-2 text-sm font-medium text-stone-800">
              <span>Alamat lengkap</span>
              <textarea
                value={event.address}
                onChange={(input) =>
                  updateEvent(index, "address", input.currentTarget.value)
                }
                maxLength={500}
                required
                rows={3}
                className={`${inputClassName} py-3`}
              />
            </label>
            <label className="block space-y-2 text-sm font-medium text-stone-800">
              <span>Tautan peta (opsional)</span>
              <input
                type="url"
                value={event.mapUrl}
                onChange={(input) =>
                  updateEvent(index, "mapUrl", input.currentTarget.value)
                }
                maxLength={2048}
                placeholder="https://maps.google.com/..."
                className={inputClassName}
              />
            </label>
          </div>
        ))}
        <FieldError messages={state.fieldErrors?.eventsJson} />
        <button
          type="button"
          onClick={() =>
            setEvents((current) => [...current, { ...emptyEvent }])
          }
          className="inline-flex min-h-11 items-center rounded-xl border border-stone-300 px-4 text-sm font-semibold text-stone-800 hover:bg-stone-50"
        >
          + Tambah acara
        </button>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-stone-950">
          Cerita dan penutup
        </legend>
        <label className="block space-y-2 text-sm font-medium text-stone-800">
          <span>Cerita pasangan (opsional)</span>
          <textarea
            name="story"
            defaultValue={values.story}
            maxLength={2000}
            rows={6}
            className={`${inputClassName} py-3`}
          />
          <FieldError messages={state.fieldErrors?.story} />
        </label>
        <label className="block space-y-2 text-sm font-medium text-stone-800">
          <span>Pesan penutup (opsional)</span>
          <textarea
            name="closingMessage"
            defaultValue={values.closingMessage}
            maxLength={1000}
            rows={4}
            className={`${inputClassName} py-3`}
          />
          <FieldError messages={state.fieldErrors?.closingMessage} />
        </label>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-stone-950">
          Informasi hadiah
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2 text-sm font-medium text-stone-800">
            <span>Nama bank atau dompet digital</span>
            <input
              name="giftBankName"
              defaultValue={values.giftBankName}
              maxLength={100}
              className={inputClassName}
            />
            <FieldError messages={state.fieldErrors?.giftBankName} />
          </label>
          <label className="block space-y-2 text-sm font-medium text-stone-800">
            <span>Nomor rekening</span>
            <input
              name="giftAccountNumber"
              defaultValue={values.giftAccountNumber}
              maxLength={100}
              className={inputClassName}
            />
            <FieldError messages={state.fieldErrors?.giftAccountNumber} />
          </label>
        </div>
        <label className="block space-y-2 text-sm font-medium text-stone-800">
          <span>Nama pemilik rekening</span>
          <input
            name="giftAccountHolder"
            defaultValue={values.giftAccountHolder}
            maxLength={100}
            className={inputClassName}
          />
          <FieldError messages={state.fieldErrors?.giftAccountHolder} />
        </label>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-stone-950">
          Kontak pasangan
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2 text-sm font-medium text-stone-800">
            <span>Nama kontak</span>
            <input
              name="contactName"
              defaultValue={values.contactName}
              maxLength={100}
              className={inputClassName}
            />
            <FieldError messages={state.fieldErrors?.contactName} />
          </label>
          <label className="block space-y-2 text-sm font-medium text-stone-800">
            <span>Nomor kontak</span>
            <input
              name="contactPhone"
              defaultValue={values.contactPhone}
              maxLength={30}
              placeholder="+62 812 3456 7890"
              className={inputClassName}
            />
            <FieldError messages={state.fieldErrors?.contactPhone} />
          </label>
        </div>
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
