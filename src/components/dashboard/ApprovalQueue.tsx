import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/components/auth/AuthProvider";

export const ApprovalQueue = () => {
  const { user, profile } = useAuthContext();
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [selected, setSelected] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [history, setHistory] = useState({});

  useEffect(() => {
    const fetchApprovals = async () => {
      if (!user) return;
      // Fetch pending approvals assigned to this user/role
      const { data } = await supabase
        .from("event_approvals")
        .select("*, event:events(*)")
        .eq("status", "pending")
        .or(`approver_id.eq.${user.id},approval_level.eq.${profile?.role}`);
      setPendingApprovals(data || []);
    };
    fetchApprovals();
  }, [user, profile]);

  const handleApprove = async (approvalId, approve = true) => {
    setActionLoading(true);
    await supabase
      .from("event_approvals")
      .update({
        status: approve ? "approved" : "rejected",
        comments: comment,
        approved_at: new Date().toISOString(),
      })
      .eq("id", approvalId);
    setActionLoading(false);
    setComment("");
    setPendingApprovals(pendingApprovals.filter((a) => a.id !== approvalId));
  };

  const handleBulkApprove = async (approve = true) => {
    setActionLoading(true);
    await Promise.all(
      selected.map((id) =>
        supabase
          .from("event_approvals")
          .update({
            status: approve ? "approved" : "rejected",
            comments: comment,
            approved_at: new Date().toISOString(),
          })
          .eq("id", id)
      )
    );
    setActionLoading(false);
    setComment("");
    setPendingApprovals(
      pendingApprovals.filter((a) => !selected.includes(a.id))
    );
    setSelected([]);
  };

  const fetchHistory = async (eventId) => {
    const { data } = await supabase
      .from("event_approvals")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: true });
    setHistory((h) => ({ ...h, [eventId]: data || [] }));
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Approval Queue</CardTitle>
          <CardDescription>Events pending your approval</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingApprovals.length === 0 ? (
            <div className="text-center text-gray-500">
              No pending approvals
            </div>
          ) : (
            <>
              <div className="mb-4 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkApprove(true)}
                  disabled={selected.length === 0 || actionLoading}
                >
                  Bulk Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkApprove(false)}
                  disabled={selected.length === 0 || actionLoading}
                >
                  Bulk Reject
                </Button>
              </div>
              {pendingApprovals.map((approval) => (
                <Card key={approval.id} className="mb-4 border">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>{approval.event?.title}</CardTitle>
                      <CardDescription>
                        Level: <Badge>{approval.approval_level}</Badge>
                      </CardDescription>
                    </div>
                    <input
                      type="checkbox"
                      checked={selected.includes(approval.id)}
                      onChange={(e) => {
                        setSelected((sel) =>
                          e.target.checked
                            ? [...sel, approval.id]
                            : sel.filter((id) => id !== approval.id)
                        );
                      }}
                    />
                  </CardHeader>
                  <CardContent>
                    <div className="mb-2 text-sm text-gray-700">
                      {approval.event?.description}
                    </div>
                    <div className="mb-2 text-xs text-gray-500">
                      Submitted: {approval.event?.created_at}
                    </div>
                    <div className="flex gap-2 mb-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => fetchHistory(approval.event_id)}
                      >
                        Show Approval History
                      </Button>
                    </div>
                    {history[approval.event_id] && (
                      <div className="mb-2 bg-gray-50 p-2 rounded">
                        <div className="font-semibold text-xs mb-1">
                          Approval History
                        </div>
                        {history[approval.event_id].map((h) => (
                          <div key={h.id} className="text-xs mb-1">
                            {h.approval_level}: {h.status}{" "}
                            {h.comments && `- ${h.comments}`}
                          </div>
                        ))}
                      </div>
                    )}
                    <Textarea
                      className="mb-2"
                      placeholder="Add comment (optional)"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(approval.id, true)}
                        disabled={actionLoading}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleApprove(approval.id, false)}
                        disabled={actionLoading}
                      >
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
