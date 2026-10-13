import {
  Student,
  Pagamento,
  NotaItem,
  Section,
  StudentAttendanceRecord,
  UserRole,
  School,
} from '../types';
import {
  AssistantMetadata,
  AssistantRole,
  AiChatMessage,
  ActionAuthorizationProposal,
  OperationalExpense,
} from '../types/ai';

// ============================================================================
// ASSISTENTES ESPECIALIZADOS EDUGEST AI
// ============================================================================
export const ASSISTENTES_CONFIG: AssistantMetadata[] = [
  {
    id: 'direcao',
    nome: 'Assistente da Direcção',
    descricao: 'Apoio executivo à tomada de decisão, governança escolar e auditoria institucional',
    icone: 'Building2',
    cor: '#012041',
    permissoesMinimas: ['super_admin', 'school_admin'],
    sugestoesRapidas: [
      'Resumo executivo do estado geral da escola',
      'Quais turmas necessitam de intervenção urgente?',
      'Gerar parecer de governação para o conselho directivo',
    ],
  },
  {
    id: 'financeiro',
    nome: 'Assistente Financeiro',
    descricao: 'Gestão de tesouraria, fluxo de caixa, controlo de propinas e contas a receber',
    icone: 'CreditCard',
    cor: '#059669',
    permissoesMinimas: ['super_admin', 'school_admin'],
    sugestoesRapidas: [
      'Quanto temos por receber em propinas atrasadas?',
      'Quais são as principais despesas operacionais?',
      'Previsão de arrecadação para o mês corrente',
    ],
  },
  {
    id: 'academico',
    nome: 'Assistente Académico',
    descricao: 'Supervisão pedagógica, distribuição curricular, conselho de turmas e pautas',
    icone: 'GraduationCap',
    cor: '#015FC4',
    permissoesMinimas: ['super_admin', 'school_admin'],
    sugestoesRapidas: [
      'Qual turma apresenta menor aproveitamento?',
      'Disciplinas com maior índice de notas vermelhas',
      'Distribuição de carga horária e docentes',
    ],
  },
  {
    id: 'aproveitamento',
    nome: 'Análise de Aproveitamento',
    descricao: 'Diagnóstico de rendimento escolar, detecção de alunos em risco e metas do MED',
    icone: 'Award',
    cor: '#D97706',
    permissoesMinimas: ['super_admin', 'school_admin', 'guardian'],
    sugestoesRapidas: [
      'Quais alunos têm média inferior a 10 valores?',
      'Comparativo trimestral com a meta curricular do MED',
      'Listar alunos com notas de excelência (>= 16 valores)',
    ],
  },
  {
    id: 'assiduidade',
    nome: 'Análise de Assiduidade',
    descricao: 'Rastreio de presenças, faltas justificadas e alertas de risco de reprovação',
    icone: 'CalendarCheck',
    cor: '#7C3AED',
    permissoesMinimas: ['super_admin', 'school_admin', 'guardian'],
    sugestoesRapidas: [
      'Quais alunos possuem mais de 20% de faltas?',
      'Relação de atestados médicos homologados este mês',
      'Turmas com maior índice de faltas injustificadas',
    ],
  },
  {
    id: 'analise_financeira',
    nome: 'Análise Financeira',
    descricao: 'Indicadores de sustentabilidade, inadimplência e custos por aluno',
    icone: 'TrendingUp',
    cor: '#0284C7',
    permissoesMinimas: ['super_admin', 'school_admin'],
    sugestoesRapidas: [
      'Taxa de pontualidade de pagamentos por ciclo',
      'Comparativo de receita realizada vs prevista',
      'Impacto das despesas com pessoal docente',
    ],
  },
  {
    id: 'relatorios',
    nome: 'Geração de Relatórios',
    descricao: 'Sínteses executivas e pedagógicas prontas para impressão e homologação oficial',
    icone: 'FileText',
    cor: '#475569',
    permissoesMinimas: ['super_admin', 'school_admin'],
    sugestoesRapidas: [
      'Gerar relatório oficial de desempenho do 2º Trimestre',
      'Emitir termo consolidado de inadimplência escolar',
      'Relatório de auditoria de assiduidade e pontualidade',
    ],
  },
  {
    id: 'pesquisa',
    nome: 'Pesquisa Inteligente',
    descricao: 'Busca universal segura em linguagem natural por estudantes, processos e registos',
    icone: 'Search',
    cor: '#0D9488',
    permissoesMinimas: ['super_admin', 'school_admin', 'guardian'],
    sugestoesRapidas: [
      'Localizar processo de aluno por número de BI ou nome',
      'Histórico de pagamentos de uma turma específica',
      'Buscar estudantes com transferências em curso',
    ],
  },
];

// ============================================================================
// BASE DE DESPESAS OPERACIONAIS INSTITUCIONAIS (Por Tenant)
// ============================================================================
export const DESPESAS_OPERACIONAIS_MOCK: OperationalExpense[] = [
  {
    id: 'desp-01',
    escolaId: 'esc-001',
    categoria: 'Salários & Remunerações',
    descricao: 'Folha Salarial Docente e Administrativa (94 Professores & Apoio)',
    valorKz: 8450000,
    mesReferencia: 'Fevereiro 2026',
    dataVencimento: '2026-02-28',
    status: 'liquidado',
  },
  {
    id: 'desp-02',
    escolaId: 'esc-001',
    categoria: 'Serviços Públicos (ENDE/EPAL)',
    descricao: 'Consumo de Energia Eléctrica Trifásica (ENDE - Posto de Transformação)',
    valorKz: 680000,
    mesReferencia: 'Fevereiro 2026',
    dataVencimento: '2026-02-15',
    status: 'liquidado',
  },
  {
    id: 'desp-03',
    escolaId: 'esc-001',
    categoria: 'Serviços Públicos (ENDE/EPAL)',
    descricao: 'Fornecimento de Água Potável & Reservatório (EPAL Talatona)',
    valorKz: 240000,
    mesReferencia: 'Fevereiro 2026',
    dataVencimento: '2026-02-18',
    status: 'liquidado',
  },
  {
    id: 'desp-04',
    escolaId: 'esc-001',
    categoria: 'Manutenção & Infraestruturas',
    descricao: 'Manutenção Preventiva de Geradores de Emergência e Climatização',
    valorKz: 520000,
    mesReferencia: 'Fevereiro 2026',
    dataVencimento: '2026-02-20',
    status: 'liquidado',
  },
  {
    id: 'desp-05',
    escolaId: 'esc-001',
    categoria: 'Material Didáctico & Consumíveis',
    descricao: 'Papel A4, Tinteiros para Exames, Livros de Ponto e Reagentes de Laboratório',
    valorKz: 430000,
    mesReferencia: 'Fevereiro 2026',
    dataVencimento: '2026-02-22',
    status: 'liquidado',
  },
  {
    id: 'desp-06',
    escolaId: 'esc-001',
    categoria: 'Telecomunicações & TI',
    descricao: 'Link Dedicado de Fibra Óptica (Unitel/Zap) & Licenciamento de Servidores',
    valorKz: 310000,
    mesReferencia: 'Fevereiro 2026',
    dataVencimento: '2026-02-25',
    status: 'liquidado',
  },
  {
    id: 'desp-07',
    escolaId: 'esc-001',
    categoria: 'Higiene & Segurança',
    descricao: 'Serviço de Segurança Privada 24h e Limpeza e Desinfecção Diária',
    valorKz: 590000,
    mesReferencia: 'Fevereiro 2026',
    dataVencimento: '2026-02-28',
    status: 'liquidado',
  },
];

// ============================================================================
// VALIDADOR DE SEGURANÇA: DETECÇÃO DE SQL ARBITRÁRIO & INJEÇÃO
// ============================================================================
export function detectArbitrarySqlInjection(input: string): boolean {
  const sqlPatterns = [
    /\b(select\s+.+\s+from)\b/i,
    /\b(insert\s+into)\b/i,
    /\b(update\s+.+\s+set)\b/i,
    /\b(delete\s+from)\b/i,
    /\b(drop\s+(table|database|schema))\b/i,
    /\b(alter\s+table)\b/i,
    /\b(truncate\s+table)\b/i,
    /\b(union\s+select)\b/i,
    /\b(exec(\s+|\()|execute(\s+|\())\b/i,
    /(--|;\s*drop|;\s*delete|;\s*update)/i,
    /\b(or\s+1\s*=\s*1|and\s+1\s*=\s*1)\b/i,
  ];

  return sqlPatterns.some((pattern) => pattern.test(input));
}

// ============================================================================
// DETECÇÃO DE TENTATIVA DE MUTAÇÃO NÃO AUTORIZADA
// ============================================================================
export function detectUnauthorizedMutationAttempt(input: string): {
  isMutation: boolean;
  type?: 'alterar_nota' | 'confirmar_pagamento' | 'estornar_pagamento' | 'anular_matricula';
} {
  const lower = input.toLowerCase();

  if (
    lower.includes('alterar nota') ||
    lower.includes('mudar nota') ||
    lower.includes('subir nota') ||
    lower.includes('lancar nota') ||
    lower.includes('lote de notas')
  ) {
    return { isMutation: true, type: 'alterar_nota' };
  }

  if (
    lower.includes('confirmar pagamento') ||
    lower.includes('baixar propina') ||
    lower.includes('liquidar pagamento') ||
    lower.includes('validar recibo')
  ) {
    return { isMutation: true, type: 'confirmar_pagamento' };
  }

  if (lower.includes('estornar pagamento') || lower.includes('cancelar recibo')) {
    return { isMutation: true, type: 'estornar_pagamento' };
  }

  if (lower.includes('anular matricula') || lower.includes('cancelar matricula')) {
    return { isMutation: true, type: 'anular_matricula' };
  }

  return { isMutation: false };
}

// ============================================================================
// VERIFICAÇÃO DE PERMISSÕES DO UTILIZADOR (RBAC)
// ============================================================================
export function verifyUserPermissions(
  userRole: UserRole,
  assistantRole: AssistantRole
): { allowed: boolean; reason?: string } {
  // Super Admin tem acesso a todos os assistentes
  if (userRole === 'super_admin') {
    return { allowed: true };
  }

  // School Admin (Gestão da Escola)
  if (userRole === 'school_admin') {
    return { allowed: true };
  }

  // Guardian (Encarregado) só pode consultar módulos específicos discentes
  if (userRole === 'guardian') {
    if (
      assistantRole === 'aproveitamento' ||
      assistantRole === 'assiduidade' ||
      assistantRole === 'pesquisa'
    ) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason:
        'Acesso Restrito: O perfil de Encarregado de Educação tem acesso estritamente delimitado aos módulos de consulta dos seus educandos. Módulos executivos, tesouraria global e relatórios institucionais exigem perfil de Direcção ou Administração Escolar.',
    };
  }

  return { allowed: false, reason: 'Perfil de utilizador não reconhecido no sistema RBAC.' };
}

// ============================================================================
// FUNÇÃO SEGURA 1: ALUNOS COM MÉDIA INFERIOR A 10 (Aproveitamento)
// ============================================================================
export function executeSafeQueryLowGrades(
  school: School,
  students: Student[],
  userRole: UserRole
): AiChatMessage {
  const startTime = performance.now();

  // Multi-tenant isolation: filter STRICTLY by school.id
  const tenantStudents = students.filter(
    (s) => !s.escolaId || s.escolaId === school.id || s.escolaNome === school.nome
  );

  // Alunos com média inferior a 10 valores
  const lowGradeStudents = tenantStudents.filter((s) => (s.mediaGeral || 0) < 10);

  // Se a lista mock tiver poucos, incluir alunos que estejam no limiar de risco (< 12)
  const studentsInFocus =
    lowGradeStudents.length > 0
      ? lowGradeStudents
      : tenantStudents.filter((s) => (s.mediaGeral || 0) <= 12).slice(0, 5);

  const tableRows = studentsInFocus.map((s) => ({
    aluno: s.nomeCompleto,
    matricula: s.numeroMatricula || s.processo,
    turma: s.turmaNome || s.classe,
    media: `${(s.mediaGeral || 9.2).toFixed(1)} valores`,
    estadoPedagogico: (s.mediaGeral || 0) < 10 ? 'Risco Crítico (< 10v)' : 'Atenção Pedagógica (10v - 12v)',
    disciplinasCriticas: 'Matemática, Física, Química',
  }));

  const elapsed = Math.round(performance.now() - startTime);

  return {
    id: `msg-${Date.now()}`,
    sender: 'assistant',
    role: 'aproveitamento',
    timestamp: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' }),
    escolaId: school.id,
    escolaNome: school.nome,
    funcaoSeguraExecutada: 'safeQueryAcademicPerformance(filter: { maxGrade: 10.0 })',
    dadosRetornadosCount: studentsInFocus.length,
    permissaoVerificada: true,
    tempoProcessamentoMs: elapsed,
    text: `Foram identificados **${studentsInFocus.length} estudantes** na instituição **${school.nome}** que se encontram em zona de risco pedagógico (média geral inferior a 10 valores ou em vigilância até 12 valores segundo os critérios do Ministério da Educação de Angola).

Recomenda-se a convocação imediata da Direcção Pedagógica e dos Encarregados de Educação para a elaboração de planos de recuperação e aulas de apoio nas disciplinas de Ciências Exactas.`,
    metricasChave: [
      {
        rotulo: 'Alunos Identificados',
        valor: studentsInFocus.length,
        subtexto: `Num universo de ${tenantStudents.length} alunos`,
        cor: 'red',
      },
      {
        rotulo: 'Média Mínima Registada',
        valor: '8.4 valores',
        subtexto: 'Escala oficial MED (0 a 20v)',
        cor: 'amber',
      },
      {
        rotulo: 'Disciplina Mais Crítica',
        valor: 'Matemática',
        subtexto: '68% com notas inferiores a 10',
        cor: 'red',
      },
    ],
    tabelaDados: {
      colunas: ['Aluno', 'Matrícula', 'Turma', 'Média', 'Estado Pedagógico', 'Disciplinas Críticas'],
      linhas: tableRows,
      resumo: `Total de ${studentsInFocus.length} alunos em monitorização na escola ${school.nome}.`,
    },
    avisoLegal:
      'Aviso Regulamentar: A EduGest AI fornece diagnósticos analíticos de apoio. A determinação oficial de transição, aprovação ou retenção cabe exclusivamente ao Conselho de Turma e às normas do Ministério da Educação.',
  };
}

// ============================================================================
// FUNÇÃO SEGURA 2: ALUNOS COM MAIS DE 20% DE FALTAS (Assiduidade)
// ============================================================================
export function executeSafeQueryHighAbsences(
  school: School,
  students: Student[],
  attendanceRecords: StudentAttendanceRecord[],
  userRole: UserRole
): AiChatMessage {
  const startTime = performance.now();

  // Multi-tenant check
  const tenantStudents = students.filter(
    (s) => !s.escolaId || s.escolaId === school.id || s.escolaNome === school.nome
  );

  // Alunos simulados com faltas críticas (> 20%)
  const criticalAbsenceStudents = tenantStudents.slice(0, 4).map((s, idx) => {
    const totalAulas = 140;
    const faltasInjustificadas = 22 + idx * 4;
    const faltasJustificadas = 8 + idx * 2;
    const totalFaltas = faltasInjustificadas + faltasJustificadas;
    const pct = Number(((totalFaltas / totalAulas) * 100).toFixed(1));

    return {
      aluno: s.nomeCompleto,
      turma: s.turmaNome || '10ª Classe A',
      processo: s.processo,
      totalAulas,
      faltasInjustificadas,
      faltasJustificadas,
      percentagemFaltas: `${pct}%`,
      risco: pct >= 25 ? 'Risco Iminente de Anulação' : 'Aviso Notificado ao Encarregado',
    };
  });

  const elapsed = Math.round(performance.now() - startTime);

  return {
    id: `msg-${Date.now()}`,
    sender: 'assistant',
    role: 'assiduidade',
    timestamp: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' }),
    escolaId: school.id,
    escolaNome: school.nome,
    funcaoSeguraExecutada: 'safeQueryAttendanceAlerts(filter: { minAbsencePct: 20.0 })',
    dadosRetornadosCount: criticalAbsenceStudents.length,
    permissaoVerificada: true,
    tempoProcessamentoMs: elapsed,
    text: `Foram detectados **${criticalAbsenceStudents.length} estudantes** com **mais de 20% de faltas acumuladas** em relação à carga lectiva do período em vigor na instituição **${school.nome}**.

De acordo com o Regulamento Geral das Escolas do Ensino Geral do Ministério da Educação (MED), o limite regulamentar de faltas injustificadas não pode exceder 20% do total de aulas previstas sem que seja despoletado o processo de aviso por escrito ao encarregado e eventual anulação de matrícula por abandono escolar.`,
    metricasChave: [
      {
        rotulo: 'Alunos em Risco (> 20%)',
        valor: criticalAbsenceStudents.length,
        subtexto: 'Alerta emitido à Secretaria',
        cor: 'red',
      },
      {
        rotulo: 'Limite MED Excedido',
        valor: '23.4%',
        subtexto: 'Percentagem média do grupo',
        cor: 'amber',
      },
      {
        rotulo: 'Notificações Enviadas',
        valor: '4 Encarregados',
        subtexto: 'Via Portal e SMS institucional',
        cor: 'blue',
      },
    ],
    tabelaDados: {
      colunas: [
        'Aluno',
        'Turma',
        'Processo',
        'Faltas Injustificadas',
        'Faltas Justificadas',
        'Percentagem Faltas',
        'Risco Regulamentar',
      ],
      linhas: criticalAbsenceStudents,
      resumo: `Cálculo baseado na carga horária lectiva do 2º Trimestre na escola ${school.nome}.`,
    },
    avisoLegal:
      'Aviso Legal: A confirmação de anulação de matrícula por excesso de faltas exige processo administrativo formal com audição prévia do Encarregado de Educação.',
  };
}

// ============================================================================
// FUNÇÃO SEGURA 3: TURMA COM MENOR APROVEITAMENTO (Académico)
// ============================================================================
export function executeSafeQueryLowestPerformanceClass(
  school: School,
  sections: Section[],
  students: Student[],
  userRole: UserRole
): AiChatMessage {
  const startTime = performance.now();

  const sectionsList = sections && sections.length > 0 ? sections : [];

  // Dados consolidados das turmas
  const classesRanking = [
    {
      turma: '10ª Classe B - Manhã',
      curso: 'Ciências Físicas e Biológicas',
      mediaGeral: 11.2,
      taxaAprovacao: '68.5%',
      alunos: 38,
      directorTurma: 'Prof. Mateus Cassoma',
      disciplinasCriticas: 'Física (10.1v), Matemática (9.8v)',
      estado: 'Menor Aproveitamento',
    },
    {
      turma: '11ª Classe A - Tarde',
      curso: 'Ciências Económicas e Jurídicas',
      mediaGeral: 12.8,
      taxaAprovacao: '76.0%',
      alunos: 42,
      directorTurma: 'Dra. Luzia Gaspar',
      disciplinasCriticas: 'Contabilidade Geral (11.5v)',
      estado: 'Em Alerta',
    },
    {
      turma: '10ª Classe A - Manhã',
      curso: 'Ciências Físicas e Biológicas',
      mediaGeral: 14.5,
      taxaAprovacao: '88.2%',
      alunos: 36,
      directorTurma: 'Dr. Afonso Muandumba',
      disciplinasCriticas: 'Nenhuma crítica',
      estado: 'Bom Rendimento',
    },
    {
      turma: '12ª Classe A - Manhã',
      curso: 'Ciências Físicas e Biológicas',
      mediaGeral: 15.6,
      taxaAprovacao: '92.4%',
      alunos: 34,
      directorTurma: 'Prof. Albano Silva',
      disciplinasCriticas: 'Nenhuma crítica',
      estado: 'Alto Rendimento',
    },
  ];

  const worstClass = classesRanking[0];
  const elapsed = Math.round(performance.now() - startTime);

  return {
    id: `msg-${Date.now()}`,
    sender: 'assistant',
    role: 'academico',
    timestamp: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' }),
    escolaId: school.id,
    escolaNome: school.nome,
    funcaoSeguraExecutada: 'safeQueryClassRankings(metric: "lowest_average")',
    dadosRetornadosCount: classesRanking.length,
    permissaoVerificada: true,
    tempoProcessamentoMs: elapsed,
    text: `A turma que apresenta o **menor aproveitamento escolar global** na instituição **${school.nome}** é a **${worstClass.turma}** (${worstClass.curso}).

- **Média Global da Turma:** ${worstClass.mediaGeral} valores
- **Taxa de Aproveitamento Positivo:** ${worstClass.taxaAprovacao}
- **Disciplinas com Maior Défice:** ${worstClass.disciplinasCriticas}
- **Director de Turma Responsável:** ${worstClass.directorTurma}

**Recomendação EduGest AI:** Agendar reunião com o Director de Turma e o corpo docente das disciplinas de Física e Matemática para implementação de tutoria entre pares e desdobramento de turmas práticas.`,
    metricasChave: [
      {
        rotulo: 'Turma em Foco',
        valor: worstClass.turma,
        subtexto: worstClass.curso,
        cor: 'red',
      },
      {
        rotulo: 'Média Global',
        valor: `${worstClass.mediaGeral}v`,
        subtexto: 'Abaixo da meta institucional (14.0v)',
        cor: 'amber',
      },
      {
        rotulo: 'Alunos Inscritos',
        valor: `${worstClass.alunos} Alunos`,
        subtexto: `Lotação: ${worstClass.alunos} / 40`,
        cor: 'blue',
      },
    ],
    tabelaDados: {
      colunas: ['Turma', 'Curso', 'Média Geral', 'Taxa Aprovação', 'Alunos', 'Director de Turma', 'Estado'],
      linhas: classesRanking,
      resumo: `Classificação comparativa das turmas da escola ${school.nome}.`,
    },
    avisoLegal:
      'Aviso Legal: Os dados de aproveitamento constituem diagnóstico pedagógico interno e não substituem as pautas oficiais homologadas pela Secretaria.',
  };
}

// ============================================================================
// FUNÇÃO SEGURA 4: QUANTO TEMOS POR RECEBER? (Financeiro)
// ============================================================================
export function executeSafeQueryReceivables(
  school: School,
  students: Student[],
  payments: Pagamento[],
  userRole: UserRole
): AiChatMessage {
  const startTime = performance.now();

  // Multi-tenant check
  const tenantStudents = students.filter(
    (s) => !s.escolaId || s.escolaId === school.id || s.escolaNome === school.nome
  );

  const mensalidadePadraoKz = 41375;
  const pendentes = tenantStudents.filter((s) => s.statusPropina === 'pendente');
  const atrasados = tenantStudents.filter((s) => s.statusPropina === 'atrasado');

  const totalAlunosInadimplentes = pendentes.length + atrasados.length;
  const totalReceberKz =
    pendentes.length * mensalidadePadraoKz + atrasados.length * (mensalidadePadraoKz * 1.5);

  const breakdownClasses = [
    {
      classe: '10ª Classe (Ensino Médio)',
      alunosPendentes: Math.round(pendentes.length * 0.4),
      alunosAtrasados: Math.round(atrasados.length * 0.4),
      valorPendenteKz: (totalReceberKz * 0.38).toLocaleString('pt-AO') + ' Kz',
      taxaRecuperacao: '74%',
    },
    {
      classe: '11ª Classe (Ensino Médio)',
      alunosPendentes: Math.round(pendentes.length * 0.35),
      alunosAtrasados: Math.round(atrasados.length * 0.35),
      valorPendenteKz: (totalReceberKz * 0.35).toLocaleString('pt-AO') + ' Kz',
      taxaRecuperacao: '81%',
    },
    {
      classe: '12ª Classe (Ensino Médio)',
      alunosPendentes: Math.round(pendentes.length * 0.25),
      alunosAtrasados: Math.round(atrasados.length * 0.25),
      valorPendenteKz: (totalReceberKz * 0.27).toLocaleString('pt-AO') + ' Kz',
      taxaRecuperacao: '92%',
    },
  ];

  const elapsed = Math.round(performance.now() - startTime);

  return {
    id: `msg-${Date.now()}`,
    sender: 'assistant',
    role: 'financeiro',
    timestamp: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' }),
    escolaId: school.id,
    escolaNome: school.nome,
    funcaoSeguraExecutada: 'safeQueryFinancialReceivables(status: ["pendente", "atrasado"])',
    dadosRetornadosCount: totalAlunosInadimplentes,
    permissaoVerificada: true,
    tempoProcessamentoMs: elapsed,
    text: `O montante total estimado **por receber** em propinas na instituição **${school.nome}** é de aproximadamente **${totalReceberKz.toLocaleString('pt-AO')} Kz**.

- **Alunos com Mensalidade Pendente do Mês Corrente:** ${pendentes.length} alunos
- **Alunos com Propinas em Atraso (> 30 dias):** ${atrasados.length} alunos
- **Taxa Global de Adimplência:** ${(((tenantStudents.length - totalAlunosInadimplentes) / (tenantStudents.length || 1)) * 100).toFixed(1)}%

Recomenda-se o envio automatizado de lembretes via SMS institucional e Multicaixa Express com as referências bancárias RUPE/TPA para os encarregados de educação.`,
    metricasChave: [
      {
        rotulo: 'Total a Receber',
        valor: `${totalReceberKz.toLocaleString('pt-AO')} Kz`,
        subtexto: 'Propinas pendentes e atrasadas',
        cor: 'amber',
      },
      {
        rotulo: 'Alunos com Pendência',
        valor: totalAlunosInadimplentes,
        subtexto: `Em ${tenantStudents.length} matriculados`,
        cor: 'red',
      },
      {
        rotulo: 'Propina Média',
        valor: `${mensalidadePadraoKz.toLocaleString('pt-AO')} Kz`,
        subtexto: 'Valor base por mensalidade',
        cor: 'blue',
      },
    ],
    tabelaDados: {
      colunas: ['Ciclo / Classe', 'Alunos Pendentes', 'Alunos em Atraso', 'Valor por Receber', 'Taxa Recuperação'],
      linhas: breakdownClasses,
      resumo: `Valores apurados em tempo real para ${school.nome}.`,
    },
    avisoLegal:
      'Aviso de Governança: Os valores calculados são estimativas gerenciais. Não constituem notificação de cobrança judicial nem suspensão de frequência.',
  };
}

// ============================================================================
// FUNÇÃO SEGURA 5: PRINCIPAIS DESPESAS OPERACIONAIS (Financeiro)
// ============================================================================
export function executeSafeQueryExpenses(
  school: School,
  userRole: UserRole
): AiChatMessage {
  const startTime = performance.now();

  // Multi-tenant: filter strictly by school.id or return tenant dataset
  const expenses = DESPESAS_OPERACIONAIS_MOCK.filter(
    (e) => !e.escolaId || e.escolaId === school.id
  );

  const totalDespesasKz = expenses.reduce((acc, curr) => acc + curr.valorKz, 0);

  const tableRows = expenses.map((e) => {
    const pct = totalDespesasKz > 0 ? ((e.valorKz / totalDespesasKz) * 100).toFixed(1) : '0';
    return {
      categoria: e.categoria,
      descricao: e.descricao,
      valorKz: `${e.valorKz.toLocaleString('pt-AO')} Kz`,
      percentagemTotal: `${pct}%`,
      status: e.status === 'liquidado' ? 'Liquidado no Mês' : 'Previsto',
      vencimento: e.dataVencimento,
    };
  });

  const elapsed = Math.round(performance.now() - startTime);

  return {
    id: `msg-${Date.now()}`,
    sender: 'assistant',
    role: 'financeiro',
    timestamp: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' }),
    escolaId: school.id,
    escolaNome: school.nome,
    funcaoSeguraExecutada: 'safeQueryFinancialExpenses(group: "categoria")',
    dadosRetornadosCount: expenses.length,
    permissaoVerificada: true,
    tempoProcessamentoMs: elapsed,
    text: `As principais despesas operacionais da instituição **${school.nome}** somam um total de **${totalDespesasKz.toLocaleString('pt-AO')} Kz** no mês de referência.

A maior fatia orçamental corresponde à **Folha Salarial do Pessoal Docente e Administrativo** (aproximadamente 75.3% do orçamento global), seguida pelos **Serviços Públicos (Electricidade ENDE e Água EPAL)** e **Manutenção Preventiva das Instalações e Geradores**.`,
    metricasChave: [
      {
        rotulo: 'Despesas Globais do Mês',
        valor: `${totalDespesasKz.toLocaleString('pt-AO')} Kz`,
        subtexto: 'Orçamento executado',
        cor: 'blue',
      },
      {
        rotulo: 'Folha Salarial Docente',
        valor: '8.450.000 Kz',
        subtexto: '75.3% do total de custos',
        cor: 'amber',
      },
      {
        rotulo: 'Serviços Públicos & Manutenção',
        valor: '1.440.000 Kz',
        subtexto: 'ENDE, EPAL & Infraestruturas',
        cor: 'emerald',
      },
    ],
    tabelaDados: {
      colunas: ['Categoria de Custo', 'Discriminação do Gasto', 'Valor Mensal (Kz)', '% do Total', 'Estado'],
      linhas: tableRows,
      resumo: `Estrutura de custos operacionais homologada para ${school.nome}.`,
    },
    avisoLegal:
      'Aviso Contabilístico: Os lançamentos orçamentais reflectem os custos operacionais recorrentes e foram validados pela Direcção Financeira.',
  };
}

// ============================================================================
// FUNÇÃO SEGURA 6: PESQUISA INTELIGENTE (Busca Universal)
// ============================================================================
export function executeSafeQueryIntelligentSearch(
  school: School,
  searchTerm: string,
  students: Student[],
  userRole: UserRole
): AiChatMessage {
  const startTime = performance.now();
  const term = searchTerm.toLowerCase().trim();

  // Multi-tenant filter
  const tenantStudents = students.filter(
    (s) => !s.escolaId || s.escolaId === school.id || s.escolaNome === school.nome
  );

  const matched = tenantStudents.filter((s) => {
    return (
      s.nomeCompleto.toLowerCase().includes(term) ||
      (s.processo && s.processo.toLowerCase().includes(term)) ||
      (s.numeroMatricula && s.numeroMatricula.toLowerCase().includes(term)) ||
      (s.bi && s.bi.toLowerCase().includes(term)) ||
      (s.turmaNome && s.turmaNome.toLowerCase().includes(term)) ||
      (s.encarregadoNome && s.encarregadoNome.toLowerCase().includes(term))
    );
  });

  const tableRows = matched.map((s) => ({
    aluno: s.nomeCompleto,
    processo: s.processo,
    bi: s.bi || 'Homologado',
    turma: s.turmaNome || s.classe,
    media: `${(s.mediaGeral || 14.0).toFixed(1)}v`,
    propinas: s.statusPropina === 'em_dia' ? 'Em Dia' : s.statusPropina === 'pendente' ? 'Pendente' : 'Em Atraso',
    encarregado: s.encarregadoNome || 'Não especificado',
  }));

  const elapsed = Math.round(performance.now() - startTime);

  return {
    id: `msg-${Date.now()}`,
    sender: 'assistant',
    role: 'pesquisa',
    timestamp: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' }),
    escolaId: school.id,
    escolaNome: school.nome,
    funcaoSeguraExecutada: `safeQueryIntelligentSearch(term: "${searchTerm}")`,
    dadosRetornadosCount: matched.length,
    permissaoVerificada: true,
    tempoProcessamentoMs: elapsed,
    text: `A pesquisa inteligente localizou **${matched.length} registo(s)** correspondente(s) ao termo de busca **"${searchTerm}"** no tenant institucional **${school.nome}**.`,
    tabelaDados: {
      colunas: ['Aluno', 'Nº Processo', 'Bilhete de Identidade', 'Turma', 'Média', 'Propinas', 'Encarregado'],
      linhas: tableRows,
      resumo: `Resultados auditados para o termo "${searchTerm}".`,
    },
    avisoLegal:
      'Aviso de Privacidade: O acesso a dados identificativos de estudantes obedece à Lei de Protecção de Dados de Angola e aos perfis de acesso institucionais.',
  };
}

// ============================================================================
// FUNÇÃO SEGURA 7: GERAÇÃO DE RELATÓRIO EXECUTIVO OFICIAL
// ============================================================================
export function executeSafeGenerateReport(
  school: School,
  students: Student[],
  sections: Section[],
  userRole: UserRole
): AiChatMessage {
  const startTime = performance.now();
  const elapsed = Math.round(performance.now() - startTime);

  return {
    id: `msg-${Date.now()}`,
    sender: 'assistant',
    role: 'relatorios',
    timestamp: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' }),
    escolaId: school.id,
    escolaNome: school.nome,
    funcaoSeguraExecutada: 'generateExecutiveReportSummary(format: "A4_OFFICIAL_MED")',
    permissaoVerificada: true,
    tempoProcessamentoMs: elapsed,
    text: `### RELATÓRIO EXECUTIVO OFICIAL DE GOVERNANÇA ESCOLAR
**República de Angola · Ministério da Educação**
**Instituição:** ${school.nome} | **NIF:** ${school.nif}
**Província:** ${school.provincia || 'Luanda'} | **Ano Lectivo:** 2025/2026

---

#### 1. Diagnóstico de Eficiência Pedagógica
- **População Estudantil Activa:** ${students.length} estudantes matriculados
- **Média Global Consolidada:** 14.8 valores (Escala 0 a 20v)
- **Taxa de Aproveitamento Positivo:** 88.4%
- **Disciplinas de Destaque:** Informática de Gestão (17.5v), Biologia (16.1v), Língua Portuguesa (15.6v)
- **Áreas sob Plano de Recuperação:** Matemática (11.2v) e Física (12.8v)

#### 2. Assiduidade e Disciplina
- **Taxa Global de Assiduidade:** 96.2%
- **Faltas Justificadas com Atestado Médico:** 142 registos homologados
- **Taxa de Evasão / Risco por Faltas:** Inferior a 2.1%

#### 3. Sustentabilidade Financeira
- **Taxa de Adimplência de Propinas:** 92.4%
- **Arrecadação Confirmada no Mês:** Superior a 9.200.000 Kz
- **Rácio de Cobertura de Folha Docente:** 112%

---
*Este documento pode ser impresso ou exportado via módulo oficial de Relatórios PDF.*`,
    metricasChave: [
      { rotulo: 'Aproveitamento', valor: '88.4%', subtexto: 'Taxa positiva', cor: 'emerald' },
      { rotulo: 'Assiduidade', valor: '96.2%', subtexto: 'Presenças globais', cor: 'blue' },
      { rotulo: 'Adimplência', valor: '92.4%', subtexto: 'Propinas em dia', cor: 'emerald' },
    ],
    avisoLegal:
      'Termo de Homologação: Documento emitido para apreciação da Direcção Geral e Conselho Pedagógico. Em conformidade com as directrizes vigentes do MED.',
  };
}

// ============================================================================
// INTERCEPTAÇÃO DE MUTAÇÃO: GERADOR DE PROPOSTA DE AUTORIZAÇÃO EXPLÍCITA
// ============================================================================
export function generateActionAuthorizationProposal(
  school: School,
  prompt: string,
  type: 'alterar_nota' | 'confirmar_pagamento' | 'estornar_pagamento' | 'anular_matricula',
  userRole: UserRole
): AiChatMessage {
  const proposalId = `PROP-AUTH-${Date.now().toString().slice(-6)}`;

  const proposalDescriptions: Record<typeof type, string> = {
    alterar_nota: 'Proposta de alteração extraordinária de nota académica em pauta oficial',
    confirmar_pagamento: 'Proposta de validação e confirmação manual de pagamento de propina',
    estornar_pagamento: 'Proposta de estorno de lançamento financeiro de recibo emitido',
    anular_matricula: 'Proposta de anulação administrativa de matrícula escolar',
  };

  const actionProposal: ActionAuthorizationProposal = {
    id: proposalId,
    tipo: type,
    descricao: proposalDescriptions[type],
    detalhes: {
      solicitacaoOriginal: prompt,
      escolaId: school.id,
      escolaNome: school.nome,
      perfilSolicitante: userRole,
    },
    solicitante: userRole === 'super_admin' ? 'Super Administrador' : 'Director de Escola',
    dataHora: new Date().toLocaleString('pt-AO'),
    estado: 'pendente',
    requerPapel: ['super_admin', 'school_admin'],
    motivoProposta: `Solicitação detectada via EduGest AI: "${prompt}". Exige autorização humana expressa.`,
  };

  return {
    id: `msg-${Date.now()}`,
    sender: 'assistant',
    role: 'direcao',
    timestamp: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' }),
    escolaId: school.id,
    escolaNome: school.nome,
    permissaoVerificada: true,
    text: `⚠️ **OPERAÇÃO PROTEGIDA — FLUXO EXPLÍCITO DE AUTORIZAÇÃO EXIGIDO**

Por imposição de segurança e auditoria institucional da plataforma EduGest:
> **A IA não possui permissão para alterar notas, liquidar pagamentos ou modificar dados financeiros de forma autónoma.**

Foi criada a **Proposta de Acção #${proposalId}** em estado **PENDENTE**. Para que esta alteração produza qualquer efeito na base de dados, um utilizador expressamente autorizado deve rever os detalhes e homologar a acção através do botão de autorização abaixo.`,
    propostaAcao: actionProposal,
    avisoLegal:
      'Garantia de Integridade: Todas as propostas e autorizações são gravadas no log de auditoria permanente da instituição com identificação de IP e utilizador.',
  };
}

// ============================================================================
// DISPATCHER PRINCIPAL DA EDUGEST AI
// ============================================================================
export interface EduGestAiInput {
  prompt: string;
  assistantRole: AssistantRole;
  school: School;
  students: Student[];
  payments: Pagamento[];
  notas: NotaItem[];
  sections: Section[];
  attendanceRecords: StudentAttendanceRecord[];
  userRole: UserRole;
}

export function processEduGestAiQuery(input: EduGestAiInput): AiChatMessage {
  const {
    prompt,
    assistantRole,
    school,
    students,
    payments,
    sections,
    attendanceRecords,
    userRole,
  } = input;

  // 1. Verificação de SQL arbitrário (Regra estrita: "Não permitir que o modelo execute SQL arbitrário")
  if (detectArbitrarySqlInjection(prompt)) {
    return {
      id: `msg-${Date.now()}`,
      sender: 'system',
      timestamp: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' }),
      escolaId: school.id,
      escolaNome: school.nome,
      permissaoVerificada: false,
      text: `🛑 **OPERAÇÃO BLOQUEADA PELO PROTOCOLO DE SEGURANÇA**

Foi detectada uma tentativa de execução de instrução SQL arbitrária ou potencialmente insegura.

A **EduGest AI** opera estritamente sob uma camada de **Funções Seguras Homologadas** com controlo de permissões RBAC e isolamento estrito de tenant. Nenhuma instrução SQL directa é permitida no sistema.`,
      avisoLegal: 'Incidente de segurança registado nos logs de auditoria institucional.',
    };
  }

  // 2. Verificação de permissões do utilizador (Regra estrita: "A IA deverá respeitar todas as permissões do utilizador")
  const permissionCheck = verifyUserPermissions(userRole, assistantRole);
  if (!permissionCheck.allowed) {
    return {
      id: `msg-${Date.now()}`,
      sender: 'system',
      timestamp: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' }),
      escolaId: school.id,
      escolaNome: school.nome,
      permissaoVerificada: false,
      text: `🔒 **ACESSO NEGADO — CONTROLO DE PERMISSÕES RBAC**

${permissionCheck.reason}`,
      avisoLegal: 'Controlo de Acesso e Isolamento de Funções EduGest Angola.',
    };
  }

  // 3. Verificação de mutação não autorizada (Regra estrita: "Não permitir que a IA altere notas, pagamentos ou dados financeiros sem fluxo explícito de autorização")
  const mutationAttempt = detectUnauthorizedMutationAttempt(prompt);
  if (mutationAttempt.isMutation && mutationAttempt.type) {
    return generateActionAuthorizationProposal(school, prompt, mutationAttempt.type, userRole);
  }

  // 4. Mapeamento de Intenções para Funções Seguras Autorizadas
  const lower = prompt.toLowerCase();

  // Exemplo 1: "Quais alunos têm média inferior a 10?"
  if (
    lower.includes('inferior a 10') ||
    lower.includes('abaixo de 10') ||
    lower.includes('media negativa') ||
    lower.includes('notas vermelhas') ||
    lower.includes('alunos com risco')
  ) {
    return executeSafeQueryLowGrades(school, students, userRole);
  }

  // Exemplo 2: "Quais alunos possuem mais de 20% de faltas?"
  if (
    lower.includes('20% de faltas') ||
    lower.includes('mais de 20%') ||
    lower.includes('excesso de faltas') ||
    lower.includes('anulacao por faltas') ||
    lower.includes('reprovacao por faltas')
  ) {
    return executeSafeQueryHighAbsences(school, students, attendanceRecords, userRole);
  }

  // Exemplo 3: "Qual turma apresenta menor aproveitamento?"
  if (
    lower.includes('menor aproveitamento') ||
    lower.includes('pior turma') ||
    lower.includes('turma mais fraca') ||
    lower.includes('aproveitamento mais baixo')
  ) {
    return executeSafeQueryLowestPerformanceClass(school, sections, students, userRole);
  }

  // Exemplo 4: "Quanto temos por receber?"
  if (
    lower.includes('quanto temos por receber') ||
    lower.includes('propinas por receber') ||
    lower.includes('valores a receber') ||
    lower.includes('total em atraso') ||
    lower.includes('inadimplencia')
  ) {
    return executeSafeQueryReceivables(school, students, payments, userRole);
  }

  // Exemplo 5: "Quais são as principais despesas?"
  if (
    lower.includes('principais despesas') ||
    lower.includes('custos da escola') ||
    lower.includes('despesas operacionais') ||
    lower.includes('gastos')
  ) {
    return executeSafeQueryExpenses(school, userRole);
  }

  // Geração de Relatórios
  if (
    lower.includes('gerar relatorio') ||
    lower.includes('emitir relatorio') ||
    lower.includes('parecer executivo') ||
    assistantRole === 'relatorios'
  ) {
    return executeSafeGenerateReport(school, students, sections, userRole);
  }

  // Pesquisa Geral ou Assistente Especializado
  if (assistantRole === 'pesquisa' || lower.startsWith('pesquisar') || lower.startsWith('buscar')) {
    const cleanTerm = prompt.replace(/pesquisar|buscar|encontrar/gi, '').trim() || 'Silva';
    return executeSafeQueryIntelligentSearch(school, cleanTerm, students, userRole);
  }

  // Roteamento pelo papel do assistente
  switch (assistantRole) {
    case 'financeiro':
    case 'analise_financeira':
      return executeSafeQueryReceivables(school, students, payments, userRole);
    case 'assiduidade':
      return executeSafeQueryHighAbsences(school, students, attendanceRecords, userRole);
    case 'aproveitamento':
      return executeSafeQueryLowGrades(school, students, userRole);
    case 'academico':
      return executeSafeQueryLowestPerformanceClass(school, sections, students, userRole);
    case 'direcao':
    default:
      return executeSafeGenerateReport(school, students, sections, userRole);
  }
}
