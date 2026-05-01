"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarDays, FileText, Filter } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loading } from "../components/Loading";

type HistoryStatus = "pending" | "applied" | "interview" | "rejected" | "hired";

type HistoryItem = {
  id: string;
  status: HistoryStatus;
  html_data: string;
  offer: string;
  createdAt: string;
  updatedAt: string;
  cv_template_id: string | null;
  cv_template?: {
    id: string;
    name: string;
    preview_image: string | null;
  } | null;
};

const statusOptions: HistoryStatus[] = [
  "pending",
  "applied",
  "interview",
  "rejected",
  "hired",
];

const statusClasses: Record<HistoryStatus, string> = {
  pending: "bg-slate-100 text-slate-700",
  applied: "bg-blue-100 text-blue-700",
  interview: "bg-amber-100 text-amber-700",
  rejected: "bg-rose-100 text-rose-700",
  hired: "bg-emerald-100 text-emerald-700",
};

export default function CVHistoryPage() {
  const [histories, setHistories] = useState<HistoryItem[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadHistories = async () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);

    const response = await fetch(`/api/cv-histories?${params.toString()}`);
    const payload = await response.json();
    const nextHistories = payload.histories ?? [];
    setHistories(nextHistories);
    setSelectedHistoryId((current) => current || nextHistories[0]?.id || "");
    setIsLoading(false);
  };

  useEffect(() => {
    loadHistories();
  }, [statusFilter, fromDate, toDate]);

  const selectedHistory = useMemo(
    () => histories.find((item) => item.id === selectedHistoryId) ?? null,
    [histories, selectedHistoryId],
  );

  const updateStatus = async (id: string, status: HistoryStatus) => {
    await fetch("/api/cv-histories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });

    setHistories((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item)),
    );
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <div className="mx-auto  px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-stone-900">
              Historial de vacantes
            </h1>
            <p className="text-sm text-stone-600">
              Revisa cada CV generado, su estado de proceso y el contenido
              asociado.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
                <Filter className="mr-1 inline h-3.5 w-3.5" />
                Estado
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
                Desde
              </label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
                Hasta
              </label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-white"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <Card className="border-stone-200 bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Vacantes guardadas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {histories.length === 0 ? (
                <p className="text-sm text-stone-500">
                  Aún no tienes historiales guardados.
                </p>
              ) : (
                histories.map((history) => (
                  <button
                    key={history.id}
                    onClick={() => setSelectedHistoryId(history.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      selectedHistoryId === history.id
                        ? "border-stone-900 bg-stone-900 text-white"
                        : "border-stone-200 bg-stone-50 hover:border-stone-300"
                    }`}
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-sm font-medium">
                          {history.offer}
                        </p>
                        <p className="mt-1 text-xs opacity-70">
                          {format(new Date(history.createdAt), "MMM d, yyyy")}
                        </p>
                      </div>
                      <Badge
                        className={
                          selectedHistoryId === history.id
                            ? "bg-white/15 text-white"
                            : statusClasses[history.status]
                        }
                      >
                        {history.status}
                      </Badge>
                    </div>
                    <p className="text-xs opacity-70">
                      {history.cv_template?.name ?? "Sin plantilla explícita"}
                    </p>
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-stone-200 bg-white w-full">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="text-lg">Detalle del CV</CardTitle>
                {selectedHistory && (
                  <p className="mt-1 text-sm text-stone-500">
                    Creado el{" "}
                    {format(new Date(selectedHistory.createdAt), "MMM d, yyyy")}
                  </p>
                )}
              </div>
              {selectedHistory && (
                <Select
                  value={selectedHistory.status}
                  onValueChange={(value) =>
                    updateStatus(selectedHistory.id, value as HistoryStatus)
                  }
                >
                  <SelectTrigger className="w-[170px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardHeader>
            <CardContent>
              {!selectedHistory ? (
                <div className="flex min-h-[540px] flex-col items-center justify-center rounded-3xl border border-dashed border-stone-300 bg-stone-50 text-center">
                  <FileText className="mb-3 h-10 w-10 text-stone-400" />
                  <p className="text-sm text-stone-500">
                    Selecciona un historial para ver el preview y el detalle
                    completo.
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="overflow-hidden rounded-3xl border border-stone-200">
                    <iframe
                      srcDoc={selectedHistory.html_data}
                      title="CV preview"
                      className="h-full w-full bg-white"
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-3xl border border-stone-200 bg-stone-50 p-4">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                        Oferta original
                      </p>
                      <p className="whitespace-pre-wrap text-sm text-stone-700">
                        {selectedHistory.offer}
                      </p>
                    </div>
                    <div className="rounded-3xl border border-stone-200 bg-stone-50 p-4">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                        Plantilla
                      </p>
                      <p className="text-sm text-stone-700">
                        {selectedHistory.cv_template?.name ?? "Sin plantilla"}
                      </p>
                    </div>
                    <div className="rounded-3xl border border-stone-200 bg-stone-50 p-4">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                        Última actualización
                      </p>
                      <p className="text-sm text-stone-700">
                        <CalendarDays className="mr-2 inline h-4 w-4" />
                        {format(
                          new Date(selectedHistory.updatedAt),
                          "MMM d, yyyy",
                        )}
                      </p>
                    </div>
                    <Button
                      asChild
                      className="w-full bg-stone-900 hover:bg-stone-800"
                    >
                      <a href="/generar-cv">Crear nuevo CV</a>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
