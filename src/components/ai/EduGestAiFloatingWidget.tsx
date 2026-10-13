import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  Building2,
  ChevronUp,
  ChevronDown,
  Maximize2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  School,
  Student,
  Pagamento,
  NotaItem,
  Section,
  StudentAttendanceRecord,
  UserRole,
  ViewMode,
} from '../../types';
import { processEduGestAiQuery } from '../../services/edugestAiSafeEngine';
import { AiChatMessage } from '../../types/ai';

interface EduGestAiFloatingWidgetProps {
  currentSchool: School;
  students: Student[];
  payments: Pagamento[];
  notas: NotaItem[];
  sections: Section[];
  attendanceRecords: StudentAttendanceRecord[];
  userRole: UserRole;
  onNavigate: (view: ViewMode) => void;
}

export const EduGestAiFloatingWidget: React.FC<EduGestAiFloatingWidgetProps> = ({
  currentSchool,
  students,
  payments,
  notas,
  sections,
  attendanceRecords,
  userRole,
  onNavigate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: 'floating-init',
      sender: 'assistant',
      timestamp: 'Agora',
      escolaId: currentSchool.id,
      escolaNome: currentSchool.nome,
      text: `Olá! Sou o **EduGest AI Copilot** da escola **${currentSchool.nome}**. Pergunte qualquer indicador sobre alunos com média < 10, faltas > 20%, turmas ou finanças.`,
      avisoLegal: 'Isolamento de tenant estrito ativo.',
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSend = (text?: string) => {
    const q = (text || inputQuery).trim();
    if (!q || isProcessing) return;

    const userMsg: AiChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      timestamp: 'Agora',
      escolaId: currentSchool.id,
      escolaNome: currentSchool.nome,
      text: q,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsProcessing(true);

    setTimeout(() => {
      try {
        const response = processEduGestAiQuery({
          prompt: q,
          assistantRole: 'direcao',
          school: currentSchool,
          students,
          payments,
          notas,
          sections,
          attendanceRecords,
          userRole,
        });

        setMessages((prev) => [...prev, response]);
      } catch (err: any) {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            sender: 'system',
            timestamp: 'Agora',
            escolaId: currentSchool.id,
            escolaNome: currentSchool.nome,
            text: `Erro ao processar a consulta segura.`,
          },
        ]);
      } finally {
        setIsProcessing(false);
      }
    }, 250);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 no-print">
      {/* Floating Action Trigger Button when closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#012041] hover:bg-[#015FC4] text-white shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 cursor-pointer border-2 border-blue-400/30"
          title="Abrir Assistente EduGest AI"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500" />
          </span>
          <Sparkles className="w-4 h-4 text-blue-300" />
          <span className="text-xs font-bold tracking-tight">EduGest AI</span>
        </button>
      )}

      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[420px] h-[520px] bg-white rounded-2xl shadow-2xl border border-slate-300 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-[#012041] text-white px-4 py-3 flex items-center justify-between gap-2 border-b border-blue-900/60">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-xs">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-bold flex items-center gap-1.5">
                  EduGest AI Copilot
                  <Badge variant="primary" size="sm">
                    {currentSchool.nome.slice(0, 14)}...
                  </Badge>
                </div>
                <div className="text-[10px] text-blue-200/80 flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                  Isolamento Multi-Tenant · Zero-SQL
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onNavigate('edugest-ai');
                }}
                className="p-1 rounded text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
                title="Expandir para o ecrã completo da EduGest AI"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
                title="Fechar assistente"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div className="bg-slate-50 px-3 py-1.5 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[10px]">
            {[
              'Alunos com média < 10',
              'Alunos com > 20% faltas',
              'Menor aproveitamento',
              'Quanto a receber?',
              'Principais despesas',
            ].map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="px-2 py-0.5 rounded-full bg-white border border-slate-300 hover:border-[#015FC4] hover:text-[#015FC4] whitespace-nowrap transition-colors cursor-pointer shrink-0 font-medium text-[#012041]"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50/50 text-xs">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-xl ${
                      isUser
                        ? 'bg-[#015FC4] text-white rounded-br-none'
                        : 'bg-white text-[#012041] border border-slate-200 rounded-bl-none shadow-2xs'
                    }`}
                  >
                    <div className="text-[11px] leading-relaxed whitespace-pre-line">
                      {m.text}
                    </div>

                    {/* Quick Metric Pills */}
                    {m.metricasChave && m.metricasChave.length > 0 && (
                      <div className="grid grid-cols-2 gap-1.5 pt-2 mt-2 border-t border-slate-100">
                        {m.metricasChave.slice(0, 2).map((k, kIdx) => (
                          <div key={kIdx} className="p-1.5 rounded bg-slate-50 border border-slate-200 text-center">
                            <span className="text-[9px] uppercase font-bold text-slate-500 block truncate">
                              {k.rotulo}
                            </span>
                            <span className="text-xs font-black text-[#012041] font-mono">
                              {k.valor}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isProcessing && (
              <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 text-[11px] text-[#41515D] w-fit">
                <div className="w-3 h-3 border-2 border-[#015FC4] border-t-transparent rounded-full animate-spin" />
                <span>Processando consulta segura...</span>
              </div>
            )}
          </div>

          {/* Input Footer */}
          <div className="p-2.5 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-1.5"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Perguntar ao EduGest AI..."
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-[#015FC4] bg-slate-50"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!inputQuery.trim() || isProcessing}
                className="px-2.5"
              >
                <Send className="w-3 h-3" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
