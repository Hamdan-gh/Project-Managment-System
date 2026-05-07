import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    label: string;
    type: "increase" | "decrease" | "neutral";
  };
  className?: string;
  variant?: "default" | "success" | "warning" | "destructive";
}

export function StatCard({
  title,
  value,
  icon,
  description,
  trend,
  className,
  variant = "default"
}: StatCardProps) {
  const getTrendIcon = () => {
    switch (trend?.type) {
      case "increase":
        return <TrendingUp className="h-3 w-3" />;
      case "decrease":
        return <TrendingDown className="h-3 w-3" />;
      default:
        return <Minus className="h-3 w-3" />;
    }
  };

  const getTrendColor = () => {
    switch (trend?.type) {
      case "increase":
        return "text-green-600 dark:text-green-400";
      case "decrease":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-muted-foreground";
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/50";
      case "warning":
        return "border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/50";
      case "destructive":
        return "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50";
      default:
        return "border-border bg-card";
    }
  };

  return (
    <Card className={cn("transition-all duration-200 hover:shadow-md", getVariantStyles(), className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {icon && (
                <div className="h-8 w-8 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                  {icon}
                </div>
              )}
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">{value}</p>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
          {trend && (
            <div className="text-right">
              <div className={cn("flex items-center gap-1 text-xs font-medium", getTrendColor())}>
                {getTrendIcon()}
                <span>{trend.value > 0 ? "+" : ""}{trend.value}%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{trend.label}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}