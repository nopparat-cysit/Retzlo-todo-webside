import { cn } from "@/lib/utils";

interface VitalPanelProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function VitalPanel({ title, icon, children, className }: VitalPanelProps) {
  return (
    <div className={cn(
      "lofi-panel group relative overflow-hidden rounded-3xl border border-white/10 bg-[#0f0a1f]/90 p-6 backdrop-blur-xl transition-all duration-300 hover:border-dusk-lavender/30",
      className
    )}>
      <div className="mb-4 flex items-center gap-3">
        {icon && (
          <div className="rounded-2xl bg-dusk-lavender/10 p-2.5 text-dusk-lavender">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-medium text-[#f5efe6]">{title}</h3>
      </div>
      <div className="text-[#f5efe6]/90">
        {children}
      </div>
      <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-gradient-to-br from-dusk-lavender/5 to-transparent opacity-30" />
    </div>
  );
}
