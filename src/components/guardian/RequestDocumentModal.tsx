import React, { useState } from 'react';
import { FileText, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Select, Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Student, DocumentoItem } from '../../types';

interface RequestDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onRequestSuccess: (doc: DocumentoItem) => void;
}

export const RequestDocumentModal: React.FC<RequestDocumentModalProps> = ({
  isOpen,
  onClose,
  student,
  onRequestSuccess,
}) => {
  const [tipo, setTipo] = useState<'Declaracao_Matricula' | 'Certificado' | 'Outro'>('Declaracao_Matricula');
  const [titulo, setTitulo] = useState('Declaração de Matrícula com Notas');
  const [finalidade, setFinalidade] = useState('Fins de Subsídio Familiar / Emprego');

  if (!student) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newDoc: DocumentoItem = {
      id: `doc-${Date.now()}`,
      studentId: student.id,
      titulo: `${titulo} (${finalidade})`,
      tipo: tipo as any,
      dataEmissao: new Date().toISOString().substring(0, 10),
      estado: 'Valido',
      tamanho: '1.4 MB (PDF Assinado)',
      codigoVerificacao: `EG-DOC-${Math.floor(100000 + Math.random() * 900000)}`,
    };

    onRequestSuccess(newDoc);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Solicitar Documento Académico"
      subtitle={`Emissão de declaração oficial para ${student.nomeCompleto}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Tipo de Documento *"
          value={tipo}
          onChange={(e) => {
            const val = e.target.value as any;
            setTipo(val);
            if (val === 'Declaracao_Matricula') {
              setTitulo('Declaração de Matrícula com Notas');
            } else if (val === 'Certificado') {
              setTitulo('Certificado de Habilitações Literárias');
            } else {
              setTitulo('Guia de Deslocação / Transferência');
            }
          }}
          required
        >
          <option value="Declaracao_Matricula">Declaração de Matrícula com Notas Trimestrais</option>
          <option value="Certificado">Certificado de Habilitações Literárias</option>
          <option value="Outro">Atestado de Frequência Escolar Simples</option>
        </Select>

        <Select
          label="Finalidade do Documento *"
          value={finalidade}
          onChange={(e) => setFinalidade(e.target.value)}
          required
        >
          <option value="Fins de Subsídio Familiar / Emprego">Fins de Subsídio Familiar / Emprego dos Pais</option>
          <option value="Apresentação Consular / Visto">Apresentação Consular / Pedido de Visto</option>
          <option value="Inscrição em Clube Desportivo">Inscrição em Clube Desportivo / Federação</option>
          <option value="Transferência Escolar">Processo de Transferência Escolar</option>
          <option value="Apresentação Bancária">Abertura de Conta Bancária Jovem</option>
        </Select>

        <div className="p-3.5 bg-slate-50 border border-[#E2E8F0] rounded-lg text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-[#41515D]">Educando:</span>
            <span className="font-bold text-[#012041]">{student.nomeCompleto}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#41515D]">Turma / Ano:</span>
            <span className="font-semibold text-[#012041]">{student.turmaNome} · {student.anoLectivo}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#41515D]">Taxa de Emolumento:</span>
            <span className="font-bold font-mono text-[#015FC4]">3.500 Kz (Isento no 1º pedido anual)</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Emitir Documento Digital
          </Button>
        </div>
      </form>
    </Modal>
  );
};
