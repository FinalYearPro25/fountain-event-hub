import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, DollarSign, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/components/auth/AuthProvider";

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  type: string;
  status: string;
  registered: boolean;
  capacity: number;
  registered_count: number;
  registration_fee?: number;
  organizer?: string;
}

interface EventRegistrationModalProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegistrationSuccess?: () => void;
}

// Dummy payment integration for demo
const StripeButton = ({ amount, onSuccess }) => (
  <Button className="w-full" onClick={() => setTimeout(onSuccess, 1000)}>
    Pay with Stripe (₦{amount})
  </Button>
);
const PaystackButton = ({ amount, onSuccess }) => (
  <Button className="w-full" onClick={() => setTimeout(onSuccess, 1000)}>
    Pay with Paystack (₦{amount})
  </Button>
);

export const EventRegistrationModal = ({
  event,
  open,
  onOpenChange,
  onRegistrationSuccess,
}: EventRegistrationModalProps) => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("pending");

  if (!event) return null;

  const handleRegister = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (
        event.registration_fee &&
        event.registration_fee > 0 &&
        paymentStatus !== "paid"
      ) {
        setShowPayment(true);
        setLoading(false);
        return;
      }
      const { error } = await supabase.from("event_registrations").insert({
        event_id: event.id,
        user_id: user.id,
        payment_status:
          event.registration_fee && event.registration_fee > 0
            ? "pending"
            : "paid",
        attendance_status: "registered",
      });
      if (error) throw error;
      toast({
        title: "Registration Successful!",
        description: `You have successfully registered for ${event.title}.`,
      });
      onRegistrationSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    setPaymentStatus("paid");
    setShowPayment(false);
    // Update registration as paid
    await supabase
      .from("event_registrations")
      .update({ payment_status: "paid" })
      .eq("event_id", event.id)
      .eq("user_id", user.id);
    toast({
      title: "Payment Successful",
      description: "Your payment was received.",
    });
    onRegistrationSuccess?.();
    onOpenChange(false);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "academic":
        return "bg-blue-100 text-blue-800";
      case "cultural":
        return "bg-purple-100 text-purple-800";
      case "sports":
        return "bg-orange-100 text-orange-800";
      case "conference":
        return "bg-indigo-100 text-indigo-800";
      case "workshop":
        return "bg-teal-100 text-teal-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isFull = event.registered_count >= event.capacity;
  const spotsLeft = event.capacity - event.registered_count;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <DialogTitle className="text-xl">{event.title}</DialogTitle>
            <Badge className={getTypeColor(event.type)}>{event.type}</Badge>
          </div>
          <DialogDescription className="text-left">
            {event.description}
          </DialogDescription>
        </DialogHeader>
        {showPayment ? (
          <div className="space-y-4">
            <div className="text-center font-semibold">
              Pay Registration Fee
            </div>
            <StripeButton
              amount={event.registration_fee}
              onSuccess={handlePaymentSuccess}
            />
            <PaystackButton
              amount={event.registration_fee}
              onSuccess={handlePaymentSuccess}
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowPayment(false)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Event Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{event.venue}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>
                  {event.registered_count}/{event.capacity} registered
                </span>
              </div>
              {event.registration_fee && event.registration_fee > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  <span>₦{event.registration_fee.toLocaleString()}</span>
                  <Badge
                    variant={paymentStatus === "paid" ? "success" : "outline"}
                  >
                    {paymentStatus === "paid" ? "Paid" : "Pending"}
                  </Badge>
                </div>
              )}
              {event.organizer && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{event.organizer}</span>
                </div>
              )}
            </div>
            {/* Registration Status */}
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleRegister}
                disabled={
                  loading ||
                  (event.registration_fee > 0 && paymentStatus !== "paid") ||
                  isFull
                }
              >
                {loading
                  ? "Registering..."
                  : event.registration_fee > 0
                    ? paymentStatus === "paid"
                      ? "Register"
                      : "Pay to Register"
                    : "Register"}
              </Button>
              {isFull && (
                <div className="text-red-600 text-xs">Event is full</div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
