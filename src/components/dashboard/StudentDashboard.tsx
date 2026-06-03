import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Users, BookOpen, Clock, Calendar, RefreshCw, LayoutGrid, List, Search } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { StudentsTable } from "./StudentsTable";
import { StudentModal } from "./StudentModal";
import { CrmSidebar } from "./CrmSidebar";
import { useStudents } from "@/hooks/useStudents";
import { useUserRole } from "@/hooks/useUserRole";
import { useProfile } from "@/hooks/useProfile";
import { StudentDisplay } from "@/types/Student";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { parseLocalDate } from "@/lib/utils";

export const StudentDashboard = () => {
  const { students, loading, addStudent, updateStudent, deleteStudent, stats, refetch } = useStudents();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { profile } = useProfile();
  
  // UI states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentDisplay | undefined>();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<'all' | 'Iniciante' | 'Intermediário' | 'Avançado'>('all');

  // Select first student by default on desktop once loaded
  useEffect(() => {
    if (students.length > 0 && !selectedStudentId && window.innerWidth >= 768) {
      setSelectedStudentId(students[0].id);
    }
  }, [students, selectedStudentId]);

  const handleAddStudent = () => {
    setSelectedStudent(undefined);
    setIsModalOpen(true);
  };

  const handleEditStudent = (student: StudentDisplay) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleDeleteStudent = (studentId: string) => {
    deleteStudent(studentId);
    if (selectedStudentId === studentId) {
      setSelectedStudentId(null);
    }
  };

  const handleSaveStudent = (studentData: Omit<StudentDisplay, 'id' | 'createdAt'>) => {
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

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.contact.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === "all" || student.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const activeCrmStudent = students.find(s => s.id === selectedStudentId);

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground text-sm">Carregando alunos e CRM...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Left Main Section */}
      <div className="flex-1 p-4 md:p-8 space-y-6 overflow-y-auto max-h-screen">
        {/* Top welcome banner */}
        <div className="relative rounded-3xl overflow-hidden p-6 md:p-8 bg-gradient-hero text-white shadow-medium flex flex-col md:flex-row items-center justify-between gap-6 border-0">
          <div className="space-y-2 text-center md:text-left z-10">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Olá, {profile?.displayName || "Professor"}! 👋
            </h2>
            <p className="text-sm text-white/90 max-w-md">
              Acompanhe o desenvolvimento pedagógico, controle frequências e gerencie as mensalidades dos seus alunos em um só lugar.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 justify-center md:justify-start">
              <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 py-1 px-3">
                {stats.totalStudents} Alunos Cadastrados
              </Badge>
              <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 py-1 px-3">
                {stats.totalCompletedClasses} Aulas Ministradas
              </Badge>
            </div>
          </div>
          <div className="flex-shrink-0 flex gap-2 z-10">
            <Button 
              onClick={refetch} 
              variant="secondary"
              className="bg-white/10 text-white hover:bg-white/25 border-0 font-semibold rounded-xl px-4 py-5"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button 
              onClick={handleAddStudent} 
              className="bg-white text-primary hover:bg-white/90 shadow-soft font-bold rounded-xl px-5 py-5"
            >
              <Plus className="w-4 h-4 mr-2" /> Novo Aluno
            </Button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar aluno por nome ou contato..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl h-11 border-border/50 bg-card/50 backdrop-blur-sm"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
            {/* Level filter badges/pills */}
            <div className="flex bg-muted/50 p-1 rounded-xl border border-border/30 justify-around sm:justify-start">
              {(['all', 'Iniciante', 'Intermediário', 'Avançado'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLevelFilter(lvl)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    levelFilter === lvl
                      ? 'bg-primary text-white shadow-soft'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {lvl === 'all' ? 'Todos' : lvl}
                </button>
              ))}
            </div>
            
            {/* View Toggle */}
            <div className="flex bg-muted/50 p-1 rounded-xl border border-border/30 self-center sm:self-auto">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-primary text-white shadow-soft' : 'text-muted-foreground'
                }`}
                title="Grade de Cards"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'table' ? 'bg-primary text-white shadow-soft' : 'text-muted-foreground'
                }`}
                title="Lista em Tabela"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Display Area */}
        <div className="min-h-[400px]">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-16 bg-card/40 border border-dashed rounded-3xl text-muted-foreground">
              <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              {students.length === 0 
                ? "Nenhum aluno cadastrado ainda no CRM." 
                : "Nenhum aluno correspondente aos filtros de busca."
              }
              <div className="mt-4">
                <Button onClick={handleAddStudent} size="sm">
                  Cadastrar Aluno
                </Button>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudents.map((s) => {
                const progress = s.totalClasses > 0 ? Math.round((s.completedClasses / s.totalClasses) * 100) : 0;
                
                const levelGradients = {
                  'Iniciante': 'from-orange-600/90 to-orange-500/80',
                  'Intermediário': 'from-zinc-800 to-zinc-700',
                  'Avançado': 'from-neutral-950 to-neutral-900 border border-white/5',
                };
                
                return (
                  <Card 
                    key={s.id}
                    onClick={() => setSelectedStudentId(s.id)}
                    className={`overflow-hidden border-border/50 bg-card/60 backdrop-blur-sm shadow-card hover:shadow-medium hover:scale-[1.01] transition-all duration-300 cursor-pointer rounded-2xl group ${
                      selectedStudentId === s.id ? 'ring-2 ring-primary border-transparent' : ''
                    }`}
                  >
                    {/* Cover gradient representing "course image" */}
                    <div className={`h-24 bg-gradient-to-r ${levelGradients[s.level]} p-4 flex flex-col justify-between text-white relative`}>
                      <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
                      <div className="flex justify-between items-start z-10">
                        <Badge className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-0 font-bold text-[10px]">
                          {s.level}
                        </Badge>
                        <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-xs">
                          {s.name.charAt(0)}
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-white/80 z-10 bg-black/20 self-start px-2 py-0.5 rounded-full">
                        {s.age} anos
                      </span>
                    </div>
                    
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <h4 className="font-bold text-base text-foreground group-hover:text-primary transition-colors truncate">
                          {s.name}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{s.contact}</p>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-medium">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className="text-foreground">{s.completedClasses}/{s.totalClasses} aulas ({progress}%)</span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                      </div>
                      
                      {/* Divider */}
                      <Separator className="bg-border/40" />
                      
                      {/* Next lesson info */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
                          <Calendar className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          <span className="truncate">
                            {s.nextClassDate 
                              ? format(parseLocalDate(s.nextClassDate), "dd/MM/yy") 
                              : "Sem agendamento"}
                          </span>
                        </div>
                        {s.nextLessonTopic && (
                          <Badge variant="secondary" className="max-w-[120px] truncate text-[9px] px-1.5 py-0 bg-muted/60">
                            {s.nextLessonTopic}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <StudentsTable
              students={filteredStudents}
              onEdit={handleEditStudent}
              onDelete={handleDeleteStudent}
              hideFilters={true}
            />
          )}
        </div>
      </div>

      {/* Right Sidebar CRM Panel */}
      <div className="w-full md:w-[320px] xl:w-[380px] flex-shrink-0">
        <CrmSidebar
          student={activeCrmStudent}
          students={students}
          updateStudent={updateStudent}
          onEdit={handleEditStudent}
          onDelete={handleDeleteStudent}
          onClearSelection={() => setSelectedStudentId(null)}
        />
      </div>

      {/* Student Modal */}
      <StudentModal
        student={selectedStudent}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveStudent}
      />
    </div>
  );
};