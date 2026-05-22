import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle,
  Clock,
  Users,
  FileText,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  type: "critical" | "warning" | "info" | "success";
  category: "student" | "supervisor" | "system" | "deadline";
  title: string;
  description: string;
  timestamp: Date;
  actionLabel?: string;
  onAction?: () => void;
  metadata?: Record<string, any>;
}

interface AlertCardProps {
  alerts: Alert[];
  maxItems?: number;
  showHeader?: boolean;
  onViewAll?: () => void;
}

export function AlertCard({ alerts, maxItems = 5, showHeader = true, onViewAll }: AlertCardProps) {
  const getAlertIcon = (type: Alert["type"]) => {
    switch (type) {
      case "critical":
        return <AlertTriangle className="h-4 w-4" />;
      case "warning":
        return <AlertCircle className="h-4 w-4" />;
      case "success":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category: Alert["category"]) => {
    switch (category) {
      case "student":
        return <Users className="h-3 w-3" />;
      case "supervisor":
        return <Users className="h-3 w-3" />;
      case "system":
        return <Info className="h-3 w-3" />;
      case "deadline":
        return <Clock className="h-3 w-3" />;
      default:
        return <Info className="h-3 w-3" />;
    }
  };

  const getAlertStyles = (type: Alert["type"]) => {
    switch (type) {
      case "critical":
        return {
          border: "border-red-200 dark:border-red-800",
          bg: "bg-red-50 dark:bg-red-950/50",
          icon: "text-red-600 dark:text-red-400",
          badge: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
        };
      case "warning":
        return {
          border: "border-yellow-200 dark:border-yellow-800",
          bg: "bg-yellow-50 dark:bg-yellow-950/50",
          icon: "text-yellow-600 dark:text-yellow-400",
          badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
        };
      case "success":
        return {
          border: "border-green-200 dark:border-green-800",
          bg: "bg-green-50 dark:bg-green-950/50",
          icon: "text-green-600 dark:text-green-400",
          badge: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
        };
      default:
        return {
          border: "border-blue-200 dark:border-blue-800",
          bg: "bg-blue-50 dark:bg-blue-950/50",
          icon: "text-blue-600 dark:text-blue-400",
          badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
        };
    }
  };

  const displayedAlerts = alerts.slice(0, maxItems);
  const criticalCount = alerts.filter(a => a.type === "critical").length;
  const warningCount = alerts.filter(a => a.type === "warning").length;

  return (
    <Card className="flex flex-col h-full">
      {showHeader && (
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              Alerts & Notifications
              {(criticalCount > 0 || warningCount > 0) && (
                <div className="flex gap-1">
                  {criticalCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {criticalCount} Critical
                    </Badge>
                  )}
                  {warningCount > 0 && (
                    <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                      {warningCount} Warning
                    </Badge>
                  )}
                </div>
              )}
            </CardTitle>
            {onViewAll && alerts.length > maxItems && (
              <Button variant="ghost" size="sm" onClick={onViewAll}>
                View All ({alerts.length})
              </Button>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className="space-y-3 overflow-y-auto max-h-[500px] flex-1">
        {displayedAlerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No active alerts</p>
            <p className="text-xs">System is running smoothly</p>
          </div>
        ) : (
          displayedAlerts.map((alert) => {
            const styles = getAlertStyles(alert.type);
            return (
              <div
                key={alert.id}
                className={cn(
                  "p-4 rounded-lg border transition-all duration-200",
                  styles.border,
                  styles.bg
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("mt-0.5", styles.icon)}>
                    {getAlertIcon(alert.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm text-foreground">
                        {alert.title}
                      </h4>
                      <Badge variant="outline" className={cn("text-xs", styles.badge)}>
                        <div className="flex items-center gap-1">
                          {getCategoryIcon(alert.category)}
                          {alert.category}
                        </div>
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2">
                      {alert.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {alert.timestamp.toLocaleTimeString()}
                      </span>
                      
                      {alert.actionLabel && alert.onAction && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-xs"
                          onClick={alert.onAction}
                        >
                          {alert.actionLabel}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}