import React, { useState } from 'react';
import { UserCheck, CheckCircle2, AlertCircle, Building2, GraduationCap, ShieldCheck } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Select, Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Lead, Student, Section } from '../../types';

interface ConvertLeadToStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  sections: Section[];
  onConvert: (student: Student, turmaId: string) => void;
}

export const ConvertLeadToStudentModal: React.FC<ConvertLeadToStudentModalProps> = ({
  isOpen,
  onClose,
  lead,
  sections,
  onConvert,
}) => {
  const [selectedTurmaId, setSelectedTurmaId] = useState<string>(
    sections[0]?.id || ''
  );
  const [numeroMatricula, setNumeroMatricula] = useState<string>('');
  const [dataNascimento, setDataNascimento] = useState<string>('2010-04-15');
  const [genero, setGenero] = useState<'M' | 'F'>('M');
  const [bi, setBi] = useState<string>('008912304LA012');
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (lead) {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      setNumeroMatricula(`MAT-2026/${randomNum}`);
      if (sections[0]) {
        setSelectedTurmaId(sections[0].id);
      }
    }
  }, [lead, sections, isOpen]);

  if (!lead) return null;

  const currentTurma = sections.find((s) => s.id === selectedTurmaId) || sections[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numeroMatricula.trim()) {
      setError('Por favor indique o número de matrícula.');
      return;
    }

    const newStudent: Student = {
      id: `alu-crm-${Date.now()}`,
      numeroMatricula,
      processo: `EG-2026/${numeroMatricula.split('/')[1] || '0100'}`,
      nomeCompleto: lead.nomeCandidato,
      dataNascimento,
      sexo: genero,
      genero,
      documentoIdentificacao: bi,
      bi,
      tipoDocumento: 'BI',
      nacionalidade: 'Angolana',
      morada: 'Luanda, Angola',
      municipio: 'Luanda',
      provincia: 'Luanda',
      contactos: {
        telefone: lead.telefone,
        email: lead.email,
        whatsapp: lead.telefone,
      },
      telefone: lead.telefone,
      email: lead.email,
      estado: 'activo',
      escolaId: lead.escolaId,
      escolaNome: 'Colégio Welwitschia Mirabilis',
      anoLectivo: lead.anoLectivo || '2026/2027',
      classe: lead.classeInteresse,
      turmaId: currentTurma?.id || 't-10cfb-a',
      turmaNome: currentTurma?.nome || 'Turma A',
      curso: lead.cursoInteresse || 'Ensino Geral Secundário',
      encarregadoNome: `${lead.nomeEncarregado} (${lead.parentesco})`,
      encarregadoContacto: lead.telefone,
      statusPropina: 'em_dia',
      mediaGeral: 14.5,
      dataCadastro: new Date().toISOString().substring(0, 10),
    };

    onConvert(newStudent, currentTurma?.id || '');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Converter Lead em Aluno Oficial"
      subtitle={`Efectivação de matrícula e integração do candidato ${lead.nomeCandidato} no sistema escolar`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Lead Summary Info */}
        <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-slate-500 block">Candidato a Aluno:</span>
            <span className="font-bold text-[#012041] block text-sm">{lead.nomeCandidato}</span>
            <span className="text-slate-500 mt-0.5 block">
              Origem do Lead: <strong>{lead.origem}</strong>
            </span>
          </div>

          <div>
            <span className="text-slate-500 block">Encarregado de Educação:</span>
            <span className="font-bold text-[#012041] block text-sm">
              {lead.nomeEncarregado} ({lead.parentesco})
            </span>
            <span className="font-mono text-slate-600 mt-0.5 block">{lead.telefone}</span>
          </div>
        </div>

        {/* Academic Allocation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Turma de Destino Oficial *"
            value={selectedTurmaId}
            onChange={(e) => setSelectedTurmaId(e.target.value)}
            required
          >
            {sections.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.nome} ({sec.classeNome} · {sec.turno})
              </option>
            ))}
          </Select>

          <Input
            label="Número de Matrícula Oficial *"
            value={numeroMatricula}
            onChange={(e) => setNumeroMatricula(e.target.value)}
            required
            hint="Gerado automaticamente com o prefixo anual"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Data de Nascimento *"
            type="date"
            value={dataNascimento}
            onChange={(e) => setDataNascimento(e.target.value)}
            required
          />

          <Select
            label="Género *"
            value={genero}
            onChange={(e) => setGenero(e.target.value as 'M' | 'F')}
          >
            <option value="M">Masculino (M)</option>
            <option value="F">Feminino (F)</option>
          </Select>

          <Input
            label="BI Angolano / Cédula *"
            value={bi}
            onChange={(e) => setBi(e.target.value)}
            required
          />
        </div>

        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Ao confirmar, o estágio do lead mudará para <strong>«Aluno»</strong> e o registo
            ficará disponível no módulo de <strong>Alunos & Matrículas</strong>.
          </span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" icon={<UserCheck className="w-4 h-4" />}>
            Homologar Matrícula e Criar Aluno
          </Button>
        </div>
      </form>
    </Modal>
  );
};
