import React, { useState } from 'react';
import {
  FileText,
  DollarSign,
  Calendar,
  Tag,
  AlertCircle,
  Percent,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import {
  Student,
  TipoCobranca,
  LancamentoContaCorrente,
  ItemTabelaPreco,
  BeneficioRegra,
} from '../../types';
import { METADATA_TIPOS_COBRANCA } from '../../data/mockFinancialBillingData';

interface NovoLancamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  tabelaPrecos: ItemTabelaPreco[];
  beneficios: BeneficioRegra[];
  onCriarLancamento: (novo: LancamentoContaCorrente) => void;
}

export const NovoLancamentoModal: React.FC<NovoLancamentoModalProps> = ({
  isOpen,
  onClose,
  students,
  tabelaPrecos,
  beneficios,
  onCriarLancamento,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [tipoCobranca, setTipoCobranca] = useState<TipoCobranca>('propina');
  const [titulo, setTitulo] = useState('Propina de Novembro 2026');
  const [mesReferencia, setMesReferencia] = useState('Novembro 2026');
  const [valorOriginalKz, setValorOriginalKz] = useState<number>(48000);
  const [selectedBeneficioId, setSelectedBeneficioId] = useState<string>('nenhum');
  const [dataVencimento, setDataVencimento] = useState('2026-11-10');
  const [observacoes, setObservacoes] = useState('');

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  const handleTipoChange = (novoTipo: TipoCobranca) => {
    setTipoCobranca(novoTipo);
    const preco = tabelaPrecos.find((p) => p.tipoCobranca === novoTipo);
    if (preco) {
      setValorOriginalKz(preco.valorBaseKz);
      setTitulo(preco.nome);
    } else {
      setTitulo(`${METADATA_TIPOS_COBRANCA[novoTipo].label} - Geral`);
    }
  };

  // Cálculo de desconto se houver benefício
  const beneficio = beneficios.find((b) => b.id === selectedBeneficioId);
  const valorDescontoKz = beneficio?.percentualDesconto
    ? (valorOriginalKz * beneficio.percentualDesconto) / 100
    : beneficio?.valorFixoDescontoKz || 0;
  const valorFinalKz = Math.max(0, valorOriginalKz - valorDescontoKz);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const novoLancamento: LancamentoContaCorrente = {
      id: `lan-${Date.now()}`,
      escolaId: selectedStudent.escolaId,
      studentId: selectedStudent.id,
      studentNome: selectedStudent.nomeCompleto,
      studentProcesso: selectedStudent.processo,
      turmaNome: selectedStudent.turmaNome,
      anoLectivo: selectedStudent.anoLectivo,
      tipoCobranca,
      titulo,
      mesReferencia: tipoCobranca === 'propina' ? mesReferencia : undefined,
      dataEmissao: new Date().toISOString().split('T')[0],
      dataVencimento,
      valorOriginalKz,
      valorDescontoBolsaKz: valorDescontoKz,
      beneficioAplicadoNome: beneficio?.nome,
      valorMultaKz: 0,
      valorTotalDevidoKz: valorFinalKz,
      valorPagoKz: 0,
      saldoDevedorKz: valorFinalKz,
      estado: valorFinalKz === 0 ? 'pago' : 'pendente',
      observacoes,
    };

    onCriarLancamento(novoLancamento);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Lançar Novo Débito / Encargo na Conta Corrente"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-gray-700 mb-1">
            Aluno / Educando
          </label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4]"
          >
            {students.map((st) => (
              <option key={st.id} value={st.id}>
                {st.nomeCompleto} ({st.processo}) · {st.turmaNome}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Tipo de Cobrança (12 Categorias)
            </label>
            <select
              value={tipoCobranca}
              onChange={(e) => handleTipoChange(e.target.value as TipoCobranca)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4]"
            >
              {Object.entries(METADATA_TIPOS_COBRANCA).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Data de Vencimento
            </label>
            <input
              type="date"
              value={dataVencimento}
              onChange={(e) => setDataVencimento(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4]"
              required
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">
            Descrição / Título do Lançamento
          </label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4]"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Valor Base em Kwanzas (Kz)
            </label>
            <input
              type="number"
              value={valorOriginalKz}
              onChange={(e) => setValorOriginalKz(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4] font-mono"
              min={0}
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Aplicar Bolsa / Desconto / Isenção
            </label>
            <select
              value={selectedBeneficioId}
              onChange={(e) => setSelectedBeneficioId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4]"
            >
              <option value="nenhum">Nenhum benefício aplicado (0%)</option>
              {beneficios.map((ben) => (
                <option key={ben.id} value={ben.id}>
                  {ben.nome} ({ben.percentualDesconto}% de desconto)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Resumo do Débito Liquidável */}
        <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs space-y-1">
          <div className="flex justify-between text-gray-700">
            <span>Valor Nominal Original:</span>
            <span className="font-mono font-semibold">{valorOriginalKz.toLocaleString('pt-AO')} Kz</span>
          </div>
          {valorDescontoKz > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Desconto / Bolsa ({beneficio?.nome}):</span>
              <span className="font-mono font-semibold">- {valorDescontoKz.toLocaleString('pt-AO')} Kz</span>
            </div>
          )}
          <div className="flex justify-between text-[#012041] font-bold pt-1 border-t border-blue-200">
            <span>Total a Liquidar na Conta Corrente:</span>
            <span className="font-mono text-sm">{valorFinalKz.toLocaleString('pt-AO')} Kz</span>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">
            Observações / Notas Internas
          </label>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4]"
            placeholder="Ex: Emitido no guichet central a pedido do encarregado."
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
          <Button variant="secondary" size="sm" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" type="submit">
            Confirmar Lançamento
          </Button>
        </div>
      </form>
    </Modal>
  );
};
