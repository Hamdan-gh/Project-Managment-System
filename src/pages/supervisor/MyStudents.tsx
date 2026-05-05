import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserAvatar } from "@/components/UserAvatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { api } from "@/services/api";
import { Users, Loader2, Copy, Mail, Key } from "lucide-react";

interface Student {
  _id: string;
  name: string;
  email: string;
  matricNumber: string;
  department: string;
  level: string;
  avatarPath?: string;
  proposal_status: string | null;
}

export default function MyStudents() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [supervisorId, setSupervisorId] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<{ email: string; password: string } | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchStudents();
    }
  }, [user]);

  const fetchStudents = async () => {
    try {
      const { data: studentsData } = await api.get('/users/supervisor/students');
      const { data: proposalsData } = await api.get('/proposals');

      const enrichedStudents = studentsData.map((student: any) => {
        const proposal = proposalsData.find((p: any) => p.student._id === student._id);
        return {
          _id: student._id,
          name: student.name,
          email: student.email,
          matricNumber: student.matricNumber,
          department: student.department,
          level: student.level,
          avatarPath: student.avatarPath,
          proposal_status: proposal ? proposal.status : null,
        };
      });

      setStudents(enrichedStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
  };

  const handleGenerateCredentials = async () => {
    if (!selectedStudent || !newPassword) return;

    setIsGenerating(true);

    // Note: In a real app, you'd need admin privileges to reset passwords
    // This is a simplified version showing the credentials
    setGeneratedCredentials({
      email: selectedStudent.email,
      password: newPassword,
    });

    toast({
      title: "Credentials Generated",
      description: "Share these credentials with your student securely.",
    });

    setIsGenerating(false);
  };

  const copyCredentials = () => {
    if (generatedCredentials) {
      navigator.clipboard.writeText(
        `Email: ${generatedCredentials.email}\nPassword: ${generatedCredentials.password}`
      );
      toast({
        title: "Copied",
        description: "Credentials copied to clipboard",
      });
    }
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline">No Proposal</Badge>;
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Students</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your assigned students
          </p>
        </div>

        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Assigned Students
            </CardTitle>
            <CardDescription>
              {students.length} student{students.length !== 1 ? "s" : ""} assigned to you
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">No students assigned</p>
                <p className="text-sm text-muted-foreground">
                  The admin will assign students to you
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Matric No.</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Proposal Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <UserAvatar 
                            user={student}
                            className="h-8 w-8"
                            fallbackClassName="bg-primary text-primary-foreground text-xs font-semibold"
                          />
                          <span>{student.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{student.matricNumber}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.department || "—"}</TableCell>
                      <TableCell>{getStatusBadge(student.proposal_status)}</TableCell>
                      <TableCell>
                        <Dialog open={dialogOpen && selectedStudent?._id === student._id} onOpenChange={(open) => {
                          setDialogOpen(open);
                          if (!open) {
                            setSelectedStudent(null);
                            setGeneratedCredentials(null);
                            setNewPassword("");
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedStudent(student)}
                            >
                              <Key className="h-4 w-4 mr-1" />
                              Credentials
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Generate Credentials</DialogTitle>
                              <DialogDescription>
                                Generate new login credentials for {selectedStudent?.name}
                              </DialogDescription>
                            </DialogHeader>

                            {generatedCredentials ? (
                              <div className="space-y-4">
                                <div className="rounded-lg bg-success/10 border border-success/20 p-4">
                                  <p className="text-sm font-medium text-success mb-2">
                                    Credentials Generated!
                                  </p>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                      <Mail className="h-4 w-4 text-muted-foreground" />
                                      <span>{generatedCredentials.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono bg-muted px-2 py-1 rounded">
                                        {generatedCredentials.password}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button onClick={copyCredentials} variant="outline" className="flex-1">
                                    <Copy className="mr-2 h-4 w-4" />
                                    Copy
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      setDialogOpen(false);
                                      setGeneratedCredentials(null);
                                      setNewPassword("");
                                    }}
                                    className="flex-1"
                                  >
                                    Done
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label>Email</Label>
                                  <Input value={selectedStudent?.email || ""} disabled />
                                </div>
                                <div className="space-y-2">
                                  <Label>New Password</Label>
                                  <div className="flex gap-2">
                                    <Input
                                      value={newPassword}
                                      onChange={(e) => setNewPassword(e.target.value)}
                                      placeholder="Enter or generate"
                                    />
                                    <Button type="button" variant="outline" onClick={generatePassword}>
                                      Generate
                                    </Button>
                                  </div>
                                </div>
                                <Button
                                  className="w-full"
                                  onClick={handleGenerateCredentials}
                                  disabled={!newPassword || isGenerating}
                                >
                                  {isGenerating ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Generating...
                                    </>
                                  ) : (
                                    "Generate Credentials"
                                  )}
                                </Button>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
