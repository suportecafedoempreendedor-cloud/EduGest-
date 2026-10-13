import React, { useState } from 'react';
import {
  Calculator,
  LayoutDashboard,
  Layers,
  FileText,
  Calendar,
  Wallet,
  Building2,
  Receipt,
  ShieldCheck,
  Users,
  PieChart,
  FolderTree,
  Building,
  Table,
  Sparkles,
  ShieldAlert,
  Sliders,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

import {
  ExercicioEconomico,
  LancamentoContabilistico,
  ContaPlanoPGC,
  DiarioContabilistico,
  ContaBancaria,
  CaixaFinanceiro,
  FornecedorFinanceiro,
  FaturaPagar,
  ClienteFinanceiro,
  FaturaReceber,
  DocumentoFiscalEmitido,
  ConfiguracaoFiscalAGT,
  ActivoFixoImobilizado,
  OrcamentoAnual,
  CentroCusto,
  PedidoDespesaReembolso,
  RegistoAuditoriaFinanceira,
  MovimentoCaixa,
  FechoCaixa,
} from '../types/accountingFinance';

import {
  getStoredPlanoContas,
  updateContaPGC,
  savePlanoContas,
  getStoredDiarios,
  getStoredExercicio,
  getStoredLancamentos,
  postNewLancamento,
  estornarLancamento,
  encerrarPeriodoContabilistico,
  reabrirPeriodoContabilistico,
  getStoredCaixas,
  registrarMovimentoCaixa,
  executarFechoCaixa,
  getStoredContasBancarias,
  getStoredFornecedores,
  saveFornecedores,
  getStoredFaturasPagar,
  saveFaturasPagar,
  liquidarFaturaFornecedor,
  getStoredClientes,
  getStoredFaturasReceber,
  getStoredDocumentosFiscais,
  saveDocumentosFiscais,
  getStoredConfigFiscalAGT,
  saveConfigFiscalAGT,
  getStoredActivosFixos,
  saveActivosFixos,
  getStoredOrcamento,
  getStoredCentrosCusto,
  getStoredAuditLogs,
  logFinancialAudit,
} from '../services/accountingFinanceService';

// Subcomponent Tabs
import { AccountingDashboardTab } from './accounting/AccountingDashboardTab';
import { ChartOfAccountsTab } from './accounting/ChartOfAccountsTab';
import { GeneralLedgerTab } from './accounting/GeneralLedgerTab';
import { EconomicPeriodsTab } from './accounting/EconomicPeriodsTab';
import { TreasuryCashTab } from './accounting/TreasuryCashTab';
import { BankReconciliationTab } from './accounting/BankReconciliationTab';
import { AccountsPayableTab } from './accounting/AccountsPayableTab';
import { TaxInvoicingTab } from './accounting/TaxInvoicingTab';
import { TaxesAndSaftTab } from './accounting/TaxesAndSaftTab';
import { PayrollAccountingTab } from './accounting/PayrollAccountingTab';
import { BudgetingTab } from './accounting/BudgetingTab';
import { CostCentersTab } from './accounting/CostCentersTab';
import { FixedAssetsTab } from './accounting/FixedAssetsTab';
import { FinancialReportsTab } from './accounting/FinancialReportsTab';
import { AccountingAiAssistantTab } from './accounting/AccountingAiAssistantTab';
import { AuditLogTab } from './accounting/AuditLogTab';
import { AccountingSettingsTab } from './accounting/AccountingSettingsTab';

export type AccountingTabKey =
  | 'dashboard'
  | 'plano_contas'
  | 'diario_razao'
  | 'periodos'
  | 'caixa_tesouraria'
  | 'reconciliacao'
  | 'contas_pagar'
  | 'faturacao_fiscal'
  | 'impostos_saft'
  | 'salarios_rh'
  | 'orcamento'
  | 'centros_custo'
  | 'activos_fixos'
  | 'relatorios'
  | 'ai_assistant'
  | 'auditoria'
  | 'configuracoes';

interface AccountingViewProps {
  selectedSchoolName: string;
}

export const AccountingView: React.FC<AccountingViewProps> = ({ selectedSchoolName }) => {
  const tenantId = 'esc-001';

  // State Management linked with accountingFinanceService
  const [activeTab, setActiveTab] = useState<AccountingTabKey>('dashboard');
  const [planoContas, setPlanoContas] = useState<ContaPlanoPGC[]>(() => getStoredPlanoContas(tenantId));
  const [diarios] = useState<DiarioContabilistico[]>(() => getStoredDiarios(tenantId));
  const [exercicio, setExercicio] = useState<ExercicioEconomico>(() => getStoredExercicio(tenantId));
  const [lancamentos, setLancamentos] = useState<LancamentoContabilistico[]>(() => getStoredLancamentos(tenantId));
  const [caixas, setCaixas] = useState<CaixaFinanceiro[]>(() => getStoredCaixas(tenantId));
  const [contasBancarias] = useState<ContaBancaria[]>(() => getStoredContasBancarias(tenantId));
  const [fornecedores, setFornecedores] = useState<FornecedorFinanceiro[]>(() => getStoredFornecedores(tenantId));
  const [faturasPagar, setFaturasPagar] = useState<FaturaPagar[]>(() => getStoredFaturasPagar(tenantId));
  const [faturasReceber] = useState<FaturaReceber[]>(() => getStoredFaturasReceber(tenantId));
  const [documentosFiscais, setDocumentosFiscais] = useState<DocumentoFiscalEmitido[]>(() => getStoredDocumentosFiscais(tenantId));
  const [configFiscal, setConfigFiscal] = useState<ConfiguracaoFiscalAGT>(() => getStoredConfigFiscalAGT(tenantId));
  const [activosFixos, setActivosFixos] = useState<ActivoFixoImobilizado[]>(() => getStoredActivosFixos(tenantId));
  const [orcamento] = useState<OrcamentoAnual>(() => getStoredOrcamento(tenantId));
  const [centrosCusto] = useState<CentroCusto[]>(() => getStoredCentrosCusto(tenantId));
  const [auditLogs, setAuditLogs] = useState<RegistoAuditoriaFinanceira[]>(() => getStoredAuditLogs(tenantId));

  // Reload helpers
  const refreshLancamentos = () => {
    setLancamentos(getStoredLancamentos(tenantId));
    setPlanoContas(getStoredPlanoContas(tenantId));
    setAuditLogs(getStoredAuditLogs(tenantId));
  };

  const refreshExercicio = () => {
    setExercicio(getStoredExercicio(tenantId));
    setAuditLogs(getStoredAuditLogs(tenantId));
  };

  const refreshCaixas = () => {
    setCaixas(getStoredCaixas(tenantId));
    setAuditLogs(getStoredAuditLogs(tenantId));
  };

  const refreshFaturasPagar = () => {
    setFaturasPagar(getStoredFaturasPagar(tenantId));
    refreshLancamentos();
  };

  // 1. Plano de Contas Handlers
  const handleUpdateConta = (conta: ContaPlanoPGC) => {
    updateContaPGC(tenantId, conta);
    setPlanoContas(getStoredPlanoContas(tenantId));
  };

  const handleAddConta = (conta: ContaPlanoPGC) => {
    const list = [...planoContas, conta];
    savePlanoContas(tenantId, list);
    setPlanoContas(list);
    logFinancialAudit(tenantId, {
      utilizadorId: 'usr-002',
      utilizadorNome: 'Dr. António Bento',
      utilizadorEmail: 'contabilidade@edugest.ao',
      perfilPapel: 'Contabilista',
      escolaId: tenantId,
      moduloSubseccao: 'Plano de Contas',
      acao: 'CRIACAO',
      entidadeAfetadaId: conta.id,
      entidadeAfetadaDescricao: `${conta.codigo} - ${conta.designacao}`,
      detalhesTecnicos: `Criada conta PGC de grau ${conta.grau} na classe ${conta.classe}`,
      enderecoIp: '127.0.0.1',
    });
    setAuditLogs(getStoredAuditLogs(tenantId));
  };

  // 2. Diários e Lançamentos Handlers
  const handleAddLancamento = (
    novo: Omit<LancamentoContabilistico, 'id' | 'numeroLancamento' | 'totalDebitoKz' | 'totalCreditoKz' | 'diferencaKz' | 'criadoEm'>
  ) => {
    const res = postNewLancamento(tenantId, novo, 'Dr. António Bento');
    if (res.success) {
      refreshLancamentos();
    }
    return res;
  };

  const handleEstornarLancamento = (lancamentoId: string, motivo: string) => {
    const res = estornarLancamento(tenantId, lancamentoId, motivo, 'Dr. António Bento');
    if (res.success) {
      refreshLancamentos();
    }
    return res;
  };

  // 3. Períodos Económicos Handlers
  const handleEncerrarPeriodo = (mes: number) => {
    const res = encerrarPeriodoContabilistico(tenantId, mes, 'Dr. António Bento');
    if (res.success) {
      refreshExercicio();
    }
    return res;
  };

  const handleReabrirPeriodo = (mes: number, justificacao: string) => {
    const res = reabrirPeriodoContabilistico(tenantId, mes, justificacao, 'Dr. Carlos Miranda (Director Financeiro)');
    if (res.success) {
      refreshExercicio();
    }
    return res;
  };

  // 4. Tesouraria & Caixa Handlers
  const handleRegistrarMovimento = (
    caixaId: string,
    tipo: 'entrada' | 'saida',
    valorKz: number,
    motivo: string,
    forma: 'numerario' | 'tpa' | 'multicaixa_express',
    alunoNome?: string
  ) => {
    const res = registrarMovimentoCaixa(
      tenantId,
      caixaId,
      tipo,
      valorKz,
      motivo,
      forma,
      'Ana Paula Silva (Tesouraria)',
      alunoNome
    );
    if (res.success) {
      refreshCaixas();
    }
    return res;
  };

  const handleExecutarFecho = (
    caixaId: string,
    saldoContadoKz: number,
    justificacao: string
  ) => {
    const res = executarFechoCaixa(
      tenantId,
      caixaId,
      saldoContadoKz,
      justificacao,
      'Ana Paula Silva (Tesouraria)'
    );
    if (res.success) {
      refreshCaixas();
    }
    return res;
  };

  // 5. Contas a Pagar Handlers
  const handleLiquidarFatura = (
    faturaId: string,
    valorPagoKz: number,
    metodo: 'transferencia_bancaria' | 'caixa_numerario',
    bancoOrigemId: string
  ) => {
    const res = liquidarFaturaFornecedor(
      tenantId,
      faturaId,
      valorPagoKz,
      metodo,
      bancoOrigemId,
      'Dr. António Bento'
    );
    if (res.success) {
      refreshFaturasPagar();
    }
    return res;
  };

  const handleAddFornecedor = (forn: FornecedorFinanceiro) => {
    const updated = [forn, ...fornecedores];
    saveFornecedores(tenantId, updated);
    setFornecedores(updated);
    logFinancialAudit(tenantId, {
      utilizadorId: 'usr-002',
      utilizadorNome: 'Dr. António Bento',
      utilizadorEmail: 'contabilidade@edugest.ao',
      perfilPapel: 'Contabilista',
      escolaId: tenantId,
      moduloSubseccao: 'Fornecedores',
      acao: 'CRIACAO',
      entidadeAfetadaId: forn.id,
      entidadeAfetadaDescricao: forn.nomeRazaoSocial,
      detalhesTecnicos: `NIF: ${forn.nif} | Conta PGC: ${forn.contaContabilisticaPGC}`,
      enderecoIp: '127.0.0.1',
    });
    setAuditLogs(getStoredAuditLogs(tenantId));
  };

  const handleAddFaturaPagar = (fatura: FaturaPagar) => {
    const updated = [fatura, ...faturasPagar];
    saveFaturasPagar(tenantId, updated);
    setFaturasPagar(updated);

    // Contabilização automática no diário de compras:
    // Débito: Conta de Custo (75.4 ou especificada)
    // Crédito: Conta de Fornecedor (32.1.1)
    postNewLancamento(
      tenantId,
      {
        escolaId: tenantId,
        diarioId: 'dia-02',
        diarioCodigo: 'DIA-COMP',
        exercicioAno: new Date().getFullYear(),
        periodoMes: new Date().getMonth() + 1,
        dataDocumento: fatura.dataEmissaoFatura || new Date().toISOString().substring(0, 10),
        dataContabilistica: fatura.dataEmissaoFatura || new Date().toISOString().substring(0, 10),
        tipoDocumentoOrigem: 'fatura_fornecedor',
        numeroDocumentoOrigem: fatura.numeroFaturaOriginal,
        descricaoGeral: `Registo de Fatura: ${fatura.fornecedorNome} - ${fatura.descricaoServicoMaterial || ''}`,
        linhas: [
          {
            id: `lin-fp-${Date.now()}-1`,
            contaCodigo: fatura.contaCustoPGC || '75.4.1',
            contaDesignacao: 'FSE - Material e Serviços Gerais',
            descricaoLinha: fatura.descricaoServicoMaterial || 'Material / Serviços',
            debitoKz: fatura.valorTotalLiquidoPagarKz || fatura.saldoPendenteKz,
            creditoKz: 0,
            entidadeNome: fatura.fornecedorNome,
            numeroDocumentoSuporte: fatura.numeroFaturaOriginal,
          },
          {
            id: `lin-fp-${Date.now()}-2`,
            contaCodigo: '32.1.1',
            contaDesignacao: 'Fornecedores Gerais - Correntes',
            descricaoLinha: `Reconhecimento de dívida - ${fatura.fornecedorNome}`,
            debitoKz: 0,
            creditoKz: fatura.valorTotalLiquidoPagarKz || fatura.saldoPendenteKz,
            entidadeNome: fatura.fornecedorNome,
            numeroDocumentoSuporte: fatura.numeroFaturaOriginal,
          },
        ],
        estado: 'contabilizado',
        criadoPor: 'Dr. António Bento',
      },
      'Dr. António Bento'
    );

    refreshLancamentos();
    return { success: true, message: `Fatura ${fatura.numeroFaturaOriginal} registada e contabilizada em partidas dobradas.` };
  };

  // 6. Faturação Fiscal Handlers
  const handleEmitirDocumento = (doc: DocumentoFiscalEmitido) => {
    const updated = [doc, ...documentosFiscais];
    saveDocumentosFiscais(tenantId, updated);
    setDocumentosFiscais(updated);

    // Contabilização automática da fatura/recibo no Diário de Vendas e Propinas:
    // Débito: Caixa (41.1) ou Bancos (43.1)
    // Crédito: Propinas e Mensalidades (61.1.1)
    const contaDebito = doc.metodoPagamento === 'Numerário' ? '41.1.1' : '43.1.1';
    const contaDebitoNome = doc.metodoPagamento === 'Numerário' ? 'Caixa Central' : 'Bancos - Depósitos à Ordem';

    postNewLancamento(
      tenantId,
      {
        escolaId: tenantId,
        diarioId: 'dia-01',
        diarioCodigo: 'DIA-PROP',
        exercicioAno: new Date().getFullYear(),
        periodoMes: new Date().getMonth() + 1,
        dataDocumento: doc.dataEmissao.substring(0, 10),
        dataContabilistica: doc.dataEmissao.substring(0, 10),
        tipoDocumentoOrigem: 'propina',
        numeroDocumentoOrigem: doc.identificadorDocumento,
        descricaoGeral: `Faturação Fiscal ${doc.identificadorDocumento} - ${doc.clienteNome}`,
        linhas: [
          {
            id: `lin-doc-${Date.now()}-1`,
            contaCodigo: contaDebito,
            contaDesignacao: contaDebitoNome,
            descricaoLinha: `Recebimento Ref: ${doc.identificadorDocumento}`,
            debitoKz: doc.totalGeralKz,
            creditoKz: 0,
            entidadeNome: doc.clienteNome,
            numeroDocumentoSuporte: doc.identificadorDocumento,
          },
          {
            id: `lin-doc-${Date.now()}-2`,
            contaCodigo: '61.1.1',
            contaDesignacao: 'Propinas e Mensalidades do Ensino Regular',
            descricaoLinha: doc.itens?.[0]?.descricao || 'Propina Escolar / Emolumento',
            debitoKz: 0,
            creditoKz: doc.totalGeralKz,
            entidadeNome: doc.clienteNome,
            numeroDocumentoSuporte: doc.identificadorDocumento,
          },
        ],
        estado: 'contabilizado',
        criadoPor: 'Operador Certificado AGT',
      },
      'Operador Certificado AGT'
    );

    refreshLancamentos();
  };

  // 7. Integração da Folha Salarial RH
  const handlePostPayrollToLedger = (
    mesAno: string,
    totalBase: number,
    totalIrt: number,
    totalInssTrab: number,
    totalInssPat: number,
    totalLiquido: number
  ) => {
    const res = postNewLancamento(
      tenantId,
      {
        escolaId: tenantId,
        diarioId: 'dia-05',
        diarioCodigo: 'DIA-SAL',
        exercicioAno: Number(mesAno.split('-')[0]),
        periodoMes: Number(mesAno.split('-')[1]),
        dataDocumento: new Date().toISOString().substring(0, 10),
        dataContabilistica: new Date().toISOString().substring(0, 10),
        tipoDocumentoOrigem: 'salario_rh',
        numeroDocumentoOrigem: `FOLHA-RH-${mesAno}`,
        descricaoGeral: `Apropriação e Processamento da Folha Salarial - ${mesAno}`,
        linhas: [
          {
            id: `lin-sal-${Date.now()}-1`,
            contaCodigo: '72.1.1',
            contaDesignacao: 'Remunerações do Pessoal Docente e Administrativo',
            descricaoLinha: `Vencimentos Base e Subsídios Folha ${mesAno}`,
            debitoKz: totalBase,
            creditoKz: 0,
          },
          {
            id: `lin-sal-${Date.now()}-2`,
            contaCodigo: '72.5.1',
            contaDesignacao: 'Encargos Sociais Patronais - INSS 8%',
            descricaoLinha: `INSS Patronal (8%) Folha ${mesAno}`,
            debitoKz: totalInssPat,
            creditoKz: 0,
          },
          {
            id: `lin-sal-${Date.now()}-3`,
            contaCodigo: '34.2.1',
            contaDesignacao: 'Estado - Imposto sobre o Rendimento do Trabalho (IRT)',
            descricaoLinha: `Retenção de IRT Trabalhadores Folha ${mesAno}`,
            debitoKz: 0,
            creditoKz: totalIrt,
          },
          {
            id: `lin-sal-${Date.now()}-4`,
            contaCodigo: '34.4.1',
            contaDesignacao: 'Segurança Social - INSS a Recolher (11%)',
            descricaoLinha: `INSS Trabalhador (3%) + INSS Patronal (8%)`,
            debitoKz: 0,
            creditoKz: totalInssTrab + totalInssPat,
          },
          {
            id: `lin-sal-${Date.now()}-5`,
            contaCodigo: '36.1.1',
            contaDesignacao: 'Pessoal - Remunerações a Pagar (Salários Líquidos)',
            descricaoLinha: `Transferências Bancárias a Pagar - Folha ${mesAno}`,
            debitoKz: 0,
            creditoKz: totalLiquido,
          },
        ],
        estado: 'contabilizado',
        criadoPor: 'Módulo de Recursos Humanos EduGest',
      },
      'Dr. António Bento'
    );

    if (res.success) {
      refreshLancamentos();
    }
    return res;
  };

  // 8. Activos Fixos Handlers
  const handleAddActivo = (activo: ActivoFixoImobilizado) => {
    const updated = [activo, ...activosFixos];
    saveActivosFixos(tenantId, updated);
    setActivosFixos(updated);

    // Contabilização de aquisição de ativo fixo
    postNewLancamento(
      tenantId,
      {
        escolaId: tenantId,
        diarioId: 'dia-06',
        diarioCodigo: 'DIA-OD',
        exercicioAno: new Date().getFullYear(),
        periodoMes: new Date().getMonth() + 1,
        dataDocumento: activo.dataAquisicao,
        dataContabilistica: activo.dataAquisicao,
        tipoDocumentoOrigem: 'manual',
        numeroDocumentoOrigem: activo.codigoPatrimonial,
        descricaoGeral: `Aquisição de Imobilizado: ${activo.designacao}`,
        linhas: [
          {
            id: `lin-af-${Date.now()}-1`,
            contaCodigo: activo.contaActivoPGC || '11.4',
            contaDesignacao: 'Imobilizações Corpóreas',
            descricaoLinha: `Registo patrimonial: ${activo.designacao}`,
            debitoKz: activo.custoAquisicaoKz,
            creditoKz: 0,
            numeroDocumentoSuporte: activo.numeroFaturaCompra,
          },
          {
            id: `lin-af-${Date.now()}-2`,
            contaCodigo: '43.1.1',
            contaDesignacao: 'Banco BAI - Operacional',
            descricaoLinha: `Pagamento da aquisição: ${activo.designacao}`,
            debitoKz: 0,
            creditoKz: activo.custoAquisicaoKz,
            numeroDocumentoSuporte: activo.numeroFaturaCompra,
          },
        ],
        estado: 'contabilizado',
        criadoPor: 'Gestor Patrimonial',
      },
      'Dr. António Bento'
    );

    refreshLancamentos();
  };

  // 9. Configurações Fiscais Handlers
  const handleSaveConfigFiscal = (config: ConfiguracaoFiscalAGT) => {
    saveConfigFiscalAGT(tenantId, config);
    setConfigFiscal(config);
    logFinancialAudit(tenantId, {
      utilizadorId: 'usr-002',
      utilizadorNome: 'Dr. António Bento',
      utilizadorEmail: 'contabilidade@edugest.ao',
      perfilPapel: 'Contabilista Certificado',
      escolaId: tenantId,
      moduloSubseccao: 'Configurações Fiscais',
      acao: 'EDICAO',
      entidadeAfetadaId: 'config-agt',
      entidadeAfetadaDescricao: `NIF: ${config.nifInstituicao} | Regime IVA: ${config.regimeIva}`,
      detalhesTecnicos: 'Actualização dos parâmetros fiscais e taxas de retenção da instituição.',
      enderecoIp: '127.0.0.1',
    });
    setAuditLogs(getStoredAuditLogs(tenantId));
  };

  // Nav items definition
  const submodules = [
    { key: 'dashboard', label: 'Painel Executivo', icon: <LayoutDashboard className="w-4 h-4" />, badge: 'Visão Geral' },
    { key: 'plano_contas', label: 'Plano de Contas PGC', icon: <Layers className="w-4 h-4" />, badge: 'Classes 1 a 8' },
    { key: 'diario_razao', label: 'Diários & Partidas Dobradas', icon: <FileText className="w-4 h-4" />, badge: `${lancamentos.length}` },
    { key: 'periodos', label: 'Exercícios & Períodos', icon: <Calendar className="w-4 h-4" />, badge: '2026 Aberto' },
    { key: 'caixa_tesouraria', label: 'Tesouraria & Caixa', icon: <Wallet className="w-4 h-4" />, badge: `${caixas.length} Caixas` },
    { key: 'reconciliacao', label: 'Reconciliação Bancária', icon: <Building2 className="w-4 h-4" />, badge: 'BFA / BAI' },
    { key: 'contas_pagar', label: 'Contas a Pagar', icon: <Receipt className="w-4 h-4" />, badge: `${faturasPagar.filter(f => f.estado !== 'paga').length} Abertas` },
    { key: 'faturacao_fiscal', label: 'Faturação AGT', icon: <ShieldCheck className="w-4 h-4" />, badge: 'FT / FR / NC' },
    { key: 'impostos_saft', label: 'Impostos & SAF-T (AO)', icon: <CheckCircle2 className="w-4 h-4" />, badge: 'v1.01_01' },
    { key: 'salarios_rh', label: 'Folha Salarial RH', icon: <Users className="w-4 h-4" />, badge: 'Apropriação' },
    { key: 'orcamento', label: 'Orçamento Anual', icon: <PieChart className="w-4 h-4" />, badge: 'Execução' },
    { key: 'centros_custo', label: 'Centros de Custo', icon: <FolderTree className="w-4 h-4" />, badge: `${centrosCusto.length} Centros` },
    { key: 'activos_fixos', label: 'Ativos Imobilizados', icon: <Building className="w-4 h-4" />, badge: `${activosFixos.length} Ativos` },
    { key: 'relatorios', label: 'Balanço & DRE', icon: <Table className="w-4 h-4" />, badge: 'Demonstrações' },
    { key: 'ai_assistant', label: 'Assistente IA PGC', icon: <Sparkles className="w-4 h-4 text-amber-500" />, badge: 'IA Contábil' },
    { key: 'auditoria', label: 'Auditoria Financeira', icon: <ShieldAlert className="w-4 h-4 text-blue-500" />, badge: `${auditLogs.length} Logs` },
    { key: 'configuracoes', label: 'Configurações & PGC', icon: <Sliders className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header Oficial do Módulo de Contabilidade e Finanças */}
      <div className="bg-gradient-to-r from-[#012041] via-[#01356b] to-[#015FC4] text-white p-6 rounded-2xl shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="p-2 bg-white/10 rounded-xl backdrop-blur-xs flex items-center justify-center">
                <Calculator className="w-6 h-6 text-emerald-400" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Contabilidade & Finanças
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                PGC Angola & Partidas Dobradas
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/20 text-blue-200 border border-blue-400/30">
                AGT Certificado nº 412/AGT/2026
              </span>
            </div>
            <p className="text-xs sm:text-sm text-blue-100/80 max-w-2xl">
              Sistema de gestão contábil, tesouraria, conformidade fiscal do Decreto nº 180/19 (SAF-T AO), partidas dobradas e demonstrações financeiras da instituição <strong>{selectedSchoolName}</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('diario_razao')}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs transition flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              Novo Lançamento
            </button>
            <button
              onClick={() => setActiveTab('impostos_saft')}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition flex items-center gap-2 border border-white/20 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              Validar SAF-T AO
            </button>
            <button
              onClick={() => window.print()}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition border border-white/20 cursor-pointer"
              title="Imprimir visão do ecrã"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Badges de Estado e Conformidade Institucional */}
        <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
            <span className="text-blue-200/70 text-[11px] block">Exercício Económico:</span>
            <span className="font-bold text-white text-xs">{exercicio.ano} (Janeiro a Dezembro)</span>
          </div>
          <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
            <span className="text-blue-200/70 text-[11px] block">Moeda Oficial:</span>
            <span className="font-bold text-white text-xs">Kwanza Angolano (AOA / Kz)</span>
          </div>
          <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
            <span className="text-blue-200/70 text-[11px] block">Regime de IVA:</span>
            <span className="font-bold text-white text-xs">{configFiscal.regimeIva} (Art. 12º CIVA)</span>
          </div>
          <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
            <span className="text-blue-200/70 text-[11px] block">Ficheiro SAF-T AO:</span>
            <span className="font-bold text-emerald-300 text-xs">Versão 1.01_01 Contabilidade</span>
          </div>
        </div>
      </div>

      {/* 2. Barra de Navegação Horizontal dos Submódulos Contabilísticos */}
      <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-2xs overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          {submodules.map((sm) => {
            const isActive = activeTab === sm.key;
            return (
              <button
                key={sm.key}
                onClick={() => setActiveTab(sm.key as AccountingTabKey)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-[#012041] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span>{sm.icon}</span>
                <span>{sm.label}</span>
                {sm.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}
                  >
                    {sm.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Área de Renderização dos Submódulos Activos */}
      <div className="transition-all">
        {activeTab === 'dashboard' && (
          <AccountingDashboardTab
            exercicio={exercicio}
            lancamentos={lancamentos}
            contasBancarias={contasBancarias}
            caixas={caixas}
            faturasPagar={faturasPagar}
            faturasReceber={faturasReceber}
            orcamento={orcamento}
            centrosCusto={centrosCusto}
            onNavigateSubmodule={(submoduleKey) => setActiveTab(submoduleKey as AccountingTabKey)}
            schoolName={selectedSchoolName}
          />
        )}

        {activeTab === 'plano_contas' && (
          <ChartOfAccountsTab
            planoContas={planoContas}
            onUpdateConta={handleUpdateConta}
            onAddConta={handleAddConta}
            schoolName={selectedSchoolName}
          />
        )}

        {activeTab === 'diario_razao' && (
          <GeneralLedgerTab
            lancamentos={lancamentos}
            diarios={diarios}
            planoContas={planoContas}
            onAddLancamento={handleAddLancamento}
            onEstornarLancamento={handleEstornarLancamento}
            schoolName={selectedSchoolName}
          />
        )}

        {activeTab === 'periodos' && (
          <EconomicPeriodsTab
            exercicio={exercicio}
            onEncerrarPeriodo={handleEncerrarPeriodo}
            onReabrirPeriodo={handleReabrirPeriodo}
          />
        )}

        {activeTab === 'caixa_tesouraria' && (
          <TreasuryCashTab
            caixas={caixas}
            onRegistrarMovimento={handleRegistrarMovimento}
            onExecutarFecho={handleExecutarFecho}
            schoolName={selectedSchoolName}
          />
        )}

        {activeTab === 'reconciliacao' && (
          <BankReconciliationTab
            contasBancarias={contasBancarias}
            schoolName={selectedSchoolName}
          />
        )}

        {activeTab === 'contas_pagar' && (
          <AccountsPayableTab
            fornecedores={fornecedores}
            faturasPagar={faturasPagar}
            contasBancarias={contasBancarias}
            onLiquidarFatura={handleLiquidarFatura}
            onAddFornecedor={handleAddFornecedor}
            onAddFaturaPagar={handleAddFaturaPagar}
            schoolName={selectedSchoolName}
          />
        )}

        {activeTab === 'faturacao_fiscal' && (
          <TaxInvoicingTab
            documentosFiscais={documentosFiscais}
            onEmitirDocumento={handleEmitirDocumento}
            schoolName={selectedSchoolName}
          />
        )}

        {activeTab === 'impostos_saft' && (
          <TaxesAndSaftTab
            configFiscal={configFiscal}
            schoolName={selectedSchoolName}
          />
        )}

        {activeTab === 'salarios_rh' && (
          <PayrollAccountingTab
            onPostPayrollToLedger={handlePostPayrollToLedger}
            lancamentos={lancamentos}
            schoolName={selectedSchoolName}
          />
        )}

        {activeTab === 'orcamento' && (
          <BudgetingTab
            orcamento={orcamento}
            schoolName={selectedSchoolName}
          />
        )}

        {activeTab === 'centros_custo' && (
          <CostCentersTab
            centrosCusto={centrosCusto}
            schoolName={selectedSchoolName}
          />
        )}

        {activeTab === 'activos_fixos' && (
          <FixedAssetsTab
            activosFixos={activosFixos}
            onAddActivo={handleAddActivo}
            schoolName={selectedSchoolName}
          />
        )}

        {activeTab === 'relatorios' && (
          <FinancialReportsTab
            schoolName={selectedSchoolName}
          />
        )}

        {activeTab === 'ai_assistant' && (
          <AccountingAiAssistantTab
            schoolName={selectedSchoolName}
          />
        )}

        {activeTab === 'auditoria' && (
          <AuditLogTab
            logs={auditLogs}
            schoolName={selectedSchoolName}
          />
        )}

        {activeTab === 'configuracoes' && (
          <AccountingSettingsTab
            configFiscal={configFiscal}
            onSaveConfig={handleSaveConfigFiscal}
            schoolName={selectedSchoolName}
          />
        )}
      </div>
    </div>
  );
};
