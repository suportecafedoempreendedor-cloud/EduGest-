import React, { useState, useEffect } from 'react';
import { Clock, UserCheck, AlertCircle, FileText } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Select, Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { StaffMember, StaffAttendanceRecord, StaffAttendanceStatus } from '../../types';

interface StaffPunchModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffList: StaffMember[];
  escolaId: string;
  onSaveStaffAttendance: (record: StaffAttendanceRecord) => void;
}

export const StaffPunchModal: React.FC<StaffPunchModalProps> = ({
  isOpen,
  onClose,
  staffList,
  escolaId,
  onSaveStaffAttendance,
}) => {
  const [selectedStaffId, setSelectedStaffId] = useState<string>(staffList[0]?.id || '');
  const [data, setData] = useState<string>(new Date().toISOString().substring(0, 10));
  const [horaEntrada, setHoraEntrada] = useState<string>('07:30');
  const [horaSaida, setHoraSaida] = useState<string>('15:30');
  const [status, setStatus] = useState<StaffAttendanceStatus>('presente');
  const [minutosAtraso, setMinutosAtraso] = useState<number>(0);
  const [justificacao, setJustificacao] = useState<string>('');
  const [metodoRegisto, setMetodoRegisto] = useState<
    'manual_secretaria' | 'terminal_biometrico' | 'qrcode' | 'pin'
  >('manual_secretaria');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (staffList[0]) {
      setSelectedStaffId(staffList[0].id);
    }
    const now = new Date();
    const curTime = now.toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' });
    setHoraEntrada(curTime);
  }, [isOpen, staffList]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId) {
      setError('Por favor seleccione o funcionário ou docente.');
      return;
    }

    const staffMember = staffList.find((s) => s.id === selectedStaffId);

    const record: StaffAttendanceRecord = {
      id: `att-stf-${Date.now()}`,
      escolaId,
      staffId: selectedStaffId,
      staffNome: staffMember?.nome || 'Funcionário',
      cargo: staffMember?.cargo || 'Colaborador',
      tipo: staffMember?.tipo || 'professor',
      data,
      horaEntrada: status === 'falta' || status === 'falta_justificada' ? undefined : horaEntrada,
      horaSaida: status === 'falta' || status === 'falta_justificada' ? undefined : horaSaida,
      status,
      minutosAtraso: status === 'atraso' ? Number(minutosAtraso) : undefined,
      justificacao: justificacao.trim() || undefined,
      metodoRegisto,
    };

    onSaveStaffAttendance(record);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registo de Ponto & Assiduidade do Colaborador"
      subtitle="Entrada, saída, faltas, atrasos e justificações de docentes e pessoal administrativo"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <Select
          label="Funcionário / Docente *"
          value={selectedStaffId}
          onChange={(e) => setSelectedStaffId(e.target.value)}
          required
        >
          {staffList.map((st) => (
            <option key={st.id} value={st.id}>
              {st.nome} · {st.cargo} ({st.tipo})
            </option>
          ))}
        </Select>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Data de Registo *"
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            required
          />

          <Select
            label="Estado da Assiduidade *"
            value={status}
            onChange={(e) => setStatus(e.target.value as StaffAttendanceStatus)}
          >
            <option value="presente">Presente (Cumprimento Integral)</option>
            <option value="atraso">Atraso na Entrada</option>
            <option value="falta">Falta Injustificada</option>
            <option value="falta_justificada">Falta Justificada (Atestado / Dispensa)</option>
          </Select>
        </div>

        {status !== 'falta' && status !== 'falta_justificada' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Hora de Entrada *"
              type="time"
              value={horaEntrada}
              onChange={(e) => setHoraEntrada(e.target.value)}
              required
            />

            <Input
              label="Hora de Saída"
              type="time"
              value={horaSaida}
              onChange={(e) => setHoraSaida(e.target.value)}
            />
          </div>
        )}

        {status === 'atraso' && (
          <div>
            <Input
              label="Minutos de Atraso *"
              type="number"
              min={1}
              max={180}
              value={minutosAtraso}
              onChange={(e) => setMinutosAtraso(Number(e.target.value))}
              required
              hint="Minutos decorridos após a tolerância oficial do regulamento"
            />
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-[#012041] block mb-1.5">
            Justificação / Observação Institucional
          </label>
          <textarea
            value={justificacao}
            onChange={(e) => setJustificacao(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-[#E2E8F0] px-3.5 py-2 text-sm text-[#012041] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#015FC4]"
            placeholder="Ex: Apresentou comprovativo médico ou comunicação prévia à direcção."
          />
        </div>

        <div>
          <Select
            label="Canal / Método de Ponto"
            value={metodoRegisto}
            onChange={(e) => setMetodoRegisto(e.target.value as any)}
          >
            <option value="manual_secretaria">Manual (Secretaria / RH da Escola)</option>
            <option value="terminal_biometrico">Terminal Biométrico (Impressão Digital)</option>
            <option value="qrcode">Leitor de Cartão QR Code</option>
            <option value="pin">Teclado de PIN Numérico</option>
          </Select>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Confirmar Ponto
          </Button>
        </div>
      </form>
    </Modal>
  );
};
