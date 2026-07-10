import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import {
  Plus, UserCog, Copy, Mail, Users, Loader2,
  CheckCircle2, Eye, EyeOff, Pencil, Trash2,
} from "lucide-react";
import { z } from "zod";

interface Supervisor {
  _id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  specialization?: string;
  maxStudents?: number;
  student_count?: number;
}

const supervisorSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  department: z.string().optional(),
  specialization: z.string().optional(),
  maxStudents: z.number().min(1).max(50),
});

const editSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  department: z.string().optional(),
  specialization: z.string().optional(),
  maxStudents: z.number().min(1).max(50),
});

export default function Supervisors() {
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [maxStudents, setMaxStudents] = useState(10);
  const [showPassword, setShowPassword] = useState(false);

  // Credentials dialog
  const [credDialogOpen, setCredDialogOpen] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<{ email: string; name: string; password: string } | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showCredPassword, setShowCredPassword] = useState(false);

  // Edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSupervisor, setEditingSupervisor] = useState<Supervisor | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editDepartment, setEditDepartment] = useState("");
  const [editSpecialization, setEditSpecialization] = useState("");
  const [editMaxStudents, setEditMaxStudents] = useState(10);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingSupervisor, setDeletingSupervisor] = useState<Supervisor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    fetchSupervisors();
  }, []);

  const fetchSupervisors = async () => {
    try {
      const { data } = await api.get("/users/role/supervisor");
      const supervisorsWithCount = data.map((sup: any) => ({ ...sup, student_count: 0 }));
      setSupervisors(supervisorsWithCount);
    } catch (error) {
      console.error("Error fetching supervisors:", error);
      toast({ title: "Error", description: "Failed to load supervisors", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Create ──────────────────────────────────────────────────────────
  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    let pwd = "";
    for (let i = 0; i < 12; i++) pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    setPassword(pwd);
  };

  const resetForm = () => {
    setFullName(""); setEmail(""); setPassword("");
    setDepartment(""); setSpecialization(""); setMaxStudents(10);
    setEmailSent(false); setShowPassword(false);
  };

  const handleCreateSupervisor = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = supervisorSchema.safeParse({ fullName, email, password, department, specialization, maxStudents });
    if (!validation.success) {
      toast({ title: "Validation Error", description: validation.error.errors[0].message, variant: "destructive" });
      return;
    }
    setIsCreating(true);
    try {
      await api.post("/users", {
        name: fullName, email, password, role: "supervisor",
        department: department || undefined,
        specialization: specialization || undefined,
        maxStudents,
      });
      setGeneratedCredentials({ email, name: fullName, password });
      setEmailSent(false);
      setDialogOpen(false);
      setCredDialogOpen(true);
      toast({ title: "Supervisor Created", description: "Account created successfully." });
      fetchSupervisors();
      resetForm();
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.msg || "Failed to create supervisor", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  // ── Credentials email ────────────────────────────────────────────────
  const copyCredentials = () => {
    if (!generatedCredentials) return;
    navigator.clipboard.writeText(`Email: ${generatedCredentials.email}\nPassword: ${generatedCredentials.password}`)
      .then(() => toast({ title: "Copied", description: "Credentials copied to clipboard" }));
  };

  const handleSendEmail = async () => {
    if (!generatedCredentials) return;
    setIsSendingEmail(true);
    try {
      await api.post("/auth/send-credentials", {
        email: generatedCredentials.email,
        name: generatedCredentials.name,
        password: generatedCredentials.password,
      }, { timeout: 30000 }); // 30s — enough for SMTP, won't hang forever
      setEmailSent(true);
      toast({ title: "Email Sent", description: `Credentials sent to ${generatedCredentials.email}` });
    } catch (error: any) {
      toast({
        title: "Email Failed",
        description: error.response?.data?.msg || "Failed to send email. Copy credentials manually.",
        variant: "destructive",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  // ── Edit ─────────────────────────────────────────────────────────────
  const openEditDialog = (supervisor: Supervisor) => {
    setEditingSupervisor(supervisor);
    setEditName(supervisor.name);
    setEditEmail(supervisor.email);
    setEditDepartment(supervisor.department || "");
    setEditSpecialization(supervisor.specialization || "");
    setEditMaxStudents(supervisor.maxStudents || 10);
    setEditDialogOpen(true);
  };

  const handleUpdateSupervisor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupervisor) return;
    const validation = editSchema.safeParse({
      fullName: editName, email: editEmail,
      department: editDepartment, specialization: editSpecialization,
      maxStudents: editMaxStudents,
    });
    if (!validation.success) {
      toast({ title: "Validation Error", description: validation.error.errors[0].message, variant: "destructive" });
      return;
    }
    setIsUpdating(true);
    try {
      await api.put(`/users/${editingSupervisor._id}`, {
        name: editName,
        email: editEmail,
        department: editDepartment || undefined,
        specialization: editSpecialization || undefined,
        maxStudents: editMaxStudents,
      });
      toast({ title: "Updated", description: `${editName}'s profile has been updated.` });
      setEditDialogOpen(false);
      setEditingSupervisor(null);
      fetchSupervisors();
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.msg || "Failed to update supervisor", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────
  const openDeleteDialog = (supervisor: Supervisor) => {
    setDeletingSupervisor(supervisor);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSupervisor = async () => {
    if (!deletingSupervisor) return;
    setIsDeleting(true);
    try {
      await api.delete(`/users/${deletingSupervisor._id}`);
      toast({ title: "Deleted", description: `${deletingSupervisor.name} has been removed.` });
      setDeleteDialogOpen(false);
      setDeletingSupervisor(null);
      fetchSupervisors();
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.msg || "Failed to delete supervisor", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Supervisors</h1>
            <p className="text-muted-foreground mt-1 text-sm">Manage supervisor accounts and assignments</p>
          </div>

          {/* ── Add Supervisor dialog ── */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Supervisor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Supervisor</DialogTitle>
                <DialogDescription>Create a new supervisor account with login credentials</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSupervisor} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Dr. John Smith" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="j.smith@university.edu" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter or generate password"
                        className="pr-10"
                        required
                      />
                      <button type="button" onClick={() => setShowPassword((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <Button type="button" variant="outline" onClick={generatePassword}>Generate</Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input id="department" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Computer Science" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxStudents">Max Students</Label>
                    <Input id="maxStudents" type="number" min={1} max={50} value={maxStudents} onChange={(e) => setMaxStudents(parseInt(e.target.value))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input id="specialization" value={specialization} onChange={(e) => setSpecialization(e.target.value)} placeholder="Machine Learning, Web Development" />
                </div>
                <Button type="submit" className="w-full" disabled={isCreating}>
                  {isCreating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : "Create Supervisor"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* ── Credentials dialog ── */}
        <Dialog open={credDialogOpen} onOpenChange={(open) => { setCredDialogOpen(open); if (!open) setGeneratedCredentials(null); }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-5 w-5" />
                Supervisor Created Successfully
              </DialogTitle>
              <DialogDescription>Share these credentials or send them directly to the supervisor's email.</DialogDescription>
            </DialogHeader>
            {generatedCredentials && (
              <div className="space-y-5">
                <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-3">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Name</p>
                    <p className="font-medium text-foreground">{generatedCredentials.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email</p>
                    <p className="font-medium text-foreground">{generatedCredentials.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Password</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono font-semibold text-foreground tracking-wider">
                        {showCredPassword ? generatedCredentials.password : "•".repeat(generatedCredentials.password.length)}
                      </p>
                      <button type="button" onClick={() => setShowCredPassword((p) => !p)}
                        className="text-muted-foreground hover:text-foreground transition-colors">
                        {showCredPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button onClick={handleSendEmail} disabled={isSendingEmail || emailSent} className="w-full">
                    {isSendingEmail ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending Email...</>
                      : emailSent ? <><CheckCircle2 className="mr-2 h-4 w-4 text-green-400" />Credentials Sent</>
                      : <><Mail className="mr-2 h-4 w-4" />Send Credentials to Email</>}
                  </Button>
                  <div className="flex gap-2">
                    <Button onClick={copyCredentials} variant="outline" className="flex-1">
                      <Copy className="mr-2 h-4 w-4" />Copy Credentials
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => { setCredDialogOpen(false); setGeneratedCredentials(null); }}>
                      Done
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center">Ask the supervisor to change their password after first login.</p>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* ── Edit dialog ── */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Supervisor</DialogTitle>
              <DialogDescription>Update {editingSupervisor?.name}'s account details</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateSupervisor} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editName">Full Name</Label>
                <Input id="editName" value={editName} onChange={(e) => setEditName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editEmail">Email</Label>
                <Input id="editEmail" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editDepartment">Department</Label>
                  <Input id="editDepartment" value={editDepartment} onChange={(e) => setEditDepartment(e.target.value)} placeholder="Computer Science" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editMaxStudents">Max Students</Label>
                  <Input id="editMaxStudents" type="number" min={1} max={50} value={editMaxStudents} onChange={(e) => setEditMaxStudents(parseInt(e.target.value))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editSpecialization">Specialization</Label>
                <Input id="editSpecialization" value={editSpecialization} onChange={(e) => setEditSpecialization(e.target.value)} placeholder="Machine Learning, Web Development" />
              </div>
              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ── Delete confirmation ── */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Supervisor?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete <strong>{deletingSupervisor?.name}</strong>'s account
                ({deletingSupervisor?.email}). This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteSupervisor}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</> : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* ── Table ── */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              All Supervisors
            </CardTitle>
            <CardDescription>
              {supervisors.length} supervisor{supervisors.length !== 1 ? "s" : ""} registered
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : supervisors.length === 0 ? (
              <div className="text-center py-8">
                <UserCog className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">No supervisors found</p>
                <p className="text-sm text-muted-foreground">Click "Add Supervisor" to create one</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supervisors.map((supervisor) => (
                    <TableRow key={supervisor._id}>
                      <TableCell className="font-medium">{supervisor.name}</TableCell>
                      <TableCell>{supervisor.email}</TableCell>
                      <TableCell>{supervisor.department || "—"}</TableCell>
                      <TableCell>{supervisor.specialization || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="gap-1">
                          <Users className="h-3 w-3" />
                          {supervisor.student_count || 0} / {supervisor.maxStudents || 10}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(supervisor)}
                            className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(supervisor)}
                            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
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
