export type TailorCVJob = {
  id: string;
  title: string;
  companyName: string | null;
  locationLabel: string | null;
  isRemote: boolean;
  source: string | null;
  jobUrl: string;
  postedAt: string | null;
  salaryLabel: string | null;
  descriptionSnippet: string | null;
  logoUrl: string | null;
};

export type JobSearchPagination = {
  count: number;
  currentPage: number;
  pageSize: number;
  totalPages: number | null;
  nextPage: number | null;
  previousPage: number | null;
};

export type TailorCVJobSearchInput = {
  searchTerm: string;
  location?: string;
  isRemote?: boolean;
  page?: number;
  pageSize?: number;
  sites?: string[];
};

export type TailorCVJobSearchResult = {
  jobs: TailorCVJob[];
  pagination: JobSearchPagination;
  cached: boolean;
};
