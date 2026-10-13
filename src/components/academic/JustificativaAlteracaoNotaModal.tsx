import React, { useState } from 'react';
import {
  Lock,
  Edit2,
  AlertTriangle,
  FileText,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { NotaAcademicaCompleta, RegraCalculoMedia } from '../../types/academicModule';
import { calcularMediaTrimestral } from '../../services/academicGradingEngine';

interface JustificativaAlteracaoNotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  nota: NotaAcademicaCompleta | null;
  regraMedia: RegraCalculoMedia;
  userRole: string;
  onConfirmarAlteracao: (
    notaId: string,
    novosValores: { mac: number; npp: number; npt: number; mt: number },
    justificativa: string,
    autorizacaoId: string
  ) => void;
}

export const JustificativaAlteracaoNotaModal: React.FC<JustificativaAlteracaoNotaModalProps> = ({
  isOpen,
  onClose,
  nota,
  regraMedia,
  userRole,
  onConfirmarAlteracao,
}) => {
  if (!nota) return null;

  const [mac, setMac] = useState(nota.mac);
  const [npp, setNpp] = useState(nota.npp);
  const [npt, setNpt] = useState(nota.npt);
  const [justificativa, setJustificativa] = useState('');
  const [autorizacaoId, setAutorizacaoId] = useState(`DESPACHO-COORD-${new Date().getFullYear()}/042`);

  // Cálculo determinístico imediato
  const novaMt = calcularMediaTrimestral(mac, npp, npt, regraMedia);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!justificativa.trim()) return;

    onConfirmarAlteracao(
      nota.id,
      { mac, npp, npt, mt: novaMt },
      justificativa,
      autorizacaoId
    );
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Retificação de Nota Aprovada · ${nota.alunoNome}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <ShieldAlert className="w-4 h-4 text-rose-700" />
            <span>Regra de Segurança: Nota com Aprovação Prévia</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Esta nota já foi homologada pela Coordenação Pedagógica. Qualquer alteração fica
            gravada permanentemente no <strong>Histórico de Auditoria</strong> com o nome do
            autor, hora, data e número do despacho ministerial/escolar.
          </p>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg grid grid-cols-2 gap-2 border border-gray-200">
          <div>
            <span className="text-gray-400 block text-[10px]">Aluno:</span>
            <strong className="text-gray-900">{nota.alunoNome}</strong>
          </div>
          <div>
            <span className="text-gray-400 block text-[10px]">Disciplina:</span>
            <strong className="text-gray-900">{nota.disciplinaNome}</strong>
          </div>
          <div>
            <span className="text-gray-400 block text-[10px]">Turma:</span>
            <span className="text-gray-700">{nota.turmaNome}</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[10px]">Trimestre:</span>
            <span className="text-gray-700">{nota.trimestre}º Trimestre</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              MAC (0 a 20)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="20"
              value={mac}
              onChange={(e) => setMac(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4] font-mono text-center"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              NPP (0 a 20)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="20"
              value={npp}
              onChange={(e) => setNpp(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4] font-mono text-center"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              NPT (0 a 20)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="20"
              value={npt}
              onChange={(e) => setNpt(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4] font-mono text-center"
              required
            />
          </div>
        </div>

        {/* Pré-visualização da Média Calculada */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <span className="font-semibold text-gray-700">Nova Média Trimestral (MT):</span>
          <div className="flex items-baseline gap-2">
            <span className="text-gray-400 line-through text-xs">{nota.mt.toFixed(1)}</span>
            <span className="text-base font-bold text-[#015FC4] font-mono">{novaMt.toFixed(1)}</span>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">
            Nº Despacho / Autorização da Coordenação
          </label>
          <input
            type="text"
            value={autorizacaoId}
            onChange={(e) => setAutorizacaoId(e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4] font-mono"
            required
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">
            Motivo / Justificação Pedagógica da Alteração
          </label>
          <textarea
            value={justificativa}
            onChange={(e) => setJustificativa(e.target.value)}
            rows={3}
            placeholder="Ex: Correcção de gralha na folha de cotação da prova trimestral após requerimento do encarregado."
            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4]"
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
          <Button variant="secondary" size="sm" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" type="submit">
            Gravar Alteração e Registar Auditoria
          </Button>
        </div>
      </form>
    </Modal>
  );
};
