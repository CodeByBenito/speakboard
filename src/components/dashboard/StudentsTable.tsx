import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { StudentDisplay, StudentLevel } from "@/types/Student";
import { Edit, Trash2, Search, Filter } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface StudentsTableProps {
  students: StudentDisplay[];
  onEdit: (student: StudentDisplay) => void;
  onDelete: (studentId: string) => void;
}

export const StudentsTable = ({ students, onEdit, onDelete }: StudentsTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<StudentLevel | "all">("all");

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.contact.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === "all" || student.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const getLevelBadgeVariant = (level: StudentLevel) => {
    switch (level) {
      case 'Iniciante':
        return 'bg-warning text-warning-foreground';
      case 'Intermediário':
        return 'bg-primary text-primary-foreground';
      case 'Avançado':
        return 'bg-success text-success-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getProgressPercentage = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Alunos Cadastrados
        </CardTitle>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou contato..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={levelFilter} onValueChange={(value: StudentLevel | "all") => setLevelFilter(value)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrar por nível" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os níveis</SelectItem>
              <SelectItem value="Iniciante">Iniciante</SelectItem>
              <SelectItem value="Intermediário">Intermediário</SelectItem>
              <SelectItem value="Avançado">Avançado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredStudents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {students.length === 0 
              ? "Nenhum aluno cadastrado ainda." 
              : "Nenhum aluno encontrado com os filtros aplicados."
            }
          </div>
        ) : (
          <>
            {/* Desktop Table View - Hidden on mobile */}
            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Idade</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Nível</TableHead>
                    <TableHead>Progresso</TableHead>
                    <TableHead>Próxima Aula</TableHead>
                    <TableHead>Tema</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.age} anos</TableCell>
                      <TableCell>{student.contact}</TableCell>
                      <TableCell>
                        <Badge className={getLevelBadgeVariant(student.level)}>
                          {student.level}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{student.completedClasses}/{student.totalClasses}</span>
                            <span>{getProgressPercentage(student.completedClasses, student.totalClasses)}%</span>
                          </div>
                          <Progress 
                            value={getProgressPercentage(student.completedClasses, student.totalClasses)} 
                            className="h-2"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        {student.nextClassDate 
                          ? new Date(student.nextClassDate).toLocaleDateString('pt-BR')
                          : "Não agendada"
                        }
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        {student.nextLessonTopic ? (
                          <div className="px-2 py-1 bg-accent/20 rounded-md text-sm truncate" title={student.nextLessonTopic}>
                            {student.nextLessonTopic}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onEdit(student)}
                            className="hover:bg-primary hover:text-primary-foreground"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onDelete(student.id)}
                            className="hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View - Hidden on desktop */}
            <div className="lg:hidden space-y-4">
              {filteredStudents.map((student) => (
                <Card key={student.id} className="border-border/50 shadow-soft">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{student.name}</h3>
                        <p className="text-sm text-muted-foreground">{student.age} anos</p>
                      </div>
                      <Badge className={getLevelBadgeVariant(student.level)}>
                        {student.level}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Contato:</span>
                        <span className="font-medium break-all">{student.contact}</span>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-muted-foreground">Progresso:</span>
                          <span className="font-medium">
                            {student.completedClasses}/{student.totalClasses} 
                            ({getProgressPercentage(student.completedClasses, student.totalClasses)}%)
                          </span>
                        </div>
                        <Progress 
                          value={getProgressPercentage(student.completedClasses, student.totalClasses)} 
                          className="h-2"
                        />
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Próxima Aula:</span>
                        <span className="font-medium">
                          {student.nextClassDate 
                            ? new Date(student.nextClassDate).toLocaleDateString('pt-BR')
                            : "Não agendada"
                          }
                        </span>
                      </div>
                      
                      {student.nextLessonTopic && (
                        <div>
                          <span className="text-muted-foreground">Tema:</span>
                          <div className="mt-1 px-2 py-1 bg-accent/20 rounded-md text-sm">
                            {student.nextLessonTopic}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onEdit(student)}
                        className="flex-1 hover:bg-primary hover:text-primary-foreground"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onDelete(student.id)}
                        className="flex-1 hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};