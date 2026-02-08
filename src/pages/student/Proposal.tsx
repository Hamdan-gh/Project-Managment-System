import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { api } from "@/services/api";
import { FileText, Loader2, CheckCircle, Clock, XCircle, Edit, Send } from "lucide-react";
import { z } from "zod";

interface Proposal {
  _id: string;
  title: string;
  description?: string;
  status: string;
  feedback?: string;
  submittedAt: string;
  createdAt: string;
  supervisor?: {
    _id: string;
    name: string;
    email: string;
  };
}

interface Supervisor {
  _id: string;
  name: string;
  email: string;
  specialization?: string;
}

const proposalSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters").max(200, "Title is too long"),
  description: z.string().min(50, "Description must be at least 50 characters").max(5000, "Description is too long"),
});

export default function Proposal() {
  const { user } = useAuth();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [studentSupervisor, setStudentSupervisor] = useState<Supervisor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (user) {
      fetchProposal();
    }
  }, [user]);

  const fetchProposal = async () => {
    try {
      // Get current user data with supervisor populated
      const { data: userData } = await api.get('/auth/me');
      setStudentSupervisor(userData.user.supervisor);

      const { data: proposals } = await api.get('/proposals/my');

      if (proposals && proposals.length > 0) {
        // Get the latest proposal
        const latestProposal = proposals.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        setProposal(latestProposal);
        setTitle(latestProposal.title);
        setDescription(latestProposal.description || "");
      }
    } catch (error) {
      // No proposal exists yet, that's fine
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = proposalSchema.safeParse({ title, description });
    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    if (!studentSupervisor) {
      toast({
        title: "No Supervisor Assigned",
        description: "You must have a supervisor assigned before submitting a proposal. Please contact the admin.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (proposal && isEditing) {
        // Update existing proposal
        await api.put(`/proposals/${proposal._id}`, {
          title: title.trim(),
          description: description.trim(),
          supervisor: studentSupervisor._id,
          status: "pending",
          feedback: null,
        });

        toast({
          title: "Proposal Updated",
          description: "Your proposal has been resubmitted for review",
        });
      } else {
        // Create new proposal
        await api.post('/proposals', {
          title: title.trim(),
          description: description.trim(),
          supervisor: studentSupervisor._id,
        });

        toast({
          title: "Proposal Submitted",
          description: "Your proposal has been submitted for review",
        });
      }

      setIsEditing(false);
      fetchProposal();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit proposal",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="badge-pending">Pending Review</span>;
      case "approved":
        return <span className="badge-approved">Approved</span>;
      case "rejected":
        return <span className="badge-rejected">Rejected</span>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-8 w-8 text-warning" />;
      case "approved":
        return <CheckCircle className="h-8 w-8 text-success" />;
      case "rejected":
        return <XCircle className="h-8 w-8 text-destructive" />;
      default:
        return <FileText className="h-8 w-8 text-muted-foreground" />;
    }
  };

  const canEdit = !proposal || proposal.status === "rejected";

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Proposal</h1>
          <p className="text-muted-foreground mt-1">
            Submit and manage your project proposal
          </p>
        </div>

        {/* Current Status */}
        {proposal && !isEditing && (
          <Card className="card-elevated">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Current Proposal
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Submitted {new Date(proposal.submitted_at).toLocaleDateString()}
                  </CardDescription>
                </div>
                {getStatusBadge(proposal.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                {getStatusIcon(proposal.status)}
                <div>
                  <p className="font-semibold">
                    {proposal.status === "pending"
                      ? "Awaiting Review"
                      : proposal.status === "approved"
                      ? "Proposal Approved!"
                      : "Revision Required"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {proposal.status === "pending"
                      ? "Your supervisor will review your proposal soon"
                      : proposal.status === "approved"
                      ? "You can proceed with your project"
                      : "Please revise your proposal based on feedback"}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg">{proposal.title}</h3>
                <p className="text-muted-foreground mt-2 whitespace-pre-wrap">
                  {proposal.description}
                </p>
              </div>

              {proposal.feedback && (
                <div className="rounded-lg bg-muted/50 border p-4">
                  <p className="font-medium mb-2">Supervisor Feedback</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {proposal.feedback}
                  </p>
                </div>
              )}

              {proposal.status === "rejected" && (
                <Button onClick={() => setIsEditing(true)} className="w-full">
                  <Edit className="mr-2 h-4 w-4" />
                  Revise Proposal
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Submission Form */}
        {(canEdit || isEditing) && (!proposal || isEditing) && (
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {proposal ? "Revise Proposal" : "Submit Proposal"}
              </CardTitle>
              <CardDescription>
                {proposal
                  ? "Update your proposal based on supervisor feedback"
                  : "Provide details about your final year project"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Project Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter your project title"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum 10 characters. Be specific and descriptive.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Project Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your project in detail. Include objectives, methodology, expected outcomes, and technologies you plan to use."
                    rows={10}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum 50 characters. Include project objectives, scope, methodology, and expected outcomes.
                  </p>
                </div>

                {studentSupervisor && (
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-sm text-muted-foreground">
                      This proposal will be submitted to your assigned supervisor: <span className="font-medium text-foreground">{studentSupervisor.name}</span>
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  {isEditing && (
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setIsEditing(false);
                        if (proposal) {
                          setTitle(proposal.title);
                          setDescription(proposal.description);
                        }
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    type="submit"
                    className={isEditing ? "flex-1" : "w-full"}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        {proposal ? "Resubmit Proposal" : "Submit Proposal"}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
