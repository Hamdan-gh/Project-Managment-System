import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useNotifications } from "@/contexts/NotificationContext";
import { api } from "@/services/api";
import { FileText, Loader2, CheckCircle, XCircle, Clock, Eye } from "lucide-react";

interface Proposal {
  _id: string;
  title: string;
  description: string;
  status: string;
  feedback: string | null;
  createdAt: string;
  student: {
    _id: string;
    name: string;
    email: string;
    matricNumber: string;
  };
}

export default function Proposals() {
  const { user } = useAuth();
  const { refreshNotifications } = useNotifications();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchProposals();
    }
  }, [user]);

  const fetchProposals = async () => {
    try {
      const { data: proposalsData } = await api.get('/proposals');

      setProposals(proposalsData);
    } catch (error) {
      console.error("Error fetching proposals:", error);
      toast({
        title: "Error",
        description: "Failed to load proposals",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async (status: "approved" | "rejected") => {
    if (!selectedProposal) return;

    if (status === "rejected" && !feedback.trim()) {
      toast({
        title: "Feedback Required",
        description: "Please provide feedback for rejection",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await api.put(`/proposals/${selectedProposal._id}`, {
        status,
        feedback: feedback.trim() || null,
      });

      toast({
        title: status === "approved" ? "Proposal Approved" : "Proposal Rejected",
        description: status === "approved"
          ? "The proposal has been approved successfully"
          : "The proposal has been rejected with feedback",
      });

      setDialogOpen(false);
      setSelectedProposal(null);
      setFeedback("");
      fetchProposals();
      
      // Refresh notifications after reviewing proposal (pending count changes)
      await refreshNotifications();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update proposal",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openReviewDialog = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setFeedback(proposal.feedback || "");
    setDialogOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-warning" />;
      case "approved":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="badge-pending">Pending</span>;
      case "approved":
        return <span className="badge-approved">Approved</span>;
      case "rejected":
        return <span className="badge-rejected">Rejected</span>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const pendingProposals = proposals.filter((p) => p.status === "pending");
  const reviewedProposals = proposals.filter((p) => p.status !== "pending");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Proposals</h1>
          <p className="text-muted-foreground mt-1">
            Review and manage student project proposals
          </p>
        </div>

        {/* Pending Proposals */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              Pending Review
            </CardTitle>
            <CardDescription>
              {pendingProposals.length} proposal{pendingProposals.length !== 1 ? "s" : ""} awaiting review
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : pendingProposals.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">All caught up!</p>
                <p className="text-sm text-muted-foreground">
                  No proposals pending review
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingProposals.map((proposal) => (
                  <div
                    key={proposal._id}
                    className="p-4 rounded-lg bg-warning/5 border border-warning/20 hover:bg-warning/10 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold">{proposal.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          by {proposal.student.name} ({proposal.student.matricNumber})
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                          {proposal.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Submitted {new Date(proposal.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button onClick={() => openReviewDialog(proposal)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reviewed Proposals */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Reviewed Proposals
            </CardTitle>
            <CardDescription>
              {reviewedProposals.length} proposal{reviewedProposals.length !== 1 ? "s" : ""} reviewed
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reviewedProposals.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">No reviewed proposals</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviewedProposals.map((proposal) => (
                  <div
                    key={proposal._id}
                    className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => openReviewDialog(proposal)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(proposal.status)}
                        <div>
                          <h3 className="font-semibold">{proposal.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {proposal.student.name} ({proposal.student.matricNumber})
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(proposal.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Review Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Proposal Review</DialogTitle>
              <DialogDescription>
                Review the proposal and provide feedback
              </DialogDescription>
            </DialogHeader>

            {selectedProposal && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedProposal.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    by {selectedProposal.student_name} ({selectedProposal.matric_number})
                  </p>
                  <div className="mt-2">
                    {getStatusBadge(selectedProposal.status)}
                  </div>
                </div>

                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm font-medium mb-2">Description</p>
                  <p className="text-sm whitespace-pre-wrap">{selectedProposal.description}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Feedback {selectedProposal.status === "pending" && "(required for rejection)"}
                  </label>
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide feedback for the student..."
                    rows={4}
                    disabled={selectedProposal.status !== "pending"}
                  />
                </div>

                {selectedProposal.status === "pending" && (
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleReview("rejected")}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="mr-2 h-4 w-4" />
                      )}
                      Reject
                    </Button>
                    <Button
                      className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
                      onClick={() => handleReview("approved")}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="mr-2 h-4 w-4" />
                      )}
                      Approve
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
