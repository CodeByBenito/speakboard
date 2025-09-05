import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Users, BookOpen, Clock, Calendar } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { StudentsTable } from "./StudentsTable";
import { StudentModal } from "./StudentModal";
import { ProgressChart } from "./ProgressChart";
import { useStudents } from "@/hooks/useStudents";
import { Student } from "@/types/Student";
import { toast } from "@/hooks/use-toast";

export const StudentDashboard = () => {
  const { students, addStudent, updateStudent, deleteStudent, stats } = useStudents();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | undefined>();

  const handleAddStudent = () => {
    setSelectedStudent(undefined);
    setIsModalOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleDeleteStudent = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      deleteStudent(studentId);
      toast({
        title: "Aluno removido",
        description: `${student.name} foi removido com sucesso.`,
      });
    }
  };

  const handleSaveStudent = (studentData: Omit<Student, 'id' | 'createdAt'>) => {
    if (selectedStudent) {
      updateStudent(selectedStudent.id, studentData);
    } else {
      addStudent(studentData);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(undefined);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Dashboard de Alunos
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie seus alunos e acompanhe o progresso das aulas
            </p>
          </div>
          
          <Button 
            onClick={handleAddStudent}
            variant="gradient"
            className="shadow-soft"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Aluno
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total de Alunos"
            value={stats.totalStudents}
            description="Alunos cadastrados"
            icon={Users}
            variant="default"
          />
          
          <StatsCard
            title="Aulas Realizadas"
            value={stats.totalCompletedClasses}
            description="Aulas já concluídas"
            icon={BookOpen}
            variant="success"
          />
          
          <StatsCard
            title="Aulas Pendentes"
            value={stats.totalPendingClasses}
            description="Aulas a serem realizadas"
            icon={Clock}
            variant="warning"
          />
          
          <StatsCard
            title="Próximas Aulas"
            value={stats.studentsWithUpcomingClasses}
            description="Alunos com aulas agendadas"
            icon={Calendar}
            variant="default"
          />
        </div>

        {/* Charts */}
        <ProgressChart students={students} />

        {/* Students Table */}
        <StudentsTable
          students={students}
          onEdit={handleEditStudent}
          onDelete={handleDeleteStudent}
        />

        {/* Student Modal */}
        <StudentModal
          student={selectedStudent}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveStudent}
        />
      </div>
    </div>
  );
};