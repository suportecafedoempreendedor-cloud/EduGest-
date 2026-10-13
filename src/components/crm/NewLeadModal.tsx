import React, { useState } from 'react';
import { UserPlus, AlertCircle, Phone, Mail, Building2, User } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Select, Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Lead, LeadSource, PipelineStageId, Campaign } from '../../types';

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  escolaId: string;
  campaigns: Campaign[];
  staffList: { id: string; nome: string; cargo: string; email: string }[];
  onSaveLead: (lead: Lead) => void;
}

export const NewLeadModal: React.FC<NewLeadModalProps> = ({
  isOpen,
  onClose,
  escolaId,
  campaigns,
  staffList,
  onSaveLead,
}) => {
  const [nomeCandidato, setNomeCandidato] = useState('');
  const [nomeEncarregado, setNomeEncarregado] = useState('');
  const [parentesco, setParentesco] = useState('Pai');
  const [telefone, setTelefone] = useState('+244 923 ');
  const [telefoneAlternativo, setTelefoneAlternativo] = useState('');
  const [email, setEmail] = useState('');
  const [origem, setOrigem] = useState<LeadSource>('WhatsApp');
  const [campanhaId, setCampanhaId] = useState('');
  const [classeInteresse, setClasseInteresse] = useState('10ª Classe');
  const [cursoInteresse, setCursoInteresse] = useState('Ciências Físicas e Biológicas');
  const [turnoPretendido, setTurnoPretendido] = useState<'Manhã' | 'Tarde' | 'Noite' | 'Indiferente'>('Manhã');
  const [anoLectivo, setAnoLectivo] = useState('2026/2027');
  const [responsavelId, setResponsavelId] = useState(staffList[0]?.id || '');
  const [probabilidade, setProbabilidade] = useState(40);
  const [valorEstimadoKz, setValorEstimadoKz] = useState(63500);
  const [notas, setNotas] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeCandidato.trim()) {
      setError('Por favor indique o nome do candidato a aluno.');
      return;
    }
    if (!telefone.trim() || telefone.length < 8) {
      setError('Por favor indique um contacto telefónico válido.');
      return;
    }

    const assignedStaff = staffList.find((s) => s.id === responsavelId) || staffList[0];
    const selectedCamp = campaigns.find((c) => c.id === campanhaId);

    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      escolaId,
      nomeCandidato: nomeCandidato.trim(),
      nomeEncarregado: nomeEncarregado.trim() || nomeCandidato.trim(),
      parentesco,
      telefone: telefone.trim(),
      telefoneAlternativo: telefoneAlternativo.trim() || undefined,
      email: email.trim(),
      origem,
      campanhaId: campanhaId || undefined,
      campanhaNome: selectedCamp?.nome,
      classeInteresse,
      cursoInteresse,
      turnoPretendido,
      anoLectivo,
      estagio: 'novo_lead',
      responsavelNome: assignedStaff?.nome || 'Admissões',
      responsavelEmail: assignedStaff?.email,
      responsavelId: assignedStaff?.id,
      probabilidade: Number(probabilidade),
      valorEstimadoKz: Number(valorEstimadoKz),
      dataCriacao: new Date().toISOString().substring(0, 10),
      ultimaInteracao: new Date().toISOString().substring(0, 10),
      notas: notas.trim() || undefined,
    };

    onSaveLead(newLead);
    onClose();
    // Reset fields
    setNomeCandidato('');
    setNomeEncarregado('');
    setNotas('');
    setError(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registar Novo Lead / Candidato"
      subtitle="Cadastramento no funil de captação e admissão escolar do EduGest"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Candidato & Encarregado */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Nome Completo do Candidato *"
            value={nomeCandidato}
            onChange={(e) => setNomeCandidato(e.target.value)}
            placeholder="Ex: Mauro António dos Santos"
            required
          />

          <Input
            label="Nome do Encarregado de Educação"
            value={nomeEncarregado}
            onChange={(e) => setNomeEncarregado(e.target.value)}
            placeholder="Ex: Eng. António dos Santos"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Grau de Parentesco"
            value={parentesco}
            onChange={(e) => setParentesco(e.target.value)}
          >
            <option value="Pai">Pai</option>
            <option value="Mãe">Mãe</option>
            <option value="Tutor Legal">Tutor Legal</option>
            <option value="Tio(a)">Tio(a)</option>
            <option value="Próprio Candidato">Próprio Candidato</option>
          </Select>

          <Input
            label="Telefone Principal (WhatsApp) *"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="+244 923 000 000"
            required
          />

          <Input
            label="Email de Contacto"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="encarregado@email.ao"
          />
        </div>

        {/* Origem & Campanha */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Canal / Origem do Lead *"
            value={origem}
            onChange={(e) => setOrigem(e.target.value as LeadSource)}
            required
          >
            <option value="WhatsApp">WhatsApp</option>
            <option value="Website">Website Oficial</option>
            <option value="Facebook">Facebook</option>
            <option value="Instagram">Instagram</option>
            <option value="Telefone">Telefone (Chamada)</option>
            <option value="Indicação">Indicação de Pais</option>
            <option value="Evento">Evento / Feira Escolar</option>
            <option value="Campanha">Campanha de Mídia</option>
            <option value="Outro">Outro Canal</option>
          </Select>

          <Select
            label="Campanha de Captação"
            value={campanhaId}
            onChange={(e) => setCampanhaId(e.target.value)}
          >
            <option value="">Nenhuma / Orgânico</option>
            {campaigns.map((cmp) => (
              <option key={cmp.id} value={cmp.id}>
                {cmp.nome}
              </option>
            ))}
          </Select>

          <Select
            label="Responsável de Admissões *"
            value={responsavelId}
            onChange={(e) => setResponsavelId(e.target.value)}
            required
          >
            {staffList.map((st) => (
              <option key={st.id} value={st.id}>
                {st.nome} ({st.cargo.split(' ')[0]})
              </option>
            ))}
          </Select>
        </div>

        {/* Pedagógico & Interesse */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Classe Pretendida *"
            value={classeInteresse}
            onChange={(e) => setClasseInteresse(e.target.value)}
            required
          >
            <option value="7ª Classe">7ª Classe</option>
            <option value="8ª Classe">8ª Classe</option>
            <option value="9ª Classe">9ª Classe</option>
            <option value="10ª Classe">10ª Classe</option>
            <option value="11ª Classe">11ª Classe</option>
            <option value="12ª Classe">12ª Classe</option>
            <option value="Iniciação">Iniciação / Pré-escolar</option>
          </Select>

          <Select
            label="Curso / Área"
            value={cursoInteresse}
            onChange={(e) => setCursoInteresse(e.target.value)}
          >
            <option value="Ensino Geral Secundário">Ensino Geral Secundário</option>
            <option value="Ciências Físicas e Biológicas">Ciências Físicas e Biológicas</option>
            <option value="Ciências Económicas e Jurídicas">Ciências Económicas e Jurídicas</option>
            <option value="Informática de Gestão">Informática de Gestão</option>
            <option value="Contabilidade e Gestão">Contabilidade e Gestão</option>
          </Select>

          <Select
            label="Turno Pretendido"
            value={turnoPretendido}
            onChange={(e) => setTurnoPretendido(e.target.value as any)}
          >
            <option value="Manhã">Manhã</option>
            <option value="Tarde">Tarde</option>
            <option value="Noite">Noite</option>
            <option value="Indiferente">Indiferente</option>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Ano Lectivo *"
            value={anoLectivo}
            onChange={(e) => setAnoLectivo(e.target.value)}
            required
          />

          <Input
            label="Probabilidade de Fecho (%)"
            type="number"
            min={0}
            max={100}
            value={probabilidade}
            onChange={(e) => setProbabilidade(Number(e.target.value))}
          />

          <Input
            label="Valor Estimado de Matrícula (Kz)"
            type="number"
            value={valorEstimadoKz}
            onChange={(e) => setValorEstimadoKz(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-[#012041] block mb-1.5">
            Observações Iniciais / Histórico de Contacto
          </label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-[#E2E8F0] px-3.5 py-2 text-xs text-[#012041] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#015FC4]"
            placeholder="Ex: Contactou via WhatsApp interessado nas turmas da manhã. Encarregado quer agendar visita."
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" icon={<UserPlus className="w-4 h-4" />}>
            Inserir no Funil
          </Button>
        </div>
      </form>
    </Modal>
  );
};
