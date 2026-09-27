import { format, parseISO } from "date-fns";

/**
 * Heuristic list of language names (English + Spanish spellings, accent-free)
 * used to separate spoken languages from technical skills.
 */
const LANGUAGE_NAMES = new Set([
  // English
  "english", "spanish", "french", "german", "italian", "portuguese", "chinese",
  "japanese", "korean", "russian", "arabic", "dutch", "polish", "swedish",
  "norwegian", "danish", "finnish", "greek", "turkish", "hindi", "catalan",
  "galician", "basque", "ukrainian", "czech", "romanian", "hebrew", "thai",
  "vietnamese", "indonesian", "malay",
  // Español
  "ingles", "espanol", "frances", "aleman", "italiano", "portugues", "chino",
  "japones", "coreano", "ruso", "arabe", "neerlandes", "holandes", "polaco",
  "sueco", "noruego", "danes", "fines", "finlandes", "griego", "turco", "hindi",
  "catalan", "gallego", "vasco", "euskera", "ucraniano", "checo", "rumano",
  "hebreo", "tailandes", "vietnamita", "indonesio", "malayo",
]);

export interface CandidateProfile {
  demoMode?: boolean;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  links: { platform: string; url: string }[];
  workExperience: {
    jobTitle: string;
    company: string;
    dates?: string;
    description?: string;
  }[];
  education: {
    degree: string;
    institution: string;
    dates?: string;
  }[];
  skills: { name: string; level?: number }[];
  languages: string[];
  preferences?: {
    primaryColor?: string;
    fontFamily?: string;
    showPhoto?: boolean;
    showContact?: boolean;
    showSocial?: boolean;
  };
}

export function hasCandidateDetails(profile: CandidateProfile): boolean {
  return Boolean(
    profile.workExperience.length ||
    profile.education.length ||
    profile.skills.length ||
    profile.languages.length,
  );
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function formatDate(value?: string | null): string {
  if (!value) return "";
  const parsed = parseISO(value);
  if (Number.isNaN(parsed.getTime())) return value;
  try {
    return format(parsed, "MMM yyyy");
  } catch {
    return value;
  }
}

function formatRange(start?: string | null, end?: string | null): string {
  const from = formatDate(start);
  const to = end ? formatDate(end) : "Present";
  if (!from) return to === "Present" ? "" : to;
  return `${from} – ${to}`;
}

/**
 * Maps the raw user record (from /api/apiHandler/user/:id) into a clean,
 * CV-ready candidate profile: only recruiter-relevant fields, human-readable
 * dates, languages separated from technical skills, and design preferences.
 */
export function buildCandidateProfile(user: any): CandidateProfile {
  if (!user) {
    return {
      links: [],
      workExperience: [],
      education: [],
      skills: [],
      languages: [],
    };
  }

  const rawSkills = Array.isArray(user.skills) ? user.skills : [];
  const skills: { name: string; level?: number }[] = rawSkills
    .filter(
      (s: any) => s && typeof s.name === "string" && s.name.trim().length > 0,
    )
    .map((s: any) => ({
      name: s.name.trim(),
      level: typeof s.level === "number" ? s.level : undefined,
    }));

  const languages: string[] = [];
  const technicalSkills = skills.filter((skill) => {
    const firstWord = normalize(skill.name).split(/[^a-z]+/)[0];
    if (LANGUAGE_NAMES.has(firstWord)) {
      languages.push(skill.name);
      return false;
    }
    return true;
  });

  const workExperience = (Array.isArray(user.workExperience)
    ? user.workExperience
    : []
  )
    .filter((w: any) => w && (w.jobTitle || w.company))
    .map((w: any) => ({
      jobTitle: typeof w.jobTitle === "string" ? w.jobTitle.trim() : "",
      company: typeof w.company === "string" ? w.company.trim() : "",
      dates: formatRange(w.startDate, w.endDate),
      description:
        typeof w.description === "string" && w.description.trim()
          ? w.description.trim()
          : undefined,
    }))
    .filter((w: any) => w.jobTitle || w.company || w.dates || w.description);

  const education = (Array.isArray(user.education) ? user.education : [])
    .filter((e: any) => e && (e.degree || e.institution))
    .map((e: any) => ({
      degree: typeof e.degree === "string" ? e.degree.trim() : "",
      institution:
        typeof e.institution === "string" ? e.institution.trim() : "",
      dates: formatRange(e.startDate, e.endDate),
    }));

  const links = (Array.isArray(user.socialLinks) ? user.socialLinks : [])
    .filter(
      (l: any) =>
        l &&
        typeof l.platform === "string" &&
        l.platform.trim() &&
        typeof l.url === "string" &&
        l.url.trim(),
    )
    .map((l: any) => ({ platform: l.platform.trim(), url: l.url.trim() }));

  const prefs = user.cvPreferences;
  const preferences =
    prefs && typeof prefs === "object"
      ? {
          primaryColor:
            typeof prefs.primaryColor === "string"
              ? prefs.primaryColor
              : undefined,
          fontFamily:
            typeof prefs.fontFamily === "string" ? prefs.fontFamily : undefined,
          showPhoto:
            typeof prefs.showPhoto === "boolean"
              ? prefs.showPhoto
              : undefined,
          showContact:
            typeof prefs.showContact === "boolean"
              ? prefs.showContact
              : undefined,
          showSocial:
            typeof prefs.showSocial === "boolean"
              ? prefs.showSocial
              : undefined,
        }
      : undefined;

  return {
    name: typeof user.name === "string" ? user.name : undefined,
    email: typeof user.email === "string" ? user.email : undefined,
    phone: typeof user.phone === "string" ? user.phone : undefined,
    location: typeof user.location === "string" ? user.location : undefined,
    links,
    workExperience,
    education,
    skills: technicalSkills,
    languages,
    preferences,
  };
}
