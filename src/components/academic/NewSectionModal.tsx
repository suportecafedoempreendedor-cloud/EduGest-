import React, { useState, useEffect } from 'react';
import { Users, AlertCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input, Select } from '../ui/Input';
import { Button } from '../ui/Button';
import {
  Section,
  SchoolClass,
  AcademicYear,
  Teacher,
  TurnoType,
  SectionState,
} from '../../types';

interface NewSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (section: Section) => void;
  initialData?: Section | null;
  classes: SchoolClass[];
  academicYears: AcademicYear[];
  teachers: Teacher[];
  escolaId: string;
}

export const NewSectionModal: React.FC<NewSectionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  classes,
  academicYears,
  teachers,
  escolaId,
}) => {
  const isEditing = !!initialData;

  const activeYear = academicYears.find((y) => y.estado === 'activo') || academicYears[0];
  const firstClass = classes[0];

  const [classeId, setClasseId] = useState(firstClass?.id || '');
  const [nome, setNome] = useState('');
  const [anoLectivoId, setAnoLectivoId] = useState(activeYear?.id || '');
  const [sala, setSala] = useState('');
  const [turno, setTurno] = useState<TurnoType>('Manhã');
  const [directorTurma, setDirectorTurma] = useState('');
  const [capacidade, setCapacidade] = useState<number>(40);
  const [estado, setEstado] = useState<SectionState>('Activa');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setClasseId(initialData.classeId);
      setNome(initialData.nome);
      setAnoLectivoId(initialData.anoLectivoId);
      setSala(initialData.sala);
      setTurno(initialData.turno);
      setDirectorTurma(initialData.directorTurma);
      setCapacidade(initialData.capacidade);
      setEstado(initialData.estado);
    } else {
      const defaultClass = classes[0];
      setClasseId(defaultClass?.id || '');
      setNome(defaultClass ? `${defaultClass.nome} A` : '');
      setAnoLectivoId(activeYear?.id || '');
      setSala('Sala 01 - Bloco A');
      setTurno('Manhã');
      setDirectorTurma(teachers[0]?.nome || 'A designar pela direcção pedagógica');
      setCapacidade(40);
      setEstado('Activa');
    }
    setError(null);
  }, [initialData, isOpen, classes, activeYear, teachers]);

  const handleClassChange = (selectedId: string) => {
    setClasseId(selectedId);
    const selClass = classes.find((c) => c.id === selectedId);
    if (selClass && (!nome || !isEditing)) {
      setNome(`${selClass.nome} A`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classeId) {
      setError('Por favor seleccione a classe correspondente.');
      return;
    }
    if (!nome.trim()) {
      setError('Por favor preencha o nome da turma (ex: 10ª Classe A).');
      return;
    }
    if (!anoLectivoId) {
      setError('Por favor seleccione o ano lectivo.');
      return;
    }
    if (!sala.trim()) {
      setError('Por favor informe a sala de aulas.');
      return;
    }
    if (capacidade <= 0) {
      setError('A capacidade da turma deve ser superior a zero.');
      return;
    }

    const selClass = classes.find((c) => c.id === classeId);
    const selYear = academicYears.find((y) => y.id === anoLectivoId);

    const sectionToSave: Section = {
      id: initialData?.id || `sec-${escolaId}-${Date.now()}`,
      escolaId,
      classeId,
      classeNome: selClass?.nome || 'Classe Desconhecida',
      nome: nome.trim(),
      anoLectivoId,
      anoLectivoNome: selYear?.nome || '2025/2026',
      sala: sala.trim(),
      turno,
      directorTurma: directorTurma.trim() || 'Director(a) a designar',
      capacidade: Number(capacidade),
      totalAlunos: initialData ? initialData.totalAlunos : 0,
      estado,
    };

    onSave(sectionToSave);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Turma' : 'Criar Nova Turma'}
      subtitle="Definição de classe, turno, sala, capacidade e directoria pedagógica da turma"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Classe Curricular *"
            value={classeId}
            onChange={(e) => handleClassChange(e.target.value)}
            required
          >
            {classes.length === 0 && <option value="">Nenhuma classe registada</option>}
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome} {c.curso ? `(${c.curso})` : ''}
              </option>
            ))}
          </Select>

          <Input
            label="Nome da Turma *"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: 10ª Classe A, Turma B - Manhã"
            required
            hint="Identificação oficial da turma"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Ano Lectivo *"
            value={anoLectivoId}
            onChange={(e) => setAnoLectivoId(e.target.value)}
            required
          >
            {academicYears.map((y) => (
              <option key={y.id} value={y.id}>
                {y.nome} {y.estado === 'activo' ? '(Activo)' : `(${y.estado})`}
              </option>
            ))}
          </Select>

          <Select
            label="Turno *"
            value={turno}
            onChange={(e) => setTurno(e.target.value as TurnoType)}
            required
          >
            <option value="Manhã">Manhã (07:30 - 12:30)</option>
            <option value="Tarde">Tarde (13:00 - 18:00)</option>
            <option value="Noite">Noite (18:30 - 22:30)</option>
            <option value="Integral">Integral / Tempo Todo</option>
          </Select>

          <Input
            label="Sala / Laboratório *"
            value={sala}
            onChange={(e) => setSala(e.target.value)}
            placeholder="Ex: Sala 14 - Bloco B"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-[#012041] block mb-1.5">
              Director de Turma (Docente Responsável) *
            </label>
            <div className="flex gap-2">
              <select
                className="w-full rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-sm text-[#012041] focus:outline-none focus:ring-2 focus:ring-[#015FC4]"
                value={directorTurma}
                onChange={(e) => setDirectorTurma(e.target.value)}
              >
                <option value="">Seleccione um professor...</option>
                {teachers.map((prof) => (
                  <option key={prof.id} value={prof.nome}>
                    {prof.nome} ({prof.especialidade})
                  </option>
                ))}
                {directorTurma && !teachers.some((t) => t.nome === directorTurma) && (
                  <option value={directorTurma}>{directorTurma}</option>
                )}
              </select>
            </div>
            <p className="text-[11px] text-[#41515D] mt-1">
              Responsável pela coordenação pedagógica e pauta da turma
            </p>
          </div>

          <div>
            <Input
              label="Capacidade de Alunos *"
              type="number"
              min={1}
              max={80}
              value={capacidade}
              onChange={(e) => setCapacidade(Number(e.target.value))}
              required
              hint="Ex: 40 vagas por turma"
            />
          </div>
        </div>

        <div>
          <Select
            label="Estado da Turma *"
            value={estado}
            onChange={(e) => setEstado(e.target.value as SectionState)}
          >
            <option value="Activa">Activa (Aberta para matrículas e aulas)</option>
            <option value="Lotada">Lotada (Capacidade máxima atingida)</option>
            <option value="Inactiva">Inactiva (Temporariamente suspensa)</option>
            <option value="Encerrada">Encerrada (Ano lectivo finalizado)</option>
          </Select>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            {isEditing ? 'Guardar Alterações' : 'Criar Turma'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
