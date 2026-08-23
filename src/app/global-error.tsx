"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="id">
      <body style={{ fontFamily: "system-ui", margin: 0 }}>
        <main style={{ margin: "10vh auto", maxWidth: 560, padding: 24 }}>
          <title>Terjadi kendala | UndanganDigital</title>
          <h1>Terjadi kendala</h1>
          <p>Halaman belum dapat ditampilkan. Silakan coba kembali.</p>
          <button onClick={() => retry()} type="button">
            Coba lagi
          </button>
        </main>
      </body>
    </html>
  );
}
