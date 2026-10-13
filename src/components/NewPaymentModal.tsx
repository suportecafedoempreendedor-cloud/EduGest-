import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Input, Select } from './ui/Input';
import { Button } from './ui/Button';
import { Pagamento, Student } from '../types';

interface NewPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onAddPayment: (newPayment: Pagamento) => void;
}

export const NewPaymentModal: React.FC<NewPaymentModalProps> = ({
  isOpen,
  onClose,
  students,
  onAddPayment,
}) => {
  const [alunoId, setAlunoId] = useState<string>(students[0]?.id || '');
  const [mesReferencia, setMesReferencia] = useState<string>('Março 2025');
  const [valorKz, setValorKz] = useState<number>(38500);
  const [metodo, setMetodo] = useState<Pagamento['metodo']>('Multicaixa Express');
  const [referencia, setReferencia] = useState<string>('MCX-' + Math.floor(100000 + Math.random() * 900000));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const aluno = students.find((s) => s.id === alunoId) || students[0];
    const randomReceipt = Math.floor(10000 + Math.random() * 90000);

    const newPayment: Pagamento = {
      id: `pag-${Date.now()}`,
      reciboNumero: `RC-2025/${randomReceipt}`,
      alunoId: aluno.id,
      alunoNome: aluno.nomeCompleto,
      turmaNome: aluno.turmaNome,
      mesReferencia,
      valorKz: Number(valorKz),
      metodo,
      referencia,
      dataPagamento: new Date().toISOString().split('T')[0],
      status: 'confirmado',
    };

    onAddPayment(newPayment);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Lançamento de Propinas & Emolumentos"
      subtitle="Registo de pagamento e emissão imediata de recibo oficial"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Estudante Beneficiário"
          value={alunoId}
          onChange={(e) => setAlunoId(e.target.value)}
        >
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nomeCompleto} ({s.turmaNome} - {s.processo})
            </option>
          ))}
        </Select>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Mês de Referência"
            value={mesReferencia}
            onChange={(e) => setMesReferencia(e.target.value)}
          >
            <option value="Fevereiro 2025">Fevereiro 2025</option>
            <option value="Março 2025">Março 2025</option>
            <option value="Abril 2025">Abril 2025</option>
            <option value="Maio 2025">Maio 2025</option>
            <option value="Junho 2025">Junho 2025</option>
          </Select>

          <Input
            label="Valor em Kwanzas (Kz)"
            type="number"
            min="1000"
            step="500"
            value={valorKz}
            onChange={(e) => setValorKz(Number(e.target.value))}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Forma de Liquidação"
            value={metodo}
            onChange={(e) => setMetodo(e.target.value as Pagamento['metodo'])}
          >
            <option value="Multicaixa Express">Multicaixa Express</option>
            <option value="TPA Balcão">TPA Balcão</option>
            <option value="Transferência BAI">Transferência BAI</option>
            <option value="Transferência BFA">Transferência BFA</option>
            <option value="RUPE">RUPE (Estado)</option>
          </Select>

          <Input
            label="Nº da Transação / Referência"
            value={referencia}
            onChange={(e) => setReferencia(e.target.value)}
            hint="Código de autenticação bancária"
          />
        </div>

        <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100 text-xs text-[#012041]">
          <span className="font-semibold text-[#015FC4]">Garantia de Conformidade:</span> O recibo será emitido com assinatura digital e carimbo de liquidação institucional.
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Confirmar e Emitir Recibo
          </Button>
        </div>
      </form>
    </Modal>
  );
};
