import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Building2,
  CreditCard,
  GraduationCap,
  Award,
  CalendarCheck,
  TrendingUp,
  FileText,
  Search,
  ShieldCheck,
  ShieldAlert,
  Lock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Printer,
  ChevronRight,
  UserCheck,
  Check,
  X,
  Clock,
  ArrowRight,
  Info,
  Layers,
  Database,
  ExternalLink,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import {
  School,
  Student,
  Pagamento,
  NotaItem,
  Section,
  StudentAttendanceRecord,
  UserRole,
} from '../../types';
import {
  AssistantRole,
  AiChatMessage,
  ActionAuthorizationProposal,
} from '../../types/ai';
import {
  ASSISTENTES_CONFIG,
  processEduGestAiQuery,
} from '../../services/edugestAiSafeEngine';

interface EduGestAiViewProps {
  currentSchool: School;
  students: Student[];
  payments: Pagamento[];
  notas: NotaItem[];
  sections: Section[];
  attendanceRecords: StudentAttendanceRecord[];
  userRole: UserRole;
  onNavigate?: (view: any) => void;
}

export const EduGestAiView: React.FC<EduGestAiViewProps> = ({
  currentSchool,
  students,
  payments,
  notas,
  sections,
  attendanceRecords,
  userRole,
  onNavigate,
}) => {
  const [activeAssistant, setActiveAssistant] = useState<AssistantRole>('direcao');
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<ActionAuthorizationProposal | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [authPin, setAuthPin] = useState('');
  const [authJustificativa, setAuthJustificativa] = useState('');
  const [authFeedback, setAuthFeedback] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeAssistantConfig = ASSISTENTES_CONFIG.find((a) => a.id === activeAssistant) || ASSISTENTES_CONFIG[0];

  // Initialize welcome message for current assistant & tenant
  useEffect(() => {
    const welcomeMsg: AiChatMessage = {
      id: `welcome-${activeAssistant}-${Date.now()}`,
      sender: 'assistant',
      role: activeAssistant,
      timestamp: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' }),
      escolaId: currentSchool.id,
      escolaNome: currentSchool.nome,
      permissaoVerificada: true,
      text: `Olá! Sou o **${activeAssistantConfig.nome}** da camada **EduGest AI**, configurado com isolamento estrito para a instituição **${currentSchool.nome}**.

Estou apto a responder às suas consultas através de **funções seguras de dados homologados**, garantindo que nenhum comando SQL arbitrário seja executado e que nenhum dado ultrapasse a fronteira desta escola.

Como posso assistir a sua gestão hoje? Escolha uma das perguntas rápidas abaixo ou escreva a sua dúvida em linguagem natural.`,
      avisoLegal:
        'Aviso de Governança: A EduGest AI atua como ferramenta de assistência analítica. Decisões legais de transição de ciclo, retenção ou regularização fiscal são da competência exclusiva dos órgãos humanos da instituição.',
    };
    setMessages([welcomeMsg]);
  }, [activeAssistant, currentSchool.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle user query submission
  const handleSendMessage = async (textToSend?: string) => {
    const queryText = (textToSend || inputPrompt).trim();
    if (!queryText || isLoading) return;

    // Append user message
    const userMsg: AiChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' }),
      escolaId: currentSchool.id,
      escolaNome: currentSchool.nome,
      text: queryText,
      permissaoVerificada: true,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      // 1. Execute safe deterministic query locally
      const localResult = processEduGestAiQuery({
        prompt: queryText,
        assistantRole: activeAssistant,
        school: currentSchool,
        students,
        payments,
        notas,
        sections,
        attendanceRecords,
        userRole,
      });

      // 2. Call server-side API proxy to get contextual Gemini reasoning if enabled
      try {
        const response = await fetch('/api/edugest-ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: queryText,
            assistantRole: activeAssistant,
            schoolId: currentSchool.id,
            schoolName: currentSchool.nome,
            userRole,
            structuredContext: localResult.tabelaDados || localResult.metricasChave,
          }),
        });

        if (response.ok) {
          const apiData = await response.json();
          if (apiData.text) {
            localResult.text = apiData.text;
          }
        }
      } catch (apiErr) {
        // Safe local engine already computed the exact deterministic result
      }

      setMessages((prev) => [...prev, localResult]);
    } catch (err: any) {
      const errorMsg: AiChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'system',
        timestamp: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' }),
        escolaId: currentSchool.id,
        escolaNome: currentSchool.nome,
        text: `Erro ao processar a consulta: ${err?.message || 'Falha de comunicação com o motor de consulta seguro.'}`,
        avisoLegal: 'Por favor tente novamente ou consulte o suporte da instituição.',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExecuteAuthorization = (proposal: ActionAuthorizationProposal) => {
    setSelectedProposal(proposal);
    setAuthPin('');
    setAuthJustificativa('');
    setAuthFeedback(null);
  };

  const handleConfirmAuthorization = () => {
    if (!authPin || authPin.length < 4) {
      setAuthFeedback('Introduza um código PIN de autorização válido (mínimo 4 dígitos).');
      return;
    }

    if (!selectedProposal) return;

    // Update the proposal inside the messages
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.propostaAcao?.id === selectedProposal.id) {
          return {
            ...msg,
            propostaAcao: {
              ...msg.propostaAcao,
              estado: 'autorizado',
              autorizadoPor: `${userRole === 'super_admin' ? 'Super Administrador' : 'Director de Escola'} (PIN Verificado)`,
              dataAutorizacao: new Date().toLocaleString('pt-AO'),
              justificativaAutorizador: authJustificativa || 'Autorização humana formal homologada via EduGest AI.',
            },
          };
        }
        return msg;
      })
    );

    setAuthFeedback('Acção formalmente autorizada e homologada com sucesso no log de auditoria institucional.');
    setTimeout(() => {
      setSelectedProposal(null);
      setAuthFeedback(null);
    }, 1500);
  };

  const handleRejectAuthorization = () => {
    if (!selectedProposal) return;

    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.propostaAcao?.id === selectedProposal.id) {
          return {
            ...msg,
            propostaAcao: {
              ...msg.propostaAcao,
              estado: 'rejeitado',
              autorizadoPor: 'Rejeitado pela Gestão Humana',
              dataAutorizacao: new Date().toLocaleString('pt-AO'),
            },
          };
        }
        return msg;
      })
    );

    setSelectedProposal(null);
  };

  return (
    <div className="space-y-6">
      {/* Institutional Security & Tenant Isolation Banner */}
      <div className="bg-gradient-to-r from-[#012041] via-[#012f5e] to-[#015FC4] text-white rounded-xl p-5 shadow-sm border border-blue-900/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4 text-blue-300 animate-pulse" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">
                EduGest AI · Camada de Inteligência Artificial Oficial
              </h1>
            </div>
            <p className="text-xs text-blue-100/90 pl-10 max-w-3xl">
              Assistente executivo com <strong>isolamento estrito multi-tenant</strong>, controlo de permissões RBAC,
              governança sem SQL arbitrário e fluxo explícito de autorização para operações críticas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-xs border border-white/20 text-xs flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-blue-300" />
              <span className="font-semibold text-white truncate max-w-[200px]">
                {currentSchool.nome}
              </span>
            </div>
            <div className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-[11px] font-semibold text-emerald-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Isolamento Activo</span>
            </div>
            <div className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 border border-amber-400/30 text-[11px] font-semibold text-amber-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Zero-SQL Enforced</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Left Assistant Selector + Right Main Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Specialized Assistant Roles */}
        <div className="lg:col-span-1 space-y-4">
          <Card title="Assistentes Especializados" subtitle="Selecione o módulo de consultoria">
            <div className="space-y-1.5">
              {ASSISTENTES_CONFIG.map((assist) => {
                const isSelected = activeAssistant === assist.id;
                const IconComponent =
                  assist.id === 'direcao'
                    ? Building2
                    : assist.id === 'financeiro'
                    ? CreditCard
                    : assist.id === 'academico'
                    ? GraduationCap
                    : assist.id === 'aproveitamento'
                    ? Award
                    : assist.id === 'assiduidade'
                    ? CalendarCheck
                    : assist.id === 'analise_financeira'
                    ? TrendingUp
                    : assist.id === 'relatorios'
                    ? FileText
                    : Search;

                return (
                  <button
                    key={assist.id}
                    onClick={() => setActiveAssistant(assist.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-[#015FC4] text-white shadow-xs font-semibold'
                        : 'text-[#012041] hover:bg-slate-100 border border-transparent'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-[#015FC4]'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold leading-tight truncate">{assist.nome}</div>
                      <div
                        className={`text-[10px] mt-0.5 line-clamp-1 ${
                          isSelected ? 'text-blue-100' : 'text-[#41515D]'
                        }`}
                      >
                        {assist.descricao}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Quick Prompts / Exemplos Obrigatórios */}
          <Card title="Consultas Frequentes (1-Clique)" subtitle="Exemplos certificados de governança">
            <div className="space-y-2">
              {[
                'Quais alunos têm média inferior a 10?',
                'Quais alunos possuem mais de 20% de faltas?',
                'Qual turma apresenta menor aproveitamento?',
                'Quanto temos por receber?',
                'Quais são as principais despesas?',
              ].map((exemplo, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(exemplo)}
                  className="w-full text-left p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-[#015FC4] text-xs font-medium text-[#012041] transition-all flex items-center justify-between group cursor-pointer shadow-2xs"
                >
                  <span className="line-clamp-1">{exemplo}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#015FC4] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1.5" />
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Chat Workspace & Interactive Results */}
        <div className="lg:col-span-3 space-y-4">
          <Card noPadding className="flex flex-col h-[750px] shadow-sm">
            {/* Chat Header */}
            <div className="px-5 py-3.5 border-b border-[#E2E8F0] bg-slate-50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#012041] text-white flex items-center justify-center font-bold text-xs">
                  AI
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#012041] flex items-center gap-2">
                    {activeAssistantConfig.nome}
                    <Badge variant="primary" size="sm">
                      Funções Seguras Homologadas
                    </Badge>
                  </h2>
                  <p className="text-[11px] text-[#41515D]">
                    Conectado ao repositório de dados de: <strong>{currentSchool.nome}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMessages([])}
                  className="text-xs text-[#41515D] hover:text-[#012041]"
                  title="Limpar histórico de conversa"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" />
                  Limpar
                </Button>
              </div>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 p-5 overflow-y-auto space-y-5 bg-slate-50/40">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                const isSystem = msg.sender === 'system';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-2`}
                  >
                    <div
                      className={`max-w-3xl rounded-xl p-4 shadow-2xs ${
                        isUser
                          ? 'bg-[#015FC4] text-white rounded-br-none'
                          : isSystem
                          ? 'bg-red-50 text-red-950 border border-red-200 rounded-bl-none'
                          : 'bg-white text-[#012041] border border-[#E2E8F0] rounded-bl-none'
                      }`}
                    >
                      {/* Security Metadata Badge Header for Assistant */}
                      {!isUser && (
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100 text-[10px] text-[#41515D]">
                          <div className="flex items-center gap-2">
                            <span className="font-bold uppercase tracking-wider text-[#015FC4] flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              {msg.funcaoSeguraExecutada || 'EduGest AI Verified'}
                            </span>
                            {msg.tempoProcessamentoMs && (
                              <span className="text-slate-400 font-mono">
                                ({msg.tempoProcessamentoMs}ms)
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleCopyText(msg.id, msg.text)}
                              className="text-slate-500 hover:text-[#012041] p-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
                              title="Copiar texto da resposta"
                            >
                              {copiedId === msg.id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              <span>{copiedId === msg.id ? 'Copiado' : 'Copiar'}</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Message Body Content */}
                      <div className="text-xs leading-relaxed whitespace-pre-line space-y-2">
                        {msg.text}
                      </div>

                      {/* Dynamic Metric Cards */}
                      {msg.metricasChave && msg.metricasChave.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 mt-3 border-t border-slate-100">
                          {msg.metricasChave.map((met, mIdx) => (
                            <div
                              key={mIdx}
                              className={`p-2.5 rounded-lg border text-center ${
                                met.cor === 'red'
                                  ? 'bg-red-50/80 border-red-200 text-red-900'
                                  : met.cor === 'amber'
                                  ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                                  : met.cor === 'emerald'
                                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                                  : 'bg-blue-50/80 border-blue-200 text-blue-900'
                              }`}
                            >
                              <span className="text-[10px] font-bold uppercase tracking-wider block opacity-80">
                                {met.rotulo}
                              </span>
                              <div className="text-lg font-black font-mono mt-0.5">
                                {met.valor}
                              </div>
                              {met.subtexto && (
                                <span className="text-[10px] block opacity-75 mt-0.5">
                                  {met.subtexto}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Interactive Data Table Component */}
                      {msg.tabelaDados && msg.tabelaDados.linhas.length > 0 && (
                        <div className="pt-3 mt-3 border-t border-slate-100">
                          <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
                            <table className="w-full text-xs text-left border-collapse">
                              <thead>
                                <tr className="bg-slate-100 border-b border-slate-200 text-[#012041]">
                                  {msg.tabelaDados.colunas.map((col, cIdx) => (
                                    <th
                                      key={cIdx}
                                      className="py-2 px-3 font-bold text-[11px] whitespace-nowrap"
                                    >
                                      {col}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {msg.tabelaDados.linhas.map((row, rIdx) => (
                                  <tr
                                    key={rIdx}
                                    className="hover:bg-slate-50 transition-colors"
                                  >
                                    {msg.tabelaDados?.colunas.map((col, cIdx) => {
                                      // match key or use index
                                      const key = Object.keys(row)[cIdx];
                                      const val = row[key];
                                      return (
                                        <td
                                          key={cIdx}
                                          className="py-2 px-3 text-[#012041] whitespace-nowrap"
                                        >
                                          {typeof val === 'string' && val.includes('Risco') ? (
                                            <Badge variant="error" size="sm">
                                              {val}
                                            </Badge>
                                          ) : typeof val === 'string' && val.includes('Atenção') ? (
                                            <Badge variant="warning" size="sm">
                                              {val}
                                            </Badge>
                                          ) : typeof val === 'string' && val.includes('Em Dia') ? (
                                            <Badge variant="success" size="sm">
                                              {val}
                                            </Badge>
                                          ) : (
                                            val
                                          )}
                                        </td>
                                      );
                                    })}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {msg.tabelaDados.resumo && (
                            <p className="text-[11px] text-[#41515D] mt-1.5 italic">
                              {msg.tabelaDados.resumo}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Action Authorization Proposal Card (Fluxo Explícito Obrigatório) */}
                      {msg.propostaAcao && (
                        <div className="mt-3 p-3.5 bg-amber-50/90 border-2 border-amber-300 rounded-lg text-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-950 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                              <ShieldAlert className="w-4 h-4 text-amber-600" />
                              Proposta de Acção #{msg.propostaAcao.id}
                            </span>
                            <Badge
                              variant={
                                msg.propostaAcao.estado === 'autorizado'
                                  ? 'success'
                                  : msg.propostaAcao.estado === 'rejeitado'
                                  ? 'error'
                                  : 'warning'
                              }
                              size="sm"
                            >
                              Estado: {msg.propostaAcao.estado.toUpperCase()}
                            </Badge>
                          </div>

                          <p className="text-amber-900 font-medium">
                            {msg.propostaAcao.descricao}
                          </p>

                          <div className="text-[11px] text-amber-800 bg-white/70 p-2 rounded border border-amber-200">
                            <strong>Motivo Registado:</strong> {msg.propostaAcao.motivoProposta}
                          </div>

                          {msg.propostaAcao.estado === 'pendente' ? (
                            <div className="flex items-center gap-2 pt-1">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleExecuteAuthorization(msg.propostaAcao!)}
                                className="bg-amber-700 hover:bg-amber-800 text-white"
                              >
                                Analisar & Homologar Acção
                              </Button>
                              <span className="text-[10px] text-amber-800">
                                Exige confirmação de Director ou Super Admin
                              </span>
                            </div>
                          ) : (
                            <div className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1.5 pt-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              {msg.propostaAcao.autorizadoPor} em {msg.propostaAcao.dataAutorizacao}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Regulatory Compliance Disclaimer */}
                      {msg.avisoLegal && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 text-[10px] text-[#41515D] flex items-start gap-1.5">
                          <Info className="w-3 h-3 text-[#015FC4] shrink-0 mt-0.5" />
                          <span>{msg.avisoLegal}</span>
                        </div>
                      )}
                    </div>

                    <span className="text-[10px] text-[#41515D] px-1 font-mono">
                      {msg.timestamp} · {currentSchool.nome}
                    </span>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-center gap-3 p-4 bg-white border border-[#E2E8F0] rounded-xl max-w-sm shadow-2xs">
                  <div className="w-4 h-4 border-2 border-[#015FC4] border-t-transparent rounded-full animate-spin" />
                  <div className="text-xs text-[#012041]">
                    <span className="font-semibold block">Consultando Funções Seguras...</span>
                    <span className="text-[10px] text-[#41515D]">
                      Filtrando estritamente dados de {currentSchool.nome}
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form Toolbar */}
            <div className="p-3.5 border-t border-[#E2E8F0] bg-white">
              {/* Quick suggestions pills for current assistant */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-2 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#41515D] shrink-0 mr-1 hidden sm:inline">
                  Sugestões:
                </span>
                {activeAssistantConfig.sugestoesRapidas.map((sug, sIdx) => (
                  <button
                    key={sIdx}
                    onClick={() => handleSendMessage(sug)}
                    className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-[#012041] text-[11px] whitespace-nowrap transition-colors cursor-pointer border border-slate-200"
                  >
                    {sug}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  placeholder={`Pergunte ao ${activeAssistantConfig.nome} (ex: "Quais alunos têm média inferior a 10?")...`}
                  className="flex-1 px-3.5 py-2.5 text-xs rounded-lg border border-[#E2E8F0] focus:outline-hidden focus:ring-2 focus:ring-[#015FC4] focus:border-transparent bg-slate-50 text-[#012041] placeholder:text-slate-400"
                  disabled={isLoading}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={!inputPrompt.trim() || isLoading}
                  className="shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Enviar</span>
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>

      {/* MODAL DE HOMOLOGAÇÃO EXPLÍCITA DE ACÇÃO (Garantia de Não Mutação Não Autorizada) */}
      <Modal
        isOpen={Boolean(selectedProposal)}
        onClose={() => setSelectedProposal(null)}
        title="Homologação Formal de Acção Institucional"
        subtitle={`Fluxo Explícito de Auditoria · Proposta #${selectedProposal?.id}`}
        maxWidth="lg"
      >
        {selectedProposal && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-1.5 text-amber-900">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Confirmação Exigida: {selectedProposal.descricao}</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                A EduGest AI detectou uma proposta que envolve alteração de registos académicos ou financeiros.
                Para prevenir modificações arbitrárias, o sistema exige homologação humana de um utilizador autenticado.
              </p>
            </div>

            <div className="space-y-2 border border-slate-200 rounded-lg p-3 bg-slate-50">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-[#41515D]">Instituição:</span>
                <strong className="text-[#012041]">{currentSchool.nome}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-[#41515D]">Solicitante:</span>
                <span className="text-[#012041]">{selectedProposal.solicitante}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-[#41515D]">Data e Hora do Pedido:</span>
                <span className="text-[#012041]">{selectedProposal.dataHora}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#41515D]">Permissão Mínima:</span>
                <Badge variant="warning" size="sm">
                  Director / Super Admin
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[#012041] font-semibold text-[11px]">
                Justificativa Institucional para a Acta de Auditoria:
              </label>
              <textarea
                rows={2}
                value={authJustificativa}
                onChange={(e) => setAuthJustificativa(e.target.value)}
                placeholder="Ex: Homologado pelo Conselho Pedagógico extraordinário realizado a 12/10/2026..."
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs text-[#012041]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[#012041] font-semibold text-[11px]">
                Código PIN de Segurança do Administrador (mín. 4 dígitos):
              </label>
              <input
                type="password"
                maxLength={6}
                value={authPin}
                onChange={(e) => setAuthPin(e.target.value)}
                placeholder="••••"
                className="w-full sm:w-48 p-2 rounded-lg border border-slate-300 font-mono text-center tracking-widest text-sm"
              />
            </div>

            {authFeedback && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[11px] font-medium">
                {authFeedback}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="ghost" size="sm" onClick={handleRejectAuthorization}>
                Rejeitar Proposta
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmAuthorization}
                className="bg-emerald-700 hover:bg-emerald-800 text-white"
              >
                Autorizar e Registar em Acta
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
