"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type InvitationMediaItem = {
  id: string;
  kind: "cover" | "gallery";
  path: string;
  altText: string;
  sortOrder: number;
};

export function MediaManager({
  invitationId,
  media,
}: {
  invitationId: string;
  media: InvitationMediaItem[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string>();
  const [busy, setBusy] = useState(false);
  const cover = media.find((item) => item.kind === "cover");
  const gallery = media.filter((item) => item.kind === "gallery");

  async function upload(formData: FormData) {
    setBusy(true);
    setMessage(undefined);
    const response = await fetch(`/api/invitations/${invitationId}/media`, {
      method: "POST",
      body: formData,
    });
    const result = (await response.json()) as { message?: string };
    setBusy(false);
    setMessage(
      result.message ??
        (response.ok
          ? "Foto berhasil diunggah."
          : "Foto belum dapat diunggah."),
    );
    if (response.ok) router.refresh();
  }

  async function remove(mediaId: string) {
    setBusy(true);
    setMessage(undefined);
    const response = await fetch(
      `/api/invitations/${invitationId}/media/${mediaId}`,
      { method: "DELETE" },
    );
    const result = (await response.json()) as { message?: string };
    setBusy(false);
    setMessage(
      result.message ??
        (response.ok ? "Foto berhasil dihapus." : "Foto belum dapat dihapus."),
    );
    if (response.ok) router.refresh();
  }

  return (
    <section className="space-y-5 rounded-2xl border border-stone-200 p-5">
      <div>
        <h2 className="text-lg font-semibold text-stone-950">Media undangan</h2>
        <p className="mt-1 text-sm leading-6 text-stone-600">
          Maksimal 1 foto sampul dan 10 foto galeri. JPEG, PNG, atau WebP;
          maksimal 5 MB per file.
        </p>
      </div>
      {message ? (
        <p role="status" className="rounded-xl bg-stone-100 px-4 py-3 text-sm">
          {message}
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <MediaUploadForm
          kind="cover"
          label="Unggah foto sampul"
          disabled={busy || Boolean(cover)}
          onUpload={upload}
        />
        <MediaUploadForm
          kind="gallery"
          label="Tambah foto galeri"
          disabled={busy || gallery.length >= 10}
          onUpload={upload}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {media.map((item) => (
          <article
            key={item.id}
            className="overflow-hidden rounded-xl border border-stone-200 bg-stone-50"
          >
            <Image
              src={`/api/invitations/${invitationId}/media/${item.id}`}
              alt={
                item.altText ||
                (item.kind === "cover" ? "Foto sampul" : "Foto galeri")
              }
              width={640}
              height={480}
              unoptimized
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="flex items-center justify-between gap-3 p-3">
              <span className="text-xs font-semibold text-stone-600 uppercase">
                {item.kind === "cover"
                  ? "Sampul"
                  : `Galeri ${item.sortOrder + 1}`}
              </span>
              <button
                type="button"
                disabled={busy}
                onClick={() => remove(item.id)}
                className="text-sm font-semibold text-red-700 hover:underline disabled:opacity-50"
              >
                Hapus
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function MediaUploadForm({
  kind,
  label,
  disabled,
  onUpload,
}: {
  kind: "cover" | "gallery";
  label: string;
  disabled: boolean;
  onUpload: (formData: FormData) => Promise<void>;
}) {
  return (
    <form action={onUpload} className="space-y-3 rounded-xl bg-stone-50 p-4">
      <input type="hidden" name="kind" value={kind} />
      <label className="block space-y-2 text-sm font-medium text-stone-800">
        <span>{label}</span>
        <input
          type="file"
          name="file"
          accept="image/jpeg,image/png,image/webp"
          required
          disabled={disabled}
          className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-rose-100 file:px-3 file:py-2 file:font-semibold file:text-rose-900"
        />
      </label>
      <label className="block space-y-2 text-sm font-medium text-stone-800">
        <span>Teks alternatif</span>
        <input
          name="altText"
          maxLength={150}
          disabled={disabled}
          className="min-h-11 w-full rounded-xl border border-stone-300 px-3"
        />
      </label>
      <button
        type="submit"
        disabled={disabled}
        className="inline-flex min-h-10 items-center rounded-lg bg-stone-900 px-4 text-sm font-semibold text-white disabled:opacity-40"
      >
        Unggah
      </button>
    </form>
  );
}
