import React, { useState } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Building2,
  CreditCard,
  GraduationCap,
  Sparkles,
  Phone,
  Mail,
  ChevronRight,
  Lock,
  HeartHandshake,
  Layers,
  FileText,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { EduGestLogo } from '../EduGestLogo';
import { Button } from '../ui/Button';

interface LandingPageViewProps {
  onGoToLogin: () => void;
  onOpenRegisterSchool?: () => void;
  onSelectPlan?: (planName: string) => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onGoToLogin,
  onOpenRegisterSchool,
  onSelectPlan,
}) => {
  const [selectedFaq, setSelectedFaq] = useState<number | null>(null);

  const modules = [
    {
      title: 'Secretaria & Admissões',
      desc: 'Gestão de processos discentes, validação de BI angolano, emissão de declarações e cartões.',
      icon: <Users className="w-5 h-5 text-[#015FC4]" />,
    },
    {
      title: 'Propinas & Finanças',
      desc: 'Contas correntes por aluno, conciliação Multicaixa Express, TPA, RUPE, bolsas INAGBE e juros de mora.',
      icon: <CreditCard className="w-5 h-5 text-emerald-600" />,
    },
    {
      title: 'Gestão Académica & MED',
      desc: 'Pautas oficiais do Ministério da Educação, lançamento de MAC/NPP/NPT e boletins trimestrais digitais.',
      icon: <GraduationCap className="w-5 h-5 text-indigo-600" />,
    },
    {
      title: 'Portal do Encarregado',
      desc: 'Acesso seguro em tempo real para os pais consultarem faltas, notas, recibos e mensalidades pendentes.',
      icon: <HeartHandshake className="w-5 h-5 text-purple-600" />,
    },
    {
      title: 'Portais do Professor & Aluno',
      desc: 'Ambientes dedicados para o corpo docente submeter notas e os alunos consultarem o histórico escolar.',
      icon: <BookOpenIcon className="w-5 h-5 text-amber-600" />,
    },
    {
      title: 'Protecção de Dados (Lei 22/11)',
      desc: 'Cópia de segurança diária criptografada (AES-256) com soberania em datacenter nacional de Luanda.',
      icon: <ShieldCheck className="w-5 h-5 text-teal-600" />,
    },
  ];

  const plans = [
    {
      name: 'Start',
      badge: 'Ideal para Colégios Pequenos',
      price: '45.000 Kz',
      period: '/mês',
      alunosLimit: 'Até 300 Alunos',
      usersLimit: '5 Utilizadores Administrativos',
      features: [
        'Secretaria Escolar Completa',
        'Controlo de Propinas & Recibos',
        'Pautas e Boletins do MED',
        'Portal do Encarregado',
        'Suporte por WhatsApp & Email',
      ],
      highlight: false,
    },
    {
      name: 'Professional',
      badge: 'Mais Escolhido em Angola',
      price: '95.000 Kz',
      period: '/mês',
      alunosLimit: 'Até 1.200 Alunos',
      usersLimit: '25 Utilizadores & Docentes',
      features: [
        'Todos os recursos do Plano Start',
        'EduGest AI - Assistente Académico',
        'Portal do Professor & Aluno',
        'Módulo RH & Gestão de Ponto',
        'CRM de Admissões & Funil',
        'Exportação Diária Segura APD',
      ],
      highlight: true,
    },
    {
      name: 'Enterprise',
      badge: 'Redes Escolares & Institutos',
      price: '180.000 Kz',
      period: '/mês',
      alunosLimit: 'Alunos Ilimitados',
      usersLimit: 'Utilizadores Ilimitados',
      features: [
        'Todos os recursos do Professional',
        'Multi-Campus / Filiais Interligadas',
        'Domínio Próprio Institucional (.ao)',
        'Integração Bancária e RUPE',
        'Gestor de Conta & SLA 99.9%',
        'Backups Soberanos Dedicated Vault',
      ],
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-[#012041] flex flex-col font-sans selection:bg-[#015FC4] selection:text-white">
      {/* Barra Superior Institucional */}
      <div className="bg-[#012041] text-white/80 text-xs py-2 px-4 border-b border-white/10 hidden sm:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Conformidade Regulamentar MED & APD (Lei nº 22/11 de Angola)
            </span>
          </div>
          <div className="flex items-center gap-4 text-white/70">
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-blue-300" /> +244 923 000 111 (Luanda)
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-blue-300" /> contacto@edugest.ao
            </span>
          </div>
        </div>
      </div>

      {/* Navegação Principal */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <EduGestLogo variant="dark" />
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#41515D]">
            <a href="#modulos" className="hover:text-[#015FC4] transition-colors">
              Módulos do Sistema
            </a>
            <a href="#beneficios" className="hover:text-[#015FC4] transition-colors">
              Vantagens
            </a>
            <a href="#planos" className="hover:text-[#015FC4] transition-colors">
              Planos & Preços
            </a>
            <a href="#seguranca" className="hover:text-[#015FC4] transition-colors">
              Soberania & Segurança
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={onOpenRegisterSchool}
              className="hidden sm:inline-flex border-gray-300 text-[#012041] hover:bg-gray-100"
            >
              Registar Escola
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<ArrowRight className="w-4 h-4" />}
              onClick={onGoToLogin}
              className="bg-[#015FC4] hover:bg-[#0263CB] shadow-sm"
            >
              Entrar na Plataforma
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-white via-blue-50/40 to-[#F4F6F9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-xs font-bold text-[#015FC4]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>A Plataforma SaaS de Referência para Escolas em Angola</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#012041] tracking-tight leading-tight">
                Gestão escolar moderna, inteligente e 100% adaptada à realidade angolana.
              </h1>

              <p className="text-base text-[#41515D] leading-relaxed max-w-2xl">
                Unifique a Secretaria, Cobrança de Propinas via Multicaixa, Pautas homologadas do
                Ministério da Educação, Recursos Humanos, CRM e Portais da Família em uma única
                solução segura na nuvem soberana.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  icon={<ArrowRight className="w-5 h-5" />}
                  onClick={onGoToLogin}
                  className="bg-[#015FC4] hover:bg-[#0263CB] shadow-md text-sm px-6 py-3"
                >
                  Aceder ao Painel Institucional
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={onOpenRegisterSchool}
                  className="border-gray-300 text-[#012041] hover:bg-gray-100 text-sm px-6 py-3"
                >
                  Solicitar Demonstração / Onboarding
                </Button>
              </div>

              <div className="pt-6 border-t border-gray-200 flex flex-wrap items-center gap-6 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Isolamento Multi-Tenant Garantido</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Em conformidade com a APD Angola</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Sem necessidade de servidores locais</span>
                </div>
              </div>
            </div>

            {/* Imagem / Card de Demonstração */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl bg-gradient-to-tr from-[#012041] via-[#013366] to-[#015FC4] p-1 shadow-2xl">
                <div className="rounded-xl bg-[#012041] p-6 text-white space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-[11px] font-mono text-blue-200">portal.edugest.ao</span>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-white/10 border border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-blue-200 block">Instituição Activa</span>
                        <span className="font-bold text-sm text-white">Colégio Esperança do Saber</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                        Plano Pro
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <span className="text-gray-400 block text-[10px]">Estudantes</span>
                        <strong className="text-lg text-white font-mono">1.042</strong>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <span className="text-gray-400 block text-[10px]">Taxa de Cobrança</span>
                        <strong className="text-lg text-emerald-400 font-mono">94.2%</strong>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-400/20 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-blue-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Selo de Integridade Institucional</span>
                      </div>
                      <p className="text-[11px] text-blue-100/80">
                        Controlo de acesso estrito com segregação de dados por escola e auditoria activa.
                      </p>
                    </div>

                    <Button
                      variant="primary"
                      size="md"
                      onClick={onGoToLogin}
                      className="w-full justify-center bg-[#015FC4] hover:bg-[#0263CB] font-bold"
                    >
                      Entrar no Sistema
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Módulos do Sistema */}
      <section id="modulos" className="py-20 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#015FC4]">
              Estrutura Modular Completa
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#012041]">
              Tudo o que uma escola moderna necessita em um só lugar
            </h2>
            <p className="text-sm text-[#41515D]">
              Cada departamento opera em seu próprio painel de trabalho com permissões rigorosas,
              evitando acessos indevidos a dados sensíveis de outras áreas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((m, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl border border-gray-200 bg-[#F4F6F9]/60 hover:bg-white hover:border-[#015FC4] hover:shadow-md transition-all space-y-3"
              >
                <div className="w-10 h-10 rounded-lg bg-white shadow-xs flex items-center justify-center border border-gray-200">
                  {m.icon}
                </div>
                <h3 className="font-bold text-base text-[#012041]">{m.title}</h3>
                <p className="text-xs text-[#41515D] leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planos & Subscrições */}
      <section id="planos" className="py-20 bg-[#F4F6F9] border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#015FC4]">
              Transparência & Escalabilidade
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#012041]">
              Planos desenhados para cada fase da sua instituição
            </h2>
            <p className="text-sm text-[#41515D]">
              Mensalidades em Kwanzas (Kz) sem custos ocultos com suporte técnico especializado em Luanda e restantes províncias.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {plans.map((p, idx) => (
              <div
                key={idx}
                className={`rounded-2xl p-8 flex flex-col justify-between transition-all ${
                  p.highlight
                    ? 'bg-white border-2 border-[#015FC4] shadow-xl relative'
                    : 'bg-white border border-gray-200 shadow-xs'
                }`}
              >
                <div>
                  {p.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#015FC4] text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                      Recomendado
                    </span>
                  )}
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-black text-[#012041]">{p.name}</h3>
                    <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {p.badge}
                    </span>
                  </div>

                  <div className="my-6">
                    <span className="text-3xl sm:text-4xl font-extrabold text-[#012041] font-mono">
                      {p.price}
                    </span>
                    <span className="text-xs text-gray-500 font-semibold">{p.period}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 text-xs font-semibold text-gray-700 space-y-1 mb-6">
                    <div>✓ {p.alunosLimit}</div>
                    <div>✓ {p.usersLimit}</div>
                  </div>

                  <ul className="space-y-3 text-xs text-gray-600 mb-8">
                    {p.features.map((f, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  variant={p.highlight ? 'primary' : 'secondary'}
                  size="md"
                  onClick={() => onSelectPlan?.(p.name) || onGoToLogin()}
                  className={`w-full justify-center font-bold ${
                    p.highlight ? 'bg-[#015FC4] hover:bg-[#0263CB]' : ''
                  }`}
                >
                  Seleccionar Plano {p.name}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rodapé Oficial */}
      <footer className="bg-[#012041] text-white pt-16 pb-12 border-t border-white/10 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <EduGestLogo variant="light" />
              <p className="text-gray-400 text-xs leading-relaxed">
                A plataforma líder em gestão escolar integrada em Angola. Construída para assegurar
                conformidade regulamentar, rigor financeiro e sucesso académico.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-sm text-white uppercase tracking-wider">Acesso Rápido</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button onClick={onGoToLogin} className="hover:text-white transition-colors">
                    Entrar na Plataforma
                  </button>
                </li>
                <li>
                  <button onClick={onOpenRegisterSchool} className="hover:text-white transition-colors">
                    Registar Nova Instituição
                  </button>
                </li>
                <li>
                  <a href="#planos" className="hover:text-white transition-colors">
                    Tabela de Planos
                  </a>
                </li>
                <li>
                  <a href="#modulos" className="hover:text-white transition-colors">
                    Módulos Escolares
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-sm text-white uppercase tracking-wider">Normas & Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Termos de Utilização do SaaS
                  </span>
                </li>
                <li>
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Política de Privacidade & Dados
                  </span>
                </li>
                <li>
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Conformidade com a Lei nº 22/11
                  </span>
                </li>
                <li>
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Normas Pedagógicas do MED
                  </span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-sm text-white uppercase tracking-wider">Contactos & Suporte</h4>
              <p className="text-gray-400">
                Luanda, Angola · Suporte técnico activo de Segunda a Sábado.
              </p>
              <div className="text-gray-300 font-mono space-y-1">
                <div>+244 923 000 111</div>
                <div>suporte@edugest.ao</div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-400">
            <span>© {new Date().getFullYear()} EduGest Angola. Todos os direitos reservados.</span>
            <span>Desenvolvido com rigor institucional para o ensino angolano.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Ícone auxiliar
function BookOpenIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  );
}
