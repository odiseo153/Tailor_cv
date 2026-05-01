"use client";

import { Check, ChevronDown, Sparkles } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { AccordionItem, AIModel, ProviderIcon, ProviderId, PROVIDERS_CONFIG } from "../types";

type Props = {
  aiModels: AIModel[];
  selectedModel: string;
  modelSearchOpen: boolean;
  modelSearchQuery: string;
  browsingProvider: ProviderId | null;
  setModelSearchOpen: (open: boolean) => void;
  setModelSearchQuery: (value: string) => void;
  setBrowsingProvider: (provider: ProviderId | null) => void;
  setSelectedModel: (value: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  title: string;
  placeholder: string;
  searchPlaceholder: string;
  noResults: string;
  description: string;
};

export function ModelSelector(props: Props) {
  const {
    aiModels,
    selectedModel,
    modelSearchOpen,
    modelSearchQuery,
    browsingProvider,
    setModelSearchOpen,
    setModelSearchQuery,
    setBrowsingProvider,
    setSelectedModel,
    isOpen,
    onToggle,
    title,
    placeholder,
    searchPlaceholder,
    noResults,
    description,
  } = props;

  const filteredModels = aiModels.filter((m) =>
    `${m.provider} ${m.id} ${m.name}`.toLowerCase().includes(modelSearchQuery.toLowerCase()),
  );

  return (
    <AccordionItem title={title} icon={Sparkles} isOpen={isOpen} onToggle={onToggle}>
      <Popover
        open={modelSearchOpen}
        onOpenChange={(open) => {
          setModelSearchOpen(open);
          if (!open) {
            setModelSearchQuery("");
            setBrowsingProvider(null);
          }
        }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 whitespace-nowrap rounded-md border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <span className="flex items-center gap-2 min-w-0">
              {selectedModel && selectedModel !== "auto" ? (
                (() => {
                  const model = aiModels.find((x) => `${x.provider}:${x.id}` === selectedModel);
                  return model ? (
                    <>
                      <ProviderIcon provider={model.provider} size={18} />
                      <span className="truncate">{model.name}</span>
                      <span className="text-xs text-gray-400 shrink-0 capitalize">{model.provider}</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">{selectedModel}</span>
                  );
                })()
              ) : selectedModel === "auto" ? (
                <span className="text-gray-700">Auto (fallback)</span>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
          </button>
        </PopoverTrigger>

        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 overflow-hidden" align="start">
          <div className="border-b">
            <Input
              placeholder={searchPlaceholder}
              value={modelSearchQuery}
              onChange={(e) => {
                setModelSearchQuery(e.target.value);
                if (e.target.value) setBrowsingProvider(null);
              }}
              className="border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
            />
          </div>

          {modelSearchQuery ? (
            <div className="max-h-64 overflow-auto">
              {"auto (fallback)".includes(modelSearchQuery.toLowerCase()) && (
                <SelectableAuto selectedModel={selectedModel} onSelect={() => setSelectedModel("auto")} close={() => setModelSearchOpen(false)} />
              )}

              {filteredModels.map((model) => {
                const value = `${model.provider}:${model.id}`;
                return (
                  <button
                    key={value}
                    type="button"
                    className="relative flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent"
                    onClick={() => {
                      setSelectedModel(value);
                      setModelSearchOpen(false);
                      setModelSearchQuery("");
                    }}
                  >
                    <ProviderIcon provider={model.provider} size={16} />
                    <span className="flex-1 text-left truncate">{model.name}</span>
                    <span className="text-xs text-gray-400 capitalize shrink-0">{model.provider}</span>
                    {selectedModel === value && <Check className="h-3.5 w-3.5 shrink-0" />}
                  </button>
                );
              })}

              {filteredModels.length === 0 && !"auto (fallback)".includes(modelSearchQuery.toLowerCase()) && (
                <p className="py-6 text-center text-sm text-muted-foreground">{noResults}</p>
              )}
            </div>
          ) : browsingProvider ? (
            <>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:bg-gray-50 border-b"
                onClick={() => setBrowsingProvider(null)}
              >
                <ChevronDown className="h-3 w-3 rotate-90" />
                <ProviderIcon provider={browsingProvider} size={14} />
                <span className="capitalize font-medium">
                  {PROVIDERS_CONFIG.find((p) => p.id === browsingProvider)?.name ?? browsingProvider}
                </span>
                <span className="ml-auto text-gray-400">
                  {aiModels.filter((m) => m.provider === browsingProvider).length} models
                </span>
              </button>
              <div className="max-h-64 overflow-auto">
                {aiModels
                  .filter((m) => m.provider === browsingProvider)
                  .map((model) => {
                    const value = `${model.provider}:${model.id}`;
                    return (
                      <button
                        key={value}
                        type="button"
                        className="relative flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent"
                        onClick={() => {
                          setSelectedModel(value);
                          setModelSearchOpen(false);
                          setBrowsingProvider(null);
                        }}
                      >
                        <span className="flex-1 text-left truncate">{model.name}</span>
                        {selectedModel === value && <Check className="h-3.5 w-3.5 shrink-0" />}
                      </button>
                    );
                  })}
              </div>
            </>
          ) : (
            <div className="p-2">
              <SelectableAuto selectedModel={selectedModel} onSelect={() => setSelectedModel("auto")} close={() => setModelSearchOpen(false)} fancy />
              <p className="text-[10px] text-gray-400 px-2 pb-1 uppercase tracking-wider font-medium">Providers</p>
              <div className="grid grid-cols-2 gap-1.5">
                {PROVIDERS_CONFIG.map((provider) => {
                  const count = aiModels.filter((m) => m.provider === provider.id).length;
                  const isSelected = selectedModel.startsWith(`${provider.id}:`);

                  return (
                    <button
                      key={provider.id}
                      type="button"
                      onClick={() => setBrowsingProvider(provider.id as ProviderId)}
                      style={isSelected ? { borderColor: provider.color } : undefined}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors text-left ${
                        isSelected ? "bg-gray-50" : "border-gray-200"
                      }`}
                    >
                      <ProviderIcon provider={provider.id} size={22} />
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 text-xs leading-tight">{provider.name}</p>
                        <p className="text-[10px] text-gray-400">{count > 0 ? `${count} models` : "Loading..."}</p>
                      </div>
                      <ChevronDown className="ml-auto h-3 w-3 -rotate-90 text-gray-400 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
      <p className="text-xs text-gray-500 mt-2">{description}</p>
    </AccordionItem>
  );
}

function SelectableAuto({
  selectedModel,
  onSelect,
  close,
  fancy = false,
}: {
  selectedModel: string;
  onSelect: () => void;
  close: () => void;
  fancy?: boolean;
}) {
  return (
    <button
      type="button"
      className={`relative flex w-full items-center gap-2 text-sm hover:bg-accent ${
        fancy
          ? "rounded-md px-3 py-2 mb-1 border border-transparent hover:border-gray-100"
          : "rounded-sm px-3 py-2"
      }`}
      onClick={() => {
        onSelect();
        close();
      }}
    >
      {fancy && (
        <span className="inline-flex h-[20px] w-[20px] items-center justify-center rounded bg-gray-100 text-[9px] font-bold text-gray-500 shrink-0">
          *
        </span>
      )}
      <span className="flex-1 text-left">Auto (fallback)</span>
      {selectedModel === "auto" && <Check className={`shrink-0 ${fancy ? "h-3.5 w-3.5 text-blue-600" : "h-3.5 w-3.5"}`} />}
    </button>
  );
}
