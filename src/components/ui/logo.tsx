import { cn } from "@/lib/utils";

export const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <div 
      className={cn(
        "flex items-center justify-center rounded-xl bg-gradient-interactive",
        className
      )}
      style={{ 
        width: '44px', 
        height: '44px',
        boxShadow: '0 4px 14px hsl(210 78% 46% / 0.35)'
      }}
    >
      <span 
        className="text-lg font-black tracking-tight text-primary-foreground"
        style={{ 
          fontFamily: 'system-ui, -apple-system, sans-serif',
          letterSpacing: '-0.02em'
        }}
      >
        SB
      </span>
    </div>
  );
};
