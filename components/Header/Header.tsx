"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const pageNames: Record<string, string> = {
  "/": "Início",
  "/dashboard": "Dashboard",
  "/conta": "Conta",
  "/alimentadores": "Alimentadores",
};

type HeaderAction =
  | {
      type: "button";
      label: string;
      icon?: ReactNode;
      onClick: () => void;
      variant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
      circular?: boolean;
    }
  | {
      type: "select";
      placeholder: string;
      value?: string;
      options: { label: string; value: string }[];
      onChange: (value: string | null) => void;
      width?: string;
    };

interface HeaderProps {
  actions?: HeaderAction[];
}

export default function Header({ actions = [] }: HeaderProps) {
  const pathname = usePathname();

  const name =
    Object.entries(pageNames).find(
      ([route]) =>
        pathname === route || (route !== "/" && pathname.startsWith(`${route}/`))
    )?.[1] || "Início";

  return (
    <header className="mx-auto flex min-h-24 w-full max-w-4xl items-center justify-between gap-4 px-6 lg:px-0">
      <h1 className="text-3xl font-light">{name}</h1>

      {actions.length > 0 && (
        <div className="flex items-center gap-2">
          {actions.map((action, index) => {
            if (action.type === "select") {
              return (
                <Select
                  key={index}
                  value={action.value}
                  onValueChange={action.onChange}
                >
                  <SelectTrigger className={action.width ?? "w-[160px]"}>
                    <SelectValue placeholder={action.placeholder} />
                  </SelectTrigger>

                  <SelectContent>
                    {action.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              );
            }

            return (
              <Button
                key={index}
                type="button"
                variant={action.variant ?? "default"}
                size={action.circular ? "icon" : "default"}
                className={action.circular ? "shrink-0 rounded-full cursor-pointer" : "shrink-0 cursor-pointer"}
                onClick={action.onClick}
                aria-label={action.circular ? action.label : undefined}
                title={action.circular ? action.label : undefined}
              >
                {action.icon}
                {!action.circular && action.label}
              </Button>
            );
          })}
        </div>
      )}
    </header>
  );
}