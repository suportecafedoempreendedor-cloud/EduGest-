import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input, Select } from '../ui/Input';
import { Button } from '../ui/Button';
import { Guardian, Student, GrauParentesco } from '../../types';

interface NewGuardianModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onAddGuardian: (
    newGuardian: Guardian,
    selectedStudentIds: { studentId: string; grau: GrauParentesco; isPrincipal: boolean }[]
  ) => void;
  editingGuardian?: Guardian | null;
}

export const NewGuardianModal: React.FC<NewGuardianModalProps> = ({
  isOpen,
  onClose,
  students,
  onAddGuardian,
  editingGuardian,
}) => {
  const [formData, setFormData] = useState({
    nome: editingGuardian?.nome || '',
    documento: editingGuardian?.documento || '',
    tipoDocumento: editingGuardian?.tipoDocumento || ('BI' as 'BI' | 'Passaporte' | 'Outro'),
    telefone: editingGuardian?.telefone || '+244 ',
    telefoneAlternativo: editingGuardian?.telefoneAlternativo || '',
    email: editingGuardian?.email || '',
    morada: editingGuardian?.morada || '',
    profissao: editingGuardian?.profissao || '',
    grauParentescoPrincipal:
      editingGuardian?.grauParentescoPrincipal || ('Pai' as GrauParentesco),
  });

  // Multiple students association state
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentGraus, setStudentGraus] = useState<Record<string, GrauParentesco>>({});
  const [studentPrincipals, setStudentPrincipals] = useState<Record<string, boolean>>({});

  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleStudentSelection = (stId: string) => {
    if (selectedStudentIds.includes(stId)) {
      setSelectedStudentIds(selectedStudentIds.filter((id) => id !== stId));
    } else {
      setSelectedStudentIds([...selectedStudentIds, stId]);
      if (!studentGraus[stId]) {
        setStudentGraus({ ...studentGraus, [stId]: formData.grauParentescoPrincipal });
      }
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.nome.trim()) errs.nome = 'Nome do encarregado é obrigatório.';
    if (!formData.documento.trim()) errs.documento = 'Número do BI ou documento é obrigatório.';
    if (!formData.telefone.trim() || formData.telefone.length < 8) {
      errs.telefone = 'Contacto telefónico válido é obrigatório.';
    }
    if (formData.email && !formData.email.includes('@')) {
      errs.email = 'Insira um correio electrónico válido.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const guardianToSave: Guardian = {
      id: editingGuardian?.id || `enc-${Date.now()}`,
      nome: formData.nome,
      documento: formData.documento.toUpperCase(),
      tipoDocumento: formData.tipoDocumento,
      telefone: formData.telefone,
      telefoneAlternativo: formData.telefoneAlternativo || undefined,
      email: formData.email,
      morada: formData.morada || 'Luanda',
      profissao: formData.profissao || 'Não especificada',
      grauParentescoPrincipal: formData.grauParentescoPrincipal,
      dataCadastro: editingGuardian?.dataCadastro || new Date().toISOString().split('T')[0],
    };

    const relations = selectedStudentIds.map((stId) => ({
      studentId: stId,
      grau: studentGraus[stId] || formData.grauParentescoPrincipal,
      isPrincipal: studentPrincipals[stId] ?? true,
    }));

    onAddGuardian(guardianToSave, relations);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingGuardian ? 'Editar Encarregado de Educação' : 'Novo Encarregado de Educação'}
      subtitle="Registo de tutor legal e vínculo a um ou múltiplos educandos (guardian_students)"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome Completo do Encarregado"
          placeholder="Ex: Dr. Manuel Domingos Kiala"
          value={formData.nome}
          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          error={errors.nome}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Número de Identificação (BI / Passaporte)"
            placeholder="Ex: 002341902LA011"
            value={formData.documento}
            onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
            error={errors.documento}
          />

          <Select
            label="Tipo de Documento"
            value={formData.tipoDocumento}
            onChange={(e) =>
              setFormData({
                ...formData,
                tipoDocumento: e.target.value as 'BI' | 'Passaporte' | 'Outro',
              })
            }
          >
            <option value="BI">Bilhete de Identidade (BI)</option>
            <option value="Passaporte">Passaporte Nacional / Estrangeiro</option>
            <option value="Outro">Outro Documento</option>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Telefone Principal"
            placeholder="Ex: +244 923 456 781"
            value={formData.telefone}
            onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
            error={errors.telefone}
          />

          <Input
            label="Telefone Alternativo (Opcional)"
            placeholder="Ex: +244 912 300 450"
            value={formData.telefoneAlternativo}
            onChange={(e) => setFormData({ ...formData, telefoneAlternativo: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Correio Electrónico"
            type="email"
            placeholder="Ex: m.kiala@angola-law.co.ao"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
          />

          <Input
            label="Profissão / Ocupação"
            placeholder="Ex: Advogado Forense / Engenheiro"
            value={formData.profissao}
            onChange={(e) => setFormData({ ...formData, profissao: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Morada Residencial"
            placeholder="Ex: Rua Comandante Gika, Nº 14, Alvalade"
            value={formData.morada}
            onChange={(e) => setFormData({ ...formData, morada: e.target.value })}
          />

          <Select
            label="Grau de Parentesco Padrão"
            value={formData.grauParentescoPrincipal}
            onChange={(e) =>
              setFormData({
                ...formData,
                grauParentescoPrincipal: e.target.value as GrauParentesco,
              })
            }
          >
            <option value="Pai">Pai</option>
            <option value="Mãe">Mãe</option>
            <option value="Tio(a)">Tio(a)</option>
            <option value="Avô(ó)">Avô(ó)</option>
            <option value="Irmão/ã">Irmão/ã</option>
            <option value="Tutor Legal">Tutor Legal</option>
            <option value="Outro">Outro</option>
          </Select>
        </div>

        {/* Association with Multiple Students */}
        <div className="pt-3 border-t border-[#E2E8F0] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#012041] uppercase tracking-wide">
              Associar Educandos ao Encarregado (`guardian_students`)
            </span>
            <span className="text-[11px] text-[#015FC4] font-medium">
              {selectedStudentIds.length} educando(s) selecionado(s)
            </span>
          </div>

          <p className="text-[11px] text-[#41515D]">
            Um encarregado pode ter múltiplos filhos ou educandos associados na mesma instituição.
          </p>

          <div className="max-h-48 overflow-y-auto space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50/50">
            {students.map((st) => {
              const isSelected = selectedStudentIds.includes(st.id);
              return (
                <div
                  key={st.id}
                  className={`p-2.5 rounded-lg border text-xs transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-200 text-[#012041]'
                      : 'bg-white border-slate-200 text-[#41515D]'
                  }`}
                >
                  <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleStudentSelection(st.id)}
                      className="rounded text-[#015FC4] focus:ring-[#015FC4] w-4 h-4 shrink-0"
                    />
                    <div className="min-w-0 truncate">
                      <strong className="text-[#012041] block truncate">{st.nomeCompleto}</strong>
                      <span className="text-[11px] text-[#41515D]">
                        {st.numeroMatricula || st.processo} · {st.classe} ({st.turmaNome})
                      </span>
                    </div>
                  </label>

                  {isSelected && (
                    <div className="flex items-center gap-2 pl-6 sm:pl-0 shrink-0">
                      <select
                        value={studentGraus[st.id] || formData.grauParentescoPrincipal}
                        onChange={(e) =>
                          setStudentGraus({
                            ...studentGraus,
                            [st.id]: e.target.value as GrauParentesco,
                          })
                        }
                        className="text-xs border border-slate-200 rounded px-2 py-1 bg-white font-medium text-[#012041]"
                      >
                        <option value="Pai">Pai</option>
                        <option value="Mãe">Mãe</option>
                        <option value="Tio(a)">Tio(a)</option>
                        <option value="Avô(ó)">Avô(ó)</option>
                        <option value="Irmão/ã">Irmão/ã</option>
                        <option value="Tutor Legal">Tutor Legal</option>
                      </select>

                      <label className="flex items-center gap-1 text-[11px] font-semibold text-[#015FC4] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={studentPrincipals[st.id] ?? true}
                          onChange={(e) =>
                            setStudentPrincipals({
                              ...studentPrincipals,
                              [st.id]: e.target.checked,
                            })
                          }
                          className="rounded text-[#015FC4] w-3.5 h-3.5"
                        />
                        Principal
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-4 border-t border-[#E2E8F0]">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" size="sm">
            {editingGuardian ? 'Salvar Alterações' : 'Cadastrar Encarregado'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
