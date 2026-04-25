export const EVER_JOBS_FALLBACK_ALLOWED_SITES = [
  "google",
  "indeed",
  "linkedin",
  "remoteok",
  "remotive",
  "arbeitnow",
  "weworkremotely",
  "jobicy",
  "himalayas",
  "themuse",
  "reed",
  "usajobs",
] as const;

export const EVER_JOBS_DEFAULT_SELECTED_SITES = [
  "google",
  "indeed",
  "remoteok",
  "linkedin",
] as const;

export const EVER_JOBS_SITE_OPTIONS = [
  { value: "google", label: "Google" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "indeed", label: "Indeed" },
  { value: "remoteok", label: "Remote OK" },
  { value: "remotive", label: "Remotive" },
  { value: "arbeitnow", label: "Arbeitnow" },
  { value: "weworkremotely", label: "We Work Remotely" },
  { value: "jobicy", label: "Jobicy" },
  { value: "themuse", label: "The Muse" },
  { value: "reed", label: "Reed" },
  { value: "usajobs", label: "USA Jobs" },
] as const;

export const EVER_JOBS_MAX_PAGE_SIZE = 25;
export const EVER_JOBS_DEFAULT_TIMEOUT_MS = 45000;
