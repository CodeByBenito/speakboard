import { useState, useEffect } from "react";
import { Student } from "@/types/Student";

// Dados mockados para demonstração
const initialStudents: Student[] = [
  {
    id: "1",
    name: "Ana Silva",
    age: 28,
    contact: "ana.silva@email.com",
    level: "Intermediário",
    totalClasses: 20,
    completedClasses: 12,
    nextClassDate: "2024-01-15",
    createdAt: "2024-01-01"
  },
  {
    id: "2", 
    name: "Carlos Santos",
    age: 35,
    contact: "(11) 99999-1234",
    level: "Avançado",
    totalClasses: 15,
    completedClasses: 15,
    nextClassDate: "2024-01-18",
    createdAt: "2024-01-02"
  },
  {
    id: "3",
    name: "Maria Oliveira", 
    age: 22,
    contact: "maria.oliveira@email.com",
    level: "Iniciante",
    totalClasses: 10,
    completedClasses: 3,
    nextClassDate: "2024-01-12",
    createdAt: "2024-01-03"
  },
  {
    id: "4",
    name: "João Pedro",
    age: 19,
    contact: "(11) 98888-5678", 
    level: "Iniciante",
    totalClasses: 8,
    completedClasses: 1,
    createdAt: "2024-01-04"
  },
  {
    id: "5",
    name: "Fernanda Costa",
    age: 31,
    contact: "fernanda.costa@email.com",
    level: "Intermediário",
    totalClasses: 25,
    completedClasses: 18,
    nextClassDate: "2024-01-20",
    createdAt: "2024-01-05"
  }
];

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    // Simula carregamento dos dados (em um app real viria de uma API)
    const savedStudents = localStorage.getItem('students');
    if (savedStudents) {
      setStudents(JSON.parse(savedStudents));
    } else {
      setStudents(initialStudents);
      localStorage.setItem('students', JSON.stringify(initialStudents));
    }
  }, []);

  // Salva no localStorage sempre que students muda
  useEffect(() => {
    if (students.length > 0) {
      localStorage.setItem('students', JSON.stringify(students));
    }
  }, [students]);

  const addStudent = (studentData: Omit<Student, 'id' | 'createdAt'>) => {
    const newStudent: Student = {
      ...studentData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    setStudents(prev => [...prev, newStudent]);
  };

  const updateStudent = (studentId: string, studentData: Omit<Student, 'id' | 'createdAt'>) => {
    setStudents(prev => prev.map(student => 
      student.id === studentId 
        ? { ...student, ...studentData }
        : student
    ));
  };

  const deleteStudent = (studentId: string) => {
    setStudents(prev => prev.filter(student => student.id !== studentId));
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
    addStudent,
    updateStudent,
    deleteStudent,
    getStudentById,
    stats: {
      totalStudents,
      totalCompletedClasses,
      totalPendingClasses,
      studentsWithUpcomingClasses
    }
  };
};