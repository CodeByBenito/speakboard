import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StudentDisplay, StudentLevel } from "@/types/Student";
import { useToast } from "@/hooks/use-toast";

interface StudentModalProps {
  student?: StudentDisplay;
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Omit<StudentDisplay, 'id' | 'createdAt'>) => void;
}

export const StudentModal = ({
  student,
  isOpen,
  onClose,
  onSave
}: StudentModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    contact: "",
    level: "" as StudentLevel | "",
    totalClasses: "",
    completedClasses: "",
    nextClassDate: ""
  });

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        age: student.age.toString(),
        contact: student.contact,
        level: student.level,
        totalClasses: student.totalClasses.toString(),
        completedClasses: student.completedClasses.toString(),
        nextClassDate: student.nextClassDate || ""
      });
    } else {
      setFormData({
        name: "",
        age: "",
        contact: "",
        level: "",
        totalClasses: "",
        completedClasses: "",
        nextClassDate: ""
      });
    }
  }, [student, isOpen]);

  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.age || !formData.contact || !formData.level) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const studentData: Omit<StudentDisplay, 'id' | 'createdAt'> = {
      name: formData.name,
      age: parseInt(formData.age),
      contact: formData.contact,
      level: formData.level as StudentLevel,
      totalClasses: parseInt(formData.totalClasses) || 0,
      completedClasses: parseInt(formData.completedClasses) || 0,
      nextClassDate: formData.nextClassDate || undefined
    };

    onSave(studentData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {student ? "Editar Aluno" : "Novo Aluno"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Idade *</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                placeholder="25"
                min="1"
                max="120"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">Telefone ou Email *</Label>
            <Input
              id="contact"
              value={formData.contact}
              onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
              placeholder="(11) 99999-9999 ou email@exemplo.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Nível *</Label>
            <Select 
              value={formData.level} 
              onValueChange={(value: StudentLevel) => 
                setFormData(prev => ({ ...prev, level: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Iniciante">Iniciante</SelectItem>
                <SelectItem value="Intermediário">Intermediário</SelectItem>
                <SelectItem value="Avançado">Avançado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalClasses">Total de Aulas</Label>
              <Input
                id="totalClasses"
                type="number"
                value={formData.totalClasses}
                onChange={(e) => setFormData(prev => ({ ...prev, totalClasses: e.target.value }))}
                placeholder="0"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="completedClasses">Aulas Realizadas</Label>
              <Input
                id="completedClasses"
                type="number"
                value={formData.completedClasses}
                onChange={(e) => setFormData(prev => ({ ...prev, completedClasses: e.target.value }))}
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nextClassDate">Próxima Aula</Label>
            <Input
              id="nextClassDate"
              type="date"
              value={formData.nextClassDate}
              onChange={(e) => setFormData(prev => ({ ...prev, nextClassDate: e.target.value }))}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="gradient">
              {student ? "Atualizar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};