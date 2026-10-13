import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Check,
  X,
  Clock,
  FileCheck2,
  AlertCircle,
  Users,
  LogOut,
  Save,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Select, Input } from '../ui/Input';
import { Button } from '../ui/Button';
import {
  Student,
  Section,
  Subject,
  StudentAttendanceStatus,
  StudentAttendanceRecord,
} from '../../types';

interface ClassRollCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  sections: Section[];
  students: Student[];
  subjects: Subject[];
  initialTurmaId?: string;
  escolaId: string;
  onSaveBatchAttendance: (records: StudentAttendanceRecord[]) => void;
}

interface StudentRollState {
  studentId: string;
  studentNome: string;
  status: StudentAttendanceStatus;
  minutosAtraso?: number;
  justificacao?: string;
}

export const ClassRollCallModal: React.FC<ClassRollCallModalProps> = ({
  isOpen,
  onClose,
  sections,
  students,
  subjects,
  initialTurmaId,
  escolaId,
  onSaveBatchAttendance,
}) => {
  const [selectedTurmaId, setSelectedTurmaId] = useState<string>(
    initialTurmaId || sections[0]?.id || ''
  );
  const [dataChamada, setDataChamada] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );
  const [selectedDisciplina, setSelectedDisciplina] = useState<string>(
    subjects[0]?.nome || 'Matemática'
  );

  const turmaAlunos = students.filter(
    (s) => s.turmaId === selectedTurmaId && s.estado !== 'inactivo' && s.estado !== 'transferido'
  );

  const [rollStates, setRollStates] = useState<Record<string, StudentRollState>>({});

  useEffect(() => {
    if (initialTurmaId) {
      setSelectedTurmaId(initialTurmaId);
    } else if (sections[0]) {
      setSelectedTurmaId(sections[0].id);
    }
  }, [initialTurmaId, sections, isOpen]);

  useEffect(() => {
    // Reset or populate students default as present
    const initialMap: Record<string, StudentRollState> = {};
    turmaAlunos.forEach((aluno) => {
      initialMap[aluno.id] = {
        studentId: aluno.id,
        studentNome: aluno.nomeCompleto,
        status: 'presenca',
      };
    });
    setRollStates(initialMap);
  }, [selectedTurmaId, students]);

  const handleSetStatus = (studentId: string, status: StudentAttendanceStatus) => {
    setRollStates((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
        minutosAtraso: status === 'atraso' ? (prev[studentId]?.minutosAtraso || 15) : undefined,
      },
    }));
  };

  const handleSetAll = (status: StudentAttendanceStatus) => {
    setRollStates((prev) => {
      const updated: Record<string, StudentRollState> = {};
      Object.keys(prev).forEach((id) => {
        updated[id] = {
          ...prev[id],
          status,
        };
      });
      return updated;
    });
  };

  const handleUpdateNotes = (studentId: string, field: 'minutosAtraso' | 'justificacao', value: any) => {
    setRollStates((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  const currentTurma = sections.find((s) => s.id === selectedTurmaId);

  const counts = {
    presencas: Object.values(rollStates).filter((r) => r.status === 'presenca').length,
    faltas: Object.values(rollStates).filter((r) => r.status === 'falta').length,
    justificadas: Object.values(rollStates).filter((r) => r.status === 'falta_justificada').length,
    atrasos: Object.values(rollStates).filter((r) => r.status === 'atraso').length,
    saidas: Object.values(rollStates).filter((r) => r.status === 'saida_antecipada').length,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const recordsToSave: StudentAttendanceRecord[] = Object.values(rollStates).map((st) => ({
      id: `att-${Date.now()}-${st.studentId}`,
      escolaId,
      studentId: st.studentId,
      studentNome: st.studentNome,
      turmaId: selectedTurmaId,
      turmaNome: currentTurma?.nome || 'Turma',
      disciplinaNome: selectedDisciplina,
      data: dataChamada,
      status: st.status,
      minutosAtraso: st.minutosAtraso,
      justificacao: st.justificacao,
      horaRegisto: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' }),
      registadoPor: currentTurma?.directorTurma || 'Professor da Disciplina',
      metodoRegisto: 'manual_professor',
    }));

    onSaveBatchAttendance(recordsToSave);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Caderneta de Chamada da Turma"
      subtitle="Registo de presença, faltas, atrasos e saídas antecipadas em tempo real"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Top Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 border border-[#E2E8F0] rounded-xl">
          <Select
            label="Turma *"
            value={selectedTurmaId}
            onChange={(e) => setSelectedTurmaId(e.target.value)}
          >
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome} ({s.turno})
              </option>
            ))}
          </Select>

          <Input
            label="Data da Aula *"
            type="date"
            value={dataChamada}
            onChange={(e) => setDataChamada(e.target.value)}
            required
          />

          <Select
            label="Disciplina / Tempo *"
            value={selectedDisciplina}
            onChange={(e) => setSelectedDisciplina(e.target.value)}
          >
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.nome}>
                {sub.nome} [{sub.codigo}]
              </option>
            ))}
          </Select>
        </div>

        {/* Action Bar & Quick Counter */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 pb-1">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[#41515D] font-medium mr-1">Ações Rápidas:</span>
            <button
              type="button"
              onClick={() => handleSetAll('presenca')}
              className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold transition-colors cursor-pointer"
            >
              Todos Presentes
            </button>
            <button
              type="button"
              onClick={() => handleSetAll('falta')}
              className="px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100 font-semibold transition-colors cursor-pointer"
            >
              Limpar / Todos Faltas
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
              {counts.presencas} Presentes
            </span>
            <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-100">
              {counts.faltas} Faltas
            </span>
            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
              {counts.atrasos} Atrasos
            </span>
          </div>
        </div>

        {/* Student Roll Table */}
        <div className="border border-[#E2E8F0] rounded-xl overflow-hidden max-h-[380px] overflow-y-auto">
          {turmaAlunos.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#41515D]">
              Nenhum aluno registado nesta turma.
            </div>
          ) : (
            <div className="divide-y divide-[#E2E8F0]">
              {turmaAlunos.map((aluno, index) => {
                const state = rollStates[aluno.id] || { status: 'presenca' };

                return (
                  <div
                    key={aluno.id}
                    className="p-3 bg-white hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-[200px]">
                      <span className="font-mono text-[11px] text-[#41515D] w-5 text-right">
                        {index + 1}.
                      </span>
                      <div>
                        <span className="font-bold text-[#012041] block">
                          {aluno.nomeCompleto}
                        </span>
                        <span className="text-[10px] text-[#41515D] font-mono">
                          {aluno.numeroMatricula} · {aluno.bi}
                        </span>
                      </div>
                    </div>

                    {/* Status Toggle Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleSetStatus(aluno.id, 'presenca')}
                        className={`px-2 py-1 rounded font-semibold transition-all cursor-pointer ${
                          state.status === 'presenca'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-[#41515D] hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                        title="Marcar Presença"
                      >
                        Presente
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSetStatus(aluno.id, 'falta')}
                        className={`px-2 py-1 rounded font-semibold transition-all cursor-pointer ${
                          state.status === 'falta'
                            ? 'bg-red-600 text-white shadow-xs'
                            : 'bg-slate-100 text-[#41515D] hover:bg-red-50 hover:text-red-700'
                        }`}
                        title="Marcar Falta Injustificada"
                      >
                        Falta
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSetStatus(aluno.id, 'falta_justificada')}
                        className={`px-2 py-1 rounded font-semibold transition-all cursor-pointer ${
                          state.status === 'falta_justificada'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-[#41515D] hover:bg-blue-50 hover:text-blue-700'
                        }`}
                        title="Marcar Falta Justificada"
                      >
                        F. Justificada
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSetStatus(aluno.id, 'atraso')}
                        className={`px-2 py-1 rounded font-semibold transition-all cursor-pointer ${
                          state.status === 'atraso'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-slate-100 text-[#41515D] hover:bg-amber-50 hover:text-amber-700'
                        }`}
                        title="Marcar Atraso"
                      >
                        Atraso
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSetStatus(aluno.id, 'saida_antecipada')}
                        className={`px-2 py-1 rounded font-semibold transition-all cursor-pointer ${
                          state.status === 'saida_antecipada'
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'bg-slate-100 text-[#41515D] hover:bg-purple-50 hover:text-purple-700'
                        }`}
                        title="Marcar Saída Antecipada"
                      >
                        Saída Ant.
                      </button>
                    </div>

                    {/* Conditional sub-fields (Atraso minutos or Justificação) */}
                    {(state.status === 'atraso' ||
                      state.status === 'falta_justificada' ||
                      state.status === 'saida_antecipada') && (
                      <div className="w-full sm:w-48">
                        {state.status === 'atraso' ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-[#41515D]">Min:</span>
                            <input
                              type="number"
                              min={1}
                              max={60}
                              placeholder="15 min"
                              value={state.minutosAtraso || 15}
                              onChange={(e) =>
                                handleUpdateNotes(
                                  aluno.id,
                                  'minutosAtraso',
                                  Number(e.target.value)
                                )
                              }
                              className="w-16 px-2 py-1 border border-[#E2E8F0] rounded text-xs text-[#012041]"
                            />
                          </div>
                        ) : (
                          <input
                            type="text"
                            placeholder="Motivo / Justificação..."
                            value={state.justificacao || ''}
                            onChange={(e) =>
                              handleUpdateNotes(aluno.id, 'justificacao', e.target.value)
                            }
                            className="w-full px-2 py-1 border border-[#E2E8F0] rounded text-xs text-[#012041]"
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
          <span className="text-xs text-[#41515D]">
            Total de {turmaAlunos.length} alunos na turma
          </span>

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" icon={<Save className="w-4 h-4" />}>
              Gravar Caderneta de Chamada
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
