import React, { useState } from 'react';
import {
  Printer,
  Copy,
  Check,
  CheckCircle2,
  Calendar,
  Building2,
  FileText,
  ShieldCheck,
  QrCode,
  Download,
  X,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { School, Student, Turma, NotaItem, Pagamento } from '../../types';
import {
  SchoolDocumentTemplate,
  EmittedDocument,
  DocumentType,
} from '../../types/documentsReports';
import {
  formatarDataExtenso,
  formatarKz,
  interpolateTemplateText,
  exportToCsv,
} from '../../utils/documentExportUtils';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: EmittedDocument | null;
  template: SchoolDocumentTemplate | null;
  currentSchool: School;
  student?: Student;
  turma?: Turma;
  notas?: NotaItem[];
  payments?: Pagamento[];
  allStudentsInTurma?: Student[];
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  document: doc,
  template,
  currentSchool,
  student,
  turma,
  notas = [],
  payments = [],
  allStudentsInTurma = [],
}) => {
  const [copiedCode, setCopiedCode] = useState(false);

  if (!doc) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(doc.codigoAutenticidade);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Calcula estatísticas para notas
  const studentNotas = student
    ? notas.filter((n) => n.alunoId === student.id || n.alunoNome === student.nomeCompleto)
    : [];

  const mediaGlobal =
    studentNotas.length > 0
      ? (
          studentNotas.reduce((acc, curr) => acc + curr.mt, 0) / studentNotas.length
        ).toFixed(1)
      : '14.5';

  const situacaoAcademica =
    Number(mediaGlobal) >= 10 ? 'Aprovado / Transita de Classe' : 'Em Risco Pedagógico';

  // Interpolação de texto do corpo
  const variables: Record<string, string | number> = {
    NOME_ALUNO: student?.nomeCompleto || doc.alunoNome || 'Estudante Não Identificado',
    NUMERO_DOCUMENTO: student?.documentoIdentificacao || doc.alunoBi || '006458921LA042',
    TIPO_DOCUMENTO: student?.tipoDocumento || 'B.I.',
    DATA_NASCIMENTO: student?.dataNascimento
      ? formatarDataExtenso(student.dataNascimento)
      : '14 de Março de 2009',
    NATURALIDADE: student?.municipio || 'Maianga',
    PROVINCIA: student?.provincia || 'Luanda',
    ANO_LECTIVO: doc.anoLectivo || currentSchool.anoLectivoActivo,
    PROCESSO: student?.processo || doc.alunoProcesso || 'EG-2025/1042',
    CLASSE: doc.classe || turma?.nome.split('-')[0].trim() || '10ª Classe',
    TURMA: doc.turmaNome || turma?.nome || 'Turma A',
    SALA: turma?.sala || 'Sala 04',
    CURSO: turma?.curso || 'Ciências Físicas e Biológicas',
    PERIODO: turma?.periodo || 'Manhã',
    DIRECTOR_TURMA: turma?.directorTurma || 'Prof.ª Domingas Quaresma',
    FINALIDADE: doc.finalidade || 'efeitos legais e escolares',
    PERCENTAGEM_FREQUENCIA: '96',
    MEDIA_GLOBAL: mediaGlobal,
    MEDIA_FINAL: mediaGlobal,
    MEDIA_POR_EXTENSO: 'Quatorze valores e cinco décimas',
    SITUACAO_ACADEMICA: situacaoAcademica,
    RESUMO_DISCIPLINAS: 'Aprovado em todas as disciplinas curriculares',
    FILIACAO_PAI: 'António Francisco Capanda',
    FILIACAO_MAE: 'Esperança Manuel Quaresma',
    NUMERO_REGISTO_LIVRO: '394/2026',
    ENCARREGADO_NOME: 'António Francisco Capanda',
    ENCARREGADO_TELEFONE: '+244 923 110 442',
    ENCARREGADO_OU_ALUNO: student?.nomeCompleto || 'Encarregado de Educação',
    DATA_VENCIMENTO: '10 de Abril de 2026',
    VALOR_ILIQUIDO_KZ: '45.000',
    PAGADOR_NOME: 'António Francisco Capanda (Encarregado)',
    VALOR_KZ: '45.000',
    VALOR_POR_EXTENSO: 'Quarenta e Cinco Mil Kwanzas',
    DESCRICAO_PAGAMENTO: 'Propina do mês de Março de 2026',
    METODO_PAGAMENTO: 'Multicaixa Express (Referência Automática)',
    REFERENCIA_PAGAMENTO: 'MCX-2026-9812409',
    TRIMESTRE: '1º Trimestre',
  };

  const textoCorpoInterpolado = template
    ? interpolateTemplateText(template.textoCorpo, variables)
    : doc.titulo;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Documento Oficial · ${doc.numeroDocumento}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Barra superior de acções */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm print:hidden">
          <div className="flex items-center gap-2 text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-medium">Código de Autenticidade:</span>
            <code className="px-2 py-0.5 bg-white border border-slate-200 rounded font-mono text-xs font-semibold text-[#012041]">
              {doc.codigoAutenticidade}
            </code>
            <button
              onClick={handleCopyCode}
              className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 transition-colors"
              title="Copiar código de validação"
            >
              {copiedCode ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<Printer className="w-4 h-4" />}
              onClick={handlePrint}
            >
              Imprimir / PDF
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>

        {/* ========================================================
            FOLHA OFICIAL DE DOCUMENTO (LAYOUT A4 PARA ANGOLA)
           ======================================================== */}
        <div
          id="official-document-sheet"
          className="bg-white border border-slate-300 rounded-lg p-8 sm:p-12 shadow-sm font-serif text-slate-900 relative overflow-hidden"
          style={{ minHeight: '800px' }}
        >
          {/* Marca d'água de segurança */}
          {template?.mostrarMarcaDAgua && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.03] rotate-[-28deg]">
              <span className="text-6xl sm:text-7xl font-extrabold uppercase tracking-widest text-[#012041]">
                {template.marcaDAguaTexto || currentSchool.nome}
              </span>
            </div>
          )}

          {/* Cabeçalho da República de Angola */}
          <div className="text-center space-y-1 pb-6 border-b-2 border-slate-800">
            {/* Insígnia da República de Angola estilizada */}
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 rounded-full border-2 border-slate-800 flex items-center justify-center font-sans font-bold text-xs bg-slate-50">
                ANGOLA
              </div>
            </div>

            <p className="text-xs font-bold uppercase tracking-widest text-slate-700">
              REPÚBLICA DE ANGOLA
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              {template?.ministerio || 'MINISTÉRIO DA EDUCAÇÃO'}
            </p>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              {template?.governoProvincial || `GOVERNO PROVINCIAL DE ${currentSchool.provincia.toUpperCase()}`}
            </p>
            <div className="pt-2">
              <h2 className="text-base sm:text-lg font-bold font-sans uppercase tracking-tight text-[#012041]">
                {currentSchool.nome}
              </h2>
              <p className="text-xs font-sans text-slate-600 italic">
                {template?.numeroDecretoAutorizacao || 'Autorização Definitiva de Funcionamento · MED'}
              </p>
            </div>
          </div>

          {/* Título do Documento e Número de Registo */}
          <div className="my-8 text-center">
            <h1 className="text-xl sm:text-2xl font-bold font-sans uppercase tracking-wide text-[#012041]">
              {doc.tipo === 'declaracao_matricula' && 'DECLARAÇÃO DE MATRÍCULA'}
              {doc.tipo === 'declaracao_frequencia' && 'DECLARAÇÃO DE FREQUÊNCIA'}
              {doc.tipo === 'declaracao_aproveitamento' && 'DECLARAÇÃO DE APROVEITAMENTO'}
              {doc.tipo === 'boletim' && 'BOLETIM DE AVALIAÇÃO TRIMESTRAL'}
              {doc.tipo === 'pauta' && 'PAUTA OFICIAL DE AVALIAÇÃO'}
              {doc.tipo === 'certificado' && 'CERTIFICADO DE HABILITAÇÕES'}
              {doc.tipo === 'factura' && 'FACTURA PROFORMA COMERCIAL'}
              {doc.tipo === 'recibo' && 'RECIBO OFICIAL DE QUITAÇÃO'}
              {doc.tipo === 'comprovativo' && 'COMPROVATIVO DE MATRÍCULA'}
            </h1>
            <p className="text-xs font-mono font-medium text-slate-500 mt-1">
              Nº de Registo Oficial: {doc.numeroDocumento} · Ano Lectivo: {doc.anoLectivo}
            </p>
          </div>

          {/* ========================================================
              CORPO DO DOCUMENTO CONFORME O TIPO
             ======================================================== */}

          {/* 1. Declarações e Certificado */}
          {['declaracao_matricula', 'declaracao_frequencia', 'declaracao_aproveitamento', 'certificado', 'comprovativo'].includes(
            doc.tipo
          ) && (
            <div className="space-y-6 text-sm sm:text-base leading-relaxed text-justify px-2 sm:px-4">
              <div className="whitespace-pre-line text-slate-800">
                {textoCorpoInterpolado}
              </div>

              {/* Se for certificado ou aproveitamento, exibir quadro de notas sumário */}
              {(doc.tipo === 'declaracao_aproveitamento' || doc.tipo === 'certificado') &&
                studentNotas.length > 0 && (
                  <div className="my-4 border border-slate-300 rounded font-sans text-xs">
                    <div className="bg-slate-100 p-2 font-bold text-slate-800 border-b border-slate-300">
                      Classificações Registadas no Sistema Pedagógico (Escala MED 0-20)
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3">
                      {studentNotas.map((n) => (
                        <div key={n.id} className="p-2 bg-slate-50 rounded border border-slate-200">
                          <p className="text-slate-500 truncate">{n.disciplina}</p>
                          <p className="font-bold text-sm text-[#012041]">
                            {n.mt} <span className="text-[10px] text-slate-400">Valores</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* 2. Boletim de Notas Trimestral (Tabela Oficial MED) */}
          {doc.tipo === 'boletim' && (
            <div className="space-y-4 font-sans text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-700">
                <div>
                  <span className="text-slate-400 block text-[11px]">Aluno:</span>
                  <span className="font-bold">{doc.alunoNome}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Processo:</span>
                  <span className="font-bold">{doc.alunoProcesso}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Turma:</span>
                  <span className="font-bold">{doc.turmaNome || '10ª Classe - A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Trimestre:</span>
                  <span className="font-bold">1º Trimestre</span>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-300 rounded">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 text-[11px]">
                      <th className="p-2.5 font-bold">Disciplina Curricular</th>
                      <th className="p-2.5 text-center font-bold">MAC</th>
                      <th className="p-2.5 text-center font-bold">NPP</th>
                      <th className="p-2.5 text-center font-bold">NPT</th>
                      <th className="p-2.5 text-center font-bold bg-slate-200">Média (MT)</th>
                      <th className="p-2.5 font-bold">Apreciação Pedagógica</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {studentNotas.length > 0 ? (
                      studentNotas.map((n) => (
                        <tr key={n.id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-medium text-slate-900">{n.disciplina}</td>
                          <td className="p-2.5 text-center font-mono">{n.mac}</td>
                          <td className="p-2.5 text-center font-mono">{n.npp}</td>
                          <td className="p-2.5 text-center font-mono">{n.npt}</td>
                          <td
                            className={`p-2.5 text-center font-bold font-mono ${
                              n.mt >= 10 ? 'text-emerald-700 bg-emerald-50/50' : 'text-red-600 bg-red-50/50'
                            }`}
                          >
                            {n.mt}
                          </td>
                          <td className="p-2.5 text-slate-600 text-[11px]">
                            {n.mt >= 14 ? 'Muito Bom Rendimento' : n.mt >= 10 ? 'Aproveitamento Positivo' : 'Necessita Apoio'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-slate-500">
                          Nenhuma nota registada para este aluno no trimestre selecionado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 border-t-2 border-slate-300 font-bold text-slate-900">
                      <td className="p-2.5">MÉDIA GLOBAL TRIMESTRAL</td>
                      <td colSpan={3} className="p-2.5 text-right text-slate-500">
                        Classificação Geral:
                      </td>
                      <td className="p-2.5 text-center font-mono text-sm bg-slate-200 text-[#012041]">
                        {mediaGlobal}
                      </td>
                      <td className="p-2.5 text-emerald-700">{situacaoAcademica}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* 3. Pauta Oficial de Turma */}
          {doc.tipo === 'pauta' && (
            <div className="space-y-4 font-sans text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[11px] block">Turma Avaliada:</span>
                  <span className="font-bold text-slate-800 text-sm">{doc.turmaNome || '10ª Classe - Turma A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Ano Lectivo:</span>
                  <span className="font-bold text-slate-800">{doc.anoLectivo}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Total de Alunos:</span>
                  <span className="font-bold text-slate-800">{allStudentsInTurma.length || 18}</span>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-300 rounded">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 border-b border-slate-300">
                      <th className="p-2 font-bold w-12 text-center">Nº</th>
                      <th className="p-2 font-bold">Nome Completo do Aluno</th>
                      <th className="p-2 font-bold">Processo</th>
                      <th className="p-2 text-center font-bold">Língua Port.</th>
                      <th className="p-2 text-center font-bold">Matemática</th>
                      <th className="p-2 text-center font-bold">Física</th>
                      <th className="p-2 text-center font-bold">Química</th>
                      <th className="p-2 text-center font-bold bg-slate-200">Média Geral</th>
                      <th className="p-2 font-bold text-center">Resultado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {(allStudentsInTurma.length > 0 ? allStudentsInTurma : [student].filter(Boolean)).map(
                      (st, idx) => (
                        <tr key={st?.id || idx} className="hover:bg-slate-50">
                          <td className="p-2 text-center font-mono text-slate-500">{idx + 1}</td>
                          <td className="p-2 font-medium text-slate-900">{st?.nomeCompleto}</td>
                          <td className="p-2 font-mono text-slate-500 text-[10px]">{st?.processo}</td>
                          <td className="p-2 text-center font-mono">14</td>
                          <td className="p-2 text-center font-mono">15</td>
                          <td className="p-2 text-center font-mono">13</td>
                          <td className="p-2 text-center font-mono">16</td>
                          <td className="p-2 text-center font-bold font-mono bg-slate-50 text-[#012041]">
                            14.5
                          </td>
                          <td className="p-2 text-center">
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              Transita
                            </span>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. Factura / Factura Proforma */}
          {doc.tipo === 'factura' && (
            <div className="space-y-4 font-sans text-xs">
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200 rounded">
                <div>
                  <p className="text-[11px] text-slate-400 uppercase font-semibold">Emitido Para:</p>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{doc.alunoNome}</p>
                  <p className="text-slate-600">Processo: {doc.alunoProcesso}</p>
                  <p className="text-slate-600">BI / NIF: {doc.alunoBi || '006458921LA042'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-slate-400 uppercase font-semibold">Dados da Factura:</p>
                  <p className="font-bold text-slate-900 mt-0.5">Vencimento: 10 de Abril de 2026</p>
                  <p className="text-slate-600">Moeda: Kwanzas (AOA)</p>
                  <p className="text-slate-600">Regime Fiscal: IVA Isento (Art. 12º CIVA)</p>
                </div>
              </div>

              <table className="w-full text-left border border-slate-300 rounded overflow-hidden">
                <thead className="bg-slate-100 border-b border-slate-300 text-slate-700">
                  <tr>
                    <th className="p-2.5 font-bold">Item / Descrição do Serviço Educativo</th>
                    <th className="p-2.5 text-center font-bold">Mês Ref.</th>
                    <th className="p-2.5 text-right font-bold">Qtd</th>
                    <th className="p-2.5 text-right font-bold">Preço Unit.</th>
                    <th className="p-2.5 text-right font-bold">Total (Kz)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2.5 font-medium text-slate-900">
                      Propina Mensal Regular · Ensino Secundário Geral
                    </td>
                    <td className="p-2.5 text-center text-slate-600">Abril/2026</td>
                    <td className="p-2.5 text-right font-mono">1</td>
                    <td className="p-2.5 text-right font-mono">45.000 Kz</td>
                    <td className="p-2.5 text-right font-bold font-mono">45.000 Kz</td>
                  </tr>
                </tbody>
                <tfoot className="bg-slate-50 border-t-2 border-slate-300">
                  <tr>
                    <td colSpan={4} className="p-2.5 text-right font-bold text-slate-700">
                      VALOR TOTAL A LIQUIDAR:
                    </td>
                    <td className="p-2.5 text-right font-bold font-mono text-base text-[#012041]">
                      45.000 Kz
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 text-[11px]">
                <strong>Coordenadas Bancárias para Liquidação:</strong> Banco BAI · IBAN: AO06 0040 0000 1289 4567 1012 3 · Titular: Welwitschia Education Group, Lda
              </div>
            </div>
          )}

          {/* 5. Recibo de Quitação */}
          {doc.tipo === 'recibo' && (
            <div className="space-y-4 font-sans text-xs">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-emerald-800 font-bold text-sm block">Quitação Total Confirmada</span>
                  <span className="text-emerald-700 text-[11px]">
                    Pagamento reconciliado na tesouraria institucional
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-emerald-800 block">Valor Liquidado:</span>
                  <span className="text-xl font-bold font-mono text-emerald-900">45.000 Kz</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200 rounded">
                <div>
                  <span className="text-slate-400 block text-[11px]">Beneficiário / Educando:</span>
                  <span className="font-bold text-slate-900">{doc.alunoNome}</span>
                  <span className="block text-slate-600">Processo: {doc.alunoProcesso}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Método de Liquidação:</span>
                  <span className="font-bold text-slate-900">Multicaixa Express</span>
                  <span className="block text-slate-600">Ref: MCX-2026-9812409</span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              ASSINATURAS, CARIMBO E AUTENTICAÇÃO
             ======================================================== */}
          <div className="mt-12 pt-6 border-t border-slate-200">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 items-end text-center">
              {/* Assinatura do Director */}
              <div className="space-y-1">
                <div className="h-10 border-b border-slate-400 mx-auto w-40" />
                <p className="font-bold text-xs uppercase text-slate-800">
                  {template?.nomeDirector || 'Dr. Manuel Domingos'}
                </p>
                <p className="text-[11px] text-slate-500 italic">
                  {template?.cargoDirector || 'Director Geral'}
                </p>
              </div>

              {/* Selo Branco / Carimbo Oficial */}
              <div className="flex flex-col items-center justify-center space-y-1">
                {template?.mostrarSeloBranco !== false && (
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#015FC4]/40 flex flex-col items-center justify-center p-2 text-center text-[9px] text-[#015FC4] uppercase font-bold bg-[#015FC4]/5">
                    <span>Selo Branco</span>
                    <span>Institucional</span>
                  </div>
                )}
                <span className="text-[10px] text-slate-400 font-mono">
                  {formatarDataExtenso(doc.dataEmissao)}
                </span>
              </div>

              {/* Assinatura do Secretário */}
              <div className="space-y-1">
                <div className="h-10 border-b border-slate-400 mx-auto w-40" />
                <p className="font-bold text-xs uppercase text-slate-800">
                  {template?.nomeSecretario || 'Prof. André Muanza'}
                </p>
                <p className="text-[11px] text-slate-500 italic">
                  {template?.cargoSecretario || 'Secretário Pedagógico'}
                </p>
              </div>
            </div>

            {/* Rodapé e Termo de Verificação Digital */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-[10px] text-slate-500 font-sans">
              <div className="flex items-center gap-2">
                <QrCode className="w-7 h-7 text-slate-700" />
                <div>
                  <p className="font-semibold text-slate-700">Verificação de Autenticidade Digital</p>
                  <p>Código: <span className="font-mono font-bold text-slate-900">{doc.codigoAutenticidade}</span></p>
                </div>
              </div>

              <div className="text-right max-w-sm">
                <p className="truncate">{template?.rodapeTexto || currentSchool.morada}</p>
                <p>EduGest SaaS · Sistema de Gestão Escolar de Angola</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
