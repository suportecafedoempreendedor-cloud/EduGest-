import React from 'react';
import { Printer, Download, CheckCircle2, ShieldCheck, FileText, Building2, User, CreditCard } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { OfficialReceipt } from '../../types';

interface OfficialReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: OfficialReceipt | null;
}

export const OfficialReceiptModal: React.FC<OfficialReceiptModalProps> = ({
  isOpen,
  onClose,
  receipt,
}) => {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Recibo Oficial de Pagamento"
      subtitle={`Documento Fiscal Certificado · ${receipt.numeroRecibo}`}
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Printable Receipt Paper Container */}
        <div className="p-6 bg-white border border-[#CBD5E1] rounded-xl shadow-xs space-y-6 text-[#012041]">
          {/* Header Institutional */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-[#E2E8F0]">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#015FC4] uppercase tracking-wider mb-1">
                <Building2 className="w-4 h-4" />
                <span>República de Angola · Ministério da Educação</span>
              </div>
              <h3 className="text-lg font-bold text-[#012041]">{receipt.escolaNome}</h3>
              <p className="text-xs text-[#41515D] mt-0.5">
                NIF: <span className="font-mono font-semibold text-[#012041]">{receipt.escolaNif}</span> · Sistema Integrado EduGest
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Número do Recibo</span>
              <span className="text-base font-bold font-mono text-[#015FC4] block">
                {receipt.numeroRecibo}
              </span>
              <span className="text-[11px] text-[#41515D] block mt-0.5">
                Emissão: {receipt.dataEmissao}
              </span>
            </div>
          </div>

          {/* Student & Guardian Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 border border-[#E2E8F0] rounded-lg text-xs">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Identificação do Educando
              </span>
              <div>
                <span className="font-bold text-[#012041] block text-sm">{receipt.studentNome}</span>
                <span className="text-[#41515D] block">
                  Processo: <span className="font-mono font-semibold">{receipt.studentProcesso}</span> · Turma: <span className="font-semibold">{receipt.studentTurma}</span>
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Encarregado de Educação
              </span>
              <div>
                <span className="font-bold text-[#012041] block text-sm">{receipt.guardianNome}</span>
                <span className="text-[#41515D] block">
                  Documento / BI: <span className="font-mono font-semibold">{receipt.guardianBi}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Item Details Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-y border-[#E2E8F0] text-[#012041] font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Discriminação do Serviço / Encargo</th>
                  <th className="py-2.5 px-3">Categoria</th>
                  <th className="py-2.5 px-3">Mês / Referência</th>
                  <th className="py-2.5 px-3 text-right">Valor Liquidado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                <tr>
                  <td className="py-3 px-3">
                    <span className="font-bold text-[#012041] block">{receipt.descricao}</span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Ref. Operação: {receipt.referenciaOperacao}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold uppercase text-[10px] text-[#015FC4]">
                    {receipt.tipoItem}
                  </td>
                  <td className="py-3 px-3 text-[#41515D]">
                    {receipt.mesReferencia || 'Ano Lectivo 2025/2026'}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-sm text-[#012041]">
                    {receipt.valorKz.toLocaleString('pt-AO')} Kz
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total Banner */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-lg flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold block">Pagamento Confirmado & Homologado</span>
                <span className="text-[11px] text-emerald-700">
                  Método: {receipt.metodoPagamento} · Operador: {receipt.operadorSecretaria}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-emerald-800 block">Total Pago</span>
              <span className="text-lg font-bold font-mono text-emerald-900 block">
                {receipt.valorKz.toLocaleString('pt-AO')} Kz
              </span>
            </div>
          </div>

          {/* Fiscal Certification Hash & Footer */}
          <div className="pt-3 border-t border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-[#41515D]">
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-[#015FC4] shrink-0" />
              <span className="truncate max-w-xs sm:max-w-md">
                Certificação Digital AGT: {receipt.hashCertificacao}
              </span>
            </div>

            <span className="text-[10px] text-slate-400">
              Processado por Software Certificado EduGest Angola
            </span>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Fechar
          </Button>
          <Button
            variant="primary"
            icon={<Printer className="w-4 h-4" />}
            onClick={handlePrint}
          >
            Imprimir / Salvar PDF
          </Button>
        </div>
      </div>
    </Modal>
  );
};
