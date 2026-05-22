import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { Plus, UserCog, Copy, Mail, Users, Loader2 } from "lucide-react";
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

export default function Supervisors() {
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<{ email: string; password: string } | null>(null);
  const { toast } = useToast();

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [maxStudents, setMaxStudents] = useState(10);

  useEffect(() => {
    fetchSupervisors();
  }, []);

  const fetchSupervisors = async () => {
    try {
      const { data } = await api.get("/users/role/supervisor");
      // For now, set student_count to 0, can be updated later if needed
      const supervisorsWithCount = data.map((sup: any) => ({ ...sup, student_count: 0 }));
      setSupervisors(supervisorsWithCount);
    } catch (error) {
      console.error("Error fetching supervisors:", error);
      toast({
        title: "Error",
        description: "Failed to load supervisors",
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
    setPassword(password);
  };

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPassword("");
    setDepartment("");
    setSpecialization("");
    setMaxStudents(10);
    setGeneratedCredentials(null);
  };

  const handleCreateSupervisor = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = supervisorSchema.safeParse({
      fullName,
      email,
      password,
      department,
      specialization,
      maxStudents,
    });

    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      const { data } = await api.post("/users", {
        name: fullName,
        email,
        password,
        role: "supervisor",
        department: department || undefined,
        specialization: specialization || undefined,
        maxStudents,
      });

      setGeneratedCredentials({ email, password });
      toast({
        title: "Supervisor Created",
        description: "The supervisor account has been created successfully.",
      });

      fetchSupervisors();
      resetForm();
      setDialogOpen(false);
    } catch (error: any) {
      console.error("Error creating supervisor:", error);
      toast({
        title: "Error",
        description: error.response?.data?.msg || "Failed to create supervisor",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Supervisors</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage supervisor accounts and assignments
            </p>
          </div>
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
                <DialogDescription>
                  Create a new supervisor account with auto-generated credentials
                </DialogDescription>
              </DialogHeader>

              {generatedCredentials ? (
                <div className="space-y-4">
                  <div className="rounded-lg bg-success/10 border border-success/20 p-4">
                    <p className="text-sm font-medium text-success mb-2">
                      Supervisor Created Successfully!
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
                      Copy Credentials
                    </Button>
                    <Button
                      onClick={() => {
                        setGeneratedCredentials(null);
                        setDialogOpen(false);
                      }}
                      className="flex-1"
                    >
                      Done
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreateSupervisor} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Dr. John Smith"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="j.smith@university.edu"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="flex gap-2">
                      <Input
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter or generate password"
                        required
                      />
                      <Button type="button" variant="outline" onClick={generatePassword}>
                        Generate
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="Computer Science"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxStudents">Max Students</Label>
                      <Input
                        id="maxStudents"
                        type="number"
                        min={1}
                        max={50}
                        value={maxStudents}
                        onChange={(e) => setMaxStudents(parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization</Label>
                    <Input
                      id="specialization"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      placeholder="Machine Learning, Web Development"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Supervisor"
                    )}
                  </Button>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>

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
                <p className="text-sm text-muted-foreground">
                  Click "Add Supervisor" to create one
                </p>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supervisors.map((supervisor) => (
                    <TableRow key={supervisor._id}>
                      <TableCell className="font-medium">
                        {supervisor.name}
                      </TableCell>
                      <TableCell>{supervisor.email}</TableCell>
                      <TableCell>{supervisor.department || "—"}</TableCell>
                      <TableCell>{supervisor.specialization || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="gap-1">
                          <Users className="h-3 w-3" />
                          {supervisor.student_count || 0} / {supervisor.maxStudents || 10}
                        </Badge>
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