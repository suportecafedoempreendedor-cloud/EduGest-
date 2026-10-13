import React, { useState, useEffect } from 'react';
import { BookOpen, AlertCircle, Layers } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input, Select } from '../ui/Input';
import { Button } from '../ui/Button';
import { ClassSubject, SchoolClass, Subject } from '../../types';

interface NewClassSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (classSubject: ClassSubject) => void;
  classes: SchoolClass[];
  subjects: Subject[];
  initialClassId?: string;
  escolaId: string;
}

export const NewClassSubjectModal: React.FC<NewClassSubjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  classes,
  subjects,
  initialClassId,
  escolaId,
}) => {
  const [classeId, setClasseId] = useState(initialClassId || classes[0]?.id || '');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [cargaHorariaSemanal, setCargaHorariaSemanal] = useState<number>(4);
  const [coeficiente, setCoeficiente] = useState<number>(2);
  const [obrigatoria, setObrigatoria] = useState<boolean>(true);
  const [estado, setEstado] = useState<'activa' | 'inactiva'>('activa');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialClassId) {
      setClasseId(initialClassId);
    } else if (classes[0]) {
      setClasseId(classes[0].id);
    }
    if (subjects[0]) {
      setSubjectId(subjects[0].id);
      setCargaHorariaSemanal(subjects[0].cargaHorariaSemanal || 4);
    }
    setError(null);
  }, [isOpen, initialClassId, classes, subjects]);

  const handleSubjectChange = (id: string) => {
    setSubjectId(id);
    const sub = subjects.find((s) => s.id === id);
    if (sub) {
      setCargaHorariaSemanal(sub.cargaHorariaSemanal);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classeId) {
      setError('Por favor seleccione a classe correspondente.');
      return;
    }
    if (!subjectId) {
      setError('Por favor seleccione a disciplina a incluir na matriz.');
      return;
    }
    if (cargaHorariaSemanal <= 0) {
      setError('A carga horária semanal deve ser superior a zero.');
      return;
    }

    const selClass = classes.find((c) => c.id === classeId);
    const selSubject = subjects.find((s) => s.id === subjectId);

    const classSubjectToSave: ClassSubject = {
      id: `cs-${escolaId}-${Date.now()}`,
      escolaId,
      classeId,
      classeNome: selClass?.nome || 'Classe Desconhecida',
      subjectId,
      subjectNome: selSubject?.nome || 'Disciplina Desconhecida',
      subjectCodigo: selSubject?.codigo || 'DISC',
      cargaHorariaSemanal: Number(cargaHorariaSemanal),
      coeficiente: Number(coeficiente) || 1,
      obrigatoria,
      estado,
    };

    onSave(classSubjectToSave);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Vincular Disciplina à Matriz Curricular"
      subtitle="Defina os tempos semanais e peso da disciplina no plano de estudos da classe"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <Select
          label="Classe de Destino *"
          value={classeId}
          onChange={(e) => setClasseId(e.target.value)}
          required
        >
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome} {c.curso ? `(${c.curso})` : ''}
            </option>
          ))}
        </Select>

        <Select
          label="Disciplina a Vincular *"
          value={subjectId}
          onChange={(e) => handleSubjectChange(e.target.value)}
          required
        >
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nome} [{s.codigo}] - {s.cargaHorariaSemanal} tempos padrão
            </option>
          ))}
        </Select>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Carga Horária Semanal nesta Classe *"
            type="number"
            min={1}
            max={15}
            value={cargaHorariaSemanal}
            onChange={(e) => setCargaHorariaSemanal(Number(e.target.value))}
            required
            hint="Tempos semanais (45-50 min cada)"
          />

          <Input
            label="Coeficiente / Peso de Avaliação"
            type="number"
            min={1}
            max={5}
            value={coeficiente}
            onChange={(e) => setCoeficiente(Number(e.target.value))}
            hint="Peso no cálculo da média final"
          />
        </div>

        <div className="flex items-center gap-2 p-3 bg-slate-50 border border-[#E2E8F0] rounded-lg">
          <input
            type="checkbox"
            id="obrigatoria-check"
            checked={obrigatoria}
            onChange={(e) => setObrigatoria(e.target.checked)}
            className="w-4 h-4 rounded text-[#015FC4] focus:ring-[#015FC4]"
          />
          <label htmlFor="obrigatoria-check" className="text-xs text-[#012041] cursor-pointer">
            <span className="font-semibold block">Disciplina Obrigatória do Plano</span>
            <span className="text-[#41515D]">Requisito mandatório para transição e aprovação do aluno</span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Adicionar à Matriz
          </Button>
        </div>
      </form>
    </Modal>
  );
};
