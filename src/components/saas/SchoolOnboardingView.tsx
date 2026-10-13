import React, { useState } from 'react';
import {
  Building2,
  UserCheck,
  Calendar,
  Layers,
  Settings,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Copy,
  Check,
  ExternalLink,
  BookOpen,
  Phone,
  Mail,
  MapPin,
  Lock,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input, Select } from '../ui/Input';
import { Alert } from '../ui/Alert';
import { School, OnboardingFormState, SchoolPlan, ViewMode } from '../../types';

interface SchoolOnboardingViewProps {
  onNavigate: (view: ViewMode) => void;
  onAddSchool: (newSchool: School) => Promise<boolean> | void;
  onSelectSchoolTenant: (school: School) => void;
  isSimulatingNetwork?: boolean;
}

export const SchoolOnboardingView: React.FC<SchoolOnboardingViewProps> = ({
  onNavigate,
  onAddSchool,
  onSelectSchoolTenant,
  isSimulatingNetwork = false,
}) => {
  // Flag to show onboarding initial landing page or the active wizard
  const [hasStarted, setHasStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdSchool, setCreatedSchool] = useState<School | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Initial form state
  const [formData, setFormData] = useState<OnboardingFormState>({
    // Step 1: Dados da escola
    nome: '',
    nomeComercial: '',
    nif: '',
    provincia: 'Luanda',
    municipio: 'Maianga',
    morada: '',
    telefone: '+244 ',
    email: '',
    website: '',
    logotipo: '',

    // Step 2: Administrador
    adminNome: '',
    adminEmail: '',
    adminTelefone: '+244 ',
    adminCargo: 'Director Geral / Pedagógico',

    // Step 3: Ano lectivo
    anoLectivo: '2025/2026',
    dataInicio: '2025-09-01',
    dataFim: '2026-06-30',
    modeloTrimestral: true,

    // Step 4: Classes e Ciclos
    ciclosSelecionados: ['Iº Ciclo', 'IIº Ciclo'],
    cursosOferecidos: ['Ciências Físicas e Biológicas', 'Ciências Económicas e Jurídicas'],

    // Step 5: Configurações
    plano: 'Plano Pro',
    periodoTrialDias: 30,
    limiteAlunos: 1500,
    notificacoesSms: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    { num: 1, title: 'Dados da Escola', desc: 'Identificação & Contactos', icon: <Building2 className="w-4 h-4" /> },
    { num: 2, title: 'Administrador', desc: 'Gestor do Tenant', icon: <UserCheck className="w-4 h-4" /> },
    { num: 3, title: 'Ano Lectivo', desc: 'Calendário do MED', icon: <Calendar className="w-4 h-4" /> },
    { num: 4, title: 'Classes & Ciclos', desc: 'Estrutura Curricular', icon: <Layers className="w-4 h-4" /> },
    { num: 5, title: 'Configurações', desc: 'Plano & Capacidade', icon: <Settings className="w-4 h-4" /> },
    { num: 6, title: 'Conclusão', desc: 'Homologação do Tenant', icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  const validateStep = (stepNum: number) => {
    const errs: Record<string, string> = {};

    if (stepNum === 1) {
      if (!formData.nome.trim()) errs.nome = 'Nome da escola é obrigatório.';
      if (!formData.nif.trim()) errs.nif = 'NIF institucional é obrigatório.';
      else if (formData.nif.length < 9) errs.nif = 'Insira um NIF angolano válido (mínimo 9 dígitos).';
      if (!formData.morada.trim()) errs.morada = 'Morada da escola é obrigatória.';
      if (!formData.email.trim() || !formData.email.includes('@')) errs.email = 'Email institucional válido é obrigatório.';
      if (!formData.telefone.trim() || formData.telefone.length < 8) errs.telefone = 'Telefone válido é obrigatório.';
    }

    if (stepNum === 2) {
      if (!formData.adminNome.trim()) errs.adminNome = 'Nome do administrador é obrigatório.';
      if (!formData.adminEmail.trim() || !formData.adminEmail.includes('@')) errs.adminEmail = 'Email do administrador é obrigatório.';
      if (!formData.adminTelefone.trim() || formData.adminTelefone.length < 8) errs.adminTelefone = 'Contacto do administrador é obrigatório.';
    }

    if (stepNum === 4) {
      if (formData.ciclosSelecionados.length === 0) errs.ciclos = 'Selecione pelo menos um ciclo de ensino.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 6) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinishOnboarding = async () => {
    setIsSubmitting(true);
    try {
      const randomId = `esc-${Date.now().toString().slice(-4)}`;
      const initials = formData.nome
        .split(' ')
        .map((w) => w[0])
        .filter(Boolean)
        .slice(0, 3)
        .join('')
        .toUpperCase();

      let valorMensal = 125000;
      if (formData.plano === 'Plano Básico') valorMensal = 75000;
      if (formData.plano === 'Plano Pro') valorMensal = 125000;
      if (formData.plano === 'Plano Enterprise') valorMensal = 185000;
      if (formData.plano === 'Plano Governamental') valorMensal = 250000;

      const newSchool: School = {
        id: randomId,
        nome: formData.nome,
        nomeComercial: formData.nomeComercial || `${formData.nome}, Lda`,
        nif: formData.nif,
        logotipo: formData.logotipo || initials,
        provincia: formData.provincia,
        municipio: formData.municipio,
        morada: formData.morada,
        telefone: formData.telefone,
        email: formData.email,
        website: formData.website || `https://${formData.nome.toLowerCase().replace(/\s+/g, '')}.edu.ao`,
        estado: 'trial', // Todo onboarding inicia em Trial de 30 dias
        plano: formData.plano,
        valorMensalKz: valorMensal,
        dataCriacao: new Date().toISOString().split('T')[0],
        dataFimTrial: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        adminNome: formData.adminNome,
        adminEmail: formData.adminEmail,
        adminTelefone: formData.adminTelefone,
        totalAlunos: 0,
        totalProfessores: 0,
        anoLectivoActivo: formData.anoLectivo,
      };

      const result = await onAddSchool(newSchool);
      if (result !== false) {
        setCreatedSchool(newSchool);
        setIsCompleted(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdSchool) return;
    const text = `Credenciais EduGest Angola:\nEscola: ${createdSchool.nome}\nAdmin: ${createdSchool.adminNome}\nEmail: ${createdSchool.adminEmail}\nAmbiente: ${createdSchool.id}.edugest.ao`;
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // 1. Initial Landing Page of Onboarding
  if (!hasStarted) {
    return (
      <div className="space-y-6">
        <Card noPadding>
          <div className="p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-[#012041] text-white flex items-center justify-center mx-auto shadow-md">
              <Building2 className="w-8 h-8 text-[#015FC4]" />
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase font-bold tracking-widest text-[#015FC4]">
                EduGest Angola · Plataforma SaaS
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#012041] tracking-tight">
                Onboarding de Nova Instituição Escolar
              </h2>
              <p className="text-sm text-[#41515D] leading-relaxed max-w-xl mx-auto">
                Provisione uma nova escola no sistema com isolamento de tenant, administrador próprio,
                configuração de classes, calendário oficial do MED e período de experimentação activo.
              </p>
            </div>

            {/* Stepper overview preview */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-left pt-4">
              {steps.map((st) => (
                <div key={st.num} className="p-3.5 rounded-xl border border-[#E2E8F0] bg-slate-50/50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-[#015FC4] text-white text-[10px] font-bold flex items-center justify-center">
                      {st.num}
                    </span>
                    <span className="text-xs font-bold text-[#012041]">{st.title}</span>
                  </div>
                  <span className="text-[11px] text-[#41515D] block">{st.desc}</span>
                </div>
              ))}
            </div>

            <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="secondary"
                onClick={() => onNavigate('saas-schools')}
              >
                Voltar à Gestão de Escolas
              </Button>
              <Button
                variant="primary"
                icon={<ArrowRight className="w-4 h-4" />}
                onClick={() => setHasStarted(true)}
              >
                Iniciar Processo de Onboarding
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Success Completion Screen
  if (isCompleted && createdSchool) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <Card noPadding>
          <div className="p-8 sm:p-10 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Tenant Provisionado com Sucesso
              </span>
              <h2 className="text-2xl font-bold text-[#012041] mt-1">
                {createdSchool.nome}
              </h2>
              <p className="text-xs text-[#41515D] mt-1">
                A instituição está ativa em modo de período experimental (Trial de 30 dias) no plano {createdSchool.plano}.
              </p>
            </div>

            {/* Tenant details sheet */}
            <div className="p-5 rounded-xl border border-[#E2E8F0] bg-slate-50 text-left text-xs space-y-2.5 font-mono">
              <div className="flex justify-between border-b pb-2 border-slate-200">
                <span className="text-[#41515D]">Identificador do Tenant:</span>
                <span className="font-bold text-[#012041]">{createdSchool.id}</span>
              </div>
              <div className="flex justify-between border-b pb-2 border-slate-200">
                <span className="text-[#41515D]">NIF Institucional:</span>
                <span className="text-[#012041]">{createdSchool.nif}</span>
              </div>
              <div className="flex justify-between border-b pb-2 border-slate-200">
                <span className="text-[#41515D]">Administrador da Escola:</span>
                <span className="text-[#012041]">{createdSchool.adminNome}</span>
              </div>
              <div className="flex justify-between border-b pb-2 border-slate-200">
                <span className="text-[#41515D]">Email de Acesso Inicial:</span>
                <span className="text-[#015FC4]">{createdSchool.adminEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#41515D]">Vencimento do Período Trial:</span>
                <span className="text-emerald-700 font-bold">{createdSchool.dataFimTrial}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                variant="secondary"
                size="sm"
                icon={copiedKey ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                onClick={handleCopyCredentials}
              >
                {copiedKey ? 'Credenciais Copiadas!' : 'Copiar Credenciais'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<ExternalLink className="w-4 h-4" />}
                onClick={() => onSelectSchoolTenant(createdSchool)}
              >
                Aceder Imediatamente ao Tenant
              </Button>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <button
                onClick={() => onNavigate('saas-schools')}
                className="text-xs font-semibold text-[#015FC4] hover:underline cursor-pointer"
              >
                Voltar à Lista de Escolas
              </button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Active Multi-Step Wizard
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Stepper Breadcrumbs */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          {steps.map((st) => {
            const isCurrent = currentStep === st.num;
            const isDone = currentStep > st.num;
            return (
              <div
                key={st.num}
                className={`p-2.5 rounded-lg border text-center transition-all ${
                  isCurrent
                    ? 'border-[#015FC4] bg-blue-50/60 text-[#015FC4]'
                    : isDone
                    ? 'border-emerald-200 bg-emerald-50/40 text-emerald-700'
                    : 'border-slate-200 bg-slate-50/40 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold mb-0.5">
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <span>{st.num}.</span>
                  )}
                  <span className="truncate">{st.title}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Step Card Form */}
      <Card
        title={`Passo ${currentStep} de 6: ${steps[currentStep - 1].title}`}
        subtitle={steps[currentStep - 1].desc}
      >
        <div className="space-y-5">
          {/* STEP 1: Dados da Escola */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nome Oficial da Escola *"
                  placeholder="Ex: Colégio Welwitschia Mirabilis"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  error={errors.nome}
                  hint="Nome que constará nas pautas e declarações"
                />

                <Input
                  label="Nome Comercial / Razão Social"
                  placeholder="Ex: Welwitschia Education Group, Lda"
                  value={formData.nomeComercial}
                  onChange={(e) => setFormData({ ...formData, nomeComercial: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="NIF Institucional *"
                  placeholder="Ex: 5418029412"
                  value={formData.nif}
                  onChange={(e) => setFormData({ ...formData, nif: e.target.value })}
                  error={errors.nif}
                />

                <Select
                  label="Província *"
                  value={formData.provincia}
                  onChange={(e) => setFormData({ ...formData, provincia: e.target.value })}
                >
                  <option value="Luanda">Luanda</option>
                  <option value="Benguela">Benguela</option>
                  <option value="Huambo">Huambo</option>
                  <option value="Huíla">Huíla</option>
                  <option value="Cuanza Sul">Cuanza Sul</option>
                  <option value="Cabinda">Cabinda</option>
                  <option value="Malanje">Malanje</option>
                  <option value="Uíge">Uíge</option>
                </Select>

                <Input
                  label="Município *"
                  placeholder="Ex: Maianga / Talatona"
                  value={formData.municipio}
                  onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                />
              </div>

              <Input
                label="Morada Completa da Sede Escolar *"
                placeholder="Rua, Número, Bairro"
                value={formData.morada}
                onChange={(e) => setFormData({ ...formData, morada: e.target.value })}
                error={errors.morada}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Telefone Institucional *"
                  placeholder="+244 923 000 000"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  error={errors.telefone}
                />

                <Input
                  label="Email da Secretaria Geral *"
                  type="email"
                  placeholder="secretaria@escola.ao"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  error={errors.email}
                />

                <Input
                  label="Website Oficial"
                  placeholder="https://escola.ao"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* STEP 2: Administrador da Escola */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <Alert type="info" title="Isolamento de Tenant & Acesso">
                Cada escola deverá começar com um administrador principal. Este utilizador terá credenciais de gestão restritas exclusivamente ao tenant da sua escola.
              </Alert>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nome Completo do Administrador *"
                  placeholder="Ex: Dr. Manuel Domingos"
                  value={formData.adminNome}
                  onChange={(e) => setFormData({ ...formData, adminNome: e.target.value })}
                  error={errors.adminNome}
                />

                <Input
                  label="Cargo Institucional"
                  value={formData.adminCargo}
                  onChange={(e) => setFormData({ ...formData, adminCargo: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email de Acesso (Login do Tenant) *"
                  type="email"
                  placeholder="admin@escola.ao"
                  value={formData.adminEmail}
                  onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                  error={errors.adminEmail}
                  hint="Será o utilizador de autenticação"
                />

                <Input
                  label="Telefone de Contacto Directo *"
                  placeholder="+244 923 000 000"
                  value={formData.adminTelefone}
                  onChange={(e) => setFormData({ ...formData, adminTelefone: e.target.value })}
                  error={errors.adminTelefone}
                />
              </div>
            </div>
          )}

          {/* STEP 3: Ano Lectivo */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Designação do Ano Lectivo *"
                  value={formData.anoLectivo}
                  onChange={(e) => setFormData({ ...formData, anoLectivo: e.target.value })}
                />

                <Input
                  label="Data de Início do Ano Lectivo *"
                  type="date"
                  value={formData.dataInicio}
                  onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                />

                <Input
                  label="Data de Conclusão / Exames *"
                  type="date"
                  value={formData.dataFim}
                  onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                />
              </div>

              <div className="p-4 rounded-xl border border-[#E2E8F0] bg-slate-50 space-y-2 text-xs">
                <span className="font-bold text-[#012041] block">
                  Modelo de Avaliação do Ministério da Educação (MED - Angola):
                </span>
                <p className="text-[#41515D] leading-relaxed">
                  O tenant será inicializado automaticamente com o modelo oficial de três trimestres lectivos, cálculo automático da Média Trimestral (MT = [MAC + NPP + NPT] / 3) e escala de notas de 0 a 20 valores.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: Classes e Ciclos */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <span className="text-xs font-semibold text-[#012041] block mb-2">
                  Selecione os Ciclos de Ensino Ministrados pela Escola:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'Ensino Primário', label: 'Ensino Primário (1ª à 6ª Classe)' },
                    { id: 'Iº Ciclo', label: 'Iº Ciclo do Ensino Secundário (7ª à 9ª Classe)' },
                    { id: 'IIº Ciclo', label: 'IIº Ciclo Geral (10ª à 12ª Classe - Puniv)' },
                    { id: 'Ensino Técnico', label: 'Ensino Médio Técnico-Profissional (10ª à 13ª)' },
                  ].map((ciclo) => {
                    const isChecked = formData.ciclosSelecionados.includes(ciclo.id);
                    return (
                      <label
                        key={ciclo.id}
                        className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-colors ${
                          isChecked ? 'border-[#015FC4] bg-blue-50/50 text-[#012041]' : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                ciclosSelecionados: [...formData.ciclosSelecionados, ciclo.id],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                ciclosSelecionados: formData.ciclosSelecionados.filter((c) => c !== ciclo.id),
                              });
                            }
                          }}
                          className="rounded text-[#015FC4] focus:ring-[#015FC4]"
                        />
                        <span className="text-xs font-medium">{ciclo.label}</span>
                      </label>
                    );
                  })}
                </div>
                {errors.ciclos && <span className="text-xs text-red-600 block mt-1">{errors.ciclos}</span>}
              </div>
            </div>
          )}

          {/* STEP 5: Configurações do SaaS */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <span className="text-xs font-semibold text-[#012041] block mb-2">
                  Escolha o Plano de Subscrição Inicial:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      nome: 'Plano Básico' as SchoolPlan,
                      preco: '75.000 Kz/mês',
                      desc: 'Até 500 alunos. Gestão de pautas e propinas.',
                    },
                    {
                      nome: 'Plano Pro' as SchoolPlan,
                      preco: '125.000 Kz/mês',
                      desc: 'Até 1.500 alunos. Módulo pedagógico avançado e Multicaixa.',
                      destaque: true,
                    },
                    {
                      nome: 'Plano Enterprise' as SchoolPlan,
                      preco: '185.000 Kz/mês',
                      desc: 'Até 3.000 alunos. Suporte dedicado e declarações com carimbo digital.',
                    },
                  ].map((p) => {
                    const isSelected = formData.plano === p.nome;
                    return (
                      <div
                        key={p.nome}
                        onClick={() => setFormData({ ...formData, plano: p.nome })}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#015FC4] ring-2 ring-[#015FC4]/20 bg-blue-50/40'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-[#012041]">{p.nome}</span>
                          {p.destaque && <Badge variant="primary">Popular</Badge>}
                        </div>
                        <div className="text-base font-bold text-[#015FC4] font-mono mb-2">
                          {p.preco}
                        </div>
                        <p className="text-xs text-[#41515D]">{p.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Período Experimental de 30 Dias:</strong> A escola iniciará no estado <strong>Trial</strong> sem cobranças imediatas nesta fase.
                </span>
              </div>
            </div>
          )}

          {/* STEP 6: Conclusão & Resumo de Homologação */}
          {currentStep === 6 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-5 rounded-xl border border-[#E2E8F0] bg-slate-50/70 space-y-3 text-xs">
                <h4 className="text-sm font-bold text-[#012041]">Resumo da Nova Instituição Escolar</h4>
                
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-[#41515D] block">Escola:</span>
                    <strong className="text-[#012041]">{formData.nome}</strong>
                  </div>
                  <div>
                    <span className="text-[#41515D] block">NIF:</span>
                    <strong className="font-mono text-[#012041]">{formData.nif}</strong>
                  </div>
                  <div>
                    <span className="text-[#41515D] block">Localização:</span>
                    <span>{formData.municipio}, {formData.provincia}</span>
                  </div>
                  <div>
                    <span className="text-[#41515D] block">Subscrição Escolhida:</span>
                    <strong className="text-[#015FC4]">{formData.plano}</strong>
                  </div>
                  <div>
                    <span className="text-[#41515D] block">Administrador Responsável:</span>
                    <span>{formData.adminNome} ({formData.adminEmail})</span>
                  </div>
                  <div>
                    <span className="text-[#41515D] block">Ano Lectivo Inicial:</span>
                    <span>{formData.anoLectivo}</span>
                  </div>
                </div>
              </div>

              <Alert type="success" title="Pronto para Provisionar">
                Ao clicar em "Homologar & Criar Escola", o tenant será inicializado, o administrador será cadastrado e um log administrativo será registado.
              </Alert>
            </div>
          )}

          {/* Wizard Footer Controls */}
          <div className="flex items-center justify-between pt-5 border-t border-[#E2E8F0]">
            <div>
              {currentStep > 1 && (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<ArrowLeft className="w-4 h-4" />}
                  onClick={handleBack}
                >
                  Voltar
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('saas-schools')}
              >
                Cancelar
              </Button>

              {currentStep < 6 ? (
                <Button
                  variant="primary"
                  size="sm"
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                  onClick={handleNext}
                >
                  Próximo Passo
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  icon={<CheckCircle2 className="w-4 h-4" />}
                  onClick={handleFinishOnboarding}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'A provisionar tenant...' : 'Homologar & Criar Escola'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
