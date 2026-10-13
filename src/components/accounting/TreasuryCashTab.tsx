import React, { useState } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  FileCheck,
  Printer,
  Download,
  DollarSign,
  User,
  Clock,
  X,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { CaixaFinanceiro, MovimentoCaixa, FechoCaixa } from '../../types/accountingFinance';

interface TreasuryCashTabProps {
  caixas: CaixaFinanceiro[];
  onRegistrarMovimento: (
    caixaId: string,
    tipo: 'entrada' | 'saida',
    valorKz: number,
    motivo: string,
    forma: 'numerario' | 'tpa' | 'multicaixa_express',
    alunoNome?: string
  ) => { success: boolean; message: string; movimento?: MovimentoCaixa };
  onExecutarFecho: (
    caixaId: string,
    saldoContadoKz: number,
    justificacao: string
  ) => { success: boolean; message: string; fecho?: FechoCaixa };
  schoolName: string;
}

export const TreasuryCashTab: React.FC<TreasuryCashTabProps> = ({
  caixas,
  onRegistrarMovimento,
  onExecutarFecho,
  schoolName,
}) => {
  const [selectedCaixaId, setSelectedCaixaId] = useState(caixas[0]?.id || 'cx-01');

  // Modais
  const [isNovoMovimentoOpen, setIsNovoMovimentoOpen] = useState(false);
  const [isFechoOpen, setIsFechoOpen] = useState(false);
  const [viewingRecibo, setViewingRecibo] = useState<MovimentoCaixa | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form Movimento
  const [tipoMovimento, setTipoMovimento] = useState<'entrada' | 'saida'>('entrada');
  const [valorMovimentoKz, setValorMovimentoKz] = useState(25000);
  const [motivoMovimento, setMotivoMovimento] = useState('');
  const [formaPagamento, setFormaPagamento] = useState<'numerario' | 'tpa' | 'multicaixa_express'>('numerario');
  const [alunoNome, setAlunoNome] = useState('');

  // Form Fecho
  const [saldoContadoKz, setSaldoContadoKz] = useState(0);
  const [justificacaoDiferenca, setJustificacaoDiferenca] = useState('');

  const currentCaixa = caixas.find((c) => c.id === selectedCaixaId) || caixas[0];

  const handleSubmeterMovimento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivoMovimento) return;

    const res = onRegistrarMovimento(
      selectedCaixaId,
      tipoMovimento,
      valorMovimentoKz,
      motivoMovimento,
      formaPagamento,
      alunoNome || undefined
    );

    if (res.success) {
      setIsNovoMovimentoOpen(false);
      setMotivoMovimento('');
      setAlunoNome('');
      setFeedback({ type: 'success', message: res.message });
      if (res.movimento) {
        setViewingRecibo(res.movimento);
      }
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleSubmeterFecho = (e: React.FormEvent) => {
    e.preventDefault();
    const res = onExecutarFecho(selectedCaixaId, saldoContadoKz, justificacaoDiferenca);

    if (res.success) {
      setIsFechoOpen(false);
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const diferencaFecho = currentCaixa ? saldoContadoKz - currentCaixa.saldoAtualKz : 0;

  return (
    <div className="space-y-6">
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-gray-400 hover:text-gray-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Cartões dos Caixas da Instituição */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {caixas.map((cx) => {
          const isSelected = cx.id === selectedCaixaId;
          return (
            <div
              key={cx.id}
              onClick={() => setSelectedCaixaId(cx.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#015FC4] bg-blue-50/40 shadow-sm ring-2 ring-[#015FC4]/20'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-[#012041] text-white">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] font-bold text-[#015FC4]">{cx.codigo}</span>
                    <h4 className="font-bold text-sm text-gray-900">{cx.nome}</h4>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                  Activo
                </span>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <span className="text-[10px] text-gray-500 uppercase block">Saldo Actual em Numerário:</span>
                <div className="text-xl font-bold font-mono text-gray-900 mt-0.5">
                  {cx.saldoAtualKz.toLocaleString('pt-AO')} <span className="text-xs font-sans text-gray-500">Kz</span>
                </div>
              </div>

              <div className="mt-2 text-[11px] text-gray-500 flex justify-between">
                <span>Responsável: {cx.responsavelNome}</span>
                <span className="font-mono text-gray-400">PGC: {cx.contaContabilisticaPGC}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Painel Operacional do Caixa Selecionado */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <span className="text-xs font-bold text-[#015FC4] uppercase tracking-wider block">
              Operações de Caixa · {currentCaixa?.nome}
            </span>
            <h3 className="text-base font-bold text-gray-900">
              Saldo em Cofre / Gaveta: {currentCaixa?.saldoAtualKz.toLocaleString('pt-AO')} Kz
            </h3>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto no-print">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSaldoContadoKz(currentCaixa?.saldoAtualKz || 0);
                setIsFechoOpen(true);
              }}
              icon={<FileCheck className="w-4 h-4" />}
            >
              Efectuar Fecho de Caixa
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsNovoMovimentoOpen(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Registar Movimento
            </Button>
          </div>
        </div>

        {/* Resumo Rápido de Movimentos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3">
            <div className="p-2 bg-emerald-600 text-white rounded-lg">
              <ArrowDownRight className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-emerald-800 uppercase font-bold block">Entradas do Dia</span>
              <strong className="text-sm font-bold text-emerald-950 font-mono">+950.000 Kz</strong>
            </div>
          </div>

          <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 flex items-center gap-3">
            <div className="p-2 bg-rose-600 text-white rounded-lg">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-rose-800 uppercase font-bold block">Saídas / Pagamentos</span>
              <strong className="text-sm font-bold text-rose-950 font-mono">-120.000 Kz</strong>
            </div>
          </div>

          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-3">
            <div className="p-2 bg-[#015FC4] text-white rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-blue-800 uppercase font-bold block">Último Fecho Homologado</span>
              <strong className="text-sm font-bold text-blue-950 font-mono">Hoje às 17:30</strong>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: REGISTAR NOVO MOVIMENTO DE CAIXA */}
      {isNovoMovimentoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-gray-200 p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h3 className="font-bold text-sm text-[#012041]">Registar Movimento no {currentCaixa?.nome}</h3>
              <button onClick={() => setIsNovoMovimentoOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmeterMovimento} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTipoMovimento('entrada')}
                  className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition-all ${
                    tipoMovimento === 'entrada'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  <ArrowDownRight className="w-4 h-4 text-emerald-600" />
                  <span>Entrada (Recebimento)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTipoMovimento('saida')}
                  className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition-all ${
                    tipoMovimento === 'saida'
                      ? 'border-rose-500 bg-rose-50 text-rose-800'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4 text-rose-600" />
                  <span>Saída (Despesa / Suprimento)</span>
                </button>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Valor do Movimento (Kz) *</label>
                <input
                  type="number"
                  min={1}
                  value={valorMovimentoKz}
                  onChange={(e) => setValorMovimentoKz(Number(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-xs font-mono font-bold text-base"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Forma de Liquidação *</label>
                <select
                  value={formaPagamento}
                  onChange={(e) => setFormaPagamento(e.target.value as any)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-xs font-semibold"
                >
                  <option value="numerario">Numerário em Dinheiro (Notas / Moedas Kz)</option>
                  <option value="tpa">TPA Multicaixa de Balcão</option>
                  <option value="multicaixa_express">Multicaixa Express</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Motivo / Descrição *</label>
                <input
                  type="text"
                  value={motivoMovimento}
                  onChange={(e) => setMotivoMovimento(e.target.value)}
                  placeholder="Ex: Pagamento da propina de Março, compra de água mineral para secretaria..."
                  className="w-full p-2 border border-gray-200 rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Nome do Aluno / Entidade (Opcional)</label>
                <input
                  type="text"
                  value={alunoNome}
                  onChange={(e) => setAlunoNome(e.target.value)}
                  placeholder="Ex: Manuel Domingos de Sousa"
                  className="w-full p-2 border border-gray-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <Button type="button" variant="secondary" size="sm" onClick={() => setIsNovoMovimentoOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" size="sm" icon={<CheckCircle2 className="w-4 h-4" />}>
                  Confirmar e Emitir Recibo
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: FECHO DE CAIXA DIÁRIO */}
      {isFechoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-gray-200 p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <div>
                <h3 className="font-bold text-sm text-[#012041]">Fecho Oficial de Caixa Diário</h3>
                <span className="text-[10px] text-gray-500">{currentCaixa?.nome}</span>
              </div>
              <button onClick={() => setIsFechoOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmeterFecho} className="space-y-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl space-y-1.5 border border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-600">Saldo Esperado pelo Sistema:</span>
                  <strong className="font-mono text-gray-900 font-bold">
                    {currentCaixa?.saldoAtualKz.toLocaleString('pt-AO')} Kz
                  </strong>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Saldo Físico Contado em Gaveta (Notas & Moedas) *
                </label>
                <input
                  type="number"
                  min={0}
                  value={saldoContadoKz}
                  onChange={(e) => setSaldoContadoKz(Number(e.target.value) || 0)}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-xs font-mono font-bold text-base"
                  required
                />
              </div>

              {/* Diferença Apurada */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between font-mono font-bold ${
                  diferencaFecho === 0
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : diferencaFecho > 0
                    ? 'bg-blue-50 border-blue-200 text-blue-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                <span>Diferença Apurada:</span>
                <span>
                  {diferencaFecho > 0 ? `+${diferencaFecho.toLocaleString('pt-AO')}` : diferencaFecho.toLocaleString('pt-AO')} Kz
                  {diferencaFecho === 0 ? ' (Caixa Certinho)' : diferencaFecho > 0 ? ' (Sobra)' : ' (Quebra)'}
                </span>
              </div>

              {diferencaFecho !== 0 && (
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Justificação Obrigatória da Diferença *
                  </label>
                  <textarea
                    rows={2}
                    value={justificacaoDiferenca}
                    onChange={(e) => setJustificacaoDiferenca(e.target.value)}
                    placeholder="Indique a causa da quebra ou sobra no fecho..."
                    className="w-full p-2 border border-gray-200 rounded-lg text-xs"
                    required
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <Button type="button" variant="secondary" size="sm" onClick={() => setIsFechoOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" size="sm" icon={<FileCheck className="w-4 h-4" />}>
                  Homologar Fecho de Caixa
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RECIBO DE MOVIMENTO DE CAIXA EMITIDO */}
      {viewingRecibo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full border border-gray-200 p-5 space-y-4">
            <div className="text-center border-b border-gray-100 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#015FC4] block">
                {schoolName} · Tesouraria
              </span>
              <h3 className="font-bold text-sm text-gray-900 mt-0.5">Comprovativo de Movimento de Caixa</h3>
              <span className="font-mono text-xs text-gray-500 font-bold">{viewingRecibo.numeroRecibo}</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Operação:</span>
                <span className="font-bold uppercase text-emerald-700">{viewingRecibo.tipo}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Valor Liquidado:</span>
                <span className="font-mono font-bold text-gray-900 text-sm">
                  {viewingRecibo.valorKz.toLocaleString('pt-AO')} Kz
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Forma de Pagamento:</span>
                <span className="capitalize">{viewingRecibo.formaPagamento.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Motivo:</span>
                <span className="font-medium text-gray-800">{viewingRecibo.motivo}</span>
              </div>
              {viewingRecibo.alunoNome && (
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500">Aluno / Entidade:</span>
                  <span className="font-semibold text-gray-900">{viewingRecibo.alunoNome}</span>
                </div>
              )}
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Operador:</span>
                <span className="text-gray-700">{viewingRecibo.operadorNome}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => window.print()} icon={<Printer className="w-4 h-4" />}>
                Imprimir
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setViewingRecibo(null)}>
                Concluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
