import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input, Select } from '../ui/Input';
import { Button } from '../ui/Button';
import { AcademicYear, AcademicPeriod, AcademicYearState } from '../../types';

interface NewAcademicYearModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (year: AcademicYear) => void;
  initialData?: AcademicYear | null;
  escolaId: string;
}

export const NewAcademicYearModal: React.FC<NewAcademicYearModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  escolaId,
}) => {
  const isEditing = !!initialData;

  const [nome, setNome] = useState('2026/2027');
  const [dataInicio, setDataInicio] = useState('2026-09-01');
  const [dataFim, setDataFim] = useState('2027-07-31');
  const [estado, setEstado] = useState<AcademicYearState>('planeamento');
  const [descricao, setDescricao] = useState('');

  // Períodos (Trimestres do MED)
  const [t1Inicio, setT1Inicio] = useState('2026-09-01');
  const [t1Fim, setT1Fim] = useState('2026-12-18');
  const [t2Inicio, setT2Inicio] = useState('2027-01-04');
  const [t2Fim, setT2Fim] = useState('2027-04-09');
  const [t3Inicio, setT3Inicio] = useState('2027-04-19');
  const [t3Fim, setT3Fim] = useState('2027-07-30');

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setNome(initialData.nome);
      setDataInicio(initialData.dataInicio);
      setDataFim(initialData.dataFim);
      setEstado(initialData.estado);
      setDescricao(initialData.descricao || '');

      const t1 = initialData.periodos.find((p) => p.nome.includes('1º'));
      const t2 = initialData.periodos.find((p) => p.nome.includes('2º'));
      const t3 = initialData.periodos.find((p) => p.nome.includes('3º'));

      if (t1) {
        setT1Inicio(t1.dataInicio);
        setT1Fim(t1.dataFim);
      }
      if (t2) {
        setT2Inicio(t2.dataInicio);
        setT2Fim(t2.dataFim);
      }
      if (t3) {
        setT3Inicio(t3.dataInicio);
        setT3Fim(t3.dataFim);
      }
    } else {
      setNome('2026/2027');
      setDataInicio('2026-09-01');
      setDataFim('2027-07-31');
      setEstado('planeamento');
      setDescricao('Ano lectivo planeado para a instituição');
      setT1Inicio('2026-09-01');
      setT1Fim('2026-12-18');
      setT2Inicio('2027-01-04');
      setT2Fim('2027-04-09');
      setT3Inicio('2027-04-19');
      setT3Fim('2027-07-30');
    }
    setError(null);
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      setError('Por favor informe a designação do ano lectivo (Ex: 2026/2027).');
      return;
    }
    if (!dataInicio || !dataFim) {
      setError('Por favor preencha as datas de início e término do ano lectivo.');
      return;
    }
    if (new Date(dataInicio) >= new Date(dataFim)) {
      setError('A data de início deve ser anterior à data de encerramento.');
      return;
    }

    const periodos: AcademicPeriod[] = [
      {
        id: initialData?.periodos[0]?.id || `per-${Date.now()}-1`,
        nome: '1º Trimestre',
        dataInicio: t1Inicio,
        dataFim: t1Fim,
        estado: estado === 'encerrado' ? 'concluido' : 'futuro',
      },
      {
        id: initialData?.periodos[1]?.id || `per-${Date.now()}-2`,
        nome: '2º Trimestre',
        dataInicio: t2Inicio,
        dataFim: t2Fim,
        estado: estado === 'encerrado' ? 'concluido' : 'futuro',
      },
      {
        id: initialData?.periodos[2]?.id || `per-${Date.now()}-3`,
        nome: '3º Trimestre',
        dataInicio: t3Inicio,
        dataFim: t3Fim,
        estado: estado === 'encerrado' ? 'concluido' : 'futuro',
      },
    ];

    const yearToSave: AcademicYear = {
      id: initialData?.id || `ay-${escolaId}-${Date.now()}`,
      escolaId,
      nome: nome.trim(),
      dataInicio,
      dataFim,
      estado,
      periodos,
      descricao: descricao.trim(),
    };

    onSave(yearToSave);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Ano Lectivo' : 'Criar Novo Ano Lectivo'}
      subtitle="Definição de calendário escolar, trimestres e períodos académicos da escola"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Designação do Ano Lectivo *"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: 2026/2027"
            required
            hint="Ex: 2025/2026, 2026/2027"
          />

          <Select
            label="Estado Inicial *"
            value={estado}
            onChange={(e) => setEstado(e.target.value as AcademicYearState)}
          >
            <option value="planeamento">Em Planeamento (Aguardando Abertura)</option>
            <option value="activo">Activo (Ano Corrente da Escola)</option>
            <option value="encerrado">Encerrado (Histórico Arquivado)</option>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Data de Início Oficial *"
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            required
          />

          <Input
            label="Data de Encerramento Oficial *"
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-[#012041] block mb-1.5">
            Observações / Descrição Institucional
          </label>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-[#E2E8F0] px-3.5 py-2 text-sm text-[#012041] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#015FC4] focus:border-[#015FC4]"
            placeholder="Ex: Calendário oficial homologado conforme directrizes do Ministério da Educação."
          />
        </div>

        {/* Períodos / Trimestres */}
        <div className="p-4 bg-slate-50 rounded-xl border border-[#E2E8F0] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#012041] uppercase tracking-wide flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#015FC4]" />
              Estrutura de Períodos Trimestrais (MED)
            </span>
            <span className="text-[11px] text-[#41515D]">3 Trimestres Lectivos</span>
          </div>

          <div className="space-y-3 pt-1">
            {/* 1º Trimestre */}
            <div className="p-3 bg-white rounded-lg border border-[#E2E8F0] grid grid-cols-1 sm:grid-cols-3 items-center gap-3">
              <span className="text-xs font-semibold text-[#012041]">1º Trimestre</span>
              <Input
                label="Início"
                type="date"
                value={t1Inicio}
                onChange={(e) => setT1Inicio(e.target.value)}
              />
              <Input
                label="Fim"
                type="date"
                value={t1Fim}
                onChange={(e) => setT1Fim(e.target.value)}
              />
            </div>

            {/* 2º Trimestre */}
            <div className="p-3 bg-white rounded-lg border border-[#E2E8F0] grid grid-cols-1 sm:grid-cols-3 items-center gap-3">
              <span className="text-xs font-semibold text-[#012041]">2º Trimestre</span>
              <Input
                label="Início"
                type="date"
                value={t2Inicio}
                onChange={(e) => setT2Inicio(e.target.value)}
              />
              <Input
                label="Fim"
                type="date"
                value={t2Fim}
                onChange={(e) => setT2Fim(e.target.value)}
              />
            </div>

            {/* 3º Trimestre */}
            <div className="p-3 bg-white rounded-lg border border-[#E2E8F0] grid grid-cols-1 sm:grid-cols-3 items-center gap-3">
              <span className="text-xs font-semibold text-[#012041]">3º Trimestre</span>
              <Input
                label="Início"
                type="date"
                value={t3Inicio}
                onChange={(e) => setT3Inicio(e.target.value)}
              />
              <Input
                label="Fim"
                type="date"
                value={t3Fim}
                onChange={(e) => setT3Fim(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            {isEditing ? 'Guardar Alterações' : 'Criar Ano Lectivo'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
