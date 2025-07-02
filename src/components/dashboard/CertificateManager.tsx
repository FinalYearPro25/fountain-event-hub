
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Award, Mail, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { generateCertificatePDF } from "@/lib/certificate";
import { useToast } from "@/hooks/use-toast";
import JSZip from "jszip";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";

// Mock data for completed events
const completedEvents = [
  { id: "evt_1", name: "Tech Symposium 2024" },
  { id: "evt_2", name: "Leadership Workshop" },
  { id: "evt_3", name: "Alumni Gala 2023" },
];

// Mock data for attendees based on event
const attendeesData = {
  evt_1: [
    {
      id: "usr_1",
      name: "Alice Johnson",
      email: "alice@example.com",
      status: "Issued",
    },
    {
      id: "usr_2",
      name: "Bob Williams",
      email: "bob@example.com",
      status: "Not Issued",
    },
    {
      id: "usr_3",
      name: "Charlie Brown",
      email: "charlie@example.com",
      status: "Not Issued",
    },
  ],
  evt_2: [
    {
      id: "usr_4",
      name: "David Lee",
      email: "david@example.com",
      status: "Issued",
    },
  ],
  evt_3: [],
};

export const CertificateManager = () => {
  const [selectedEvent, setSelectedEvent] = useState(completedEvents[0].id);
  const [attendees, setAttendees] = useState(
    attendeesData[completedEvents[0].id]
  );
  const [selectedAttendees, setSelectedAttendees] = useState([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();
  const [showIssueDialog, setShowIssueDialog] = useState(false);
  const [pendingIds, setPendingIds] = useState([]);
  const [isSending, setIsSending] = useState(false);

  const handleEventChange = (eventId) => {
    setSelectedEvent(eventId);
    setAttendees(attendeesData[eventId] || []);
    setSelectedAttendees([]);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedAttendees(attendees.map((a) => a.id));
    } else {
      setSelectedAttendees([]);
    }
  };

  const handleSelectSingle = (attendeeId, checked) => {
    if (checked) {
      setSelectedAttendees((prev) => [...prev, attendeeId]);
    } else {
      setSelectedAttendees((prev) => prev.filter((id) => id !== attendeeId));
    }
  };

  const handleIssueCertificates = (ids) => {
    setPendingIds(ids);
    setShowIssueDialog(true);
  };

  const handleDownloadZip = async () => {
    setShowIssueDialog(false);
    const toIssue = attendees.filter((a) => pendingIds.includes(a.id));
    if (toIssue.length === 0) return;
    const zip = new JSZip();
    const eventName =
      completedEvents.find((e) => e.id === selectedEvent)?.name || "";
    const date = new Date().toLocaleDateString();
    for (const attendee of toIssue) {
      // Generate a unique verification code
      const verificationCode = uuidv4();
      // Insert certificate record into Supabase
      try {
        await supabase.from("certificates").insert({
          user_id: attendee.id,
          event_id: selectedEvent,
          issued_at: new Date().toISOString(),
          verification_code: verificationCode,
          status: "issued",
        });
      } catch (error) {
        console.error("Error inserting certificate:", error);
      }
      const verificationUrl = `${window.location.origin}/verify?code=${verificationCode}`;
      const pdfBlob = await generateCertificatePDF({
        attendeeName: attendee.name,
        eventName,
        date,
        verificationUrl,
      });
      const pdfArrayBuffer = await pdfBlob.arrayBuffer();
      zip.file(
        `Certificate-${attendee.name.replace(/\s+/g, "_")}.pdf`,
        pdfArrayBuffer
      );
    }
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Certificates-${eventName.replace(/\s+/g, "_")}.zip`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    setAttendees((prev) =>
      prev.map((a) =>
        pendingIds.includes(a.id) ? { ...a, status: "Issued" } : a
      )
    );
    setSelectedAttendees([]);
    setPendingIds([]);
    toast({ title: "Certificates downloaded as ZIP and saved to database." });
  };

  const handleSendEmail = async () => {
    setIsSending(true);
    const toIssue = attendees.filter((a) => pendingIds.includes(a.id));
    const eventName =
      completedEvents.find((e) => e.id === selectedEvent)?.name || "";
    const date = new Date().toLocaleDateString();
    for (const attendee of toIssue) {
      const verificationCode = uuidv4();
      try {
        await supabase.from("certificates").insert({
          user_id: attendee.id,
          event_id: selectedEvent,
          issued_at: new Date().toISOString(),
          verification_code: verificationCode,
          status: "issued",
        });
      } catch (error) {
        console.error("Error inserting certificate:", error);
      }
      // Email logic would go here, using verificationUrl
    }
    setTimeout(() => {
      setIsSending(false);
      setShowIssueDialog(false);
      setAttendees((prev) =>
        prev.map((a) =>
          pendingIds.includes(a.id) ? { ...a, status: "Issued" } : a
        )
      );
      setSelectedAttendees([]);
      setPendingIds([]);
      toast({
        title: "Certificates sent by email (simulated) and saved to database.",
      });
    }, 2000);
  };

  const handlePreviewCertificate = async (attendee) => {
    setPreviewName(attendee.name);
    // Use today's date and a placeholder verification URL
    const date = new Date().toLocaleDateString();
    const verificationUrl = `https://eventify.example.com/verify?user=${attendee.id}`;
    const pdfBlob = await generateCertificatePDF({
      attendeeName: attendee.name,
      eventName:
        completedEvents.find((e) => e.id === selectedEvent)?.name || "",
      date,
      verificationUrl,
    });
    const url = URL.createObjectURL(pdfBlob);
    setPreviewUrl(url);
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-6 w-6" /> Certificate Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
          <Select
            onValueChange={handleEventChange}
            defaultValue={selectedEvent}
          >
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Select an event" />
            </SelectTrigger>
            <SelectContent>
              {completedEvents.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex-grow" />
          <Button
            disabled={selectedAttendees.length === 0}
            onClick={() => handleIssueCertificates(selectedAttendees)}
            size="sm"
          >
            <Mail className="h-4 w-4 mr-2" />
            Issue Selected ({selectedAttendees.length})
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={
                    selectedAttendees.length === attendees.length &&
                    attendees.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Attendee Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendees.length > 0 ? (
              attendees.map((attendee) => (
                <TableRow key={attendee.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedAttendees.includes(attendee.id)}
                      onCheckedChange={(checked) =>
                        handleSelectSingle(attendee.id, checked)
                      }
                    />
                  </TableCell>
                  <TableCell>{attendee.name}</TableCell>
                  <TableCell>{attendee.email}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        attendee.status === "Issued"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {attendee.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handlePreviewCertificate(attendee)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No attendees for this event.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Certificate Preview Modal */}
        <Dialog open={showPreview} onOpenChange={handleClosePreview}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Certificate Preview - {previewName}</DialogTitle>
            </DialogHeader>
            {previewUrl && (
              <>
                <iframe
                  src={previewUrl}
                  title="Certificate Preview"
                  className="w-full h-96 border rounded mb-4"
                />
                <a
                  href={previewUrl}
                  download={`Certificate-${previewName}.pdf`}
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Download PDF
                </a>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Issue Certificates Dialog */}
        <Dialog open={showIssueDialog} onOpenChange={setShowIssueDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Issue Certificates</DialogTitle>
            </DialogHeader>
            <div className="mb-4">
              How would you like to issue certificates to the selected
              attendees?
            </div>
            <div className="flex flex-col gap-3">
              <Button onClick={handleDownloadZip} disabled={isSending}>
                Download ZIP
              </Button>
              <Button
                variant="outline"
                onClick={handleSendEmail}
                disabled={isSending}
              >
                {isSending ? "Sending..." : "Send by Email"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
