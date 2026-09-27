export interface JobOfferAnalysis {
  skills: string[];
  requisitos: string[];
  seniority: string;
  keywords: string[];
  jobTitle: string;
  description: string;
}

export function validateJobOfferAnalysis(value: unknown): JobOfferAnalysis {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Job offer analysis returned an invalid structure");
  }

  const result = value as Record<string, unknown>;
  const arraysAreValid = ["skills", "requisitos", "keywords"].every(
    (key) =>
      Array.isArray(result[key]) &&
      (result[key] as unknown[]).every((item) => typeof item === "string"),
  );

  if (
    !arraysAreValid ||
    typeof result.seniority !== "string" ||
    typeof result.jobTitle !== "string" ||
    typeof result.description !== "string"
  ) {
    throw new Error("Job offer analysis returned an invalid structure");
  }

  return result as unknown as JobOfferAnalysis;
}
