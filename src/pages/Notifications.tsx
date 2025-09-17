import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, CheckCheck, Trash2, Calendar, DollarSign, Star, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  title: string;
  body?: string;
  type?: 'booking' | 'payment' | 'review' | 'message' | 'general';
  read: boolean;
  created_at: string;
  time: string;
}

const Notifications = () => {
  const { toast } = useToast();
  
  // Sample notifications for demonstration
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "New booking request received",
      body: "Sarah Johnson wants to book you for a bridal makeup session on March 15th",
      type: "booking",
      read: false,
      created_at: new Date().toISOString(),
      time: "2m ago"
    },
    {
      id: "2", 
      title: "Payment received",
      body: "₦45,000 payment confirmed for Emma Wilson's booking",
      type: "payment",
      read: false,
      created_at: new Date(Date.now() - 3600000).toISOString(),
      time: "1h ago"
    },
    {
      id: "3",
      title: "New 5-star review",
      body: "\"Amazing work! Highly recommend\" - Emma Wilson",
      type: "review", 
      read: true,
      created_at: new Date(Date.now() - 7200000).toISOString(),
      time: "2h ago"
    },
    {
      id: "4",
      title: "New message from Maya Chen",
      body: "I'd love to collaborate on this project",
      type: "message",
      read: true,
      created_at: new Date(Date.now() - 86400000).toISOString(), 
      time: "1d ago"
    },
    {
      id: "5",
      title: "Booking reminder",
      body: "You have a session with Sarah Johnson tomorrow at 9:00 AM",
      type: "booking",
      read: false,
      created_at: new Date(Date.now() - 172800000).toISOString(),
      time: "2d ago"
    }
  ]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );

    toast({
      title: "Success",
      description: "All notifications marked as read",
    });
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.filter(notif => notif.id !== notificationId)
    );

    toast({
      title: "Success", 
      description: "Notification deleted",
    });
  };

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'booking':
        return <Calendar className="h-5 w-5 text-primary" />;
      case 'payment':
        return <DollarSign className="h-5 w-5 text-success" />;
      case 'review':
        return <Star className="h-5 w-5 text-warning" />;
      case 'message':
        return <MessageSquare className="h-5 w-5 text-coral" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-playfair font-bold text-gradient flex items-center">
              <Bell className="mr-3 h-8 w-8" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="default" className="ml-3">
                  {unreadCount} new
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground">Stay updated with your latest activity</p>
          </div>
          
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline" size="sm">
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <Card className="p-12 text-center">
              <Bell className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notifications yet</h3>
              <p className="text-muted-foreground">
                We'll notify you when something important happens
              </p>
            </Card>
          ) : (
            notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`p-4 transition-all hover:shadow-md ${
                  !notification.read ? 'border-l-4 border-l-primary bg-primary/5' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1">
                          {notification.title}
                        </h4>
                        {notification.body && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.body}
                          </p>
                        )}
                        <div className="flex items-center space-x-4">
                          <span className="text-xs text-muted-foreground">
                            {notification.time}
                          </span>
                          {!notification.read && (
                            <Badge variant="secondary" className="text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Demo notice */}
        <Card className="p-6 bg-primary/5 border-primary/20">
          <div className="flex items-start space-x-3">
            <Bell className="h-5 w-5 text-primary mt-1" />
            <div>
              <h3 className="font-semibold text-primary mb-1">Demo Mode</h3>
              <p className="text-sm text-primary/80">
                This is a demonstration of the notifications system. In the full version, notifications would be generated automatically based on your activity and synchronized with the database.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;