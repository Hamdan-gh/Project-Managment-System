import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { 
  FileText, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User,
  Upload,
  UserPlus
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: "proposal" | "chapter" | "message" | "assignment" | "approval" | "rejection" | "login";
  user: {
    name: string;
    avatar?: string;
    role: "student" | "supervisor" | "admin";
  };
  title: string;
  description?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  maxItems?: number;
  showHeader?: boolean;
}

export function ActivityFeed({ activities, maxItems = 10, showHeader = true }: ActivityFeedProps) {
  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "proposal":
        return <FileText className="h-4 w-4" />;
      case "chapter":
        return <Upload className="h-4 w-4" />;
      case "message":
        return <MessageSquare className="h-4 w-4" />;
      case "assignment":
        return <UserPlus className="h-4 w-4" />;
      case "approval":
        return <CheckCircle className="h-4 w-4" />;
      case "rejection":
        return <XCircle className="h-4 w-4" />;
      case "login":
        return <User className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: ActivityItem["type"]) => {
    switch (type) {
      case "approval":
        return "text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400";
      case "rejection":
        return "text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400";
      case "proposal":
      case "chapter":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400";
      case "message":
        return "text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400";
      case "assignment":
        return "text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "supervisor":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "student":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const displayedActivities = activities.slice(0, maxItems);

  return (
    <Card className="flex flex-col h-full">
      {showHeader && (
        <CardHeader className="pb-3 flex-shrink-0">
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-4 overflow-y-auto max-h-[500px] flex-1">
        {displayedActivities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recent activity</p>
          </div>
        ) : (
          displayedActivities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-border/50 last:border-0 last:pb-0">
              <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={activity.user.avatar} />
                    <AvatarFallback className="text-xs">
                      {activity.user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-sm text-foreground">
                    {activity.user.name}
                  </span>
                  <Badge variant="outline" className={`text-xs ${getRoleBadgeColor(activity.user.role)}`}>
                    {activity.user.role}
                  </Badge>
                </div>
                
                <p className="text-sm text-foreground font-medium mb-1">
                  {activity.title}
                </p>
                
                {activity.description && (
                  <p className="text-xs text-muted-foreground mb-2">
                    {activity.description}
                  </p>
                )}
                
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}