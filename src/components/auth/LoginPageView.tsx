import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { EduGestLogo } from '../EduGestLogo';
import { Button } from '../ui/Button';
import { authenticateCredentials } from '../../services/authRbacService';
import { AuthUser } from '../../types/authRbac';

interface LoginPageViewProps {
  onLoginSuccess: (user: AuthUser) => void;
  onGoToForgotPassword: () => void;
  onBackToLanding: () => void;
  onOpenRegisterSchool?: () => void;
}

export const LoginPageView: React.FC<LoginPageViewProps> = ({
  onLoginSuccess,
  onGoToForgotPassword,
  onBackToLanding,
  onOpenRegisterSchool,
}) => {
  const [identifier, setIdentifier] = useState('director@esperanca.edu.ao');
  const [password, setPassword] = useState('EduGest@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Perfis de Demonstração Rápida para facilidade de teste do utilizador
  const quickDemoAccounts = [
    {
      label: 'Admin SaaS',
      email: 'admin.saas@edugest.ao',
      role: 'Super Admin Global',
      desc: 'Gestão multi-escola, planos e faturamento',
    },
    {
      label: 'Director da Escola',
      email: 'director@esperanca.edu.ao',
      role: 'Director Geral',
      desc: 'Administração interna e departamentos',
    },
    {
      label: 'Tesouraria',
      email: 'financas@esperanca.edu.ao',
      role: 'Finanças',
      desc: 'Propinas, Multicaixa e contas correntes',
    },
    {
      label: 'Coordenação',
      email: 'coordenacao@esperanca.edu.ao',
      role: 'Coord. Pedagógica',
      desc: 'Homologação de pautas e bloqueio MED',
    },
    {
      label: 'Professor',
      email: 'andre.muanza@esperanca.edu.ao',
      role: 'Docente',
      desc: 'Lançamento de notas MAC/NPP/NPT',
    },
    {
      label: 'Encarregado',
      email: 'encarregado.santos@gmail.com',
      role: 'Família',
      desc: 'Acompanhamento do educando e propinas',
    },
    {
      label: 'Aluno',
      email: 'ana.santos@aluno.esperanca.ao',
      role: 'Estudante',
      desc: 'Boletim digital e histórico de aulas',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await authenticateCredentials(identifier, password);
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setErrorMessage(result.error || 'Credenciais inválidas.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Ocorreu um erro ao processar o login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-[#012041] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-[#015FC4] selection:text-white">
      {/* Botão de retorno à landing page */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 mb-4 flex items-center justify-between">
        <button
          onClick={onBackToLanding}
          className="text-xs text-[#41515D] hover:text-[#015FC4] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
        >
          ← Voltar à Apresentação
        </button>
        <span className="text-[11px] text-gray-400">Portal Unificado v2.5</span>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="inline-block">
            <EduGestLogo variant="dark" />
          </div>
          <h2 className="mt-4 text-2xl font-black text-[#012041] tracking-tight">
            Bem-vindo ao EduGest Angola
          </h2>
          <p className="mt-1.5 text-xs text-[#41515D]">
            Introduza os seus dados para aceder ao painel da sua instituição de ensino
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-sm border border-gray-200 rounded-2xl sm:px-10 space-y-6">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>Falha na Autenticação:</strong> {errorMessage}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Email Institucional ou Identificador de Acesso
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="exemplo@esperanca.edu.ao ou processo"
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4]"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-gray-700">
                  Palavra-passe
                </label>
                <button
                  type="button"
                  onClick={onGoToForgotPassword}
                  className="text-[11px] font-semibold text-[#015FC4] hover:underline cursor-pointer"
                >
                  Esqueci-me da palavra-passe?
                </button>
              </div>

              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4] font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-[#015FC4] focus:ring-[#015FC4] w-3.5 h-3.5"
                />
                <span className="text-xs text-gray-600">Manter sessão iniciada</span>
              </label>
            </div>

            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={isLoading}
              className="w-full justify-center bg-[#015FC4] hover:bg-[#0263CB] text-xs font-bold py-2.5 shadow-sm"
              icon={!isLoading ? <ArrowRight className="w-4 h-4" /> : undefined}
            >
              {isLoading ? 'A autenticar com segurança...' : 'Entrar na Plataforma'}
            </Button>
          </form>

          {/* Seletor Rápido de Contas de Demonstração */}
          <div className="pt-4 border-t border-gray-200 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500">
              <span>Acessos de Demonstração Rápida:</span>
              <span className="text-[10px] text-gray-400 font-mono">Senha: EduGest@2026</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto p-1">
              {quickDemoAccounts.map((acc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setIdentifier(acc.email);
                    setPassword('EduGest@2026');
                    setErrorMessage(null);
                  }}
                  className={`p-2 rounded-lg text-left border text-[11px] transition-all cursor-pointer ${
                    identifier === acc.email
                      ? 'border-[#015FC4] bg-blue-50/70 font-bold text-[#012041]'
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <span className="block truncate font-semibold text-[#012041]">{acc.label}</span>
                  <span className="block truncate text-[10px] text-gray-500">{acc.role}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Informação Legal & Apoio */}
        <div className="mt-6 text-center text-xs text-gray-500 space-y-2">
          <p>
            Não tem uma conta institucional?{' '}
            <button
              onClick={onOpenRegisterSchool}
              className="text-[#015FC4] font-semibold hover:underline"
            >
              Solicitar adesão da escola
            </button>
          </p>
          <div className="flex justify-center items-center gap-2 text-[11px] text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encriptação SSL/TLS e Isolamento Multi-Tenant</span>
          </div>
        </div>
      </div>
    </div>
  );
};
