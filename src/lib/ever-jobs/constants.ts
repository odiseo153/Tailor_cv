export const EVER_JOBS_FALLBACK_ALLOWED_SITES = [
  "google",
  "indeed",
  "remoteok",
  "remotive",
  "arbeitnow",
  "weworkremotely",
  "jobicy",
  "himalayas",
  "themuse",
] as const;

export const EVER_JOBS_DEFAULT_SELECTED_SITES = [
  "google",
  "indeed",
  "remoteok",
] as const;

export const EVER_JOBS_SITE_OPTIONS = [
  { value: "google", label: "Google" },
  { value: "indeed", label: "Indeed" },
  { value: "remoteok", label: "Remote OK" },
  { value: "remotive", label: "Remotive" },
  { value: "arbeitnow", label: "Arbeitnow" },
  { value: "weworkremotely", label: "We Work Remotely" },
  { value: "jobicy", label: "Jobicy" },
  { value: "himalayas", label: "Himalayas" },
  { value: "themuse", label: "The Muse" },
] as const;

export const EVER_JOBS_MAX_PAGE_SIZE = 20;
export const EVER_JOBS_DEFAULT_TIMEOUT_MS = 45000;
