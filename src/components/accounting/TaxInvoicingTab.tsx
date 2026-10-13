import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Printer,
  Download,
  Receipt,
  Eye,
  ShieldCheck,
  Building2,
  X,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { DocumentoFiscalEmitido, TipoDocumentoFiscal } from '../../types/accountingFinance';
import { exportToCsv } from '../../utils/hrDocumentGenerator';

interface TaxInvoicingTabProps {
  documentosFiscais: DocumentoFiscalEmitido[];
  onEmitirDocumento: (doc: DocumentoFiscalEmitido) => void;
  schoolName: string;
}

export const TaxInvoicingTab: React.FC<TaxInvoicingTabProps> = ({
  documentosFiscais,
  onEmitirDocumento,
  schoolName,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('todos');

  // Modais
  const [viewingDoc, setViewingDoc] = useState<DocumentoFiscalEmitido | null>(null);
  const [isNovoDocOpen, setIsNovoDocOpen] = useState(false);

  // Form Novo Documento
  const [tipoDoc, setTipoDoc] = useState<TipoDocumentoFiscal>('FR');
  const [clienteNome, setClienteNome] = useState('');
  const [clienteNif, setClienteNif] = useState('Consumidor Final');
  const [alunoNome, setAlunoNome] = useState('');
  const [alunoProcesso, setAlunoProcesso] = useState('');
  const [artigoDescricao, setArtigoDescricao] = useState('Propina do Mês - Ensino Regular');
  const [artigoPrecoKz, setArtigoPrecoKz] = useState(42000);
  const [metodoPagamento, setMetodoPagamento] = useState<DocumentoFiscalEmitido['metodoPagamento']>('Multicaixa');

  const filtered = documentosFiscais.filter((d) => {
    const matchSearch =
      d.identificadorDocumento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.alunoNome && d.alunoNome.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchTipo = filterTipo === 'todos' || d.tipoDocumento === filterTipo;
    return matchSearch && matchTipo;
  });

  const handleCriarDocumento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteNome) return;

    const proximoNum = documentosFiscais.length + 126;
    const serie = 'EDUG2026';
    const identificador = `${tipoDoc} ${serie}/${proximoNum}`;

    const novo: DocumentoFiscalEmitido = {
      id: `doc-${Date.now()}`,
      escolaId: 'esc-001',
      tipoDocumento: tipoDoc,
      serie,
      numeroSequencial: proximoNum,
      identificadorDocumento: identificador,
      dataEmissao: new Date().toISOString().substring(0, 10),
      horaEmissao: new Date().toLocaleTimeString('pt-AO'),
      clienteNome,
      clienteNif,
      alunoNome: alunoNome || undefined,
      alunoProcesso: alunoProcesso || undefined,
      itens: [
        {
          codigoArtigo: 'ART-PROP-GEN',
          descricao: artigoDescricao,
          quantidade: 1,
          precoUnitarioKz: artigoPrecoKz,
          descontoKz: 0,
          taxaIvaPercent: 0,
          codigoRegimeIva: 'ISE',
          motivoIsencao: 'M02 - Isenção ao abrigo do Artigo 12º do CIVA (Serviços de Educação)',
          totalLiquidoKz: artigoPrecoKz,
        },
      ],
      totalIncidenciaIvaKz: artigoPrecoKz,
      totalIvaKz: 0,
      totalRetencaoKz: 0,
      totalGeralKz: artigoPrecoKz,
      metodoPagamento,
      hashDocumento: `${Math.random().toString(36).substring(2, 8).toUpperCase()}...AGT`,
      estado: 'emitido',
    };

    onEmitirDocumento(novo);
    setIsNovoDocOpen(false);
    setViewingDoc(novo);
  };

  const handleExportCsv = () => {
    const headers = [
      'Documento',
      'Data',
      'Cliente',
      'NIF',
      'Aluno',
      'Total_Geral_Kz',
      'Metodo_Pagamento',
      'Estado',
    ];
    const rows = filtered.map((d) => [
      d.identificadorDocumento,
      d.dataEmissao,
      `"${d.clienteNome.replace(/"/g, '""')}"`,
      d.clienteNif,
      d.alunoNome || '-',
      d.totalGeralKz,
      d.metodoPagamento,
      d.estado,
    ]);
    exportToCsv(`documentos_fiscais_agt_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  return (
    <div className="space-y-4">
      {/* Barra de Filtros e Ações */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar por documento (ex: FR EDUG2026/125), cliente ou aluno..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4]"
              />
            </div>

            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="px-2.5 py-2 text-xs border border-gray-200 rounded-lg bg-white text-gray-700 font-medium"
            >
              <option value="todos">Todos os Documentos</option>
              <option value="FR">Factura-Recibo (FR)</option>
              <option value="FT">Factura (FT)</option>
              <option value="RC">Recibo (RC)</option>
              <option value="NC">Nota de Crédito (NC)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto no-print">
            <Button variant="secondary" size="sm" onClick={handleExportCsv} icon={<Download className="w-4 h-4" />}>
              Exportar CSV
            </Button>
            <Button variant="primary" size="sm" onClick={() => setIsNovoDocOpen(true)} icon={<Plus className="w-4 h-4" />}>
              Emitir Documento Fiscal
            </Button>
          </div>
        </div>
      </div>

      {/* Tabela de Documentos Fiscais */}
      <div id="hr-printable-area" className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-gray-200 text-gray-700 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">Identificador</th>
                <th className="py-2.5 px-3">Data / Hora</th>
                <th className="py-2.5 px-3">Cliente / Adquirente</th>
                <th className="py-2.5 px-3">NIF</th>
                <th className="py-2.5 px-3">Educando / Aluno</th>
                <th className="py-2.5 px-3 text-right font-mono">Total Geral</th>
                <th className="py-2.5 px-3 text-center">Pagamento</th>
                <th className="py-2.5 px-3 text-center">Estado</th>
                <th className="py-2.5 px-3 text-center no-print">Visualizar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-[#015FC4]">
                    {d.identificadorDocumento}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-gray-600">
                    {d.dataEmissao} <span className="text-[10px] text-gray-400">{d.horaEmissao}</span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-gray-900">{d.clienteNome}</td>
                  <td className="py-2.5 px-3 font-mono text-gray-600">{d.clienteNif}</td>
                  <td className="py-2.5 px-3 text-gray-700">{d.alunoNome || '-'}</td>
                  <td className="py-2.5 px-3 font-mono text-right font-bold text-gray-900">
                    {d.totalGeralKz.toLocaleString('pt-AO')} Kz
                  </td>
                  <td className="py-2.5 px-3 text-center text-gray-700">{d.metodoPagamento}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                      {d.estado}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center no-print">
                    <button
                      onClick={() => setViewingDoc(d)}
                      className="p-1 rounded text-gray-600 hover:text-[#015FC4] hover:bg-blue-50"
                      title="Visualizar e Imprimir A4"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: VISUALIZAR DOCUMENTO FISCAL FORMATO OFICIAL A4 */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 bg-[#012041] text-white flex justify-between items-center no-print">
              <span className="font-bold text-sm">Visualização de Documento Fiscal (AGT)</span>
              <button onClick={() => setViewingDoc(null)} className="p-1 text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Documento A4 Estilo Oficial */}
            <div className="p-8 space-y-6 text-xs text-gray-900 bg-white">
              {/* Cabeçalho */}
              <div className="flex justify-between items-start border-b-2 border-gray-800 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                    República de Angola · Ministério das Finanças / AGT
                  </span>
                  <h2 className="text-lg font-bold text-gray-900">{schoolName}</h2>
                  <p className="text-xs text-gray-600">NIF: 5401239841 · Luanda, Angola</p>
                  <p className="text-[11px] text-gray-500">Regime: Isento de IVA (Artigo 12º do CIVA)</p>
                </div>
                <div className="text-right">
                  <div className="border border-gray-300 p-2.5 rounded-lg bg-gray-50 text-right">
                    <span className="text-[11px] font-bold uppercase text-gray-500 block">Tipo & Número:</span>
                    <h3 className="text-base font-bold text-[#015FC4] font-mono">{viewingDoc.identificadorDocumento}</h3>
                    <p className="text-[11px] text-gray-600 font-mono mt-0.5">
                      Data: {viewingDoc.dataEmissao} às {viewingDoc.horaEmissao}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dados do Adquirente */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase block font-semibold">Exmo.(a) Sr.(a) / Adquirente:</span>
                  <strong className="text-xs text-gray-900 block">{viewingDoc.clienteNome}</strong>
                  <span className="text-[11px] font-mono text-gray-600">NIF: {viewingDoc.clienteNif}</span>
                </div>
                {viewingDoc.alunoNome && (
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase block font-semibold">Educando / Aluno Associado:</span>
                    <strong className="text-xs text-gray-900 block">{viewingDoc.alunoNome}</strong>
                    {viewingDoc.alunoProcesso && (
                      <span className="text-[11px] font-mono text-gray-600">Proc. nº {viewingDoc.alunoProcesso}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Tabela de Itens */}
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 font-bold uppercase text-[10px]">
                      <th className="py-2 px-3">Código</th>
                      <th className="py-2 px-3">Descrição do Serviço / Artigo</th>
                      <th className="py-2 px-3 text-center">Qtd</th>
                      <th className="py-2 px-3 text-right">Preço Unit.</th>
                      <th className="py-2 px-3 text-center">Taxa IVA</th>
                      <th className="py-2 px-3 text-right">Total Líquido</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {viewingDoc.itens.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 font-mono text-gray-500">{it.codigoArtigo}</td>
                        <td className="py-2 px-3">
                          <span className="font-semibold">{it.descricao}</span>
                          <span className="block text-[10px] text-gray-500 mt-0.5">{it.motivoIsencao}</span>
                        </td>
                        <td className="py-2 px-3 text-center font-mono">{it.quantidade}</td>
                        <td className="py-2 px-3 font-mono text-right">{it.precoUnitarioKz.toLocaleString('pt-AO')} Kz</td>
                        <td className="py-2 px-3 text-center font-mono">0% (Isento)</td>
                        <td className="py-2 px-3 font-mono text-right font-bold">{it.totalLiquidoKz.toLocaleString('pt-AO')} Kz</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totais & Menções Legais */}
              <div className="flex justify-between items-end pt-2">
                <div className="max-w-xs text-[10px] text-gray-500 space-y-1">
                  <p>Forma de Pagamento: <strong>{viewingDoc.metodoPagamento}</strong></p>
                  <p className="font-mono text-[9px]">Hash AGT: {viewingDoc.hashDocumento}</p>
                  <p className="text-[9px] text-gray-400">
                    Processado por programa certificado nº AGT-CERT-2026/0488 · EduGest Angola SaaS ERP
                  </p>
                </div>

                <div className="w-56 p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1 text-right">
                  <div className="flex justify-between text-[11px]">
                    <span>Total Incidência:</span>
                    <span className="font-mono">{viewingDoc.totalIncidenciaIvaKz.toLocaleString('pt-AO')} Kz</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>Total IVA:</span>
                    <span className="font-mono">0 Kz</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm pt-1 border-t border-gray-200 text-gray-900">
                    <span>Total a Pagar:</span>
                    <span className="font-mono text-[#015FC4]">{viewingDoc.totalGeralKz.toLocaleString('pt-AO')} Kz</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-2 no-print">
              <Button variant="secondary" size="sm" onClick={() => window.print()} icon={<Printer className="w-4 h-4" />}>
                Imprimir Documento
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setViewingDoc(null)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EMITIR DOCUMENTO FISCAL */}
      {isNovoDocOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-gray-200 p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h3 className="font-bold text-sm text-[#012041]">Emitir Documento Fiscal Oficial (AGT)</h3>
              <button onClick={() => setIsNovoDocOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCriarDocumento} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Tipo de Documento</label>
                  <select
                    value={tipoDoc}
                    onChange={(e) => setTipoDoc(e.target.value as any)}
                    className="w-full p-2 border border-gray-200 rounded-lg text-xs font-bold"
                  >
                    <option value="FR">Factura-Recibo (FR)</option>
                    <option value="FT">Factura (FT)</option>
                    <option value="RC">Recibo (RC)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Método de Pagamento</label>
                  <select
                    value={metodoPagamento}
                    onChange={(e) => setMetodoPagamento(e.target.value as any)}
                    className="w-full p-2 border border-gray-200 rounded-lg text-xs"
                  >
                    <option value="Multicaixa">Multicaixa / TPA</option>
                    <option value="Transferência Bancária">Transferência Bancária</option>
                    <option value="Numerário">Numerário em Caixa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Nome do Adquirente / Encarregado *</label>
                <input
                  type="text"
                  value={clienteNome}
                  onChange={(e) => setClienteNome(e.target.value)}
                  placeholder="Ex: Teresa Samakaka"
                  className="w-full p-2 border border-gray-200 rounded-lg text-xs font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">NIF do Adquirente (ou 'Consumidor Final')</label>
                <input
                  type="text"
                  value={clienteNif}
                  onChange={(e) => setClienteNif(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Nome do Aluno (Opcional)</label>
                  <input
                    type="text"
                    value={alunoNome}
                    onChange={(e) => setAlunoNome(e.target.value)}
                    placeholder="Ex: Pedro Samakaka"
                    className="w-full p-2 border border-gray-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Nº Processo Aluno</label>
                  <input
                    type="text"
                    value={alunoProcesso}
                    onChange={(e) => setAlunoProcesso(e.target.value)}
                    placeholder="Ex: P-2026-045"
                    className="w-full p-2 border border-gray-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Descrição do Item / Propina *</label>
                <input
                  type="text"
                  value={artigoDescricao}
                  onChange={(e) => setArtigoDescricao(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Valor Total (Kz) *</label>
                <input
                  type="number"
                  min={1}
                  value={artigoPrecoKz}
                  onChange={(e) => setArtigoPrecoKz(Number(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-xs font-mono font-bold text-base"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <Button type="button" variant="secondary" size="sm" onClick={() => setIsNovoDocOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" size="sm" icon={<CheckCircle2 className="w-4 h-4" />}>
                  Emitir e Assinar Digitalmente
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
