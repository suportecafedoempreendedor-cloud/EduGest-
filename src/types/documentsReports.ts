export type DocumentType =
  | 'declaracao_matricula'
  | 'declaracao_frequencia'
  | 'declaracao_aproveitamento'
  | 'boletim'
  | 'pauta'
  | 'certificado'
  | 'factura'
  | 'recibo'
  | 'comprovativo';

export interface DocumentTypeMetadata {
  id: DocumentType;
  nome: string;
  descricao: string;
  categoria: 'Academico' | 'Financeiro' | 'Administrativo';
  requerAluno: boolean;
  requerTurma: boolean;
  requerFinanceiro: boolean;
  requerNotas: boolean;
  prazoValidadeDias?: number;
}

export interface SchoolDocumentTemplate {
  id: string;
  escolaId: string;
  tipoDocumento: DocumentType;
  nomeTemplate: string;
  cabecalhoRepública: string;
  ministerio: string;
  governoProvincial: string;
  subtituloCabecalho: string;
  numeroDecretoAutorizacao: string;
  mostrarLogotipo: boolean;
  mostrarSeloBranco: boolean;
  mostrarMarcaDAgua: boolean;
  marcaDAguaTexto: string;
  corPrimaria: string;
  textoCorpo: string;
  termoAutenticidade: string;
  nomeDirector: string;
  cargoDirector: string;
  nomeSecretario: string;
  cargoSecretario: string;
  mostrarQrCodeVerificacao: boolean;
  codigoPrefixo: string;
  rodapeTexto: string;
  ultimaActualizacao: string;
}

export interface EmittedDocument {
  id: string;
  numeroDocumento: string;
  codigoAutenticidade: string;
  tipo: DocumentType;
  titulo: string;
  escolaId: string;
  escolaNome: string;
  alunoId?: string;
  alunoNome?: string;
  alunoProcesso?: string;
  alunoBi?: string;
  turmaId?: string;
  turmaNome?: string;
  classe?: string;
  anoLectivo: string;
  dataEmissao: string;
  emitidoPor: string;
  finalidade: string;
  estado: 'valido' | 'anulado';
  dadosEspecificos?: Record<string, any>;
}

export type ReportCategory =
  | 'academicos'
  | 'financeiros'
  | 'administrativos'
  | 'assiduidade'
  | 'crm';

export interface ReportDefinition {
  id: string;
  categoria: ReportCategory;
  titulo: string;
  descricao: string;
  periodosDisponiveis: string[];
  filtrosSuportados: Array<'anoLectivo' | 'turma' | 'trimestre' | 'estado' | 'dataInicio' | 'dataFim' | 'curso'>;
}

export interface ReportFilterState {
  categoria: ReportCategory;
  reportId: string;
  anoLectivo: string;
  turmaId: string;
  trimestre: string;
  curso: string;
  dataInicio: string;
  dataFim: string;
  termoPesquisa: string;
}
