export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 text-lg font-bold ${className}`}>
      <img src="/images/favicon.png" alt="GreenTech" className="h-9 w-9 object-contain" />

      <span className="text-foreground">
        Green<span className="text-primary">Tech</span>
      </span>
    </div>
  );
}
