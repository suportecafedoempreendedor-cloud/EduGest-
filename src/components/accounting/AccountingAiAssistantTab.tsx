import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Search,
  Layers,
  ArrowRight,
  ShieldCheck,
  Send,
  Bot,
  RefreshCw,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface AccountingAiAssistantTabProps {
  schoolName: string;
}

export const AccountingAiAssistantTab: React.FC<AccountingAiAssistantTabProps> = ({ schoolName }) => {
  const [pergunta, setPergunta] = useState('');
  const [resposta, setResposta] = useState<string | null>(null);

  const sugestoesFrequentes = [
    'Qual a conta PGC adequada para compra de toners e papel de provas?',
    'Como contabilizar um adiantamento a fornecedor de autocarro escolar?',
    'O que diz o Artigo 12º do CIVA sobre as propinas de ensino?',
    'Como proceder em caso de quebra de caixa apurada no fecho diário?',
  ];

  const handleConsultar = (query: string) => {
    setPergunta(query);
    const q = query.toLowerCase();

    if (q.includes('toner') || q.includes('papel') || q.includes('material')) {
      setResposta(
        'Sugestão Contabilística PGC Angola:\n\n' +
        '• Débito: Conta 75.4.1 — Material Didático, Papelaria e Impressão de Pautas\n' +
        '• Crédito: Conta 41.1.1 (Caixa Central) se pago a pronto, ou Conta 32.1.1 (Fornecedores Correntes) se faturado a prazo.\n\n' +
        'Fundamentação: Despesas com materiais de expediente e testes escolares devem ser alocadas a FSE (Classe 75) sob o centro de custo pedagógico.'
      );
    } else if (q.includes('artigo 12') || q.includes('civa') || q.includes('iva') || q.includes('isencao')) {
      setResposta(
        'Enquadramento Fiscal de Angola (CIVA):\n\n' +
        '• De acordo com o Artigo 12º, alínea a) do Código do IVA de Angola, a prestação de serviços de ensino (infantil, primário, secundário e técnico) está ISENTA de IVA.\n' +
        '• Código de Isenção no SAF-T (AO): M02 — Isenção ao abrigo do Artigo 12º do CIVA.\n' +
        '• Nas faturas e faturas-recibo deve constar a menção: "Isento nos termos do Art. 12º do Código do IVA".'
      );
    } else if (q.includes('quebra') || q.includes('fecho') || q.includes('diferenca')) {
      setResposta(
        'Procedimento para Quebra ou Sobra no Fecho de Caixa:\n\n' +
        '• Se apurada quebra (saldo físico < saldo sistema): O operador deve justificar formalmente no termo de fecho. Se a responsabilidade for imputada ao operador, debita-se a Conta 37.1 (Outros Devedores) e credita-se a Conta 41.1.1.\n' +
        '• Se apurada quebra extraordinária autorizada: Debita-se a Conta 78 (Outros Custos Operacionais).\n' +
        '• Se apurada sobra: Credita-se a Conta 68 (Outros Proveitos Operacionais).'
      );
    } else {
      setResposta(
        'Análise Contabilística EduGest AI:\n\n' +
        `Para a operação consultada em ${schoolName}, recomendamos a observância do princípio das partidas dobradas no referencial PGC Angola.\n\n` +
        'Verifique sempre se os débitos igualam rigorosamente os créditos antes da submissão do lançamento definitivo.'
      );
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-gradient-to-r from-[#012041] via-[#013366] to-[#015FC4] p-6 rounded-2xl text-white shadow-lg space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-200 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-blue-300" />
          <span>EduGest AI · Assistente Contabilístico & Fiscal Inteligente</span>
        </div>
        <h3 className="text-xl font-bold">Consultor de Normas PGC, Fiscalidade AGT e Partidas Dobradas</h3>
        <p className="text-xs text-blue-100 max-w-2xl">
          Apoio em tempo real à equipa de contabilidade e finanças na classificação de contas, enquadramento de impostos e conferência de lançamentos.
        </p>
      </div>

      {/* Caixa de Pesquisa e Perguntas Frequentes */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-gray-700 mb-1.5">Faça uma consulta contabilística ou fiscal:</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={pergunta}
              onChange={(e) => setPergunta(e.target.value)}
              placeholder="Ex: Como contabilizar o pagamento de propina por Multicaixa Express?"
              className="flex-1 p-2.5 border border-gray-200 rounded-lg text-xs"
              onKeyDown={(e) => e.key === 'Enter' && handleConsultar(pergunta)}
            />
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleConsultar(pergunta)}
              icon={<Send className="w-4 h-4" />}
            >
              Consultar
            </Button>
          </div>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-gray-500 uppercase block mb-1.5">Consultas Rápidas:</span>
          <div className="flex flex-wrap gap-2">
            {sugestoesFrequentes.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleConsultar(s)}
                className="px-2.5 py-1.5 bg-gray-50 hover:bg-blue-50 hover:text-[#015FC4] border border-gray-200 rounded-lg text-gray-700 text-[11px] transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Resposta do Assistente */}
        {resposta && (
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2 mt-4">
            <div className="flex items-center gap-2 font-bold text-[#012041]">
              <Bot className="w-4 h-4 text-[#015FC4]" />
              <span>Parecer e Recomendação Técnica do EduGest AI:</span>
            </div>
            <pre className="font-sans text-xs text-gray-800 whitespace-pre-line leading-relaxed">
              {resposta}
            </pre>
            <div className="pt-2 border-t border-blue-200/60 text-[10px] text-gray-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>As sugestões geradas por IA têm caráter informativo e devem ser validadas pelo contabilista certificado da instituição.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
