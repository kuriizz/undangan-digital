import { spawnSync } from "node:child_process";

const container = "supabase_db_undangan-digital";
const verificationDatabase = "undangan_restore_verification";
const archive = "/tmp/undangan-digital-restore-test.dump";

function run(args, options = {}) {
  const result = spawnSync("docker", args, {
    encoding: "utf8",
    stdio: options.capture ? "pipe" : "inherit",
  });
  if (result.status !== 0) {
    throw new Error(`Restore check failed: docker ${args.join(" ")}`);
  }
  return result.stdout?.trim();
}

run([
  "exec",
  container,
  "dropdb",
  "-U",
  "postgres",
  "--if-exists",
  verificationDatabase,
]);

try {
  run([
    "exec",
    container,
    "pg_dump",
    "-U",
    "postgres",
    "-d",
    "postgres",
    "--format=custom",
    "--no-owner",
    "--no-privileges",
    "--exclude-schema=realtime",
    "--exclude-schema=vault",
    "--exclude-extension=supabase_vault",
    `--file=${archive}`,
  ]);
  run(["exec", container, "createdb", "-U", "postgres", verificationDatabase]);
  run([
    "exec",
    container,
    "pg_restore",
    "-U",
    "postgres",
    "-d",
    verificationDatabase,
    "--no-owner",
    "--no-privileges",
    archive,
  ]);
  const restored = run(
    [
      "exec",
      container,
      "psql",
      "-U",
      "postgres",
      "-d",
      verificationDatabase,
      "-At",
      "-c",
      "select to_regclass('public.invitations') is not null and to_regclass('public.guests') is not null and to_regclass('public.abuse_reports') is not null",
    ],
    { capture: true },
  );
  if (restored !== "t")
    throw new Error("Restored database is missing required tables.");
  process.stdout.write(
    "Database backup restored successfully into an isolated verification database.\n",
  );
} finally {
  run([
    "exec",
    container,
    "dropdb",
    "-U",
    "postgres",
    "--if-exists",
    verificationDatabase,
  ]);
  run(["exec", container, "rm", "-f", archive]);
}
