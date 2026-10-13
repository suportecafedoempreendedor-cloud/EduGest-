import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input, Select } from '../ui/Input';
import { Button } from '../ui/Button';
import { Student, StudentState, Guardian, Turma, School } from '../../types';
import { TURMAS_INICIAIS } from '../../data/mockData';

interface NewStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStudent: (newStudent: Student, guardianIdToAssociate?: string) => void;
  selectedSchoolName: string;
  guardians: Guardian[];
  editingStudent?: Student | null;
  schools?: School[];
}

export const NewStudentModal: React.FC<NewStudentModalProps> = ({
  isOpen,
  onClose,
  onAddStudent,
  selectedSchoolName,
  guardians,
  editingStudent,
  schools,
}) => {
  const initialNumeroMatricula =
    editingStudent?.numeroMatricula ||
    `MAT-2025/${Math.floor(1000 + Math.random() * 9000)}`;

  const [formData, setFormData] = useState({
    numeroMatricula: initialNumeroMatricula,
    nomeCompleto: editingStudent?.nomeCompleto || '',
    fotografia: editingStudent?.fotografia || editingStudent?.foto || '',
    dataNascimento: editingStudent?.dataNascimento || '2008-05-14',
    sexo: (editingStudent?.sexo || editingStudent?.genero || 'M') as 'M' | 'F',
    documentoIdentificacao:
      editingStudent?.documentoIdentificacao || editingStudent?.bi || '',
    tipoDocumento: editingStudent?.tipoDocumento || ('BI' as 'BI' | 'Cédula' | 'Passaporte' | 'Outro'),
    nacionalidade: editingStudent?.nacionalidade || 'Angolana',
    morada: editingStudent?.morada || '',
    municipio: editingStudent?.municipio || 'Maianga',
    provincia: editingStudent?.provincia || 'Luanda',
    telefone: editingStudent?.telefone || '+244 ',
    email: editingStudent?.email || '',
    estado: (editingStudent?.estado || 'activo') as StudentState,
    escolaNome: editingStudent?.escolaNome || selectedSchoolName,
    anoLectivo: editingStudent?.anoLectivo || '2025/2026',
    classe: editingStudent?.classe || '10ª Classe',
    turmaId: editingStudent?.turmaId || TURMAS_INICIAIS[0].id,
    selectedGuardianId: guardians[0]?.id || '',
    observacoes: editingStudent?.observacoes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.nomeCompleto.trim()) {
      errs.nomeCompleto = 'Nome completo do aluno é obrigatório.';
    }
    if (!formData.documentoIdentificacao.trim()) {
      errs.documentoIdentificacao = 'Documento de identificação (BI/Cédula) é obrigatório.';
    } else if (formData.documentoIdentificacao.trim().length < 8) {
      errs.documentoIdentificacao = 'Documento inválido (ex: 006458921LA042).';
    }
    if (!formData.morada.trim()) {
      errs.morada = 'Morada residencial é obrigatória.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const turmaSelecionada =
      TURMAS_INICIAIS.find((t) => t.id === formData.turmaId) || TURMAS_INICIAIS[0];

    const associatedGuardian = guardians.find((g) => g.id === formData.selectedGuardianId);

    const studentToSave: Student = {
      id: editingStudent?.id || `alu-${Date.now()}`,
      numeroMatricula: formData.numeroMatricula,
      processo: formData.numeroMatricula.replace('MAT', 'EG'),
      nomeCompleto: formData.nomeCompleto,
      fotografia: formData.fotografia || undefined,
      dataNascimento: formData.dataNascimento,
      sexo: formData.sexo,
      genero: formData.sexo,
      documentoIdentificacao: formData.documentoIdentificacao.toUpperCase(),
      bi: formData.documentoIdentificacao.toUpperCase(),
      tipoDocumento: formData.tipoDocumento,
      nacionalidade: formData.nacionalidade,
      morada: formData.morada,
      municipio: formData.municipio,
      provincia: formData.provincia,
      contactos: {
        telefone: formData.telefone,
        email: formData.email || undefined,
      },
      telefone: formData.telefone,
      email: formData.email || undefined,
      estado: formData.estado,
      escolaId:
        editingStudent?.escolaId ||
        schools?.find((s) => s.nome.trim().toLowerCase() === formData.escolaNome.trim().toLowerCase())?.id ||
        'esc-001',
      escolaNome: formData.escolaNome,
      anoLectivo: formData.anoLectivo,
      classe: formData.classe || `${turmaSelecionada.nome.split(' ')[0]} ${turmaSelecionada.nome.split(' ')[1]}`,
      turmaId: turmaSelecionada.id,
      turmaNome: turmaSelecionada.nome,
      curso: turmaSelecionada.curso,
      encarregadoNome: associatedGuardian
        ? `${associatedGuardian.nome} (${associatedGuardian.grauParentescoPrincipal})`
        : editingStudent?.encarregadoNome || 'Encarregado não associado',
      encarregadoContacto: associatedGuardian
        ? associatedGuardian.telefone
        : editingStudent?.encarregadoContacto || '+244 ',
      statusPropina: editingStudent?.statusPropina || 'em_dia',
      mediaGeral: editingStudent?.mediaGeral || 15.0,
      dataCadastro: editingStudent?.dataCadastro || new Date().toISOString().split('T')[0],
      observacoes: formData.observacoes || undefined,
      foto: formData.fotografia || undefined,
    };

    onAddStudent(studentToSave, formData.selectedGuardianId);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingStudent ? 'Editar Ficha do Aluno' : 'Cadastro Geral de Aluno'}
      subtitle={`Registo discente homologado · ${formData.escolaNome}`}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Identificação Primária */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Nome Completo do Aluno"
              placeholder="Ex: Esperança Neide Kiala"
              value={formData.nomeCompleto}
              onChange={(e) => setFormData({ ...formData, nomeCompleto: e.target.value })}
              error={errors.nomeCompleto}
            />
          </div>

          <div>
            <Input
              label="Número de Matrícula"
              value={formData.numeroMatricula}
              onChange={(e) => setFormData({ ...formData, numeroMatricula: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Input
              label="Documento de Identificação"
              placeholder="Ex: 006458921LA042"
              value={formData.documentoIdentificacao}
              onChange={(e) => setFormData({ ...formData, documentoIdentificacao: e.target.value })}
              error={errors.documentoIdentificacao}
            />
          </div>

          <div>
            <Select
              label="Tipo de Documento"
              value={formData.tipoDocumento}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  tipoDocumento: e.target.value as 'BI' | 'Cédula' | 'Passaporte' | 'Outro',
                })
              }
            >
              <option value="BI">Bilhete de Identidade (BI)</option>
              <option value="Cédula">Cédula Pessoal</option>
              <option value="Passaporte">Passaporte</option>
              <option value="Outro">Outro Documento</option>
            </Select>
          </div>

          <div>
            <Input
              label="Data de Nascimento"
              type="date"
              value={formData.dataNascimento}
              onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Select
              label="Sexo / Género"
              value={formData.sexo}
              onChange={(e) => setFormData({ ...formData, sexo: e.target.value as 'M' | 'F' })}
            >
              <option value="F">Feminino (F)</option>
              <option value="M">Masculino (M)</option>
            </Select>
          </div>

          <div>
            <Input
              label="Nacionalidade"
              value={formData.nacionalidade}
              onChange={(e) => setFormData({ ...formData, nacionalidade: e.target.value })}
            />
          </div>

          <div>
            <Select
              label="Estado Operacional"
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value as StudentState })}
            >
              <option value="activo">Activo</option>
              <option value="inscrito">Inscrito</option>
              <option value="pre_inscrito">Pré inscrito</option>
              <option value="suspenso">Suspenso</option>
              <option value="transferido">Transferido</option>
              <option value="concluido">Concluído</option>
              <option value="inactivo">Inactivo</option>
            </Select>
          </div>
        </div>

        {/* Localização e Contactos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Morada Residencial"
              placeholder="Ex: Rua Comandante Gika, Nº 14, Bairro Alvalade"
              value={formData.morada}
              onChange={(e) => setFormData({ ...formData, morada: e.target.value })}
              error={errors.morada}
            />
          </div>

          <div>
            <Select
              label="Província"
              value={formData.provincia}
              onChange={(e) => setFormData({ ...formData, provincia: e.target.value })}
            >
              <option value="Luanda">Luanda</option>
              <option value="Benguela">Benguela</option>
              <option value="Huambo">Huambo</option>
              <option value="Huíla">Huíla</option>
              <option value="Cuanza Sul">Cuanza Sul</option>
              <option value="Cabinda">Cabinda</option>
              <option value="Uíge">Uíge</option>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Telefone do Estudante"
            placeholder="Ex: +244 923 881 002"
            value={formData.telefone}
            onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
          />

          <Input
            label="Correio Electrónico (Opcional)"
            placeholder="Ex: aluno@edugest.ao"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        {/* Dados Académicos & Escola */}
        <div className="pt-2 border-t border-[#E2E8F0]">
          <span className="text-xs font-bold text-[#012041] block mb-2 uppercase tracking-wide">
            Enquadramento Académico & Turma
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Input
                label="Instituição de Ensino"
                value={formData.escolaNome}
                disabled
              />
            </div>

            <div>
              <Input
                label="Ano Lectivo"
                value={formData.anoLectivo}
                onChange={(e) => setFormData({ ...formData, anoLectivo: e.target.value })}
              />
            </div>

            <div>
              <Select
                label="Classe Curricular"
                value={formData.classe}
                onChange={(e) => setFormData({ ...formData, classe: e.target.value })}
              >
                <option value="10ª Classe">10ª Classe</option>
                <option value="11ª Classe">11ª Classe</option>
                <option value="12ª Classe">12ª Classe</option>
                <option value="13ª Classe">13ª Classe</option>
                <option value="7ª Classe">7ª Classe</option>
                <option value="8ª Classe">8ª Classe</option>
                <option value="9ª Classe">9ª Classe</option>
                <option value="Iniciação">Iniciação</option>
                <option value="1ª Classe">1ª Classe</option>
                <option value="2ª Classe">2ª Classe</option>
                <option value="3ª Classe">3ª Classe</option>
                <option value="4ª Classe">4ª Classe</option>
                <option value="5ª Classe">5ª Classe</option>
                <option value="6ª Classe">6ª Classe</option>
              </Select>
            </div>

            <div>
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
          </div>
        </div>

        {/* Encarregado de Educação */}
        <div className="pt-2 border-t border-[#E2E8F0]">
          <span className="text-xs font-bold text-[#012041] block mb-2 uppercase tracking-wide">
            Associação com Encarregado de Educação
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Selecione o Encarregado Principal"
              value={formData.selectedGuardianId}
              onChange={(e) => setFormData({ ...formData, selectedGuardianId: e.target.value })}
              hint="Selecione um encarregado cadastrado no sistema"
            >
              {guardians.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nome} · {g.grauParentescoPrincipal} ({g.telefone})
                </option>
              ))}
            </Select>

            <Input
              label="URL da Fotografia (Opcional)"
              placeholder="https://..."
              value={formData.fotografia}
              onChange={(e) => setFormData({ ...formData, fotografia: e.target.value })}
              hint="Cole o link da foto ou utilize a imagem padrão"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-4 border-t border-[#E2E8F0]">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" size="sm">
            {editingStudent ? 'Salvar Alterações' : 'Concluir Cadastro'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
