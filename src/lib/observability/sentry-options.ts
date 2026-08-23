import type { Breadcrumb, ErrorEvent } from "@sentry/nextjs";

function withoutQuery(value?: string) {
  if (!value) return value;
  try {
    const url = new URL(value, "http://redacted.invalid");
    return url.origin === "http://redacted.invalid"
      ? url.pathname
      : `${url.origin}${url.pathname}`;
  } catch {
    return value.split("?")[0];
  }
}

export function redactSentryEvent(event: ErrorEvent) {
  event.user = undefined;
  event.extra = undefined;
  event.message = undefined;
  for (const exception of event.exception?.values ?? []) {
    exception.value = exception.type ?? "Application error";
  }
  if (event.request) {
    event.request.cookies = undefined;
    event.request.data = undefined;
    event.request.env = undefined;
    event.request.headers = undefined;
    event.request.query_string = undefined;
    event.request.url = withoutQuery(event.request.url);
  }
  return event;
}

export function redactSentryBreadcrumb(breadcrumb: Breadcrumb) {
  if (breadcrumb.category === "console") return null;
  breadcrumb.message = breadcrumb.message?.replace(/\?.*$/, "");
  breadcrumb.data = undefined;
  return breadcrumb;
}

export const sentryPrivacyOptions = {
  beforeBreadcrumb: redactSentryBreadcrumb,
  beforeSend: redactSentryEvent,
  enabled: false,
  maxBreadcrumbs: 20,
  sendDefaultPii: false,
  tracesSampleRate: 0.05,
};
