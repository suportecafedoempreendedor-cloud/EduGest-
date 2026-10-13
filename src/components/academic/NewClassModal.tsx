import React, { useState, useEffect } from 'react';
import { Layers, AlertCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input, Select } from '../ui/Input';
import { Button } from '../ui/Button';
import { SchoolClass, CicloEnsino } from '../../types';

interface NewClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (classe: SchoolClass) => void;
  initialData?: SchoolClass | null;
  escolaId: string;
  existingClassesCount: number;
}

export const NewClassModal: React.FC<NewClassModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  escolaId,
  existingClassesCount,
}) => {
  const isEditing = !!initialData;

  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const [ciclo, setCiclo] = useState<CicloEnsino>('Iº Ciclo Secundário');
  const [curso, setCurso] = useState('Ensino Geral Secundário');
  const [ordem, setOrdem] = useState<number>(existingClassesCount + 1);
  const [estado, setEstado] = useState<'activa' | 'inactiva'>('activa');
  const [descricao, setDescricao] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setNome(initialData.nome);
      setCodigo(initialData.codigo);
      setCiclo(initialData.ciclo);
      setCurso(initialData.curso || '');
      setOrdem(initialData.ordem);
      setEstado(initialData.estado);
      setDescricao(initialData.descricao || '');
    } else {
      setNome('');
      setCodigo('');
      setCiclo('Iº Ciclo Secundário');
      setCurso('Ensino Geral Secundário');
      setOrdem(existingClassesCount + 1);
      setEstado('activa');
      setDescricao('');
    }
    setError(null);
  }, [initialData, isOpen, existingClassesCount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      setError('Por favor informe o nome da classe (ex: 7ª Classe, 10ª Classe).');
      return;
    }

    const classToSave: SchoolClass = {
      id: initialData?.id || `cla-${escolaId}-${Date.now()}`,
      escolaId,
      nome: nome.trim(),
      codigo: codigo.trim() || nome.trim().split(' ')[0],
      ciclo,
      curso: curso.trim() || undefined,
      ordem: Number(ordem) || 1,
      estado,
      descricao: descricao.trim() || undefined,
    };

    onSave(classToSave);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Classe Curricular' : 'Criar Nova Classe'}
      subtitle="Configure os níveis e classes do plano de estudos próprio da instituição"
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
            label="Designação da Classe *"
            value={nome}
            onChange={(e) => {
              setNome(e.target.value);
              if (!codigo) {
                setCodigo(e.target.value.split(' ')[0]);
              }
            }}
            placeholder="Ex: 7ª Classe, 10ª Classe"
            required
            hint="Ex: 7ª Classe, 8ª Classe, 10ª Classe - CFB"
          />

          <Input
            label="Código / Abreviatura"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="Ex: 7ª, 10ª CFB"
            hint="Código curto para pautas e turmas"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Ciclo de Ensino *"
            value={ciclo}
            onChange={(e) => {
              const novoCiclo = e.target.value as CicloEnsino;
              setCiclo(novoCiclo);
              if (novoCiclo === 'Iº Ciclo Secundário') {
                setCurso('Ensino Geral Secundário');
              } else if (novoCiclo === 'Ensino Primário') {
                setCurso('Ensino Primário Regular');
              } else if (novoCiclo === 'IIº Ciclo Geral' && !curso) {
                setCurso('Ciências Físicas e Biológicas');
              }
            }}
          >
            <option value="Ensino Primário">Ensino Primário (1ª à 6ª Classe)</option>
            <option value="Iº Ciclo Secundário">Iº Ciclo Secundário (7ª à 9ª Classe)</option>
            <option value="IIº Ciclo Geral">IIº Ciclo Geral (10ª à 12ª Classe)</option>
            <option value="IIº Ciclo Técnico Profissional">IIº Ciclo Técnico Profissional (10ª à 13ª)</option>
            <option value="Outro">Outro Plano de Estudos</option>
          </Select>

          <Input
            label="Curso / Área Pedagógica"
            value={curso}
            onChange={(e) => setCurso(e.target.value)}
            placeholder="Ex: Ciências Físicas e Biológicas"
            hint="Ex: Ensino Geral, Informática, Contabilidade"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Ordem Sequencial *"
            type="number"
            min={1}
            value={ordem}
            onChange={(e) => setOrdem(Number(e.target.value))}
            hint="Posição na escala de progressão escolar"
          />

          <Select
            label="Estado da Classe *"
            value={estado}
            onChange={(e) => setEstado(e.target.value as 'activa' | 'inactiva')}
          >
            <option value="activa">Activa (Apta para turmas e matrículas)</option>
            <option value="inactiva">Inactiva (Oculta para novos registos)</option>
          </Select>
        </div>

        <div>
          <label className="text-xs font-semibold text-[#012041] block mb-1.5">
            Descrição / Requisitos
          </label>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-[#E2E8F0] px-3.5 py-2 text-sm text-[#012041] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#015FC4] focus:border-[#015FC4]"
            placeholder="Ex: Classe terminal do ciclo secundário geral com exames nacionais."
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            {isEditing ? 'Guardar Alterações' : 'Criar Classe'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
