import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { Plus, Users, Copy, Mail, Upload, Loader2, FileSpreadsheet, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { z } from "zod";
import * as XLSX from "xlsx";

interface Student {
  _id: string;
  name: string;
  email: string;
  role: string;
  matricNumber?: string;
  department?: string;
  level?: string;
  supervisor?: string;
  supervisor_name?: string;
}

const studentSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100),
  password: z.string().min(6, "Password must be at least 6 characters"),
  matricNumber: z.string()
    .min(3, "Matric number is required")
    .regex(/^[A-Za-z]+\/\d+\/\d+$/, "Matric number must be in format CSC/000/00"),
  department: z.string().optional(),
  level: z.string().optional(),
});

// Convert matric number to email format
const matricToEmail = (matricNumber: string): string => {
  const formatted = matricNumber.toLowerCase().replace(/\//g, ".");
  return `${formatted}@student.fyp`;
};

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<{ email: string; password: string } | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const { toast } = useToast();

  // Form state
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [matricNumber, setMatricNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [level, setLevel] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data } = await api.get("/users/role/student");
      // For now, set supervisor_name to null, can be updated later if needed
      const studentsWithSupervisor = data.map((student: any) => ({ ...student, supervisor_name: null }));
      setStudents(studentsWithSupervisor);
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
    setPassword(password);
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = studentSchema.safeParse({
      fullName,
      password,
      matricNumber,
      department,
      level,
    });

    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate matric number
    try {
      const { data: existingStudents } = await api.get("/users/role/student");
      const duplicate = existingStudents.find((s: any) => s.matricNumber === matricNumber);
      if (duplicate) {
        toast({
          title: "Duplicate Entry",
          description: "A student with this matric number already exists",
          variant: "destructive",
        });
        return;
      }
    } catch (error) {
      console.error("Error checking duplicates:", error);
    }

    setIsCreating(true);

    try {
      // Convert matric number to email format
      const email = matricToEmail(matricNumber);

      const { data } = await api.post("/users", {
        name: fullName,
        email,
        password,
        role: "student",
        matricNumber,
        department: department || undefined,
        level: level || undefined,
      });

      setGeneratedCredentials({ email: matricNumber, password });
      toast({
        title: "Student Created",
        description: "The student account has been created successfully.",
      });

      fetchStudents();
      resetForm();
      setDialogOpen(false);
    } catch (error: any) {
      console.error("Error creating student:", error);
      toast({
        title: "Error",
        description: error.response?.data?.msg || "Failed to create student",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFile(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      let created = 0;
      let skipped = 0;
      const errors: string[] = [];

      for (const row of jsonData as any[]) {
        const fullName = row["Full Name"] || row["Name"] || row["fullName"] || "";
        const matricNumber = row["Matric Number"] || row["matricNumber"] || row["ID"] || "";
        const department = row["Department"] || row["department"] || "";
        const level = row["Level"] || row["level"] || "";

        if (!fullName || !matricNumber) {
          errors.push(`Skipped row: missing required fields (Full Name, Matric Number)`);
          skipped++;
          continue;
        }

        // Validate matric number format
        if (!/^[A-Za-z]+\/\d+\/\d+$/.test(matricNumber)) {
          errors.push(`Skipped ${matricNumber}: invalid format (use CSC/000/00)`);
          skipped++;
          continue;
        }

        // Generate email from matric number
        const email = matricToEmail(matricNumber);

        // Check for duplicate - TODO: implement
        // const { data: existing } = await supabase
        //   .from("students")
        //   .select("id")
        //   .eq("matric_number", matricNumber)
        //   .maybeSingle();

        // if (existing) {
        //   errors.push(`Skipped ${matricNumber}: already exists`);
        //   skipped++;
        //   continue;
        // }

        const generatedPassword = Math.random().toString(36).slice(-8) + "A1";

        try {
          // TODO: use API to create user
          // const response = await api.post('/auth/register', {
          //   email,
          //   password: generatedPassword,
          //   name: fullName,
          //   role: "student",
          //   matricNumber,
          //   department: department || null,
          //   level: level || null,
          // });

          created++;
        } catch (err: any) {
          errors.push(`Failed ${email}: ${err.message}`);
          skipped++;
        }
      }

      toast({
        title: "Import Complete",
        description: `Created ${created} students, skipped ${skipped}`,
      });

      fetchStudents();
    } catch (error: any) {
      toast({
        title: "Import Failed",
        description: error.message || "Failed to parse file",
        variant: "destructive",
      });
    } finally {
      setIsUploadingFile(false);
      e.target.value = "";
    }
  };

  const resetForm = () => {
    setFullName("");
    setPassword("");
    setMatricNumber("");
    setDepartment("");
    setLevel("");
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

  const handleDeleteStudent = async (studentId: string) => {
    setIsDeleting(studentId);
    try {
      await api.delete(`/users/${studentId}`);

      toast({
        title: "Student Deleted",
        description: "The student has been removed successfully.",
      });

      fetchStudents();
    } catch (error: any) {
      console.error("Error deleting student:", error);
      toast({
        title: "Error",
        description: error.response?.data?.msg || "Failed to delete student",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDeleteAllStudents = async () => {
    setIsDeletingAll(true);
    try {
      // Delete all students one by one
      const deletePromises = students.map(student => api.delete(`/users/${student._id}`));
      await Promise.all(deletePromises);

      toast({
        title: "All Students Deleted",
        description: `${students.length} student(s) have been removed.`,
      });

      fetchStudents();
    } catch (error: any) {
      console.error("Error deleting all students:", error);
      toast({
        title: "Error",
        description: error.response?.data?.msg || "Failed to delete students",
        variant: "destructive",
      });
    } finally {
      setIsDeletingAll(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Students</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage student accounts and registrations
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Students</DialogTitle>
                <DialogDescription>
                  Add students manually or import from Excel/CSV
                </DialogDescription>
              </DialogHeader>

              {generatedCredentials ? (
                <div className="space-y-4">
                  <div className="rounded-lg bg-success/10 border border-success/20 p-4">
                    <p className="text-sm font-medium text-success mb-2">
                      Student Created Successfully!
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
                <Tabs defaultValue="manual">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                    <TabsTrigger value="import">Import File</TabsTrigger>
                  </TabsList>

                  <TabsContent value="manual" className="mt-4">
                    <form onSubmit={handleCreateStudent} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="John Doe"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="matricNumber">Matric Number</Label>
                          <Input
                            id="matricNumber"
                            value={matricNumber}
                            onChange={(e) => setMatricNumber(e.target.value)}
                            placeholder="CS/2021/001"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Login will use matric number format (e.g., CSC/000/00)
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="flex gap-2">
                          <Input
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter or generate"
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
                          <Label htmlFor="level">Level</Label>
                          <Input
                            id="level"
                            value={level}
                            onChange={(e) => setLevel(e.target.value)}
                            placeholder="400"
                          />
                        </div>
                      </div>

                      <Button type="submit" className="w-full" disabled={isCreating}>
                        {isCreating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          "Create Student"
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="import" className="mt-4">
                    <div className="space-y-4">
                      <div className="rounded-lg border-2 border-dashed border-muted p-8 text-center">
                        <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <p className="mt-4 text-sm text-muted-foreground">
                          Upload an Excel (.xlsx) or CSV file
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Required columns: Full Name, Matric Number (format: CSC/000/00)
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Optional: Department, Level
                        </p>
                        <div className="mt-4">
                          <input
                            type="file"
                            id="file-upload"
                            accept=".xlsx,.xls,.csv"
                            className="hidden"
                            onChange={handleFileUpload}
                            disabled={isUploadingFile}
                          />
                          <Button
                            variant="outline"
                            onClick={() => document.getElementById("file-upload")?.click()}
                            disabled={isUploadingFile}
                          >
                            {isUploadingFile ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Importing...
                              </>
                            ) : (
                              <>
                                <Upload className="mr-2 h-4 w-4" />
                                Select File
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </DialogContent>
          </Dialog>
        </div>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                All Students
              </CardTitle>
              <CardDescription>
                {students.length} student{students.length !== 1 ? "s" : ""} registered
              </CardDescription>
            </div>
            {students.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={isDeletingAll}>
                    {isDeletingAll ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    Delete All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete All Students?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all {students.length} student(s). This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAllStudents} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">No students found</p>
                <p className="text-sm text-muted-foreground">
                  Click "Add Student" to create one
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
                    <TableHead>Level</TableHead>
                    <TableHead>Supervisor</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student._id}>
                      <TableCell className="font-medium">
                        {student.name}
                      </TableCell>
                      <TableCell>{student.matricNumber}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.department || "—"}</TableCell>
                      <TableCell>{student.level || "—"}</TableCell>
                      <TableCell>
                        {student.supervisor_name ? (
                          <Badge variant="secondary">{student.supervisor_name}</Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            Unassigned
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              disabled={isDeleting === student._id}
                            >
                              {isDeleting === student._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Student?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete {student.profile?.full_name || student.matric_number}. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteStudent(student._id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
