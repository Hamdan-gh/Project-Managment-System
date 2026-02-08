import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { api } from "@/services/api";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, CheckCircle, XCircle, Clock, Download, Eye, RefreshCw } from "lucide-react";

interface Chapter {
  _id: string;
  title: string;
  content?: string;
  status: string;
  feedback?: string | null;
  createdAt: string;
  submittedAt?: string | null;
  approvedAt?: string | null;
  student: {
    _id: string;
    name: string;
    email: string;
  };
  supervisor?: {
    _id: string;
    name: string;
    email: string;
  };
}

export default function ChapterReviews() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchChapters();
    }
  }, [user]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchChapters();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  const fetchChapters = async () => {
    try {
      const { data } = await api.get('/chapters/supervisor');
      setChapters(data);
    } catch (error: any) {
      console.error("Error fetching chapters:", error);
      toast.error("Failed to load chapters");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchChapters();
  };

  const openReviewDialog = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setFeedback(chapter.feedback || "");
    setDialogOpen(true);
  };

  const handleReview = async (status: "approved" | "rejected") => {
    if (!selectedChapter) return;
    if (status === "rejected" && !feedback.trim()) {
      toast.error("Please provide feedback for rejection");
      return;
    }

    setSubmitting(true);
    try {
      await api.put(`/chapters/${selectedChapter._id}`, {
        status,
        feedback: feedback.trim() || null,
      });

      toast.success(`Chapter ${status === "approved" ? "approved" : "rejected"} successfully`);
      setDialogOpen(false);
      setSelectedChapter(null);
      setFeedback("");
      fetchChapters();
    } catch (error: any) {
      console.error("Error reviewing chapter:", error);
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const downloadChapter = async (chapterId: string, fileName: string) => {
    try {
      const response = await api.get(`/chapters/download/${chapterId}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'chapter.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("File downloaded successfully");
    } catch (error: any) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download file");
    }
  };

  const previewChapter = async (chapterId: string) => {
    try {
      const response = await api.get(`/chapters/preview/${chapterId}`);
      setPreviewUrl(response.data);
      toast.success("PDF preview loaded");
    } catch (error: any) {
      console.error("Error loading preview:", error);
      toast.error("Failed to load PDF preview");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      case "submitted":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"><Clock className="w-3 h-3 mr-1" /> Submitted</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
    }
  };

  const pendingChapters = chapters.filter(c => c.status === "submitted");
  const reviewedChapters = chapters.filter(c => c.status === "approved" || c.status === "rejected");

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Chapter Reviews</h1>
            <p className="text-muted-foreground">Review and approve student chapter submissions</p>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">
              Submitted ({pendingChapters.length})
            </TabsTrigger>
            <TabsTrigger value="reviewed">
              Reviewed ({reviewedChapters.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Submitted Chapters
                </CardTitle>
                <CardDescription>Chapters submitted by students awaiting your review</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingChapters.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No submitted chapters to review
                  </p>
                ) : (
                  <div className="space-y-4">
                    {pendingChapters.map((chapter, index) => (
                      <div
                        key={chapter._id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Chapter {index + 1}:</span>
                            <span>{chapter.title}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">{chapter.student.name}</span>
                            <span className="mx-2">•</span>
                            <span>{chapter.student.email}</span>
                            <span className="mx-2">•</span>
                            <span>Submitted {new Date(chapter.submittedAt || chapter.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadChapter(chapter._id, chapter.fileName || chapter.title)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              previewChapter(chapter._id);
                              openReviewDialog(chapter);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviewed">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Reviewed Chapters
                </CardTitle>
                <CardDescription>Previously reviewed chapter submissions</CardDescription>
              </CardHeader>
              <CardContent>
                {reviewedChapters.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No reviewed chapters yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {reviewedChapters.map((chapter, index) => (
                      <div
                        key={chapter._id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Chapter {index + 1}:</span>
                            <span>{chapter.title}</span>
                            {getStatusBadge(chapter.status)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">{chapter.student.name}</span>
                            <span className="mx-2">•</span>
                            <span>{chapter.student.email}</span>
                            <span className="mx-2">•</span>
                            <span>Reviewed {chapter.approvedAt ? new Date(chapter.approvedAt).toLocaleDateString() : "N/A"}</span>
                          </div>
                          {chapter.feedback && (
                            <p className="text-sm mt-1 text-muted-foreground">
                              Feedback: {chapter.feedback}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadChapter(chapter._id, chapter.fileName || chapter.title)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Review Chapter {chapters.findIndex(c => c._id === selectedChapter?._id) + 1}: {selectedChapter?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedChapter?.student.name} ({selectedChapter?.student.email})
            </DialogDescription>
          </DialogHeader>

          {previewUrl && (
            <div className="border rounded-lg overflow-hidden">
              <iframe
                src={previewUrl}
                className="w-full h-96"
                title="PDF Preview"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Feedback (required for rejection)</label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide feedback for the student..."
              rows={4}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleReview("rejected")}
              disabled={submitting}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Reject
            </Button>
            <Button
              onClick={() => handleReview("approved")}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
