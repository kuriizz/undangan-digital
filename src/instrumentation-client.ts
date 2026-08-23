import * as Sentry from "@sentry/nextjs";

import { sentryPrivacyOptions } from "./lib/observability/sentry-options";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  ...sentryPrivacyOptions,
  dsn,
  enabled: Boolean(dsn),
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
