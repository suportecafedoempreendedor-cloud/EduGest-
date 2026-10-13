import React, { useState } from 'react';
import { CreditCard, QrCode, Smartphone, Check, AlertCircle, Sparkles } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Select, Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Student, PaymentItemType, PaymentReference, OfficialReceipt } from '../../types';

interface NewPaymentReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  initialStudentId?: string;
  guardianNome: string;
  guardianBi: string;
  escolaId: string;
  escolaNome: string;
  escolaNif: string;
  onGenerateReference: (ref: PaymentReference) => void;
  onPayImmediately: (receipt: OfficialReceipt, referenceId?: string) => void;
}

export const NewPaymentReferenceModal: React.FC<NewPaymentReferenceModalProps> = ({
  isOpen,
  onClose,
  students,
  initialStudentId,
  guardianNome,
  guardianBi,
  escolaId,
  escolaNome,
  escolaNif,
  onGenerateReference,
  onPayImmediately,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudentId || students[0]?.id || ''
  );
  const [tipo, setTipo] = useState<PaymentItemType>('propina');
  const [mesReferencia, setMesReferencia] = useState('Março 2026');
  const [descricao, setDescricao] = useState('');
  const [valorKz, setValorKz] = useState<number>(38500);
  const [emolumentoTipo, setEmolumentoTipo] = useState('Declaração com Notas');
  const [outroTipo, setOutroTipo] = useState('Uniforme Oficial');

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  // Adjust defaults when type changes
  const handleTypeChange = (newTipo: PaymentItemType) => {
    setTipo(newTipo);
    if (newTipo === 'propina') {
      setValorKz(38500);
      setDescricao(`Propina do Mês de ${mesReferencia}`);
    } else if (newTipo === 'matricula') {
      setValorKz(25000);
      setDescricao('Confirmação de Matrícula para o Ano Lectivo 2026/2027');
    } else if (newTipo === 'emolumentos') {
      setValorKz(3500);
      setDescricao(`Emissão de ${emolumentoTipo}`);
    } else if (newTipo === 'multas') {
      setValorKz(3850);
      setDescricao('Multa de Mora (10%) por Atraso de Pagamento');
    } else {
      setValorKz(18000);
      setDescricao(`Aquisição de ${outroTipo}`);
    }
  };

  const handleGenerateOnly = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    // Generate random realistic 9-digit Multicaixa reference: 9XX XXX XXX
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const refCode = `923 ${randomSuffix.toString().substring(0, 3)} ${randomSuffix.toString().substring(3, 6)}`;

    const newRef: PaymentReference = {
      id: `ref-${Date.now()}`,
      entidade: '00192',
      referencia: refCode,
      valorKz,
      tipo,
      descricao: descricao || `${tipo.toUpperCase()} · ${selectedStudent.nomeCompleto}`,
      studentId: selectedStudent.id,
      studentNome: selectedStudent.nomeCompleto,
      dataGeracao: new Date().toISOString().substring(0, 10),
      dataValidade: '2026-04-15',
      estado: 'pendente',
    };

    onGenerateReference(newRef);
    onClose();
  };

  const handleSimulatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const receiptNum = `RC-${new Date().getFullYear()}/${Math.floor(10000 + Math.random() * 90000)}`;
    const hash = `${Math.random().toString(36).substring(2, 10)}-${selectedStudent.id}-agt-cert`;

    const newReceipt: OfficialReceipt = {
      id: `rec-${Date.now()}`,
      numeroRecibo: receiptNum,
      escolaId,
      escolaNome,
      escolaNif,
      studentId: selectedStudent.id,
      studentNome: selectedStudent.nomeCompleto,
      studentProcesso: selectedStudent.processo || selectedStudent.numeroMatricula,
      studentTurma: selectedStudent.turmaNome,
      guardianNome,
      guardianBi,
      dataEmissao: new Date().toISOString().replace('T', ' ').substring(0, 16),
      tipoItem: tipo,
      descricao: descricao || `${tipo.toUpperCase()} · ${selectedStudent.nomeCompleto}`,
      mesReferencia: tipo === 'propina' ? mesReferencia : undefined,
      valorKz,
      metodoPagamento: 'Multicaixa Express (Simulação Imediata)',
      referenciaOperacao: `MCX-${Date.now().toString().substring(5)}`,
      hashCertificacao: hash,
      operadorSecretaria: 'Portal do Encarregado (Auto-Serviço)',
    };

    onPayImmediately(newReceipt);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Efectuar Pagamento Escolar"
      subtitle="Gere referência Multicaixa para pagamento bancário ou liquide instantaneamente"
      maxWidth="lg"
    >
      <form className="space-y-4">
        {/* Educando Selector */}
        <Select
          label="Educando Beneficiário *"
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          required
        >
          {students.map((st) => (
            <option key={st.id} value={st.id}>
              {st.nomeCompleto} · {st.turmaNome} (Processo: {st.numeroMatricula})
            </option>
          ))}
        </Select>

        {/* Categoria Selector */}
        <div>
          <label className="text-xs font-semibold text-[#012041] block mb-2">
            Tipo de Encargo Escolar *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: 'propina' as PaymentItemType, label: 'Propina' },
              { id: 'matricula' as PaymentItemType, label: 'Matrícula' },
              { id: 'emolumentos' as PaymentItemType, label: 'Emolumentos' },
              { id: 'multas' as PaymentItemType, label: 'Multas' },
              { id: 'outros' as PaymentItemType, label: 'Outros' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleTypeChange(cat.id)}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer text-center ${
                  tipo === cat.id
                    ? 'bg-[#012041] text-white border-[#012041] shadow-xs'
                    : 'bg-white text-[#41515D] border-[#CBD5E1] hover:bg-slate-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Fields based on Type */}
        {tipo === 'propina' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Mês de Referência *"
              value={mesReferencia}
              onChange={(e) => {
                setMesReferencia(e.target.value);
                setDescricao(`Propina do Mês de ${e.target.value}`);
              }}
            >
              <option value="Janeiro 2026">Janeiro 2026</option>
              <option value="Fevereiro 2026">Fevereiro 2026</option>
              <option value="Março 2026">Março 2026 (Mês Corrente)</option>
              <option value="Abril 2026">Abril 2026</option>
              <option value="Maio 2026">Maio 2026</option>
              <option value="Junho 2026">Junho 2026</option>
              <option value="Julho 2026">Julho 2026</option>
            </Select>

            <Input
              label="Valor da Propina (Kz) *"
              type="number"
              value={valorKz}
              onChange={(e) => setValorKz(Number(e.target.value))}
              required
            />
          </div>
        )}

        {tipo === 'matricula' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Finalidade da Taxa *"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            >
              <option value="Confirmação de Matrícula para o Ano Lectivo 2026/2027">
                Confirmação de Matrícula (2026/2027)
              </option>
              <option value="Inscrição de Novo Educando (7ª Classe)">
                Inscrição de Novo Educando (7ª Classe)
              </option>
              <option value="Seguro Escolar Obrigatório Anual">
                Seguro Escolar Obrigatório Anual
              </option>
            </Select>

            <Input
              label="Valor Fixado (Kz) *"
              type="number"
              value={valorKz}
              onChange={(e) => setValorKz(Number(e.target.value))}
              required
            />
          </div>
        )}

        {tipo === 'emolumentos' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Tipo de Documento / Emolumento *"
              value={emolumentoTipo}
              onChange={(e) => {
                setEmolumentoTipo(e.target.value);
                setDescricao(`Emissão de ${e.target.value}`);
                if (e.target.value.includes('Certificado')) setValorKz(6500);
                else if (e.target.value.includes('Cartão')) setValorKz(2500);
                else setValorKz(3500);
              }}
            >
              <option value="Declaração com Notas">Declaração com Notas (3.500 Kz)</option>
              <option value="Declaração sem Notas">Declaração sem Notas (2.500 Kz)</option>
              <option value="Certificado de Habilitações">Certificado de Habilitações (6.500 Kz)</option>
              <option value="Segunda Via de Cartão de Estudante">2ª Via de Cartão de Estudante (2.500 Kz)</option>
            </Select>

            <Input
              label="Valor do Emolumento (Kz) *"
              type="number"
              value={valorKz}
              onChange={(e) => setValorKz(Number(e.target.value))}
              required
            />
          </div>
        )}

        {tipo === 'multas' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Motivo da Penalização *"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            >
              <option value="Multa de Mora (10%) por Atraso de Pagamento de Mensalidade">
                Multa de Mora (10%) · Atraso de Mensalidade
              </option>
              <option value="Taxa de Regularização Fora de Prazo">
                Taxa de Regularização Fora de Prazo (15%)
              </option>
            </Select>

            <Input
              label="Valor da Multa (Kz) *"
              type="number"
              value={valorKz}
              onChange={(e) => setValorKz(Number(e.target.value))}
              required
            />
          </div>
        )}

        {tipo === 'outros' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Item / Serviço *"
              value={outroTipo}
              onChange={(e) => {
                setOutroTipo(e.target.value);
                setDescricao(`Aquisição de ${e.target.value}`);
                if (e.target.value.includes('Transporte')) setValorKz(28000);
                else if (e.target.value.includes('Robótica')) setValorKz(15000);
                else setValorKz(18000);
              }}
            >
              <option value="Uniforme Oficial">Kit de Uniforme Oficial (18.000 Kz)</option>
              <option value="Transporte Escolar Mensal">Transporte Escolar Mensal (28.000 Kz)</option>
              <option value="Clube de Robótica & Programação">Clube de Robótica (15.000 Kz)</option>
              <option value="Visita de Estudo ao Museu de História">Visita de Estudo (5.000 Kz)</option>
            </Select>

            <Input
              label="Valor Total (Kz) *"
              type="number"
              value={valorKz}
              onChange={(e) => setValorKz(Number(e.target.value))}
              required
            />
          </div>
        )}

        {/* Summary Card */}
        <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-xl flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-[#012041] block">
              Entidade Multicaixa: <span className="font-mono text-[#015FC4]">00192</span>
            </span>
            <span className="text-[#41515D]">
              Beneficiário: {escolaNome} · NIF: {escolaNif}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase block font-bold">Total a Liquidar</span>
            <span className="text-base font-bold font-mono text-[#012041]">
              {valorKz.toLocaleString('pt-AO')} Kz
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
          <Button type="button" variant="ghost" onClick={onClose} className="w-full sm:w-auto">
            Cancelar
          </Button>

          <Button
            type="button"
            variant="secondary"
            icon={<Smartphone className="w-4 h-4" />}
            onClick={handleGenerateOnly}
            className="w-full sm:w-auto"
          >
            Gerar Apenas Referência
          </Button>

          <Button
            type="button"
            variant="primary"
            icon={<CreditCard className="w-4 h-4" />}
            onClick={handleSimulatePayment}
            className="w-full sm:w-auto bg-[#015FC4]"
          >
            Pagar com Multicaixa Express
          </Button>
        </div>
      </form>
    </Modal>
  );
};
