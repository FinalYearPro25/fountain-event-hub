import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface NotificationBellProps {
  userId: any;
  count?: number;
}

export const NotificationBell = ({ userId, count }: NotificationBellProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const { toast } = useToast ? useToast() : { toast: () => {} };
  const [open, setOpen] = useState(false);

  // Fetch notifications from the notifications table (user-specific)
  useEffect(() => {
    if (!userId) return;
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);
      setNotifications(data || []);
      setUnread((data || []).filter((n) => !n.read).length);
    };
    fetchNotifications();
    // Real-time subscription for notifications table
    const sub = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          fetchNotifications();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(sub);
    };
  }, [userId]);

  // Real-time event-based notifications for approval queues
  useEffect(() => {
    const channel = supabase
      .channel("events-notifications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        (payload) => {
          const event = payload.new;
          // Type guard: ensure event is an object with status and title
          if (
            event &&
            typeof event === "object" &&
            "status" in event &&
            "title" in event &&
            "id" in event &&
            typeof event.status === "string" &&
            typeof event.title === "string" &&
            typeof event.id === "string"
          ) {
            if (
              event.status === "pending_approval" ||
              event.status === "pending_student_affairs" ||
              event.status === "pending_vc"
            ) {
              // Create a minimal notification object
              const notification = {
                id: event.id,
                message: event.title,
                read: false,
                created_at: new Date().toISOString(),
              };
              setNotifications((prev) => [notification, ...prev]);
              setUnread((prev) => prev + 1);
              toast &&
                toast({
                  title: "New event needs your attention",
                  description: event.title,
                });
            }
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const markAllRead = async () => {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId);
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    setUnread(0);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full text-xs px-1">
              {unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold">Notifications</span>
          <Button size="sm" variant="outline" onClick={markAllRead}>
            Mark all as read
          </Button>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-gray-500 text-center py-4">
              No notifications
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-2 rounded mb-1 ${n.read ? "bg-gray-50" : "bg-blue-50"}`}
              >
                <div className="text-sm">{n.message}</div>
                <div className="text-xs text-gray-400">
                  {new Date(n.created_at).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
