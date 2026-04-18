import { z } from "zod";

const optionalTrimmedString = z
  .string()
  .trim()
  .max(120)
  .transform((value) => value || undefined)
  .optional();

export const JobSearchRequestSchema = z.object({
  searchTerm: z.string().trim().min(2).max(120),
  location: optionalTrimmedString,
  isRemote: z.boolean().optional().default(false),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).optional(),
  sites: z.array(z.string().trim().min(1)).max(20).optional(),
});

const EverJobsLocationSchema = z
  .object({
    city: z.string().nullable().optional(),
    state: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
  })
  .nullable()
  .optional();

const EverJobsCompensationSchema = z
  .object({
    minAmount: z.number().nullable().optional(),
    maxAmount: z.number().nullable().optional(),
    currency: z.string().nullable().optional(),
    interval: z.string().nullable().optional(),
  })
  .nullable()
  .optional();

const EverJobsJobSchema = z.object({
  id: z.union([z.string(), z.number()]),
  site: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  companyName: z.string().nullable().optional(),
  jobUrl: z.string().url(),
  location: EverJobsLocationSchema,
  description: z.string().nullable().optional(),
  compensation: EverJobsCompensationSchema,
  datePosted: z.string().nullable().optional(),
  isRemote: z.boolean().nullable().optional(),
  logoUrl: z.string().url().nullable().optional(),
});

export const EverJobsSearchResponseSchema = z.object({
  count: z.number().int().nonnegative(),
  total_pages: z.number().int().positive().nullable().optional(),
  current_page: z.number().int().positive().nullable().optional(),
  page_size: z.number().int().positive().nullable().optional(),
  jobs: z.array(EverJobsJobSchema),
  cached: z.boolean().optional().default(false),
  next_page: z.number().int().positive().nullable().optional(),
  previous_page: z.number().int().positive().nullable().optional(),
});

export type JobSearchRequestInput = z.infer<typeof JobSearchRequestSchema>;
export type EverJobsSearchResponse = z.infer<typeof EverJobsSearchResponseSchema>;
