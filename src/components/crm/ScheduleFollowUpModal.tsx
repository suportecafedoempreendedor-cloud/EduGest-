import React, { useState } from 'react';
import { Calendar, Clock, AlertCircle, Phone, MessageSquare, Users, Check } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Select, Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { FollowUp, Lead } from '../../types';

interface ScheduleFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  staffList: { id: string; nome: string; cargo: string }[];
  onSchedule: (followUp: FollowUp) => void;
}

export const ScheduleFollowUpModal: React.FC<ScheduleFollowUpModalProps> = ({
  isOpen,
  onClose,
  lead,
  staffList,
  onSchedule,
}) => {
  const [titulo, setTitulo] = useState('Telefonar para verificar documentação');
  const [tipo, setTipo] = useState<'chamada' | 'whatsapp' | 'visita' | 'email' | 'reuniao'>('chamada');
  const [dataPrevista, setDataPrevista] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().substring(0, 10)
  );
  const [horaPrevista, setHoraPrevista] = useState('10:00');
  const [responsavelNome, setResponsavelNome] = useState(lead?.responsavelNome || staffList[0]?.nome || '');
  const [observacoes, setObservacoes] = useState('');

  if (!lead) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newFollowUp: FollowUp = {
      id: `fu-${Date.now()}`,
      leadId: lead.id,
      leadNome: lead.nomeCandidato,
      titulo: titulo.trim(),
      tipo,
      dataPrevista,
      horaPrevista,
      responsavelNome: responsavelNome || lead.responsavelNome,
      observacoes: observacoes.trim() || undefined,
      concluido: false,
    };

    onSchedule(newFollowUp);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Agendar Follow-up / Lembrete"
      subtitle={`Próxima acção planeada com ${lead.nomeCandidato}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Objectivo / Descrição da Tarefa *"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Canal / Tipo *"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as any)}
          >
            <option value="chamada">Chamada Telefónica</option>
            <option value="whatsapp">Mensagem WhatsApp</option>
            <option value="visita">Visita às Instalações</option>
            <option value="reuniao">Reunião Presencial</option>
            <option value="email">Envio de Email</option>
          </Select>

          <Select
            label="Responsável Atribuído *"
            value={responsavelNome}
            onChange={(e) => setResponsavelNome(e.target.value)}
          >
            {staffList.map((st) => (
              <option key={st.id} value={st.nome}>
                {st.nome}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Data Prevista *"
            type="date"
            value={dataPrevista}
            onChange={(e) => setDataPrevista(e.target.value)}
            required
          />

          <Input
            label="Hora Prevista *"
            type="time"
            value={horaPrevista}
            onChange={(e) => setHoraPrevista(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-[#012041] block mb-1.5">
            Notas de Apoio para a Tarefa
          </label>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-[#E2E8F0] px-3.5 py-2 text-xs text-[#012041] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#015FC4]"
            placeholder="Ex: Verificar se já enviaram os documentos por email antes de ligar."
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" icon={<Calendar className="w-4 h-4" />}>
            Agendar Tarefa
          </Button>
        </div>
      </form>
    </Modal>
  );
};
