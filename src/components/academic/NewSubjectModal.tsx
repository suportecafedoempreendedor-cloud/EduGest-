import React, { useState, useEffect } from 'react';
import { BookOpen, AlertCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input, Select } from '../ui/Input';
import { Button } from '../ui/Button';
import { Subject } from '../../types';

interface NewSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subject: Subject) => void;
  initialData?: Subject | null;
  escolaId: string;
}

export const NewSubjectModal: React.FC<NewSubjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  escolaId,
}) => {
  const isEditing = !!initialData;

  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const [cargaHorariaSemanal, setCargaHorariaSemanal] = useState<number>(4);
  const [estado, setEstado] = useState<'activa' | 'inactiva'>('activa');
  const [areaCientifica, setAreaCientifica] = useState('Ciências Exactas');
  const [descricao, setDescricao] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setNome(initialData.nome);
      setCodigo(initialData.codigo);
      setCargaHorariaSemanal(initialData.cargaHorariaSemanal);
      setEstado(initialData.estado);
      setAreaCientifica(initialData.areaCientifica || 'Ciências Exactas');
      setDescricao(initialData.descricao || '');
    } else {
      setNome('');
      setCodigo('');
      setCargaHorariaSemanal(4);
      setEstado('activa');
      setAreaCientifica('Ciências Exactas');
      setDescricao('');
    }
    setError(null);
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      setError('Por favor preencha o nome da disciplina.');
      return;
    }
    if (!codigo.trim()) {
      setError('Por favor preencha o código/abreviatura da disciplina (Ex: MAT, LP).');
      return;
    }
    if (cargaHorariaSemanal <= 0) {
      setError('A carga horária semanal deve ser superior a zero.');
      return;
    }

    const subjectToSave: Subject = {
      id: initialData?.id || `sub-${escolaId}-${Date.now()}`,
      escolaId,
      nome: nome.trim(),
      codigo: codigo.trim().toUpperCase(),
      cargaHorariaSemanal: Number(cargaHorariaSemanal),
      estado,
      areaCientifica,
      descricao: descricao.trim() || undefined,
    };

    onSave(subjectToSave);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Disciplina' : 'Criar Nova Disciplina'}
      subtitle="Registe componentes curriculares no plano pedagógico da instituição"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Nome da Disciplina *"
            value={nome}
            onChange={(e) => {
              setNome(e.target.value);
              if (!codigo) {
                setCodigo(e.target.value.substring(0, 3).toUpperCase());
              }
            }}
            placeholder="Ex: Matemática, Física, Inglês"
            required
          />

          <Input
            label="Código / Sigla *"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            placeholder="Ex: MAT, LP, FIS, QUI"
            required
            hint="Abreviatura usada nas pautas e cadernetas"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Área Científica / Departamento *"
            value={areaCientifica}
            onChange={(e) => setAreaCientifica(e.target.value)}
          >
            <option value="Ciências Exactas">Ciências Exactas (Matemática, Física)</option>
            <option value="Ciências Naturais">Ciências Naturais & Saúde (Química, Biologia)</option>
            <option value="Línguas e Comunicação">Línguas e Comunicação (Português, Inglês, Francês)</option>
            <option value="Ciências Sociais">Ciências Sociais e Humanas (História, Geografia, Filosofia)</option>
            <option value="Ciências Económicas">Ciências Económicas & Gestão (Economia, Contabilidade)</option>
            <option value="Ciências Jurídicas">Ciências Jurídicas (Direito, Cidadania)</option>
            <option value="Tecnologia e Informática">Tecnologia e Informática (Programação, Redes, TIC)</option>
            <option value="Expressões e Desporto">Expressões Artísticas & Educação Física</option>
          </Select>

          <Input
            label="Carga Horária Semanal (Tempos) *"
            type="number"
            min={1}
            max={15}
            value={cargaHorariaSemanal}
            onChange={(e) => setCargaHorariaSemanal(Number(e.target.value))}
            required
            hint="Tempos lectivos semanais de 45-50 min"
          />
        </div>

        <div>
          <Select
            label="Estado da Disciplina *"
            value={estado}
            onChange={(e) => setEstado(e.target.value as 'activa' | 'inactiva')}
          >
            <option value="activa">Activa (Disponível na matriz curricular)</option>
            <option value="inactiva">Inactiva (Descontinuada temporariamente)</option>
          </Select>
        </div>

        <div>
          <label className="text-xs font-semibold text-[#012041] block mb-1.5">
            Ementa / Objectivos da Disciplina
          </label>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-[#E2E8F0] px-3.5 py-2 text-sm text-[#012041] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#015FC4] focus:border-[#015FC4]"
            placeholder="Ex: Introdução ao cálculo, trigonometria e geometria descritiva."
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            {isEditing ? 'Guardar Alterações' : 'Criar Disciplina'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
