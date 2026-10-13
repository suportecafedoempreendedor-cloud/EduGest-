// Utilitário de Geração e Exportação de Documentos de Recursos Humanos (EduGest Angola)

export interface SchoolHeaderInfo {
  schoolName: string;
  nif?: string;
  provincia?: string;
  municipio?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
}

export const defaultSchoolHeader: SchoolHeaderInfo = {
  schoolName: 'Colégio EduGest Angola (Complexo Escolar Privado)',
  nif: '5417082910',
  provincia: 'Luanda',
  municipio: 'Talatona',
  endereco: 'Via Expressa Fidel de Castro, Km 14',
  telefone: '+244 923 456 789',
  email: 'direccao.rh@edugest.ao',
};

/**
 * Descarrega um ficheiro gerado no browser com formato e codificação adequados
 */
export const downloadFile = (content: string, fileName: string, contentType = 'text/plain;charset=utf-8') => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Exporta uma matriz de dados tabulares para CSV com BOM UTF-8 (compatível com Excel)
 */
export const exportToCsv = (filename: string, headers: string[], rows: (string | number)[][]) => {
  const csvContent =
    '\uFEFF' +
    [
      headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(';'),
      ...rows.map((row) =>
        row
          .map((cell) => {
            const str = cell !== undefined && cell !== null ? String(cell) : '';
            return `"${str.replace(/"/g, '""')}"`;
          })
          .join(';')
      ),
    ].join('\r\n');

  downloadFile(csvContent, filename.endsWith('.csv') ? filename : `${filename}.csv`, 'text/csv;charset=utf-8;');
};

/**
 * Gera texto oficial para Declaração de Efectividade / Serviço
 */
export const generateDeclarationText = (params: {
  school: SchoolHeaderInfo;
  colaboradorNome: string;
  biNumero: string;
  cargo: string;
  departamento: string;
  dataAdmissao: string;
  vinculo: string;
  finalidade: string;
  incluirSalario?: boolean;
  salarioBaseKz?: number;
  dataEmissao?: string;
}) => {
  const {
    school,
    colaboradorNome,
    biNumero,
    cargo,
    departamento,
    dataAdmissao,
    vinculo,
    finalidade,
    incluirSalario = false,
    salarioBaseKz = 0,
    dataEmissao = new Date().toLocaleDateString('pt-AO'),
  } = params;

  let texto = `================================================================================
REPÚBLICA DE ANGOLA
MINISTÉRIO DA EDUCAÇÃO
${school.schoolName.toUpperCase()}
NIF: ${school.nif} | ${school.municipio}, ${school.provincia}
================================================================================

                           DECLARAÇÃO DE SERVIÇO E EFECTIVIDADE
                           Nº REF: DECL-RH/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}

Para os devidos efeitos e a pedido do(a) interessado(a), declara-se que o(a) Senhor(a):

  Nome Completo: ${colaboradorNome}
  Portador(a) do Bilhete de Identidade nº: ${biNumero}
  Categoria / Cargo: ${cargo}
  Departamento: ${departamento}
  Regime de Contratação: ${vinculo}
  Data de Admissão: ${dataAdmissao}

É colaborador(a) com vínculo activo e em pleno exercício das suas funções docentes/profissionais
nesta instituição de ensino privado, não constando em seu registo qualquer nota desabonatória.
`;

  if (incluirSalario && salarioBaseKz > 0) {
    texto += `
Aufere mensalmente a retribuição base de ${salarioBaseKz.toLocaleString('pt-AO')} Kz (Kwanzas),
acrescida dos subsídios e abonos legais em vigor.
`;
  }

  texto += `
A presente declaração é emitida para efeitos de: ${finalidade || 'Fins Legais e Oficiais'}.

Por ser verdade e para que produza os efeitos legais onde convier, passa-se a presente declaração
que vai devidamente assinada e autenticada com o carimbo oficial em uso nesta Direcção.

${school.municipio}, aos ${dataEmissao}.

_____________________________________________________
A DIRECÇÃO DE RECURSOS HUMANOS
${school.schoolName}
(Assinatura devidamente reconhecida / Carimbo Digital EduGest)
================================================================================`;

  return texto;
};
