import { Check } from "lucide-react";

import { getPasswordRules } from "@/lib/auth-rules";
import { cn } from "@/lib/utils";

export function PasswordChecklist({ value }: { value: string }) {
  return (
    <ul className="grid grid-cols-1 gap-x-4 gap-y-1 pl-2 text-[0.7rem] text-subtle sm:grid-cols-2">
      {getPasswordRules(value).map((rule) => (
        <li
          key={rule.id}
          className={cn(
            "flex items-center gap-1.5 transition-colors",
            rule.met && "text-foreground",
          )}
        >
          <Check
            className={cn(
              "size-3 shrink-0 stroke-[2.5]",
              rule.met ? "text-brand" : "text-subtle/50",
            )}
            aria-hidden="true"
          />
          {rule.label}
        </li>
      ))}
    </ul>
  );
}
