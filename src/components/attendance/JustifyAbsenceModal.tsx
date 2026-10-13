import React, { useState } from 'react';
import { FileCheck, AlertCircle, Upload } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input, Select } from '../ui/Input';
import { Button } from '../ui/Button';
import { StudentAttendanceRecord } from '../../types';

interface JustifyAbsenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: StudentAttendanceRecord | null;
  onJustify: (recordId: string, justificacao: string, documento?: string) => void;
}

export const JustifyAbsenceModal: React.FC<JustifyAbsenceModalProps> = ({
  isOpen,
  onClose,
  record,
  onJustify,
}) => {
  const [tipoJustificacao, setTipoJustificacao] = useState('Atestado Médico Oficial');
  const [justificacao, setJustificacao] = useState('');
  const [documentoRef, setDocumentoRef] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!record) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!justificacao.trim()) {
      setError('Por favor descreva o motivo da justificação.');
      return;
    }

    const fullJustificacao = `${tipoJustificacao}: ${justificacao.trim()}`;
    onJustify(record.id, fullJustificacao, documentoRef.trim() || undefined);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Justificar Falta de Aluno"
      subtitle={`Regularização formal de ausência de ${record.studentNome} (${record.data})`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-lg text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-[#41515D]">Aluno:</span>
            <span className="font-bold text-[#012041]">{record.studentNome}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#41515D]">Turma:</span>
            <span className="font-semibold text-[#012041]">{record.turmaNome}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#41515D]">Data da Ausência:</span>
            <span className="font-semibold text-red-700">{record.data}</span>
          </div>
        </div>

        <Select
          label="Tipo de Comprovativo *"
          value={tipoJustificacao}
          onChange={(e) => setTipoJustificacao(e.target.value)}
        >
          <option value="Atestado Médico Oficial">Atestado Médico Oficial (Centro/Hospital)</option>
          <option value="Declaração do Encarregado">Declaração Escrita do Encarregado de Educação</option>
          <option value="Representação Escolar/Desportiva">Representação Institucional ou Competição</option>
          <option value="Motivo de Força Maior">Motivo de Força Maior / Falecimento Familiar</option>
          <option value="Deslocação Justificada">Deslocação Provincial / Nacional</option>
        </Select>

        <div>
          <label className="text-xs font-semibold text-[#012041] block mb-1.5">
            Descrição Pormenorizada do Motivo *
          </label>
          <textarea
            value={justificacao}
            onChange={(e) => setJustificacao(e.target.value)}
            rows={3}
            required
            className="w-full rounded-lg border border-[#E2E8F0] px-3.5 py-2 text-sm text-[#012041] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#015FC4]"
            placeholder="Ex: Aluno em repouso médico recomendado durante 3 dias conforme prescrição clínica."
          />
        </div>

        <Input
          label="Número do Documento / Atestado (Opcional)"
          value={documentoRef}
          onChange={(e) => setDocumentoRef(e.target.value)}
          placeholder="Ex: MED-ATEST-2026/8941"
          hint="Referência arquivada na secretaria pedagógica"
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Homologar Falta Justificada
          </Button>
        </div>
      </form>
    </Modal>
  );
};
