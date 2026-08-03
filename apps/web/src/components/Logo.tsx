import { Sprout } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 font-bold text-lg ${className}`}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
        <Sprout className="h-4 w-4" />
      </span>
      <span className="text-foreground">
        Green<span className="text-primary">Tech</span>
      </span>
    </div>
  );
}