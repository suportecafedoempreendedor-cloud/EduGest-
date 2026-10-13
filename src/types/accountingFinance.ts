/**
 * Tipos e Interfaces do Módulo Integrado de Contabilidade e Finanças
 * EduGest Angola | SaaS de Gestão Escolar & ERP
 * 
 * Em estrita conformidade com o Plano Geral de Contabilidade de Angola (PGC),
 * PGC-EM, Código do IVA de Angola (Artigo 12º - Isenção de Ensino),
 * Decreto Presidencial nº 180/19 (SAF-T AO) e boas práticas IFRS.
 */

// ==========================================
// 1. PLANO DE CONTAS (PGC ANGOLA)
// ==========================================

export type ClasseContabilistica =
  | '1_meios_fixos'         // Classe 1: Meios Fixos e Investimentos
  | '2_existencias'         // Classe 2: Existências
  | '3_terceiros'           // Classe 3: Terceiros (Clientes, Fornecedores, Estado, Pessoal)
  | '4_meios_monetarios'    // Classe 4: Meios Monetários (Caixa, Bancos)
  | '5_capital_reservas'    // Classe 5: Capital e Fundos Próprios
  | '6_proveitos'           // Classe 6: Proveitos por Natureza (Propinas, Emolumentos, Vendas)
  | '7_custos'              // Classe 7: Custos por Natureza (Pessoal, FSE, Amortizações)
  | '8_resultados';         // Classe 8: Resultados

export type NaturezaSaldoConta = 'devedora' | 'credora' | 'indiferente';
export type TipoConta = 'agregadora' | 'movimento';

export interface ContaPlanoPGC {
  id: string;
  codigo: string;             // Ex: '61.1.1', '31.1.2', '43.1'
  designacao: string;         // Ex: 'Propinas e Mensalidades do Ensino Regular'
  classe: ClasseContabilistica;
  tipo: TipoConta;            // 'agregadora' (não aceita lançamentos directos) ou 'movimento'
  natureza: NaturezaSaldoConta;
  contaPaiCodigo?: string;    // Ex: '61.1' para '61.1.1'
  grau: number;               // 1 (Classe), 2 (Grupo), 3 (Subgrupo), 4 (Conta Razão), 5 (Subconta Analítica)
  saldoInicialDevedorKz: number;
  saldoInicialCredorKz: number;
  saldoAtualKz: number;       // Calculado: (Débitos - Créditos) conforme natureza
  totalDebitosKz: number;
  totalCreditosKz: number;
  centroCustoId?: string;
  aceitaCentroCusto: boolean;
  activa: boolean;
}

// ==========================================
// 2. DIÁRIOS & LANÇAMENTOS EM PARTIDAS DOBRADAS
// ==========================================

export type TipoDiario =
  | 'vendas_propinas'         // Faturação de propinas, taxas escolares e emolumentos
  | 'compras_fornecedores'    // Faturas de compras e serviços contratados
  | 'caixa'                   // Recebimentos e pagamentos em numerário
  | 'bancos'                  // Movimentos bancários, transferências e TPA
  | 'salarios'                // Processamento e apropriação da folha salarial RH
  | 'operacoes_diversas';     // Ajustamentos, amortizações, encerramentos

export interface DiarioContabilistico {
  id: string;
  codigo: string;             // Ex: 'DIA-PROP', 'DIA-CAIXA', 'DIA-BANCO'
  nome: string;
  tipo: TipoDiario;
  descricao: string;
  bloqueado: boolean;
}

export type EstadoLancamento = 'rascunho' | 'aprovado' | 'contabilizado' | 'estornado';

export interface LinhaLancamentoContabilistico {
  id: string;
  contaCodigo: string;        // Código PGC (deve ser conta de movimento)
  contaDesignacao: string;
  descricaoLinha: string;
  debitoKz: number;
  creditoKz: number;
  centroCustoId?: string;
  centroCustoNome?: string;
  entidadeId?: string;        // Aluno ID, Fornecedor ID ou Funcionário ID
  entidadeNome?: string;
  numeroDocumentoSuporte?: string;
}

export interface LancamentoContabilistico {
  id: string;
  escolaId: string;
  numeroLancamento: string;    // Ex: 'LAN-2026/00145' (único e sequencial)
  diarioId: string;
  diarioCodigo: string;
  exercicioAno: number;        // Ex: 2026
  periodoMes: number;          // 1 a 12 (ou 13 para ajustamento de fecho)
  dataDocumento: string;       // Data de emissão do documento de suporte
  dataContabilistica: string;  // Data efetiva no diário
  tipoDocumentoOrigem: 'propina' | 'fatura_fornecedor' | 'recibo_caixa' | 'extrato_bancario' | 'salario_rh' | 'manual' | 'amortizacao' | 'estorno';
  documentoOrigemId?: string;
  numeroDocumentoOrigem: string;
  descricaoGeral: string;
  linhas: LinhaLancamentoContabilistico[];
  totalDebitoKz: number;
  totalCreditoKz: number;
  diferencaKz: number;         // Deve ser rigorosamente 0 para ser contabilizado
  estado: EstadoLancamento;
  criadoPor: string;
  criadoEm: string;
  aprovadoPor?: string;
  aprovadoEm?: string;
  estornadoPor?: string;
  estornadoEm?: string;
  lancamentoEstornoId?: string;
  motivoEstorno?: string;
}

// ==========================================
// 3. EXERCÍCIOS ECONÓMICOS & PERÍODOS
// ==========================================

export type EstadoPeriodoContabil = 'aberto' | 'em_revisao' | 'encerrado';

export interface PeriodoContabilistico {
  id: string;
  mes: number;                // 1 a 12 (13 para encerramento de contas)
  designacao: string;         // Ex: 'Janeiro 2026', 'Período 13 - Regularizações'
  dataInicio: string;
  dataFim: string;
  estado: EstadoPeriodoContabil;
  totalLancamentos: number;
  encerradoPor?: string;
  encerradoEm?: string;
  justificacaoReabertura?: string;
}

export interface ExercicioEconomico {
  id: string;
  escolaId: string;
  ano: number;                // Ex: 2026
  designacao: string;         // 'Exercício Económico de 2026'
  dataInicio: string;
  dataFim: string;
  estado: 'aberto' | 'encerrado';
  periodos: PeriodoContabilistico[];
  moedaPadrao: string;        // 'AOA'
  referencialContabilistico: 'PGC_ANGOLA' | 'PGC_EM' | 'IFRS_FULL';
}

// ==========================================
// 4. TESOURARIA, CAIXA & BANCOS
// ==========================================

export interface CaixaFinanceiro {
  id: string;
  escolaId: string;
  codigo: string;             // Ex: 'CX-CENTRAL'
  nome: string;               // Ex: 'Caixa Central da Secretaria'
  responsavelNome: string;
  saldoAberturaKz: number;
  saldoAtualKz: number;
  moeda: string;              // 'AOA'
  activo: boolean;
  contaContabilisticaPGC: string; // Ex: '41.1.1'
}

export interface MovimentoCaixa {
  id: string;
  caixaId: string;
  tipo: 'entrada' | 'saida';
  valorKz: number;
  dataHora: string;
  motivo: string;
  numeroRecibo: string;
  formaPagamento: 'numerario' | 'tpa' | 'multicaixa_express';
  alunoId?: string;
  alunoNome?: string;
  fornecedorNome?: string;
  operadorNome: string;
  lancamentoContabilisticoId?: string;
}

export interface FechoCaixa {
  id: string;
  caixaId: string;
  caixaNome: string;
  dataFecho: string;
  saldoSistemaKz: number;     // Saldo calculado pelos registos
  saldoContadoKz: number;     // Saldo físico apurado pelo tesoureiro
  diferencaKz: number;        // saldoContado - saldoSistema (quebra ou sobra)
  justificacaoDiferenca?: string;
  totalEntradasKz: number;
  totalSaidasKz: number;
  operadorResponsavel: string;
  validadoPor?: string;
  estado: 'pendente' | 'homologado';
}

export interface ContaBancaria {
  id: string;
  escolaId: string;
  bancoNome: string;          // 'BAI', 'BFA', 'Banco Millennium Atlântico', 'BIC', 'Standard Bank'
  siglaBanco: string;
  numeroConta: string;
  iban: string;               // Ex: 'AO06 0040 0000 1234 5678 9012 3'
  swiftBic?: string;
  titularConta: string;
  tipoConta: 'ordem' | 'poupanca' | 'tpa_associada';
  moeda: 'AOA' | 'USD' | 'EUR';
  saldoContabilisticoKz: number;
  saldoExtratoBancarioKz: number;
  saldoPendenteConciliacaoKz: number;
  dataUltimaConciliacao: string;
  contaContabilisticaPGC: string; // Ex: '43.1.1'
  activa: boolean;
}

export interface LinhaExtratoBancario {
  id: string;
  contaBancariaId: string;
  dataMovimento: string;
  dataValor: string;
  descricaoExtrato: string;
  documentoReferencia: string;
  debitoKz: number;
  creditoKz: number;
  saldoAposMovimentoKz: number;
  conciliado: boolean;
  movimentoSistemaId?: string; // Id da liquidação ou pagamento correspondente
  conciliadoEm?: string;
  conciliadoPor?: string;
}

export interface ConciliacaoBancariaItem {
  id: string;
  contaBancariaId: string;
  periodoReferencia: string;  // Ex: '2026-03'
  dataConciliacao: string;
  saldoExtratoKz: number;
  saldoLivroRazaoKz: number;
  diferencaNaoConciliadaKz: number;
  movimentosPendentesExtrato: number;
  movimentosPendentesRazao: number;
  responsavelNome: string;
  estado: 'em_progresso' | 'concluida_equilibrada' | 'com_divergencias';
}

// ==========================================
// 5. CONTAS A RECEBER & CLIENTES
// ==========================================

export interface ClienteFinanceiro {
  id: string;
  escolaId: string;
  codigoCliente: string;       // Ex: 'CLI-0021'
  tipoEntidade: 'aluno' | 'encarregado' | 'empresa_patrocinadora' | 'outro';
  nomeRazaoSocial: string;
  nif: string;
  telefone: string;
  email: string;
  morada: string;
  saldoDevedorKz: number;
  limiteCreditoKz?: number;
  contaContabilisticaPGC: string; // Ex: '31.1.2.001'
  activo: boolean;
}

export interface FaturaReceber {
  id: string;
  escolaId: string;
  numeroFatura: string;        // 'FT 2026/00452' ou 'FR 2026/00120'
  clienteId: string;
  clienteNome: string;
  clienteNif: string;
  alunoId?: string;
  alunoNome?: string;
  alunoNumeroProcesso?: string;
  turmaNome?: string;
  dataEmissao: string;
  dataVencimento: string;
  valorTotalLiquidoKz: number;
  valorImpostoIvaKz: number;
  valorTotalKz: number;
  valorPagoKz: number;
  saldoAbertoKz: number;
  estado: 'pendente' | 'parcial' | 'liquidado' | 'vencido' | 'anulado';
  descricao: string;
  linhasItens: {
    itemDescricao: string;
    quantidade: number;
    precoUnitarioKz: number;
    taxaIvaPercent: number;
    motivoIsencaoIva?: string;
    totalLinhaKz: number;
  }[];
  lancamentoContabilisticoId?: string;
}

export interface AntiguidadeSaldoReceber {
  clienteId: string;
  clienteNome: string;
  nif: string;
  contacto: string;
  saldoTotalKz: number;
  correnteVincendoKz: number;  // Ainda não venceu
  atraso1a30DiasKz: number;
  atraso31a60DiasKz: number;
  atraso61a90DiasKz: number;
  atrasoMais90DiasKz: number;
}

// ==========================================
// 6. CONTAS A PAGAR & FORNECEDORES
// ==========================================

export interface FornecedorFinanceiro {
  id: string;
  escolaId: string;
  codigoFornecedor: string;    // Ex: 'FORN-0012'
  nomeRazaoSocial: string;     // Ex: 'Editorial Nzila Lda', 'Sistemas de Rede & TI Angola'
  nif: string;                 // NIF angolano de 10 dígitos
  categoria: 'livros_material' | 'tecnologia_software' | 'manutencao_obras' | 'energia_agua' | 'alimentacao_cantina' | 'servicos_seguranca' | 'outro';
  telefone: string;
  email: string;
  ibanPagamento: string;
  banco: string;
  morada: string;
  saldoDevedorKz: number;      // Quanto a escola deve ao fornecedor
  contaContabilisticaPGC: string; // Ex: '32.1.1.002'
  activa: boolean;
}

export interface FaturaPagar {
  id: string;
  escolaId: string;
  fornecedorId: string;
  fornecedorNome: string;
  fornecedorNif: string;
  numeroFaturaOriginal: string; // Número que consta na fatura emitida pelo fornecedor
  numeroRegistoInterno: string;  // Ex: 'COMP-2026/0089'
  dataEmissaoFatura: string;
  dataEntradaRegisto: string;
  dataVencimento: string;
  valorBaseKz: number;
  valorIvaSuportadoKz: number;
  taxaIvaPercent: number;
  valorRetencaoFonteKz: number; // Ex: 6.5% prestação de serviços
  taxaRetencaoFontePercent: number;
  valorTotalLiquidoPagarKz: number;
  valorPagoKz: number;
  saldoPendenteKz: number;
  centroCustoId?: string;
  centroCustoNome?: string;
  contaCustoPGC: string;        // Ex: '75.2.1' (FSE - Material de Consumo)
  descricaoServicoMaterial: string;
  estado: 'rascunho' | 'aprovada' | 'paga_parcial' | 'paga' | 'rejeitada' | 'cancelada';
  anexoFaturaUrl?: string;
  lancamentoContabilisticoId?: string;
}

export interface OrdemPagamento {
  id: string;
  numeroOrdem: string;          // Ex: 'OP-2026/0034'
  fornecedorId: string;
  fornecedorNome: string;
  faturaPagarId: string;
  valorPagarKz: number;
  metodoPagamento: 'transferencia_bancaria' | 'cheque' | 'numerario_caixa';
  contaBancariaOrigemId?: string;
  contaBancariaOrigemIban?: string;
  dataEmissao: string;
  dataPrevistaExecucao: string;
  dataExecutada?: string;
  referenciaBancaria?: string;
  estado: 'preparada' | 'autorizada_direccao' | 'executada' | 'cancelada';
  autorizadoPor?: string;
}

// ==========================================
// 7. FATURAÇÃO & DOCUMENTOS FISCAIS (AGT)
// ==========================================

export type TipoDocumentoFiscal =
  | 'FT' // Factura
  | 'FR' // Factura-Recibo
  | 'RC' // Recibo
  | 'NC' // Nota de Crédito (rectificação/anulação)
  | 'ND'; // Nota de Débito

export interface DocumentoFiscalEmitido {
  id: string;
  escolaId: string;
  tipoDocumento: TipoDocumentoFiscal;
  serie: string;               // Ex: 'EDUG2026'
  numeroSequencial: number;    // Ex: 125
  identificadorDocumento: string; // Ex: 'FR EDUG2026/125'
  dataEmissao: string;
  horaEmissao: string;
  clienteNome: string;
  clienteNif: string;
  clienteMorada?: string;
  alunoNome?: string;
  alunoProcesso?: string;
  itens: {
    codigoArtigo: string;
    descricao: string;
    quantidade: number;
    precoUnitarioKz: number;
    descontoKz: number;
    taxaIvaPercent: number;
    codigoRegimeIva: 'ISE' | 'NOR' | 'RED';
    motivoIsencao: string;     // Ex: 'M02 - Isenção ao abrigo do Artigo 12º do CIVA (Educação)'
    totalLiquidoKz: number;
  }[];
  totalIncidenciaIvaKz: number;
  totalIvaKz: number;
  totalRetencaoKz: number;
  totalGeralKz: number;
  metodoPagamento: 'TPA' | 'Multicaixa' | 'Numerário' | 'Transferência Bancária' | 'A Prazo';
  hashDocumento: string;       // Assinatura digital / hash para integridade AGT
  estado: 'emitido' | 'anulado';
  motivoAnulacao?: string;
  lancamentoContabilisticoId?: string;
}

// ==========================================
// 8. FISCALIDADE ANGOLANA & SAF-T (AO)
// ==========================================

export interface ConfiguracaoFiscalAGT {
  nifInstituicao: string;
  razaoSocial: string;
  reparticaoFiscal: string;    // Ex: '3ª Repartição Fiscal de Luanda - Maianga'
  regimeIva: 'geral' | 'simplificado' | 'exclusao' | 'isento_ensino';
  isencaoArtigo12Civa: boolean; // Isenção específica para Serviços de Ensino em Angola
  taxaIvaPadraoPercent: number; // 14%
  taxaRetencaoPrestacaoServicosPercent: number; // 6.5%
  retencaoIrtAplicavel: boolean;
  taxaInssTrabalhadorPercent: number; // 3%
  taxaInssPatronalPercent: number;    // 8%
  versaoSaftSuportada: 'SAF-T (AO) 1.01_01';
}

export interface ResumoApuramentoImpostos {
  periodoAnoMes: string;       // Ex: '2026-03'
  ivaLiquidadoTotalKz: number;
  ivaDedutivelComprasKz: number;
  ivaPagarOuRecuperarKz: number;
  retencaoFonteEfetuadaKz: number;  // 6.5% retido a fornecedores
  irtTotalRetidoSalariosKz: number; // Grupo A de IRT dos colaboradores
  inssTotalTrabalhador3Kz: number;
  inssTotalPatronal8Kz: number;
  inssTotalEntregarKz: number;      // 11% global
  dataLimitePagamento: string;
  estado: 'em_apuramento' | 'declarado' | 'pago';
}

// Estrutura SAF-T (AO) de Contabilidade
export interface SaftContabilidadeExport {
  header: {
    auditFileVersion: string;
    companyID: string;
    taxRegistrationNumber: string;
    taxAccountingBasis: string;
    companyName: string;
    businessName: string;
    companyAddress: {
      addressDetail: string;
      city: string;
      province: string;
      country: string;
    };
    fiscalYear: number;
    startDate: string;
    endDate: string;
    currencyCode: string;
    dateCreated: string;
    taxEntity: string;
    productCompanyTaxID: string;
    softwareValidationNumber: string;
    productID: string;
    productVersion: string;
  };
  masterFiles: {
    generalLedgerAccounts: {
      accountID: string;
      accountDescription: string;
      openingDebitBalance: number;
      openingCreditBalance: number;
      closingDebitBalance: number;
      closingCreditBalance: number;
      groupingCategory: string;
      taxonomyCode?: string;
    }[];
    customers: {
      customerID: string;
      accountID: string;
      customerTaxID: string;
      companyName: string;
    }[];
    suppliers: {
      supplierID: string;
      accountID: string;
      supplierTaxID: string;
      companyName: string;
    }[];
  };
  generalLedgerEntries: {
    numberOfEntries: number;
    totalDebit: number;
    totalCredit: number;
    journals: {
      journalID: string;
      description: string;
      transactions: {
        transactionID: string;
        period: number;
        transactionDate: string;
        sourceID: string;
        description: string;
        lines: {
          recordID: string;
          accountID: string;
          debitAmount?: number;
          creditAmount?: number;
          description: string;
        }[];
      }[];
    }[];
  };
}

// ==========================================
// 9. ORÇAMENTO & CONTROLO ORÇAMENTAL
// ==========================================

export interface RubricaOrcamental {
  id: string;
  codigoRubrica: string;       // Ex: 'ORC-REC-01', 'ORC-DESP-04'
  tipo: 'receita' | 'despesa';
  designacao: string;
  contaContabilisticaPGC: string;
  centroCustoId?: string;
  valorOrcamentadoAnualKz: number;
  valorRealizadoKz: number;
  desvioValorKz: number;       // Realizado - Orcamentado
  desvioPercentual: number;
  distribuicaoMensalPrevistaKz: Record<number, number>; // mes (1-12) => valor
}

export interface OrcamentoAnual {
  id: string;
  escolaId: string;
  anoExercicio: number;
  titulo: string;              // 'Orçamento Geral do Colégio - Ano Lectivo 2026'
  versao: string;              // 'v1.0 Aprovada'
  estado: 'rascunho' | 'submetido' | 'aprovado' | 'revisado';
  totalReceitasOrcamentadasKz: number;
  totalDespesasOrcamentadasKz: number;
  resultadoOrcamentadoPrevistoKz: number;
  totalReceitasRealizadasKz: number;
  totalDespesasRealizadasKz: number;
  rubricas: RubricaOrcamental[];
  dataAprovacao?: string;
  aprovadoPor?: string;
}

// ==========================================
// 10. CONTABILIDADE ANALÍTICA & CENTROS DE CUSTO
// ==========================================

export interface CentroCusto {
  id: string;
  escolaId: string;
  codigo: string;              // Ex: 'CC-01-PEDAG', 'CC-02-ADM', 'CC-03-TRANS'
  nome: string;
  tipo: 'operacional' | 'apoio' | 'direccao';
  responsavelNome: string;
  orcamentoAtribuidoKz: number;
  custosAcumuladosKz: number;
  receitasAtribuidasKz: number;
  saldoOperacionalKz: number;
  activo: boolean;
}

// ==========================================
// 11. ACTIVOS FIXOS & AMORTIZAÇÕES
// ==========================================

export type MetodoAmortizacao = 'quotas_constantes' | 'quotas_degressivas';

export interface ActivoFixoImobilizado {
  id: string;
  escolaId: string;
  codigoPatrimonial: string;   // Ex: 'PAT-2026-0042'
  designacao: string;          // Ex: 'Autocarro Escolar Toyota Coaster 30L', 'Servidor Central Dell'
  categoria: 'edificios_instalacoes' | 'equipamento_informatico' | 'mobiliario_escolar' | 'viaturas_transporte' | 'equipamento_laboratorio' | 'outros';
  dataAquisicao: string;
  fornecedorNome: string;
  numeroFaturaCompra: string;
  custoAquisicaoKz: number;
  valorResidualEstimadoKz: number;
  vidaUtilAnos: number;        // Ex: 5 anos (informática), 10 anos (mobiliário), 20 anos (edifícios)
  taxaAmortizacaoAnualPercent: number; // Ex: 20%, 10%, 5%
  metodo: MetodoAmortizacao;
  amortizacaoAcumuladaKz: number;
  valorLiquidoContabilisticoKz: number; // Custo - Amortização Acumulada
  estadoConservacao: 'excelente' | 'bom' | 'regular' | 'danificado' | 'abatido';
  localizacaoFisica: string;   // Ex: 'Campus 1 - Sala de Servidores', 'Garagem do Colégio'
  responsavelNome: string;
  contaActivoPGC: string;      // Ex: '11.4' (Equipamento de Transporte)
  contaAmortizacaoAcumuladaPGC: string; // Ex: '18.4'
  contaCustoAmortizacaoPGC: string;     // Ex: '74.1'
  ativo: boolean;
}

// ==========================================
// 12. DESPESAS & REEMBOLSOS
// ==========================================

export interface PedidoDespesaReembolso {
  id: string;
  numeroPedido: string;        // Ex: 'DSP-2026/0018'
  colaboradorId: string;
  colaboradorNome: string;
  departamento: string;
  categoria: 'transporte_deslocacao' | 'material_urgente' | 'refeicoes_eventos' | 'taxas_oficiais' | 'outro';
  descricaoDetalhada: string;
  dataDespesa: string;
  valorSolicitadoKz: number;
  valorAprovadoKz?: number;
  anexoComprovativoUrl?: string;
  tipo: 'reembolso' | 'adiantamento_fundo_maneio';
  estado: 'rascunho' | 'submetido' | 'aprovado' | 'rejeitado' | 'pago' | 'contabilizado';
  dataAprovacao?: string;
  aprovadoPor?: string;
  motivoRejeicao?: string;
  pagoEm?: string;
  metodoPagamento?: string;
  lancamentoContabilisticoId?: string;
}

// ==========================================
// 13. AUDITORIA & SEGURANÇA FINANCEIRA
// ==========================================

export interface RegistoAuditoriaFinanceira {
  id: string;
  dataHora: string;
  utilizadorId: string;
  utilizadorNome: string;
  utilizadorEmail: string;
  perfilPapel: string;
  escolaId: string;
  moduloSubseccao: string;     // 'Lançamentos', 'Tesouraria', 'SAF-T', 'Fiscalidade', 'Encerramento'
  acao: 'CRIACAO' | 'EDICAO' | 'APROVACAO' | 'CONTABILIZACAO' | 'ESTORNO' | 'ENCERRAMENTO_PERIODO' | 'EXPORTACAO_SAFT' | 'RECONCILIACAO_BANCO';
  entidadeAfetadaId: string;
  entidadeAfetadaDescricao: string;
  detalhesTecnicos: string;
  valorMonetarioKz?: number;
  enderecoIp: string;
}

// ==========================================
// 14. DEMONSTRAÇÕES FINANCEIRAS
// ==========================================

export interface LinhaBalanco {
  rubricaCodigo: string;
  rubricaDescricao: string;
  notaExplicativa?: string;
  anoAtualKz: number;
  anoAnteriorKz: number;
  subItens?: LinhaBalanco[];
}

export interface EstruturaBalancoPatrimonial {
  dataReferencia: string;
  exercicioAno: number;
  ativoNaoCorrente: LinhaBalanco[];
  totalAtivoNaoCorrenteKz: number;
  ativoCorrente: LinhaBalanco[];
  totalAtivoCorrenteKz: number;
  totalAtivoKz: number;

  capitalProprio: LinhaBalanco[];
  totalCapitalProprioKz: number;
  passivoNaoCorrente: LinhaBalanco[];
  totalPassivoNaoCorrenteKz: number;
  passivoCorrente: LinhaBalanco[];
  totalPassivoCorrenteKz: number;
  totalPassivoKz: number;
  totalCapitalProprioEPassivoKz: number;
  quadradoEquilibrado: boolean; // Ativo === Capital Próprio + Passivo
}

export interface DemonstracaoResultados {
  exercicioAno: number;
  periodoDescricao: string;
  vendasEServicosPropinasKz: number;
  outrosProveitosOperacionaisKz: number;
  totalRendimentosOperacionaisKz: number;

  custosPessoalSalariosKz: number;
  fornecimentosEServicosExternosFseKz: number;
  impostosTaxasOperacionaisKz: number;
  amortizacoesEDepreciacoesExercicioKz: number;
  outrosCustosOperacionaisKz: number;
  totalGastosOperacionaisKz: number;

  resultadoOperacionalEbitdaKz: number;
  rendimentosFinanceirosJurosKz: number;
  gastosFinanceirosJurosBancariosKz: number;
  resultadoAntesImpostosKz: number;
  impostoIndustrialEstimadoKz: number;
  resultadoLiquidoExercicioKz: number;
}

export interface LinhaBalanceteVerificacao {
  contaCodigo: string;
  contaDesignacao: string;
  tipo: TipoConta;
  grau: number;
  saldoInicialDevedorKz: number;
  saldoInicialCredorKz: number;
  movimentoDebitoKz: number;
  movimentoCreditoKz: number;
  saldoFinalDevedorKz: number;
  saldoFinalCredorKz: number;
}
