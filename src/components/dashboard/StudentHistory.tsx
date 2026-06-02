import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStudentHistory } from '@/hooks/useStudentHistory';
import { History, BookOpen, DollarSign, Calendar, FileText, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface StudentHistoryProps {
  studentId: string;
  studentName: string;
}

export const StudentHistory = ({ studentId, studentName }: StudentHistoryProps) => {
  const { classHistory, paymentHistory, loading, addClassRecord, addPaymentRecord, addReportRecord } = useStudentHistory(studentId);
  const [isClassDialogOpen, setIsClassDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  const [classForm, setClassForm] = useState({
    class_date: new Date().toISOString().split('T')[0],
    topic: '',
    notes: '',
    status: 'completed',
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    due_date: '',
    status: 'paid',
    notes: '',
  });

  const [reportForm, setReportForm] = useState({
    report_date: new Date().toISOString().split('T')[0],
    title: '',
    content: '',
  });

  const handleAddClass = async () => {
    await addClassRecord({
      class_date: new Date(classForm.class_date).toISOString(),
      topic: classForm.topic,
      notes: classForm.notes,
      status: classForm.status,
    });
    setIsClassDialogOpen(false);
    setClassForm({
      class_date: new Date().toISOString().split('T')[0],
      topic: '',
      notes: '',
      status: 'completed',
    });
  };

  const handleAddPayment = async () => {
    await addPaymentRecord({
      amount: parseFloat(paymentForm.amount),
      payment_date: new Date(paymentForm.payment_date).toISOString(),
      due_date: paymentForm.due_date ? new Date(paymentForm.due_date).toISOString() : undefined,
      status: paymentForm.status,
      notes: paymentForm.notes,
    });
    setIsPaymentDialogOpen(false);
    setPaymentForm({
      amount: '',
      payment_date: new Date().toISOString().split('T')[0],
      due_date: '',
      status: 'paid',
      notes: '',
    });
  };

  const handleAddReport = async () => {
    await addReportRecord({
      report_date: new Date(reportForm.report_date).toISOString(),
      title: reportForm.title,
      content: reportForm.content,
    });
    setIsReportDialogOpen(false);
    setReportForm({
      report_date: new Date().toISOString().split('T')[0],
      title: '',
      content: '',
    });
  };

  const classesOnly = classHistory.filter(record => record.status !== 'report');
  const reportsOnly = classHistory.filter(record => record.status === 'report');

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          <h3 className="text-lg md:text-xl font-semibold">Histórico de {studentName}</h3>
        </div>
      </div>

      {/* Class History */}
      <Card className="p-4 md:p-6 shadow-card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-success" />
            <h4 className="font-semibold text-base md:text-lg">Histórico de Aulas</h4>
          </div>
          <Dialog open={isClassDialogOpen} onOpenChange={setIsClassDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Aula
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Registrar Nova Aula</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <div>
                  <Label htmlFor="class_date">Data da Aula</Label>
                  <Input
                    id="class_date"
                    type="date"
                    value={classForm.class_date}
                    onChange={(e) => setClassForm({ ...classForm, class_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="topic">Tópico</Label>
                  <Input
                    id="topic"
                    value={classForm.topic}
                    onChange={(e) => setClassForm({ ...classForm, topic: e.target.value })}
                    placeholder="Ex: Verb To Be"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={classForm.notes}
                    onChange={(e) => setClassForm({ ...classForm, notes: e.target.value })}
                    placeholder="Notas sobre a aula..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={classForm.status} onValueChange={(value) => setClassForm({ ...classForm, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">Concluída</SelectItem>
                      <SelectItem value="cancelled">Cancelada</SelectItem>
                      <SelectItem value="rescheduled">Remarcada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddClass} className="w-full">
                  Registrar Aula
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {classesOnly.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhuma aula registrada</p>
          ) : (
            classesOnly.map((record) => (
              <div key={record.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {format(new Date(record.class_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      record.status === 'completed' ? 'bg-success/20 text-success-foreground' :
                      record.status === 'cancelled' ? 'bg-destructive/20 text-destructive-foreground' :
                      'bg-warning/20 text-warning-foreground'
                    }`}>
                      {record.status === 'completed' ? 'Concluída' :
                       record.status === 'cancelled' ? 'Cancelada' : 'Remarcada'}
                    </span>
                  </div>
                  {record.topic && (
                    <p className="text-sm text-foreground">
                      <strong>Tópico:</strong> {record.topic}
                    </p>
                  )}
                  {record.notes && (
                    <p className="text-xs text-muted-foreground">
                      <FileText className="w-3 h-3 inline mr-1" />
                      {record.notes}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Reports History */}
      <Card className="p-4 md:p-6 shadow-card border-border/50 bg-card/40">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h4 className="font-semibold text-base md:text-lg">Relatórios Pedagógicos</h4>
          </div>
          <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="w-full sm:w-auto border-primary/20 hover:bg-primary/10 hover:text-primary">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Relatório
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Registrar Novo Relatório</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <div>
                  <Label htmlFor="hist_report_date">Data do Relatório</Label>
                  <Input
                    id="hist_report_date"
                    type="date"
                    value={reportForm.report_date}
                    onChange={(e) => setReportForm({ ...reportForm, report_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="hist_report_title">Título / Assunto</Label>
                  <Input
                    id="hist_report_title"
                    value={reportForm.title}
                    onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                    placeholder="Ex: Evolução da Pronúncia"
                  />
                </div>
                <div>
                  <Label htmlFor="hist_report_content">Conteúdo do Relatório</Label>
                  <Textarea
                    id="hist_report_content"
                    value={reportForm.content}
                    onChange={(e) => setReportForm({ ...reportForm, content: e.target.value })}
                    placeholder="Notas sobre o desempenho do aluno..."
                    rows={4}
                  />
                </div>
                <Button onClick={handleAddReport} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Salvar Relatório
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {reportsOnly.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhum relatório registrado</p>
          ) : (
            reportsOnly.map((record) => (
              <div key={record.id} className="p-4 bg-muted/30 border border-border/50 rounded-xl hover:border-primary/20 transition-all duration-200">
                <div className="flex justify-between items-start gap-2 flex-wrap mb-2">
                  <h5 className="font-semibold text-sm text-foreground">{record.topic || "Relatório Pedagógico"}</h5>
                  <span className="text-xs text-muted-foreground font-medium">
                    {format(new Date(record.class_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed bg-card/55 p-3 rounded-lg border border-border/40">
                  {record.notes}
                </p>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Payment History */}
      <Card className="p-4 md:p-6 shadow-card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-success" />
            <h4 className="font-semibold text-base md:text-lg">Histórico de Pagamentos</h4>
          </div>
          <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Pagamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Registrar Novo Pagamento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <div>
                  <Label htmlFor="amount">Valor (R$)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="payment_date">Data do Pagamento</Label>
                  <Input
                    id="payment_date"
                    type="date"
                    value={paymentForm.payment_date}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="due_date">Data de Vencimento</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={paymentForm.due_date}
                    onChange={(e) => setPaymentForm({ ...paymentForm, due_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="payment_status">Status</Label>
                  <Select value={paymentForm.status} onValueChange={(value) => setPaymentForm({ ...paymentForm, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Pago</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="overdue">Atrasado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="payment_notes">Observações</Label>
                  <Textarea
                    id="payment_notes"
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                    placeholder="Observações sobre o pagamento..."
                    rows={2}
                  />
                </div>
                <Button onClick={handleAddPayment} className="w-full">
                  Registrar Pagamento
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {paymentHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhum pagamento registrado</p>
          ) : (
            paymentHistory.map((record) => (
              <div key={record.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {format(new Date(record.payment_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      record.status === 'paid' ? 'bg-success/20 text-success-foreground' :
                      record.status === 'pending' ? 'bg-warning/20 text-warning-foreground' :
                      'bg-destructive/20 text-destructive-foreground'
                    }`}>
                      {record.status === 'paid' ? 'Pago' :
                       record.status === 'pending' ? 'Pendente' : 'Atrasado'}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-success">
                    R$ {Number(record.amount).toFixed(2)}
                  </p>
                  {record.due_date && (
                    <p className="text-xs text-muted-foreground">
                      Vencimento: {format(new Date(record.due_date), "dd/MM/yyyy")}
                    </p>
                  )}
                  {record.notes && (
                    <p className="text-xs text-muted-foreground">
                      <FileText className="w-3 h-3 inline mr-1" />
                      {record.notes}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
