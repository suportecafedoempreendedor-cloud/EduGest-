import React, { useState } from 'react';
import { Phone, MessageSquare, Mail, Users, FileText, CheckCircle2, Clock } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Select, Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Activity, ActivityType, Lead } from '../../types';

interface LogActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  onSaveActivity: (activity: Activity) => void;
}

export const LogActivityModal: React.FC<LogActivityModalProps> = ({
  isOpen,
  onClose,
  lead,
  onSaveActivity,
}) => {
  const [tipo, setTipo] = useState<ActivityType>('chamada');
  const [titulo, setTitulo] = useState('Chamada telefónica efectuada');
  const [descricao, setDescricao] = useState('');
  const [resultado, setResultado] = useState('Conversa produtiva, solicitou mais detalhes');

  if (!lead) return null;

  const handleTipoChange = (newTipo: ActivityType) => {
    setTipo(newTipo);
    if (newTipo === 'chamada') {
      setTitulo('Chamada telefónica de acompanhamento');
    } else if (newTipo === 'whatsapp') {
      setTitulo('Mensagem enviada via WhatsApp');
    } else if (newTipo === 'visita_escola') {
      setTitulo('Visita às instalações escolares');
    } else if (newTipo === 'reuniao') {
      setTitulo('Reunião pedagógica com encarregado');
    } else if (newTipo === 'email') {
      setTitulo('Envio de folheto e proposta por email');
    } else {
      setTitulo('Nota interna sobre o processo');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const timeStr = now.toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toISOString().substring(0, 10);

    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      leadId: lead.id,
      tipo,
      titulo: titulo.trim(),
      descricao: descricao.trim() || 'Actividade registada no histórico do lead.',
      dataHora: `${dateStr} ${timeStr}`,
      responsavelNome: lead.responsavelNome,
      resultado: resultado.trim(),
    };

    onSaveActivity(newActivity);
    onClose();
    setDescricao('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registar Contacto / Actividade"
      subtitle={`Histórico de interacção com ${lead.nomeCandidato} (${lead.telefone})`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Activity Type Selector */}
        <div>
          <label className="text-xs font-semibold text-[#012041] block mb-2">
            Tipo de Contacto *
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'chamada' as ActivityType, label: 'Chamada', icon: <Phone className="w-3.5 h-3.5" /> },
              { id: 'whatsapp' as ActivityType, label: 'WhatsApp', icon: <MessageSquare className="w-3.5 h-3.5" /> },
              { id: 'visita_escola' as ActivityType, label: 'Visita', icon: <Users className="w-3.5 h-3.5" /> },
              { id: 'reuniao' as ActivityType, label: 'Reunião', icon: <Users className="w-3.5 h-3.5" /> },
              { id: 'email' as ActivityType, label: 'Email', icon: <Mail className="w-3.5 h-3.5" /> },
              { id: 'nota_interna' as ActivityType, label: 'Nota', icon: <FileText className="w-3.5 h-3.5" /> },
            ].map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => handleTipoChange(btn.id)}
                className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  tipo === btn.id
                    ? 'bg-[#012041] text-white border-[#012041]'
                    : 'bg-white text-[#41515D] border-[#CBD5E1] hover:bg-slate-50'
                }`}
              >
                {btn.icon}
                <span>{btn.label}</span>
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Título da Actividade *"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
        />

        <div>
          <label className="text-xs font-semibold text-[#012041] block mb-1.5">
            Descrição do Contacto / Assunto Tratado *
          </label>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows={3}
            required
            className="w-full rounded-lg border border-[#E2E8F0] px-3.5 py-2 text-xs text-[#012041] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#015FC4]"
            placeholder="Ex: Falámos com a mãe sobre o plano curricular da 10ª classe. Pediu para contactar novamente na sexta-feira após falar com o esposo."
          />
        </div>

        <Select
          label="Resultado do Contacto *"
          value={resultado}
          onChange={(e) => setResultado(e.target.value)}
        >
          <option value="Conversa produtiva, solicitou mais detalhes">Conversa produtiva, solicitou mais detalhes</option>
          <option value="Agendou visita às instalações">Agendou visita às instalações</option>
          <option value="Vai submeter documentação">Vai submeter documentação</option>
          <option value="Aguardando confirmação do pagamento">Aguardando confirmação do pagamento</option>
          <option value="Não atendeu / Deixada mensagem no WhatsApp">Não atendeu / Deixada mensagem</option>
          <option value="Desistiu / Optou por outra escola">Desistiu / Optou por outra instituição</option>
        </Select>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Gravar no Histórico
          </Button>
        </div>
      </form>
    </Modal>
  );
};
