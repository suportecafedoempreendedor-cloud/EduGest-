import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Input';
import { Button } from '../ui/Button';
import { Guardian, Student, GrauParentesco } from '../../types';

interface AssociateGuardianModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId?: string;
  studentName?: string;
  guardianId?: string;
  guardianName?: string;
  guardians: Guardian[];
  students: Student[];
  onAssociate: (data: {
    studentId: string;
    guardianId: string;
    grauParentesco: GrauParentesco;
    isPrincipal: boolean;
    autorizadoBuscarAluno: boolean;
    contactoEmergencia: boolean;
  }) => void;
}

export const AssociateGuardianModal: React.FC<AssociateGuardianModalProps> = ({
  isOpen,
  onClose,
  studentId,
  studentName,
  guardianId,
  guardianName,
  guardians,
  students,
  onAssociate,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState(
    studentId || students[0]?.id || ''
  );
  const [selectedGuardianId, setSelectedGuardianId] = useState(
    guardianId || guardians[0]?.id || ''
  );
  const [grauParentesco, setGrauParentesco] = useState<GrauParentesco>('Pai');
  const [isPrincipal, setIsPrincipal] = useState(true);
  const [autorizadoBuscar, setAutorizadoBuscar] = useState(true);
  const [contactoEmergencia, setContactoEmergencia] = useState(true);

  // Sync if props change
  React.useEffect(() => {
    if (studentId) setSelectedStudentId(studentId);
    if (guardianId) setSelectedGuardianId(guardianId);
  }, [studentId, guardianId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalStudentId = studentId || selectedStudentId;
    const finalGuardianId = guardianId || selectedGuardianId;

    if (!finalStudentId || !finalGuardianId) return;

    onAssociate({
      studentId: finalStudentId,
      guardianId: finalGuardianId,
      grauParentesco,
      isPrincipal,
      autorizadoBuscarAluno: autorizadoBuscar,
      contactoEmergencia,
    });
    onClose();
  };

  const isFixingStudent = !!studentId;
  const isFixingGuardian = !studentId && !!guardianId;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Associar Encarregado de Educação"
      subtitle={
        isFixingStudent
          ? `Vincular encarregado ao educando: ${studentName || 'Educando'}`
          : isFixingGuardian
          ? `Vincular novo educando ao encarregado: ${guardianName || 'Encarregado'}`
          : 'Criar vínculo na relação guardian_students'
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Selector for Student if not fixed */}
        {!isFixingStudent && (
          <Select
            label="Selecione o Educando (Aluno)"
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            hint="Escolha o aluno a associar a este encarregado"
          >
            {students.map((st) => (
              <option key={st.id} value={st.id}>
                {st.nomeCompleto} · {st.numeroMatricula} ({st.classe})
              </option>
            ))}
          </Select>
        )}

        {/* Selector for Guardian if not fixed */}
        {!isFixingGuardian && (
          <Select
            label="Selecione o Encarregado Cadastrado"
            value={selectedGuardianId}
            onChange={(e) => setSelectedGuardianId(e.target.value)}
            hint="Selecione um encarregado existente no sistema"
          >
            {guardians.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nome} · BI: {g.documento} ({g.telefone})
              </option>
            ))}
          </Select>
        )}

        <Select
          label="Grau de Parentesco com o Educando"
          value={grauParentesco}
          onChange={(e) => setGrauParentesco(e.target.value as GrauParentesco)}
        >
          <option value="Pai">Pai</option>
          <option value="Mãe">Mãe</option>
          <option value="Tio(a)">Tio(a)</option>
          <option value="Avô(ó)">Avô(ó)</option>
          <option value="Irmão/ã">Irmão/ã</option>
          <option value="Tutor Legal">Tutor Legal</option>
          <option value="Outro">Outro</option>
        </Select>

        <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isPrincipal}
              onChange={(e) => setIsPrincipal(e.target.checked)}
              className="rounded text-[#015FC4] focus:ring-[#015FC4] w-4 h-4"
            />
            <span className="font-medium text-[#012041]">
              Definir como Encarregado Principal para notificações e propinas
            </span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={autorizadoBuscar}
              onChange={(e) => setAutorizadoBuscar(e.target.checked)}
              className="rounded text-[#015FC4] focus:ring-[#015FC4] w-4 h-4"
            />
            <span className="font-medium text-[#012041]">
              Autorizado formalmente a recolher o educando na saída escolar
            </span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={contactoEmergencia}
              onChange={(e) => setContactoEmergencia(e.target.checked)}
              className="rounded text-[#015FC4] focus:ring-[#015FC4] w-4 h-4"
            />
            <span className="font-medium text-[#012041]">
              Activar como Contacto de Emergência Médica
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Confirmar Associação
          </Button>
        </div>
      </form>
    </Modal>
  );
};
