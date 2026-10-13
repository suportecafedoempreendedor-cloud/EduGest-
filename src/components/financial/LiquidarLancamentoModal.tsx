import React, { useState } from 'react';
import {
  CreditCard,
  DollarSign,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { LancamentoContaCorrente } from '../../types';

interface LiquidarLancamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  lancamento: LancamentoContaCorrente | null;
  onConfirmarLiquidacao: (
    lancamentoId: string,
    valorPago: number,
    metodo: string,
    referencia: string
  ) => void;
}

export const LiquidarLancamentoModal: React.FC<LiquidarLancamentoModalProps> = ({
  isOpen,
  onClose,
  lancamento,
  onConfirmarLiquidacao,
}) => {
  if (!lancamento) return null;

  const [valorPagar, setValorPagar] = useState<number>(lancamento.saldoDevedorKz);
  const [metodo, setMetodo] = useState<'Multicaixa Express' | 'TPA Balcão' | 'Transferência BAI' | 'Transferência BFA' | 'RUPE'>('Multicaixa Express');
  const [referencia, setReferencia] = useState(`REF-${Date.now().toString().slice(-6)}`);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (valorPagar <= 0) return;
    onConfirmarLiquidacao(lancamento.id, valorPagar, metodo, referencia);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Liquidar / Amortizar Débito · ${lancamento.studentNome}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="p-3 bg-gray-50 rounded-lg space-y-1.5 border border-gray-200">
          <div className="flex justify-between text-gray-600">
            <span>Item:</span>
            <span className="font-semibold text-gray-900">{lancamento.titulo}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Vencimento:</span>
            <span className="font-semibold text-gray-900">{lancamento.dataVencimento}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Total Devido:</span>
            <span className="font-mono font-semibold text-gray-900">
              {lancamento.valorTotalDevidoKz.toLocaleString('pt-AO')} Kz
            </span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Já Liquidado:</span>
            <span className="font-mono font-semibold text-emerald-700">
              {lancamento.valorPagoKz.toLocaleString('pt-AO')} Kz
            </span>
          </div>
          <div className="flex justify-between text-[#012041] font-bold pt-1 border-t border-gray-200">
            <span>Saldo Devedor Pendente:</span>
            <span className="font-mono text-sm text-rose-700">
              {lancamento.saldoDevedorKz.toLocaleString('pt-AO')} Kz
            </span>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">
            Valor a Pagar / Amortizar (Kz)
          </label>
          <input
            type="number"
            value={valorPagar}
            onChange={(e) => setValorPagar(Number(e.target.value))}
            max={lancamento.saldoDevedorKz}
            min={1}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4] font-mono text-sm"
            required
          />
          <div className="flex gap-2 mt-1.5">
            <button
              type="button"
              onClick={() => setValorPagar(lancamento.saldoDevedorKz)}
              className="text-[11px] text-[#015FC4] hover:underline font-semibold"
            >
              Liquidar valor total ({lancamento.saldoDevedorKz.toLocaleString('pt-AO')} Kz)
            </button>
            <span className="text-gray-300">·</span>
            <button
              type="button"
              onClick={() => setValorPagar(Math.round(lancamento.saldoDevedorKz / 2))}
              className="text-[11px] text-[#015FC4] hover:underline font-semibold"
            >
              50% ({Math.round(lancamento.saldoDevedorKz / 2).toLocaleString('pt-AO')} Kz)
            </button>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">
            Método de Pagamento Escolar
          </label>
          <select
            value={metodo}
            onChange={(e) => setMetodo(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4]"
          >
            <option value="Multicaixa Express">Multicaixa Express</option>
            <option value="TPA Balcão">TPA Balcão / Caixa da Escola</option>
            <option value="Transferência BAI">Transferência BAI</option>
            <option value="Transferência BFA">Transferência BFA</option>
            <option value="RUPE">RUPE (Referência Única de Pagamento ao Estado)</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">
            Referência de Comprovativo Bancário / TPA
          </label>
          <input
            type="text"
            value={referencia}
            onChange={(e) => setReferencia(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4] font-mono"
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
          <Button variant="secondary" size="sm" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" type="submit">
            Confirmar Pagamento e Emitir Recibo
          </Button>
        </div>
      </form>
    </Modal>
  );
};
