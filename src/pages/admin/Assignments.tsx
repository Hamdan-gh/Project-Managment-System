import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { UserPlus, Loader2, Users, Shuffle } from "lucide-react";

interface Student {
  _id: string;
  name: string;
  email: string;
  matricNumber?: string;
  department?: string;
  supervisor?: string;
  supervisor_name?: string;
}

interface Supervisor {
  _id: string;
  name: string;
  email: string;
  department?: string;
  maxStudents: number;
  student_count: number;
}

export default function Assignments() {
  const [students, setStudents] = useState<Student[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [autoAssigning, setAutoAssigning] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch students
      const { data: studentsData } = await api.get("/users/role/student");

      // Fetch supervisors
      const { data: supervisorsData } = await api.get("/users/role/supervisor");

      // For each supervisor, count their students
      const supervisorsWithCount = supervisorsData.map((sup: any) => {
        const studentCount = studentsData.filter((student: any) => student.supervisor === sup._id).length;
        return {
          ...sup,
          student_count: studentCount,
        };
      });

      // For each student, get supervisor name if assigned
      const studentsWithSupervisor = studentsData.map((student: any) => {
        const supervisor = supervisorsData.find((sup: any) => sup._id === student.supervisor);
        return {
          ...student,
          supervisor_name: supervisor ? supervisor.name : null,
        };
      });

      setStudents(studentsWithSupervisor);
      setSupervisors(supervisorsWithCount);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load assignment data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async (studentId: string, supervisorId: string | null) => {
    setAssigning(studentId);

    try {
      if (supervisorId === "unassign") {
        // To unassign, we need to set supervisor to null
        await api.put(`/users/${studentId}`, { supervisor: null });
      } else {
        await api.put(`/users/${studentId}/supervisor/${supervisorId}`);
      }

      toast({
        title: supervisorId === "unassign" ? "Student Unassigned" : "Student Assigned",
        description: supervisorId === "unassign"
          ? "The student has been unassigned from their supervisor"
          : "The student has been assigned to the supervisor",
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.msg || "Failed to update assignment",
        variant: "destructive",
      });
    } finally {
      setAssigning(null);
    }
  };

  const handleAutoAssign = async () => {
    const unassigned = students.filter((s) => !s.supervisor);

    if (unassigned.length === 0) {
      toast({
        title: "No Students to Assign",
        description: "All students are already assigned to supervisors",
      });
      return;
    }

    // Get available supervisors with remaining capacity
    const availableSupervisors = supervisors
      .filter((sup) => sup.student_count < sup.maxStudents)
      .map((sup) => ({
        ...sup,
        remainingCapacity: sup.maxStudents - sup.student_count,
      }));

    if (availableSupervisors.length === 0) {
      toast({
        title: "No Available Supervisors",
        description: "All supervisors have reached their maximum student capacity",
        variant: "destructive",
      });
      return;
    }

    setAutoAssigning(true);

    try {
      // Shuffle unassigned students for randomness
      const shuffledStudents = [...unassigned].sort(() => Math.random() - 0.5);

      // Create assignment map
      const assignments: { studentId: string; supervisorId: string }[] = [];
      const capacityTracker = new Map(
        availableSupervisors.map((sup) => [sup._id, sup.remainingCapacity])
      );

      for (const student of shuffledStudents) {
        // Find supervisors with remaining capacity
        const eligibleSupervisors = availableSupervisors.filter(
          (sup) => (capacityTracker.get(sup._id) || 0) > 0
        );

        if (eligibleSupervisors.length === 0) break;

        // Randomly select a supervisor
        const randomIndex = Math.floor(Math.random() * eligibleSupervisors.length);
        const selectedSupervisor = eligibleSupervisors[randomIndex];

        assignments.push({
          studentId: student._id,
          supervisorId: selectedSupervisor._id,
        });

        // Decrease capacity
        capacityTracker.set(
          selectedSupervisor._id,
          (capacityTracker.get(selectedSupervisor._id) || 1) - 1
        );
      }

      // Execute all assignments
      for (const assignment of assignments) {
        await api.put(`/users/${assignment.studentId}/supervisor/${assignment.supervisorId}`);
      }

      const unassignedCount = unassigned.length - assignments.length;

      toast({
        title: "Auto-Assignment Complete",
        description: `${assignments.length} student(s) assigned randomly to supervisors${
          unassignedCount > 0 ? `. ${unassignedCount} student(s) could not be assigned due to capacity limits.` : ""
        }`,
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.msg || "Failed to auto-assign students",
        variant: "destructive",
      });
    } finally {
      setAutoAssigning(false);
    }
  };

  const unassignedStudents = students.filter((s) => !s.supervisor);
  const assignedStudents = students.filter((s) => s.supervisor);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
          <p className="text-muted-foreground mt-1">
            Assign students to supervisors
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{students.length}</p>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-success/20 flex items-center justify-center">
                  <UserPlus className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{assignedStudents.length}</p>
                  <p className="text-sm text-muted-foreground">Assigned</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-warning/20 flex items-center justify-center">
                  <Users className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{unassignedStudents.length}</p>
                  <p className="text-sm text-muted-foreground">Unassigned</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignment Table */}
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Student Assignments
              </CardTitle>
              <CardDescription className="mt-1">
                Assign or reassign students to supervisors
              </CardDescription>
            </div>
            <Button
              onClick={handleAutoAssign}
              disabled={autoAssigning || isLoading || unassignedStudents.length === 0}
              className="gap-2"
            >
              {autoAssigning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Shuffle className="h-4 w-4" />
              )}
              Auto-Assign All
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">No students to assign</p>
                <p className="text-sm text-muted-foreground">
                  Add students first to make assignments
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Matric No.</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Current Supervisor</TableHead>
                    <TableHead>Assign To</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student._id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.matricNumber}</TableCell>
                      <TableCell>{student.department || "—"}</TableCell>
                      <TableCell>
                        {student.supervisor ? (
                          <Badge variant="secondary">
                            {student.supervisor_name}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            Unassigned
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select
                          disabled={assigning === student._id}
                          value={student.supervisor || ""}
                          onValueChange={(value) => handleAssign(student._id, value)}
                        >
                          <SelectTrigger className="w-48">
                            {assigning === student._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <SelectValue placeholder="Select supervisor" />
                            )}
                          </SelectTrigger>
                          <SelectContent>
                            {student.supervisor && (
                              <SelectItem value="unassign">
                                <span className="text-destructive">Unassign</span>
                              </SelectItem>
                            )}
                            {supervisors.map((sup) => (
                              <SelectItem
                                key={sup._id}
                                value={sup._id}
                                disabled={sup.student_count >= sup.maxStudents && sup._id !== student.supervisor}
                              >
                                <div className="flex items-center gap-2">
                                  <span>{sup.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    ({sup.student_count}/{sup.maxStudents})
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
