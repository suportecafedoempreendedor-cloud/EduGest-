import React, { useState, useEffect } from 'react';
import { UserCheck, AlertCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input, Select } from '../ui/Input';
import { Button } from '../ui/Button';
import {
  TeacherAssignment,
  Teacher,
  Section,
  Subject,
  AcademicYear,
} from '../../types';

interface NewTeacherAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assignment: TeacherAssignment) => void;
  teachers: Teacher[];
  sections: Section[];
  subjects: Subject[];
  academicYears: AcademicYear[];
  escolaId: string;
}

export const NewTeacherAssignmentModal: React.FC<NewTeacherAssignmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  teachers,
  sections,
  subjects,
  academicYears,
  escolaId,
}) => {
  const activeYear = academicYears.find((y) => y.estado === 'activo') || academicYears[0];

  const [professorId, setProfessorId] = useState(teachers[0]?.id || '');
  const [turmaId, setTurmaId] = useState(sections[0]?.id || '');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [anoLectivoId, setAnoLectivoId] = useState(activeYear?.id || '');
  const [cargaHorariaSemanal, setCargaHorariaSemanal] = useState<number>(4);
  const [isDirectorTurma, setIsDirectorTurma] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (teachers[0]) setProfessorId(teachers[0].id);
    if (sections[0]) setTurmaId(sections[0].id);
    if (subjects[0]) {
      setSubjectId(subjects[0].id);
      setCargaHorariaSemanal(subjects[0].cargaHorariaSemanal || 4);
    }
    if (activeYear) setAnoLectivoId(activeYear.id);
    setIsDirectorTurma(false);
    setError(null);
  }, [isOpen, teachers, sections, subjects, activeYear]);

  const handleSubjectChange = (id: string) => {
    setSubjectId(id);
    const sub = subjects.find((s) => s.id === id);
    if (sub) {
      setCargaHorariaSemanal(sub.cargaHorariaSemanal);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!professorId) {
      setError('Por favor seleccione o docente.');
      return;
    }
    if (!turmaId) {
      setError('Por favor seleccione a turma.');
      return;
    }
    if (!subjectId) {
      setError('Por favor seleccione a disciplina.');
      return;
    }
    if (!anoLectivoId) {
      setError('Por favor seleccione o ano lectivo.');
      return;
    }
    if (cargaHorariaSemanal <= 0) {
      setError('A carga horária semanal deve ser positiva.');
      return;
    }

    const selTeacher = teachers.find((t) => t.id === professorId);
    const selSection = sections.find((s) => s.id === turmaId);
    const selSubject = subjects.find((s) => s.id === subjectId);
    const selYear = academicYears.find((y) => y.id === anoLectivoId);

    const assignmentToSave: TeacherAssignment = {
      id: `ta-${escolaId}-${Date.now()}`,
      escolaId,
      professorId,
      professorNome: selTeacher?.nome || 'Docente Desconhecido',
      turmaId,
      turmaNome: selSection?.nome || 'Turma Desconhecida',
      subjectId,
      subjectNome: selSubject?.nome || 'Disciplina Desconhecida',
      anoLectivoId,
      anoLectivoNome: selYear?.nome || '2025/2026',
      cargaHorariaSemanal: Number(cargaHorariaSemanal),
      isDirectorTurma,
    };

    onSave(assignmentToSave);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Atribuição de Professor a Turma & Disciplina"
      subtitle="Distribuição de serviço docente e definição de directores de turma"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <Select
          label="Professor / Docente *"
          value={professorId}
          onChange={(e) => setProfessorId(e.target.value)}
          required
        >
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome} - {t.especialidade}
            </option>
          ))}
        </Select>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Turma Destino *"
            value={turmaId}
            onChange={(e) => setTurmaId(e.target.value)}
            required
          >
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome} ({s.turno} · {s.sala})
              </option>
            ))}
          </Select>

          <Select
            label="Disciplina a Lecionar *"
            value={subjectId}
            onChange={(e) => handleSubjectChange(e.target.value)}
            required
          >
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.nome} [{sub.codigo}]
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Ano Lectivo *"
            value={anoLectivoId}
            onChange={(e) => setAnoLectivoId(e.target.value)}
            required
          >
            {academicYears.map((y) => (
              <option key={y.id} value={y.id}>
                {y.nome} {y.estado === 'activo' ? '(Activo)' : `(${y.estado})`}
              </option>
            ))}
          </Select>

          <Input
            label="Carga Horária Semanal (Tempos) *"
            type="number"
            min={1}
            max={20}
            value={cargaHorariaSemanal}
            onChange={(e) => setCargaHorariaSemanal(Number(e.target.value))}
            required
            hint="Tempos semanais nesta turma"
          />
        </div>

        <div className="flex items-center gap-2 p-3 bg-slate-50 border border-[#E2E8F0] rounded-lg">
          <input
            type="checkbox"
            id="dt-check"
            checked={isDirectorTurma}
            onChange={(e) => setIsDirectorTurma(e.target.checked)}
            className="w-4 h-4 rounded text-[#015FC4] focus:ring-[#015FC4]"
          />
          <label htmlFor="dt-check" className="text-xs text-[#012041] cursor-pointer">
            <span className="font-semibold block">Designar como Director de Turma</span>
            <span className="text-[#41515D]">
              O professor assumirá a directoria pedagógica e assinatura das pautas desta turma
            </span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Confirmar Atribuição
          </Button>
        </div>
      </form>
    </Modal>
  );
};
