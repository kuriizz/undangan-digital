import * as Sentry from "@sentry/nextjs";

import { sentryPrivacyOptions } from "./src/lib/observability/sentry-options";

const dsn = process.env.SENTRY_DSN;

Sentry.init({
  ...sentryPrivacyOptions,
  dsn,
  enabled: Boolean(dsn),
  environment: process.env.SENTRY_ENVIRONMENT,
  release: process.env.SENTRY_RELEASE,
});
