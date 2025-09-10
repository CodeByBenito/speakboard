import { useState, useEffect } from "react";
import { Student, StudentDisplay } from "@/types/Student";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "@/hooks/use-toast";

// Helper function to convert database format to display format
const studentToDisplay = (student: any): StudentDisplay => ({
  id: student.id.toString(),
  name: student.name,
  age: student.age,
  contact: student.contact,
  level: student.level as 'Iniciante' | 'Intermediário' | 'Avançado',
  totalClasses: student.total_classes,
  completedClasses: student.completed_classes,
  nextClassDate: student.last_class_date || undefined,
  nextLessonTopic: student.next_lesson_topic || undefined,
  paymentAmount: student.payment_amount || 0,
  paymentDueDate: student.payment_due_date || undefined,
  paymentStatus: student.payment_status || 'pending',
  lastPaymentDate: student.last_payment_date || undefined,
  createdAt: student.created_at,
});

// Helper function to convert display format to database format
const displayToStudent = (display: Omit<StudentDisplay, 'id' | 'createdAt'>): Omit<Student, 'id' | 'created_at' | 'user_id'> => ({
  name: display.name,
  age: display.age,
  contact: display.contact,
  level: display.level,
  total_classes: display.totalClasses,
  completed_classes: display.completedClasses,
  last_class_date: display.nextClassDate || null,
  next_lesson_topic: display.nextLessonTopic || null,
  payment_amount: display.paymentAmount || 0,
  payment_due_date: display.paymentDueDate || null,
  payment_status: display.paymentStatus || 'pending',
  last_payment_date: display.lastPaymentDate || null,
});

export const useStudents = () => {
  const [students, setStudents] = useState<StudentDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchStudents = async () => {
    if (!user) {
      setStudents([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching students:', error);
        toast({
          title: "Erro ao carregar alunos",
          description: "Não foi possível carregar a lista de alunos.",
          variant: "destructive",
        });
        return;
      }

      const displayStudents = data?.map(studentToDisplay) || [];
      setStudents(displayStudents);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao carregar os dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [user]);

  const addStudent = async (studentData: Omit<StudentDisplay, 'id' | 'createdAt'>) => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para adicionar alunos.",
        variant: "destructive",
      });
      return;
    }

    try {
      const dbStudentData = displayToStudent(studentData);
      
      const { data, error } = await supabase
        .from('students')
        .insert([{
          ...dbStudentData,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding student:', error);
        toast({
          title: "Erro ao adicionar aluno",
          description: "Não foi possível adicionar o aluno.",
          variant: "destructive",
        });
        return;
      }

      const newStudent = studentToDisplay(data as any);
      setStudents(prev => [newStudent, ...prev]);
      
      toast({
        title: "Aluno adicionado!",
        description: `${studentData.name} foi adicionado com sucesso.`,
      });
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao adicionar o aluno.",
        variant: "destructive",
      });
    }
  };

  const updateStudent = async (studentId: string, studentData: Omit<StudentDisplay, 'id' | 'createdAt'>) => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para atualizar alunos.",
        variant: "destructive",
      });
      return;
    }

    try {
      const dbStudentData = displayToStudent(studentData);
      
      const { data, error } = await supabase
        .from('students')
        .update(dbStudentData)
        .eq('id', parseInt(studentId))
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating student:', error);
        toast({
          title: "Erro ao atualizar aluno",
          description: "Não foi possível atualizar o aluno.",
          variant: "destructive",
        });
        return;
      }

      const updatedStudent = studentToDisplay(data as any);
      setStudents(prev => prev.map(student => 
        student.id === studentId ? updatedStudent : student
      ));

      toast({
        title: "Aluno atualizado!",
        description: `${studentData.name} foi atualizado com sucesso.`,
      });
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao atualizar o aluno.",
        variant: "destructive",
      });
    }
  };

  const deleteStudent = async (studentId: string) => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para excluir alunos.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', parseInt(studentId))
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting student:', error);
        toast({
          title: "Erro ao excluir aluno",
          description: "Não foi possível excluir o aluno.",
          variant: "destructive",
        });
        return;
      }

      setStudents(prev => prev.filter(student => student.id !== studentId));
      
      toast({
        title: "Aluno excluído!",
        description: "O aluno foi removido com sucesso.",
      });
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao excluir o aluno.",
        variant: "destructive",
      });
    }
  };

  const getStudentById = (studentId: string) => {
    return students.find(student => student.id === studentId);
  };

  // Estatísticas
  const totalStudents = students.length;
  const totalCompletedClasses = students.reduce((sum, student) => sum + student.completedClasses, 0);
  const totalPendingClasses = students.reduce((sum, student) => sum + (student.totalClasses - student.completedClasses), 0);
  const studentsWithUpcomingClasses = students.filter(student => 
    student.nextClassDate && new Date(student.nextClassDate) >= new Date()
  ).length;

  return {
    students,
    loading,
    addStudent,
    updateStudent,
    deleteStudent,
    getStudentById,
    refetch: fetchStudents,
    stats: {
      totalStudents,
      totalCompletedClasses,
      totalPendingClasses,
      studentsWithUpcomingClasses
    }
  };
};