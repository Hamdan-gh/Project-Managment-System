import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { api } from "@/services/api";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, XCircle, Clock, Lock, AlertCircle } from "lucide-react";

interface Chapter {
  _id: string;
  title: string;
  content?: string;
  status: string;
  feedback?: string;
  submittedAt?: string;
  approvedAt?: string;
  createdAt: string;
  student?: {
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

export default function Chapters() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Get chapters
      const { data: chaptersData } = await api.get('/chapters/my');
      // Sort chapters by creation date
      const sortedChapters = chaptersData.sort((a: Chapter, b: Chapter) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      setChapters(sortedChapters);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const getNextChapterNumber = () => {
    return chapters.length + 1;
  };

  const canSubmitNewChapter = () => {
    if (chapters.length === 0) return true;
    
    // Sort chapters by creation date to ensure proper order
    const sortedChapters = chapters.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const lastChapter = sortedChapters[sortedChapters.length - 1];
    
    // Can submit next chapter only if the last one is approved
    return lastChapter.status === "approved";
  };

  const hasRejectedChapters = () => {
    return chapters.some(chapter => chapter.status === "rejected");
  };

  const getRejectedChapters = () => {
    return chapters.filter(chapter => chapter.status === "rejected");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !user) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('file', file);

      if (editingChapter) {
        // Update existing rejected chapter
        await api.put(`/chapters/${editingChapter._id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success("Chapter resubmitted successfully!");
      } else {
        // Create new chapter
        await api.post('/chapters', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success("Chapter submitted successfully!");
      }

      setTitle("");
      setFile(null);
      setEditingChapter(null);
      fetchData();
    } catch (error: any) {
      console.error("Error submitting chapter:", error);
      toast.error(error.response?.data?.msg || "Failed to submit chapter");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditChapter = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setTitle(chapter.title);
    setFile(null); // Reset file since we need a new upload
  };

  const handleCancelEdit = () => {
    setEditingChapter(null);
    setTitle("");
    setFile(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"><Clock className="w-3 h-3 mr-1" /> Pending Review</Badge>;
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chapter Submissions</h1>
          <p className="text-muted-foreground">Submit your project chapters for supervisor review</p>
        </div>

        {/* Show rejected chapters that can be resubmitted */}
        {hasRejectedChapters() && (
          <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-200">
                <XCircle className="h-5 w-5" />
                Chapters Needing Revision
              </CardTitle>
              <CardDescription className="text-red-700 dark:text-red-300">
                The following chapters were rejected. Please revise and resubmit them.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getRejectedChapters().map((chapter, index) => (
                  <div key={chapter._id} className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-white dark:bg-gray-800">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Chapter {chapters.findIndex(c => c._id === chapter._id) + 1}:</span>
                        <span>{chapter.title}</span>
                      </div>
                      {chapter.feedback && (
                        <p className="text-sm text-red-600 dark:text-red-400">
                          <strong>Feedback:</strong> {chapter.feedback}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={() => handleEditChapter(chapter)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Revise & Resubmit
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* New chapter submission */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              {editingChapter ? `Revise Chapter ${chapters.findIndex(c => c._id === editingChapter._id) + 1}` : `Submit Chapter ${getNextChapterNumber()}`}
            </CardTitle>
            <CardDescription>
              {editingChapter
                ? "Upload a revised version of your rejected chapter"
                : canSubmitNewChapter()
                  ? "Upload your next chapter for review"
                  : "Complete the previous chapter review before submitting a new one"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {canSubmitNewChapter() || editingChapter ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Chapter Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Introduction and Literature Review"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">PDF File</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    required
                  />
                  {file && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {file.name}
                    </p>
                  )}
                  {editingChapter && !file && (
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      Previous file: {editingChapter.content}
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  {editingChapter && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button type="submit" disabled={submitting || !file || !title}>
                    {submitting ? "Submitting..." : editingChapter ? "Resubmit Chapter" : "Submit Chapter"}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex items-center gap-3 text-muted-foreground">
                <AlertCircle className="h-5 w-5" />
                <p>Your previous chapter is pending review. Please wait for approval before submitting the next chapter.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Submitted Chapters
            </CardTitle>
            <CardDescription>Track the status of your chapter submissions</CardDescription>
          </CardHeader>
          <CardContent>
            {chapters.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No chapters submitted yet
              </p>
            ) : (
              <div className="space-y-4">
                {chapters.map((chapter, index) => (
                  <div
                    key={chapter._id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Chapter {index + 1}:</span>
                        <span>{chapter.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{chapter.content || 'No file attached'}</span>
                        <span>•</span>
                        <span>Submitted {new Date(chapter.submittedAt || chapter.createdAt).toLocaleDateString()}</span>
                      </div>
                      {chapter.feedback && (
                        <p className="text-sm mt-2 p-2 bg-muted rounded">
                          <strong>Feedback:</strong> {chapter.feedback}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(chapter.status)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadChapter(chapter._id, chapter.fileName || chapter.title)}
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
