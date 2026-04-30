import { Check, ChevronsUpDown, Building2 } from "lucide-react";
import { useState } from "react";
import { useClient } from "@/contexts/ClientContext";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

export function ClientSwitcher() {
  const { clients, currentClient, setCurrentClientId } = useClient();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [open, setOpen] = useState(false);

  if (clients.length === 0) return null;

  // Single-client users get a static label, not a noisy combobox.
  if (clients.length === 1) {
    return (
      <div
        className={cn(
          "mx-2 mb-2 mt-1 flex items-center gap-2 rounded-lg border border-sidebar-border bg-sidebar-accent/40 px-2.5 py-2",
          collapsed && "justify-center px-1.5",
        )}
        title={currentClient?.client_name}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-primary text-primary-foreground">
          <Building2 className="h-3.5 w-3.5" />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold text-sidebar-foreground">
              {currentClient?.client_name}
            </div>
            <div className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">
              {currentClient?.base_currency}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "mx-2 mb-2 mt-1 h-auto w-[calc(100%-1rem)] justify-between border border-sidebar-border bg-sidebar-accent/40 px-2.5 py-2 text-left hover:bg-sidebar-accent",
            collapsed && "w-auto justify-center px-1.5",
          )}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-primary text-primary-foreground">
              <Building2 className="h-3.5 w-3.5" />
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-semibold text-sidebar-foreground">
                  {currentClient?.client_name ?? "Select client"}
                </div>
                <div className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">
                  {currentClient ? currentClient.base_currency : `${clients.length} clients`}
                </div>
              </div>
            )}
          </div>
          {!collapsed && <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search clients…" />
          <CommandList>
            <CommandEmpty>No clients found.</CommandEmpty>
            <CommandGroup>
              {clients.map((client) => (
                <CommandItem
                  key={client.id}
                  value={`${client.client_name} ${client.slug}`}
                  onSelect={() => {
                    setCurrentClientId(client.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "me-2 h-4 w-4",
                      currentClient?.id === client.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{client.client_name}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {client.base_currency} · {client.direction.toUpperCase()}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
