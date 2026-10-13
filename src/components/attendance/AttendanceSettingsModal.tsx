import React, { useState, useEffect } from 'react';
import { Settings, Bell, ShieldAlert, Cpu, Check, AlertCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { AttendanceSettings } from '../../types';

interface AttendanceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AttendanceSettings;
  onSaveSettings: (settings: AttendanceSettings) => void;
}

export const AttendanceSettingsModal: React.FC<AttendanceSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [limiteAlerta, setLimiteAlerta] = useState<number>(settings.limiteFaltasAlerta || 5);
  const [limiteCritico, setLimiteCritico] = useState<number>(settings.limiteFaltasCritico || 10);
  const [tolerancia, setTolerancia] = useState<number>(settings.toleranciaMinutosAtraso || 15);
  const [notificarSms, setNotificarSms] = useState<boolean>(settings.notificarEncarregadosSms);
  const [qrCodeAtivo, setQrCodeAtivo] = useState<boolean>(settings.integracaoQrCodeAtiva);
  const [biometriaAtiva, setBiometriaAtiva] = useState<boolean>(settings.integracaoBiometriaAtiva);
  const [pinAtivo, setPinAtivo] = useState<boolean>(settings.integracaoPinAtiva);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLimiteAlerta(settings.limiteFaltasAlerta);
    setLimiteCritico(settings.limiteFaltasCritico);
    setTolerancia(settings.toleranciaMinutosAtraso);
    setNotificarSms(settings.notificarEncarregadosSms);
    setQrCodeAtivo(settings.integracaoQrCodeAtiva);
    setBiometriaAtiva(settings.integracaoBiometriaAtiva);
    setPinAtivo(settings.integracaoPinAtiva);
    setError(null);
  }, [settings, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (limiteAlerta <= 0 || limiteCritico <= 0) {
      setError('Os limites de faltas devem ser valores positivos superiores a zero.');
      return;
    }
    if (limiteAlerta >= limiteCritico) {
      setError('O limite de alerta preventivo deve ser inferior ao limite crítico de anulação.');
      return;
    }

    const updated: AttendanceSettings = {
      ...settings,
      limiteFaltasAlerta: Number(limiteAlerta),
      limiteFaltasCritico: Number(limiteCritico),
      toleranciaMinutosAtraso: Number(tolerancia),
      notificarEncarregadosSms: notificarSms,
      integracaoQrCodeAtiva: qrCodeAtivo,
      integracaoBiometriaAtiva: biometriaAtiva,
      integracaoPinAtiva: pinAtivo,
    };

    onSaveSettings(updated);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configuração de Limites de Faltas & Alertas"
      subtitle="Defina os parâmetros do regulamento interno do MED para gerar alertas de assiduidade"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-xl space-y-3">
          <span className="text-xs font-bold text-[#012041] uppercase tracking-wide flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            Regras de Alerta de Faltas do Aluno
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Limite de Alerta Preventivo (Faltas) *"
              type="number"
              min={1}
              max={30}
              value={limiteAlerta}
              onChange={(e) => setLimiteAlerta(Number(e.target.value))}
              required
              hint="Gera aviso amarelo e recomendação de contacto"
            />

            <Input
              label="Limite Crítico / Risco de Anulação *"
              type="number"
              min={2}
              max={50}
              value={limiteCritico}
              onChange={(e) => setLimiteCritico(Number(e.target.value))}
              required
              hint="Gera alerta vermelho e convocatória formal"
            />
          </div>

          <div>
            <Input
              label="Tolerância para Atrasos na Entrada (Minutos) *"
              type="number"
              min={0}
              max={45}
              value={tolerancia}
              onChange={(e) => setTolerancia(Number(e.target.value))}
              required
              hint="Após esta tolerância, o registo passa de presença para atraso"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="sms-check"
              checked={notificarSms}
              onChange={(e) => setNotificarSms(e.target.checked)}
              className="w-4 h-4 rounded text-[#015FC4]"
            />
            <label htmlFor="sms-check" className="text-xs text-[#012041] cursor-pointer">
              <span className="font-semibold block">Notificação Automática aos Encarregados</span>
              <span className="text-[#41515D]">
                Disparar alerta por SMS e WhatsApp ao atingir o limite configurado
              </span>
            </label>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-xl space-y-3">
          <span className="text-xs font-bold text-[#012041] uppercase tracking-wide flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-[#015FC4]" />
            Canais de Integração Tecnológica Activos
          </span>

          <div className="space-y-2 text-xs">
            <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-[#E2E8F0] cursor-pointer">
              <input
                type="checkbox"
                checked={qrCodeAtivo}
                onChange={(e) => setQrCodeAtivo(e.target.checked)}
                className="w-4 h-4 rounded text-[#015FC4]"
              />
              <div>
                <span className="font-semibold text-[#012041] block">
                  Leitor de QR Code & Cartões Escolares
                </span>
                <span className="text-[#41515D]">
                  Permite validação de entrada através de câmaras de terminais ou smartphones
                </span>
              </div>
            </label>

            <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-[#E2E8F0] cursor-pointer">
              <input
                type="checkbox"
                checked={biometriaAtiva}
                onChange={(e) => setBiometriaAtiva(e.target.checked)}
                className="w-4 h-4 rounded text-[#015FC4]"
              />
              <div>
                <span className="font-semibold text-[#012041] block">
                  Terminais Biométricos (Impressão Digital)
                </span>
                <span className="text-[#41515D]">
                  Integração com relógios de ponto físicos (ZKTeco, Anviz, Suprema)
                </span>
              </div>
            </label>

            <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-[#E2E8F0] cursor-pointer">
              <input
                type="checkbox"
                checked={pinAtivo}
                onChange={(e) => setPinAtivo(e.target.checked)}
                className="w-4 h-4 rounded text-[#015FC4]"
              />
              <div>
                <span className="font-semibold text-[#012041] block">
                  Teclado PIN Numérico de Acesso
                </span>
                <span className="text-[#41515D]">
                  Registo de presença via código pessoal de 4 dígitos nos portões
                </span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Guardar Configurações
          </Button>
        </div>
      </form>
    </Modal>
  );
};
