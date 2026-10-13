import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Calendar,
  Clock,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { PeriodoLectivoConfig, EstadoPeriodo } from '../../types/academicModule';

interface BloqueioPeriodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  periodo: PeriodoLectivoConfig | null;
  onConfirmarBloqueio: (
    periodoId: string,
    novoEstado: EstadoPeriodo,
    responsavel: string,
    observacoes: string
  ) => void;
}

export const BloqueioPeriodoModal: React.FC<BloqueioPeriodoModalProps> = ({
  isOpen,
  onClose,
  periodo,
  onConfirmarBloqueio,
}) => {
  if (!periodo) return null;

  const [novoEstado, setNovoEstado] = useState<EstadoPeriodo>(
    periodo.estado === 'aberto' ? 'bloqueado' : 'aberto'
  );
  const [responsavel, setResponsavel] = useState('Coordenação Pedagógica Central');
  const [observacoes, setObservacoes] = useState(
    novoEstado === 'bloqueado'
      ? 'Encerramento oficial do período lectivo para homologação das pautas.'
      : 'Reabertura temporária para correcções autorizadas.'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmarBloqueio(periodo.id, novoEstado, responsavel, observacoes);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Gestão de Período Lectivo · ${periodo.nome}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            <span>Impacto no Lançamento de Notas dos Professores</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Ao definir o período como <strong>Bloqueado</strong>, todos os docentes ficam imediatamente
            impedidos de lançar ou modificar notas no sistema sem pedido de reabertura à coordenação.
          </p>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">
            Novo Estado do Período
          </label>
          <select
            value={novoEstado}
            onChange={(e) => setNovoEstado(e.target.value as EstadoPeriodo)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4]"
          >
            <option value="aberto">Aberto (Permite lançamento de notas aos professores)</option>
            <option value="em_revisao">Em Revisão (Apenas coordenação pode editar)</option>
            <option value="bloqueado">Bloqueado (Notas congeladas para pautas oficiais)</option>
            <option value="encerrado">Encerrado Definitivamente</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">
            Responsável pela Alteração
          </label>
          <input
            type="text"
            value={responsavel}
            onChange={(e) => setResponsavel(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4]"
            required
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">
            Despacho / Justificativa Oficial
          </label>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4]"
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
          <Button variant="secondary" size="sm" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            icon={novoEstado === 'bloqueado' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          >
            Actualizar Estado do Período
          </Button>
        </div>
      </form>
    </Modal>
  );
};
