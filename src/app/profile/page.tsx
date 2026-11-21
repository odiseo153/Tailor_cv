"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import type { Session } from "@/lib/auth";
import ProfessionalProfile from "@/app/components/Profile/ProfessionalProfile";
import { Loading } from "../components/Loading";

interface Template {
  id: string;
  name: string;
  preview_image?: string | null;
}

async function fetchJson(url: string) {
  try {
    const response = await fetch(url);
    return response.ok ? await response.json() : null;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return null;
  }
}

function TemplateGrid({ title, templates }: { title: string; templates: Template[] }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      {templates.length === 0 ? (
        <p className="text-sm text-muted-foreground">—</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {templates.map((template) => (
            <Link
              key={template.id}
              href={`/templates/${template.id}`}
              className="rounded-xl border bg-card p-4 text-sm font-medium shadow-sm transition-shadow hover:shadow-md"
            >
              {template.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Profile() {
  const { data: session, status } = useSession() as {
    data: Session | null;
    status: "loading" | "authenticated" | "unauthenticated";
  };
  const router = useRouter();
  const [userTemplates, setUserTemplates] = useState<Template[]>([]);
  const [publicTemplates, setPublicTemplates] = useState<Template[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetchJson(`/api/user/templates/${session.user.id}`).then((data) => setUserTemplates(Array.isArray(data) ? data : []));
    fetchJson(`/api/templates`).then((data) => setPublicTemplates(data?.templates ?? []));
  }, [session?.user?.id]);

  if (status === "loading") {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-6xl px-4 py-10">
        <ProfessionalProfile>
          <section className="space-y-6">
            <h2 className="flex items-baseline gap-3">
              <span className="font-serif text-sm italic text-muted-foreground">05</span>
              <span className="text-2xl font-semibold tracking-tight">Plantillas</span>
            </h2>
            <TemplateGrid title="Mis Plantillas" templates={userTemplates} />
            <TemplateGrid title="Plantillas Públicas" templates={publicTemplates} />
          </section>
        </ProfessionalProfile>
      </div>
    </div>
  );
}
