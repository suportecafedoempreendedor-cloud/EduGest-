import React, { useState } from 'react';
import {
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowLeft,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import { EduGestLogo } from '../EduGestLogo';
import { Button } from '../ui/Button';

interface ForgotPasswordViewProps {
  onBackToLogin: () => void;
}

export const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({ onBackToLogin }) => {
  const [step, setStep] = useState<'request' | 'reset' | 'completed'>('request');
  const [email, setEmail] = useState('');
  const [tokenCode, setTokenCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Solicitar Envio do Link / Código de Recuperação
  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setMessage(null);

    // Simulação do envio de email seguro com token temporal (válido por 15 minutos)
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsLoading(false);

    // Resposta genérica segura que impede enumeração de contas (Artigo 5º Lei 22/11)
    setTokenCode('ANG-849201'); // Código gerado para simulação interactiva
    setStep('reset');
    setMessage({
      type: 'success',
      text: 'Se o endereço estiver registado, foi enviado um código de validação com validade de 15 minutos.',
    });
  };

  // Redefinir a Palavra-passe
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'As palavras-passe introduzidas não coincidem.' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({
        type: 'error',
        text: 'A nova palavra-passe deve conter pelo menos 6 caracteres para garantir robustez.',
      });
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsLoading(false);
    setStep('completed');
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-[#012041] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 mb-4">
        <button
          onClick={onBackToLogin}
          className="text-xs text-[#41515D] hover:text-[#015FC4] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Login
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="inline-block">
            <EduGestLogo variant="dark" />
          </div>
          <h2 className="mt-4 text-2xl font-black text-[#012041] tracking-tight">
            Recuperação de Palavra-passe
          </h2>
          <p className="mt-1.5 text-xs text-[#41515D]">
            Procedimento seguro de redefinição de acesso institucional
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-sm border border-gray-200 rounded-2xl sm:px-10 space-y-6">
          {message && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 border ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{message.text}</span>
            </div>
          )}

          {step === 'request' && (
            <form onSubmit={handleRequestToken} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Email Institucional Associado à Conta
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemplo@esperanca.edu.ao"
                    className="w-full pl-9 pr-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4]"
                    required
                  />
                </div>
              </div>

              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={isLoading}
                className="w-full justify-center bg-[#015FC4] hover:bg-[#0263CB] text-xs font-bold py-2.5"
              >
                {isLoading ? 'A processar pedido...' : 'Enviar Código de Validação'}
              </Button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Código de Validação Recebido
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={tokenCode}
                    onChange={(e) => setTokenCode(e.target.value)}
                    placeholder="ANG-XXXXXX"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4] font-mono text-center font-bold tracking-widest uppercase"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nova Palavra-passe
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Confirmar Nova Palavra-passe
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a palavra-passe"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4]"
                    required
                  />
                </div>
              </div>

              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={isLoading}
                className="w-full justify-center bg-[#015FC4] hover:bg-[#0263CB] text-xs font-bold py-2.5"
              >
                {isLoading ? 'A gravar nova palavra-passe...' : 'Confirmar e Redefinir'}
              </Button>
            </form>
          )}

          {step === 'completed' && (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#012041]">
                Palavra-passe Redefinida com Sucesso!
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                A sua palavra-passe institucional foi atualizada em conformidade com as regras de segurança.
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={onBackToLogin}
                className="w-full justify-center bg-[#015FC4] hover:bg-[#0263CB] text-xs font-bold"
              >
                Ir para a Página de Login
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
