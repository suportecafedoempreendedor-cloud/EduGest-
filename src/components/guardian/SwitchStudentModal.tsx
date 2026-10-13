import React from 'react';
import { UserCheck, Check, ArrowRight, GraduationCap, Building2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Student } from '../../types';

interface SwitchStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  selectedStudentId: string;
  onSelectStudent: (studentId: string) => void;
  guardianNome: string;
}

export const SwitchStudentModal: React.FC<SwitchStudentModalProps> = ({
  isOpen,
  onClose,
  students,
  selectedStudentId,
  onSelectStudent,
  guardianNome,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Trocar de Educando"
      subtitle={`Educandos associados à conta de ${guardianNome}`}
      maxWidth="md"
    >
      <div className="space-y-4">
        <p className="text-xs text-[#41515D]">
          Seleccione o educando que deseja acompanhar. Todas as notas, faltas, horários,
          conta corrente e documentos serão actualizados para o perfil seleccionado.
        </p>

        <div className="divide-y divide-[#E2E8F0] border border-[#E2E8F0] rounded-xl overflow-hidden bg-white">
          {students.map((st) => {
            const isCurrent = st.id === selectedStudentId;

            return (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  onSelectStudent(st.id);
                  onClose();
                }}
                className={`w-full p-4 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                  isCurrent
                    ? 'bg-blue-50/70 border-l-4 border-l-[#015FC4]'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {st.foto || st.fotografia ? (
                    <img
                      src={st.foto || st.fotografia}
                      alt={st.nomeCompleto}
                      className="w-11 h-11 rounded-full object-cover border border-[#CBD5E1] shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-[#012041] text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {st.nomeCompleto.substring(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#012041] truncate block">
                        {st.nomeCompleto}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] bg-[#015FC4] text-white font-bold px-1.5 py-0.5 rounded">
                          Activo
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-[#41515D] mt-0.5 flex items-center gap-2 flex-wrap">
                      <span>{st.turmaNome}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-[11px]">Nº Proc: {st.numeroMatricula}</span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={`text-[11px] font-semibold ${
                          st.statusPropina === 'em_dia'
                            ? 'text-emerald-700'
                            : st.statusPropina === 'pendente'
                            ? 'text-amber-700'
                            : 'text-red-700'
                        }`}
                      >
                        {st.statusPropina === 'em_dia'
                          ? 'Propina em Dia'
                          : st.statusPropina === 'pendente'
                          ? 'Propina Pendente'
                          : 'Propina em Atraso'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 pl-2">
                  {isCurrent ? (
                    <div className="w-7 h-7 rounded-full bg-[#015FC4] text-white flex items-center justify-center shadow-xs">
                      <Check className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center group-hover:bg-[#015FC4] group-hover:text-white transition-colors">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="ghost" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
