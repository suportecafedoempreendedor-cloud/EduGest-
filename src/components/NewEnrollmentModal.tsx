import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Input, Select } from './ui/Input';
import { Button } from './ui/Button';
import { Student } from '../types';
import { TURMAS_INICIAIS } from '../data/mockData';

interface NewEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStudent: (newStudent: Student) => void;
}

export const NewEnrollmentModal: React.FC<NewEnrollmentModalProps> = ({
  isOpen,
  onClose,
  onAddStudent,
}) => {
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    bi: '',
    dataNascimento: '2008-01-15',
    genero: 'M' as 'M' | 'F',
    turmaId: TURMAS_INICIAIS[0].id,
    provincia: 'Luanda',
    encarregadoNome: '',
    encarregadoContacto: '+244 923 ',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.nomeCompleto.trim()) {
      errs.nomeCompleto = 'Nome completo é obrigatório.';
    }
    if (!formData.bi.trim()) {
      errs.bi = 'Bilhete de Identidade (BI) é obrigatório.';
    } else if (formData.bi.trim().length < 10) {
      errs.bi = 'Formato de BI angolano inválido (ex: 006458921LA042).';
    }
    if (!formData.encarregadoNome.trim()) {
      errs.encarregadoNome = 'Nome do encarregado de educação é obrigatório.';
    }
    if (!formData.encarregadoContacto.trim() || formData.encarregadoContacto.length < 9) {
      errs.encarregadoContacto = 'Contacto telefónico válido é obrigatório.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const turmaSelecionada = TURMAS_INICIAIS.find((t) => t.id === formData.turmaId) || TURMAS_INICIAIS[0];
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newStudent: Student = {
      id: `alu-${Date.now()}`,
      numeroMatricula: `MAT-2025/${randomNum}`,
      processo: `EG-2025/${randomNum}`,
      nomeCompleto: formData.nomeCompleto,
      bi: formData.bi.toUpperCase(),
      documentoIdentificacao: formData.bi.toUpperCase(),
      tipoDocumento: 'BI',
      dataNascimento: formData.dataNascimento,
      sexo: formData.genero,
      genero: formData.genero,
      nacionalidade: 'Angolana',
      morada: 'Luanda, Angola',
      provincia: formData.provincia,
      contactos: {
        telefone: formData.encarregadoContacto,
      },
      telefone: formData.encarregadoContacto,
      estado: 'activo',
      escolaId: 'esc-001',
      escolaNome: 'Colégio Welwitschia Mirabilis',
      anoLectivo: '2025/2026',
      turmaId: formData.turmaId,
      turmaNome: turmaSelecionada.nome,
      classe: turmaSelecionada.nome.split(' ')[0] + ' ' + turmaSelecionada.nome.split(' ')[1],
      curso: turmaSelecionada.curso,
      encarregadoNome: formData.encarregadoNome,
      encarregadoContacto: formData.encarregadoContacto,
      statusPropina: 'em_dia',
      mediaGeral: 15.0,
      dataCadastro: new Date().toISOString().split('T')[0],
    };

    onAddStudent(newStudent);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nova Matrícula Escolar"
      subtitle="Registo de aluno no sistema integrado EduGest Angola"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome Completo do Estudante"
          placeholder="Ex: Manuel Domingos da Silva"
          value={formData.nomeCompleto}
          onChange={(e) => setFormData({ ...formData, nomeCompleto: e.target.value })}
          error={errors.nomeCompleto}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Bilhete de Identidade (BI)"
            placeholder="Ex: 006458921LA042"
            value={formData.bi}
            onChange={(e) => setFormData({ ...formData, bi: e.target.value })}
            error={errors.bi}
            hint="Insira sem espaços"
          />

          <Input
            label="Data de Nascimento"
            type="date"
            value={formData.dataNascimento}
            onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Género"
            value={formData.genero}
            onChange={(e) => setFormData({ ...formData, genero: e.target.value as 'M' | 'F' })}
          >
            <option value="M">Masculino</option>
            <option value="F">Feminino</option>
          </Select>

          <Select
            label="Província de Origem"
            value={formData.provincia}
            onChange={(e) => setFormData({ ...formData, provincia: e.target.value })}
          >
            <option value="Luanda">Luanda</option>
            <option value="Benguela">Benguela</option>
            <option value="Huambo">Huambo</option>
            <option value="Huíla">Huíla</option>
            <option value="Cabinda">Cabinda</option>
            <option value="Cuanza Sul">Cuanza Sul</option>
            <option value="Malanje">Malanje</option>
          </Select>

          <Select
            label="Turma & Curso"
            value={formData.turmaId}
            onChange={(e) => setFormData({ ...formData, turmaId: e.target.value })}
          >
            {TURMAS_INICIAIS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome} ({t.curso})
              </option>
            ))}
          </Select>
        </div>

        <div className="pt-2 border-t border-[#E2E8F0]">
          <span className="text-xs font-bold text-[#012041] block mb-3 uppercase tracking-wide">
            Dados do Encarregado de Educação
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nome do Encarregado"
              placeholder="Ex: Dr. António da Silva (Pai)"
              value={formData.encarregadoNome}
              onChange={(e) => setFormData({ ...formData, encarregadoNome: e.target.value })}
              error={errors.encarregadoNome}
            />

            <Input
              label="Contacto Telefónico"
              placeholder="+244 923 000 000"
              value={formData.encarregadoContacto}
              onChange={(e) => setFormData({ ...formData, encarregadoContacto: e.target.value })}
              error={errors.encarregadoContacto}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Efectuar Matrícula Oficial
          </Button>
        </div>
      </form>
    </Modal>
  );
};
