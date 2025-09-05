import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'warning';
  trend?: {
    value: number;
    label: string;
  };
}

export const StatsCard = ({
  title,
  value,
  description,
  icon: Icon,
  variant = 'default',
  trend
}: StatsCardProps) => {
  const variants = {
    default: 'bg-gradient-to-r from-primary to-primary-glow',
    success: 'bg-gradient-to-r from-success to-accent',
    warning: 'bg-gradient-to-r from-warning to-orange-400'
  };

  return (
    <Card className="shadow-card hover:shadow-medium transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn(
          "p-2 rounded-lg",
          variants[variant]
        )}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <span className={cn(
              "text-xs font-medium",
              trend.value > 0 ? "text-success" : "text-destructive"
            )}>
              {trend.value > 0 ? "+" : ""}{trend.value}%
            </span>
            <span className="text-xs text-muted-foreground ml-1">
              {trend.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};