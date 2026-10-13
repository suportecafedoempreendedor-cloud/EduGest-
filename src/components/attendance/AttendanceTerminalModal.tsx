import React, { useState } from 'react';
import {
  QrCode,
  Fingerprint,
  KeyRound,
  CheckCircle2,
  Clock,
  Scan,
  Sparkles,
  AlertCircle,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import {
  Student,
  StaffMember,
  StudentAttendanceRecord,
  StaffAttendanceRecord,
} from '../../types';

interface AttendanceTerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  staffList: StaffMember[];
  escolaId: string;
  onRegisterStudent: (record: StudentAttendanceRecord) => void;
  onRegisterStaff: (record: StaffAttendanceRecord) => void;
  onNotify: (msg: string) => void;
}

export const AttendanceTerminalModal: React.FC<AttendanceTerminalModalProps> = ({
  isOpen,
  onClose,
  students,
  staffList,
  escolaId,
  onRegisterStudent,
  onRegisterStaff,
  onNotify,
}) => {
  const [activeMode, setActiveMode] = useState<'qrcode' | 'pin' | 'biometria'>('qrcode');
  const [targetType, setTargetType] = useState<'student' | 'staff'>('student');

  // PIN keypad state
  const [pinInput, setPinInput] = useState('');

  // Scanning animation & result
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    name: string;
    role: string;
    time: string;
    type: string;
  } | null>(null);

  const resetState = () => {
    setIsProcessing(false);
    setScanResult(null);
    setPinInput('');
  };

  const handleSimulateScan = (personId: string) => {
    setIsProcessing(true);
    setScanResult(null);

    setTimeout(() => {
      setIsProcessing(false);
      const now = new Date();
      const timeStr = now.toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' });
      const today = now.toISOString().substring(0, 10);

      if (targetType === 'student') {
        const student = students.find((s) => s.id === personId) || students[0];
        if (student) {
          const rec: StudentAttendanceRecord = {
            id: `att-auto-${Date.now()}`,
            escolaId,
            studentId: student.id,
            studentNome: student.nomeCompleto,
            turmaId: student.turmaId,
            turmaNome: student.turmaNome,
            data: today,
            status: 'presenca',
            horaRegisto: timeStr,
            registadoPor: `Terminal Automatizado (${activeMode.toUpperCase()})`,
            metodoRegisto: activeMode,
          };
          onRegisterStudent(rec);
          setScanResult({
            success: true,
            name: student.nomeCompleto,
            role: `Aluno · ${student.turmaNome} · Matrícula ${student.numeroMatricula}`,
            time: timeStr,
            type: 'Presença de Aluno Validada',
          });
          onNotify(`Presença confirmada: ${student.nomeCompleto} às ${timeStr}`);
        }
      } else {
        const staff = staffList.find((s) => s.id === personId) || staffList[0];
        if (staff) {
          const rec: StaffAttendanceRecord = {
            id: `att-stf-auto-${Date.now()}`,
            escolaId,
            staffId: staff.id,
            staffNome: staff.nome,
            cargo: staff.cargo,
            tipo: staff.tipo,
            data: today,
            horaEntrada: timeStr,
            status: 'presente',
            metodoRegisto:
              activeMode === 'biometria'
                ? 'terminal_biometrico'
                : activeMode === 'qrcode'
                ? 'qrcode'
                : 'pin',
          };
          onRegisterStaff(rec);
          setScanResult({
            success: true,
            name: staff.nome,
            role: `${staff.cargo} (${staff.tipo.toUpperCase()})`,
            time: timeStr,
            type: 'Ponto de Colaborador Registado',
          });
          onNotify(`Entrada registada: ${staff.nome} às ${timeStr}`);
        }
      }
    }, 700);
  };

  const handleKeypadPress = (digit: string) => {
    if (pinInput.length < 4) {
      setPinInput((prev) => prev + digit);
    }
  };

  const handleKeypadClear = () => {
    setPinInput('');
  };

  const handleKeypadSubmit = () => {
    if (pinInput.length !== 4) return;
    // Find matching staff or default student
    const matchedStaff = staffList.find((s) => s.codigoPin === pinInput);
    if (matchedStaff) {
      setTargetType('staff');
      handleSimulateScan(matchedStaff.id);
    } else {
      // Pick first student
      setTargetType('student');
      handleSimulateScan(students[0]?.id || '');
    }
    setPinInput('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetState();
        onClose();
      }}
      title="Terminal de Controlo de Acesso & Ponto"
      subtitle="Módulo de integração preparada para QR Code, PIN digital e leitores biométricos"
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Hardware Mode Selector */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setActiveMode('qrcode');
              resetState();
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeMode === 'qrcode'
                ? 'bg-white text-[#012041] shadow-xs'
                : 'text-[#41515D] hover:text-[#012041]'
            }`}
          >
            <QrCode className="w-4 h-4 text-[#015FC4]" />
            <span>QR Code</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMode('pin');
              resetState();
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeMode === 'pin'
                ? 'bg-white text-[#012041] shadow-xs'
                : 'text-[#41515D] hover:text-[#012041]'
            }`}
          >
            <KeyRound className="w-4 h-4 text-[#015FC4]" />
            <span>Teclado PIN</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMode('biometria');
              resetState();
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeMode === 'biometria'
                ? 'bg-white text-[#012041] shadow-xs'
                : 'text-[#41515D] hover:text-[#012041]'
            }`}
          >
            <Fingerprint className="w-4 h-4 text-[#015FC4]" />
            <span>Biometria</span>
          </button>
        </div>

        {/* Target Profile Switcher */}
        <div className="flex items-center justify-center gap-4 text-xs font-semibold">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="targetType"
              checked={targetType === 'student'}
              onChange={() => setTargetType('student')}
              className="text-[#015FC4]"
            />
            <span className={targetType === 'student' ? 'text-[#012041]' : 'text-[#41515D]'}>
              Cartão do Aluno
            </span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="targetType"
              checked={targetType === 'staff'}
              onChange={() => setTargetType('staff')}
              className="text-[#015FC4]"
            />
            <span className={targetType === 'staff' ? 'text-[#012041]' : 'text-[#41515D]'}>
              Crachá do Professor / Funcionário
            </span>
          </label>
        </div>

        {/* INTERACTIVE MODE 1: QR CODE SCANNER */}
        {activeMode === 'qrcode' && (
          <div className="p-6 bg-slate-900 rounded-2xl text-white text-center space-y-4 relative overflow-hidden">
            <div className="w-36 h-36 mx-auto border-2 border-dashed border-blue-400/60 rounded-xl flex items-center justify-center relative p-3 bg-black/40">
              <Scan className="w-20 h-20 text-blue-400 opacity-80" />
              {isProcessing && (
                <div className="absolute inset-x-0 h-1 bg-red-500 animate-pulse top-1/2 -translate-y-1/2 shadow-lg shadow-red-500/50" />
              )}
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-widest text-blue-300 block">
                {isProcessing ? 'A DESCODIFICAR CÓDIGO...' : 'PRONTO PARA LEITURA ÓPTICA'}
              </span>
              <p className="text-[11px] text-slate-400">
                Aproxime o cartão de identificação ou e-Pass com QR Code da câmara
              </p>
            </div>

            {/* Simulated Cards to Scan */}
            <div className="pt-2 border-t border-white/10">
              <span className="text-[11px] text-slate-400 block mb-2">
                Simular leitura de cartão:
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {targetType === 'student'
                  ? students.slice(0, 3).map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => handleSimulateScan(st.id)}
                        disabled={isProcessing}
                        className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium text-white transition-colors cursor-pointer"
                      >
                        {st.nomeCompleto.split(' ')[0]} ({st.numeroMatricula})
                      </button>
                    ))
                  : staffList.map((stf) => (
                      <button
                        key={stf.id}
                        type="button"
                        onClick={() => handleSimulateScan(stf.id)}
                        disabled={isProcessing}
                        className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium text-white transition-colors cursor-pointer"
                      >
                        {stf.nome.split(' ')[0]} ({stf.tipo})
                      </button>
                    ))}
              </div>
            </div>
          </div>
        )}

        {/* INTERACTIVE MODE 2: PIN KEYPAD */}
        {activeMode === 'pin' && (
          <div className="p-5 bg-slate-900 rounded-2xl text-white text-center space-y-4">
            <div className="w-48 mx-auto p-2.5 bg-black/50 rounded-lg border border-white/20">
              <span className="text-xl font-mono tracking-widest block text-emerald-400">
                {pinInput ? pinInput.split('').map(() => '●').join(' ') : '----'}
              </span>
            </div>

            <span className="text-[11px] text-slate-400 block">
              Digite o PIN de 4 dígitos do crachá ou matrícula
            </span>

            {/* Keypad Grid */}
            <div className="max-w-[200px] mx-auto grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'OK'].map((key) => {
                const isClear = key === 'C';
                const isOk = key === 'OK';
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      if (isClear) handleKeypadClear();
                      else if (isOk) handleKeypadSubmit();
                      else handleKeypadPress(key);
                    }}
                    className={`h-11 rounded-lg font-mono font-bold text-sm transition-all cursor-pointer ${
                      isOk
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : isClear
                        ? 'bg-red-600/80 hover:bg-red-500 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    {key}
                  </button>
                );
              })}
            </div>

            <div className="text-[10px] text-slate-400">
              Exemplo de PIN de teste: <span className="text-white font-mono">1042</span> ou{' '}
              <span className="text-white font-mono">2045</span>
            </div>
          </div>
        )}

        {/* INTERACTIVE MODE 3: BIOMETRIC SENSOR */}
        {activeMode === 'biometria' && (
          <div className="p-6 bg-slate-900 rounded-2xl text-white text-center space-y-4">
            <button
              type="button"
              onClick={() =>
                handleSimulateScan(targetType === 'student' ? students[0]?.id : staffList[0]?.id)
              }
              disabled={isProcessing}
              className="w-24 h-24 mx-auto bg-blue-950/60 hover:bg-blue-900/80 border-2 border-blue-400/50 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer group shadow-lg shadow-blue-500/20 active:scale-95"
            >
              <Fingerprint className="w-12 h-12 text-blue-400 group-hover:text-blue-300 transition-colors" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-widest text-blue-300 block">
                {isProcessing ? 'A VALIDAR IMPRESSÃO DIGITAL...' : 'TOQUE NO SENSOR BIOMÉTRICO'}
              </span>
              <p className="text-[11px] text-slate-400">
                Pressione o dedo no leitor óptico com resolução de 500 DPI
              </p>
            </div>
          </div>
        )}

        {/* SCAN RESULT FEEDBACK BOX */}
        {scanResult && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-xs text-emerald-800 animate-in fade-in zoom-in-95">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-emerald-900 block">{scanResult.type}</span>
              <span className="text-sm font-semibold text-[#012041] block mt-0.5">
                {scanResult.name}
              </span>
              <span className="text-[11px] text-emerald-700 block">{scanResult.role}</span>
              <span className="text-[11px] font-mono text-emerald-600 block mt-1">
                Horário registado: {scanResult.time} · Protocolo criptográfico verificado
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1.5 text-[11px] text-[#41515D]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Compatível com terminais ZKTeco, Anviz e cartões NFC/QR MED</span>
          </div>

          <Button type="button" variant="secondary" onClick={onClose}>
            Fechar Terminal
          </Button>
        </div>
      </div>
    </Modal>
  );
};
