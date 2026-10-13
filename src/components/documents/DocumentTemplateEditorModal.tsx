import React, { useState } from 'react';
import {
  FileText,
  Save,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle2,
  Building2,
  Stamp,
  Sliders,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { SchoolDocumentTemplate } from '../../types/documentsReports';

interface DocumentTemplateEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: SchoolDocumentTemplate | null;
  onSaveTemplate: (updated: SchoolDocumentTemplate) => void;
  schoolName: string;
}

export const DocumentTemplateEditorModal: React.FC<DocumentTemplateEditorModalProps> = ({
  isOpen,
  onClose,
  template,
  onSaveTemplate,
  schoolName,
}) => {
  if (!template) return null;

  const [form, setForm] = useState<SchoolDocumentTemplate>({ ...template });
  const [activeTab, setActiveTab] = useState<'geral' | 'cabecalho' | 'corpo' | 'assinaturas'>('geral');

  const insertVariable = (variableName: string) => {
    const placeholder = `{${variableName}}`;
    setForm((prev) => ({
      ...prev,
      textoCorpo: prev.textoCorpo + ' ' + placeholder,
    }));
  };

  const handleSave = () => {
    onSaveTemplate({
      ...form,
      ultimaActualizacao: new Date().toISOString().split('T')[0],
    });
    onClose();
  };

  const availableVariables = [
    { label: 'Nome do Aluno', code: 'NOME_ALUNO' },
    { label: 'Processo', code: 'PROCESSO' },
    { label: 'B.I. / Documento', code: 'NUMERO_DOCUMENTO' },
    { label: 'Tipo Doc (BI)', code: 'TIPO_DOCUMENTO' },
    { label: 'Data Nascimento', code: 'DATA_NASCIMENTO' },
    { label: 'Naturalidade', code: 'NATURALIDADE' },
    { label: 'Província', code: 'PROVINCIA' },
    { label: 'Classe', code: 'CLASSE' },
    { label: 'Turma', code: 'TURMA' },
    { label: 'Ano Lectivo', code: 'ANO_LECTIVO' },
    { label: 'Curso', code: 'CURSO' },
    { label: 'Período', code: 'PERIODO' },
    { label: 'Finalidade', code: 'FINALIDADE' },
    { label: 'Média Global', code: 'MEDIA_GLOBAL' },
    { label: 'Situação Académica', code: 'SITUACAO_ACADEMICA' },
    { label: 'Encarregado', code: 'ENCARREGADO_NOME' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Configurar Template Oficial · ${template.nomeTemplate}`}
      maxWidth="2xl"
    >
      <div className="space-y-6 text-sm">
        {/* Banner contextual */}
        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900">
          <Building2 className="w-5 h-5 text-blue-700 shrink-0" />
          <div>
            <p className="font-semibold text-xs uppercase tracking-wide text-blue-800">
              Personalização de Documentos da Escola: {schoolName}
            </p>
            <p className="text-xs text-blue-700">
              As alterações feitas neste modelo aplicam-se a todos os novos documentos emitidos por esta escola.
            </p>
          </div>
        </div>

        {/* Abas de Configuração */}
        <div className="flex border-b border-slate-200 gap-2">
          <button
            onClick={() => setActiveTab('geral')}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'geral'
                ? 'border-[#015FC4] text-[#015FC4]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Configurações Gerais
          </button>
          <button
            onClick={() => setActiveTab('cabecalho')}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'cabecalho'
                ? 'border-[#015FC4] text-[#015FC4]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Cabeçalho & Timbre Oficial
          </button>
          <button
            onClick={() => setActiveTab('corpo')}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'corpo'
                ? 'border-[#015FC4] text-[#015FC4]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Texto do Corpo & Placeholders
          </button>
          <button
            onClick={() => setActiveTab('assinaturas')}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'assinaturas'
                ? 'border-[#015FC4] text-[#015FC4]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Assinaturas & Validação
          </button>
        </div>

        {/* Conteúdo da Aba */}
        {activeTab === 'geral' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nome de Identificação do Template
              </label>
              <input
                type="text"
                value={form.nomeTemplate}
                onChange={(e) => setForm({ ...form, nomeTemplate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#015FC4]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Prefixo de Numeração Oficial
                </label>
                <input
                  type="text"
                  value={form.codigoPrefixo}
                  onChange={(e) => setForm({ ...form, codigoPrefixo: e.target.value })}
                  placeholder="Ex: DECL-MAT, BOL, REC"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Cor Primária de Timbre
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.corPrimaria}
                    onChange={(e) => setForm({ ...form, corPrimaria: e.target.value })}
                    className="w-10 h-10 border border-slate-300 rounded cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={form.corPrimaria}
                    onChange={(e) => setForm({ ...form, corPrimaria: e.target.value })}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 space-y-3">
              <h4 className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
                Elementos Gráficos e Selos
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={form.mostrarSeloBranco}
                    onChange={(e) => setForm({ ...form, mostrarSeloBranco: e.target.checked })}
                    className="rounded text-[#015FC4]"
                  />
                  <span className="text-xs font-medium text-slate-700">Selo Branco Institucional</span>
                </label>

                <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={form.mostrarMarcaDAgua}
                    onChange={(e) => setForm({ ...form, mostrarMarcaDAgua: e.target.checked })}
                    className="rounded text-[#015FC4]"
                  />
                  <span className="text-xs font-medium text-slate-700">Marca d'Água Central</span>
                </label>

                <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={form.mostrarQrCodeVerificacao}
                    onChange={(e) =>
                      setForm({ ...form, mostrarQrCodeVerificacao: e.target.checked })
                    }
                    className="rounded text-[#015FC4]"
                  />
                  <span className="text-xs font-medium text-slate-700">QR Code de Autenticidade</span>
                </label>
              </div>

              {form.mostrarMarcaDAgua && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Texto da Marca d'Água
                  </label>
                  <input
                    type="text"
                    value={form.marcaDAguaTexto}
                    onChange={(e) => setForm({ ...form, marcaDAguaTexto: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'cabecalho' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Ministério Competente
              </label>
              <input
                type="text"
                value={form.ministerio}
                onChange={(e) => setForm({ ...form, ministerio: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Governo Provincial / Direcção Municipal
              </label>
              <input
                type="text"
                value={form.governoProvincial}
                onChange={(e) => setForm({ ...form, governoProvincial: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Subtítulo ou Tipologia de Ensino
              </label>
              <input
                type="text"
                value={form.subtituloCabecalho}
                onChange={(e) => setForm({ ...form, subtituloCabecalho: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Decreto ou Autorização Oficial de Funcionamento (MED)
              </label>
              <input
                type="text"
                value={form.numeroDecretoAutorizacao}
                onChange={(e) => setForm({ ...form, numeroDecretoAutorizacao: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono text-xs"
              />
            </div>
          </div>
        )}

        {activeTab === 'corpo' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-700">
                  Texto Principal da Declaração / Termo
                </label>
                <span className="text-[11px] text-slate-400">
                  Clique nas etiquetas abaixo para inserir variáveis automáticas
                </span>
              </div>
              <textarea
                rows={8}
                value={form.textoCorpo}
                onChange={(e) => setForm({ ...form, textoCorpo: e.target.value })}
                className="w-full p-3 border border-slate-300 rounded-lg text-sm font-serif leading-relaxed focus:ring-2 focus:ring-[#015FC4]"
              />
            </div>

            {/* Banco de Placeholders */}
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-2">
                Variáveis Disponíveis para Preenchimento Automático:
              </p>
              <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                {availableVariables.map((v) => (
                  <button
                    key={v.code}
                    type="button"
                    onClick={() => insertVariable(v.code)}
                    className="px-2 py-1 bg-white border border-slate-200 hover:border-[#015FC4] hover:bg-blue-50 text-slate-700 hover:text-[#015FC4] rounded text-xs transition-colors flex items-center gap-1 font-mono"
                  >
                    <span>+{v.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'assinaturas' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 space-y-3">
                <h4 className="font-semibold text-xs uppercase text-slate-600">
                  Responsável 1 (Direcção Geral)
                </h4>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    value={form.nomeDirector}
                    onChange={(e) => setForm({ ...form, nomeDirector: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Cargo / Função</label>
                  <input
                    type="text"
                    value={form.cargoDirector}
                    onChange={(e) => setForm({ ...form, cargoDirector: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-sm"
                  />
                </div>
              </div>

              <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 space-y-3">
                <h4 className="font-semibold text-xs uppercase text-slate-600">
                  Responsável 2 (Secretaria / Pedagógico)
                </h4>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    value={form.nomeSecretario}
                    onChange={(e) => setForm({ ...form, nomeSecretario: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Cargo / Função</label>
                  <input
                    type="text"
                    value={form.cargoSecretario}
                    onChange={(e) => setForm({ ...form, cargoSecretario: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Termo de Autenticidade e Menção Legal
              </label>
              <input
                type="text"
                value={form.termoAutenticidade}
                onChange={(e) => setForm({ ...form, termoAutenticidade: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Texto de Rodapé (Morada, Contactos e NIF)
              </label>
              <input
                type="text"
                value={form.rodapeTexto}
                onChange={(e) => setForm({ ...form, rodapeTexto: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>
        )}

        {/* Rodapé com botões de acção */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<RotateCcw className="w-4 h-4" />}
              onClick={() => setForm({ ...template })}
            >
              Restaurar Padrão
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Save className="w-4 h-4" />}
              onClick={handleSave}
            >
              Guardar Template
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
