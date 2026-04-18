"use client";

import { Loader2, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { EVER_JOBS_SITE_OPTIONS } from "@/lib/ever-jobs/constants";

type JobSearchFormValues = {
  searchTerm: string;
  location: string;
  isRemote: boolean;
  pageSize: number;
  sites: string[];
};

type JobSearchFormProps = {
  values: JobSearchFormValues;
  availableSites: string[];
  onChange: (nextValues: JobSearchFormValues) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isDisabled: boolean;
  validationMessage: string | null;
  t: (key: string) => string;
};

export default function JobSearchForm({
  values,
  availableSites,
  onChange,
  onSubmit,
  isSubmitting,
  isDisabled,
  validationMessage,
  t,
}: JobSearchFormProps) {
  const siteOptions = EVER_JOBS_SITE_OPTIONS.filter((site) =>
    availableSites.includes(site.value),
  );

  const toggleSite = (site: string, checked: boolean) => {
    const sites = checked
      ? [...values.sites, site]
      : values.sites.filter((selectedSite) => selectedSite !== site);

    onChange({
      ...values,
      sites,
    });
  };

  return (
    <Card className="border-slate-200 shadow-lg shadow-slate-200/60">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl text-slate-900">
          {t("job_search.form.title")}
        </CardTitle>
        <p className="text-sm leading-6 text-slate-600">
          {t("job_search.form.description")}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="job-search-term">
            {t("job_search.form.search_term_label")}
          </Label>
          <Input
            id="job-search-term"
            value={values.searchTerm}
            disabled={isDisabled}
            onChange={(event) =>
              onChange({
                ...values,
                searchTerm: event.target.value,
              })
            }
            placeholder={t("job_search.form.search_term_placeholder")}
            maxLength={120}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="job-location">
            {t("job_search.form.location_label")}
          </Label>
          <Input
            id="job-location"
            value={values.location}
            disabled={isDisabled}
            onChange={(event) =>
              onChange({
                ...values,
                location: event.target.value,
              })
            }
            placeholder={t("job_search.form.location_placeholder")}
            maxLength={120}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="space-y-1">
            <Label htmlFor="job-remote">{t("job_search.form.remote_label")}</Label>
            <p className="text-xs text-slate-500">
              {t("job_search.form.remote_hint")}
            </p>
          </div>
          <Switch
            id="job-remote"
            checked={values.isRemote}
            disabled={isDisabled}
            onCheckedChange={(checked) =>
              onChange({
                ...values,
                isRemote: checked,
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="job-page-size">
            {t("job_search.form.results_label")}
          </Label>
          <Select
            value={String(values.pageSize)}
            disabled={isDisabled}
            onValueChange={(value) =>
              onChange({
                ...values,
                pageSize: Number(value),
              })
            }
          >
            <SelectTrigger id="job-page-size">
              <SelectValue placeholder={t("job_search.form.results_placeholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-slate-900">
            {t("job_search.form.sources_label")}
          </legend>
          <p className="text-xs text-slate-500">
            {t("job_search.form.sources_hint")}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {siteOptions.map((site) => {
              const checked = values.sites.includes(site.value);

              return (
                <label
                  key={site.value}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <Checkbox
                    checked={checked}
                    disabled={isDisabled}
                    onCheckedChange={(nextChecked) =>
                      toggleSite(site.value, Boolean(nextChecked))
                    }
                    aria-label={site.label}
                  />
                  <span className="text-slate-700">{site.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {validationMessage ? (
          <p className="text-sm text-red-600">{validationMessage}</p>
        ) : null}

        <Button
          type="button"
          onClick={onSubmit}
          className="w-full"
          disabled={isSubmitting || isDisabled}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("job_search.states.loading")}
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              {t("job_search.form.submit")}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
