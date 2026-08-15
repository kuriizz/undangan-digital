type AuthMessageProps = {
  error?: string | string[];
  success?: string | string[];
};

export function AuthMessage({ error, success }: AuthMessageProps) {
  const candidate = error ?? success;
  const message = Array.isArray(candidate) ? candidate[0] : candidate;

  if (!message) {
    return null;
  }

  return (
    <p
      role={error ? "alert" : "status"}
      className={`rounded-xl border px-4 py-3 text-sm ${
        error
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-emerald-200 bg-emerald-50 text-emerald-800"
      }`}
    >
      {message}
    </p>
  );
}
