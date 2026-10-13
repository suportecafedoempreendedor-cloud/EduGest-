import React, { useState } from 'react';
import {
  Palette,
  Check,
  Copy,
  Type,
  Layers,
  Sparkles,
  Sliders,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  Maximize2,
  Box,
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Alert } from './ui/Alert';
import { Input, Select } from './ui/Input';
import { Toast } from './ui/Toast';
import { ToastNotification } from '../types';

interface DesignSystemViewProps {
  onTriggerToast?: (toast: Omit<ToastNotification, 'id'>) => void;
}

export const DesignSystemView: React.FC<DesignSystemViewProps> = ({ onTriggerToast }) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tokens' | 'typography' | 'components' | 'rules'>('tokens');

  // Interactive component sandbox state
  const [sandboxInput, setSandboxInput] = useState('Texto de teste');
  const [sandboxSelect, setSandboxSelect] = useState('opt1');
  const [sandboxButtonCount, setSandboxButtonCount] = useState(0);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHex(label);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const officialColors = [
    {
      name: 'Azul Marinho',
      hex: '#012041',
      variable: '--primary',
      bgClass: 'bg-[#012041]',
      textClass: 'text-white',
      usage: [
        'Cabeçalho',
        'Sidebar',
        'Navegação principal',
        'Elementos institucionais',
        'Fundo de áreas de destaque',
        'Textos de maior hierarquia quando adequado',
      ],
      description: 'Cor institucional principal que transmite solidez, autoridade e segurança.',
    },
    {
      name: 'Azul Tecnológico',
      hex: '#015FC4',
      variable: '--primary-action',
      bgClass: 'bg-[#015FC4]',
      textClass: 'text-white',
      usage: [
        'Botões principais',
        'Links',
        'Estados activos',
        'Elementos interactivos',
        'Indicadores',
        'Chamadas para acção (CTAs)',
      ],
      description: 'Cor condutora da interacção e acções principais da plataforma.',
    },
    {
      name: 'Azul Vivo',
      hex: '#0263CB',
      variable: '--primary-bright',
      bgClass: 'bg-[#0263CB]',
      textClass: 'text-white',
      usage: [
        'Destaques',
        'Gráficos e barras',
        'Ícones de acento',
        'Estados seleccionados',
        'Elementos interactivos secundários',
      ],
      description: 'Adiciona luminosidade, vivacidade tecnológica e hierarquia visual.',
    },
    {
      name: 'Cinza Azulado',
      hex: '#41515D',
      variable: '--text-secondary',
      bgClass: 'bg-[#41515D]',
      textClass: 'text-white',
      usage: [
        'Textos secundários',
        'Descrições e legendas',
        'Labels de formulários',
        'Ícones secundários',
        'Elementos de apoio',
      ],
      description: 'Garante excelente legibilidade e harmonia com os tons de azul marinho.',
    },
    {
      name: 'Branco',
      hex: '#FFFFFF',
      variable: '--background',
      bgClass: 'bg-[#FFFFFF] border border-[#E2E8F0]',
      textClass: 'text-[#012041]',
      usage: [
        'Fundo principal',
        'Cards',
        'Formulários e inputs',
        'Áreas de conteúdo',
        'Contraste',
      ],
      description: 'Base limpa e arejada para máxima clareza na visualização dos dados.',
    },
  ];

  const functionalColors = [
    {
      name: 'Verde (Sucesso)',
      hex: '#10B981',
      bg: 'bg-emerald-500',
      description: 'Transações confirmadas, alunos aprovados, situação regularizada.',
      rule: 'Utilizar estritamente em indicadores de estado funcional. Nunca como cor de marca.',
    },
    {
      name: 'Vermelho (Erro / Crítico)',
      hex: '#EF4444',
      bg: 'bg-red-500',
      description: 'Propinas em atraso, notas abaixo de 10 valores, validações inválidas.',
      rule: 'Utilizar estritamente em situações de erro ou criticidade pedagógica.',
    },
    {
      name: 'Amarelo / Âmbar (Alerta)',
      hex: '#F59E0B',
      bg: 'bg-amber-500',
      description: 'Prazos a expirar, pagamentos sob conciliação bancária, avisos.',
      rule: 'Utilizar estritamente em estados de atenção e avisos temporários.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-[#012041] text-white rounded-xl p-6 relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/10 text-xs font-semibold text-[#8EA5B8] uppercase tracking-wider mb-2">
            <Palette className="w-3.5 h-3.5 text-[#015FC4]" />
            Manual de Identidade Visual & Design System
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Identidade Visual Oficial do EduGest Angola
          </h2>
          <p className="text-sm text-[#8EA5B8] mt-2 leading-relaxed">
            A identidade visual transmite <strong className="text-white">confiança, tecnologia, organização, segurança e profissionalismo</strong>.
            Consulte a paleta oficial, tokens em variáveis CSS, escala tipográfica e biblioteca de componentes reutilizáveis.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#E2E8F0] gap-2 overflow-x-auto pb-px">
        {[
          { id: 'tokens', label: '1. Paleta Oficial & Variáveis', icon: <Palette className="w-4 h-4" /> },
          { id: 'typography', label: '2. Tipografia (Inter)', icon: <Type className="w-4 h-4" /> },
          { id: 'components', label: '3. Biblioteca de Componentes', icon: <Box className="w-4 h-4" /> },
          { id: 'rules', label: '4. Regras Visuais & Diretrizes', icon: <ShieldCheck className="w-4 h-4" /> },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-[#015FC4] text-[#015FC4] font-semibold'
                  : 'border-transparent text-[#41515D] hover:text-[#012041]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Tokens & Palette */}
      {activeTab === 'tokens' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#012041]">Cores Oficiais da Marca</h3>
              <p className="text-xs text-[#41515D]">
                Clique em qualquer cartão para copiar o código HEX ou o nome da variável CSS.
              </p>
            </div>
            {copiedHex && (
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 animate-in fade-in">
                Copiado: {copiedHex}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {officialColors.map((color) => (
              <Card
                key={color.name}
                className="hover:border-[#015FC4] transition-all cursor-pointer group"
                noPadding
                onClick={() => copyToClipboard(color.hex, color.name)}
              >
                <div
                  className={`h-28 rounded-t-xl p-4 flex flex-col justify-between ${color.bgClass} ${color.textClass}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider opacity-90">
                      {color.name}
                    </span>
                    <button
                      className="p-1 rounded bg-black/20 hover:bg-black/40 text-white transition-colors"
                      title="Copiar HEX"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div>
                    <div className="text-xl font-bold font-mono tracking-tight">{color.hex}</div>
                    <div className="text-[11px] font-mono opacity-80">{color.variable}</div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <p className="text-xs text-[#41515D]">{color.description}</p>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#012041] block mb-1">
                      Utilização Prevista:
                    </span>
                    <ul className="text-xs text-[#41515D] space-y-1">
                      {color.usage.map((u, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-[#015FC4] font-bold">•</span>
                          <span>{u}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Functional States Notice */}
          <Card
            title="Cores Adicionais para Estados Funcionais"
            subtitle="Regra Estrita: Estas cores devem aparecer apenas em componentes de estado e nunca substituir a identidade principal."
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {functionalColors.map((fc) => (
                <div
                  key={fc.name}
                  className="p-4 rounded-xl border border-[#E2E8F0] bg-slate-50/50 space-y-2"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded-full ${fc.bg} shrink-0`} />
                    <span className="text-xs font-bold text-[#012041]">{fc.name}</span>
                    <span className="text-xs font-mono text-[#41515D] ml-auto">{fc.hex}</span>
                  </div>
                  <p className="text-xs text-[#41515D]">{fc.description}</p>
                  <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded border border-amber-200">
                    {fc.rule}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* CSS Variables Code Snippet */}
          <Card
            title="Código de Variáveis CSS (:root)"
            subtitle="Definido no src/index.css para uso transversal em toda a aplicação"
            headerAction={
              <Button
                variant="secondary"
                size="sm"
                icon={<Copy className="w-3.5 h-3.5" />}
                onClick={() =>
                  copyToClipboard(
                    `:root {\n  --primary: #012041;\n  --primary-action: #015FC4;\n  --primary-bright: #0263CB;\n  --text-secondary: #41515D;\n  --background: #FFFFFF;\n}`,
                    'CSS Variables'
                  )
                }
              >
                Copiar Variáveis
              </Button>
            }
          >
            <pre className="p-4 rounded-lg bg-[#012041] text-blue-100 font-mono text-xs overflow-x-auto">
{`:root {
  --primary: #012041;          /* Azul Marinho (Cabeçalho, Sidebar, institucional) */
  --primary-action: #015FC4;   /* Azul Tecnológico (Botões, acções, estados activos) */
  --primary-action-hover: #014FA5; /* Variação escura para hover */
  --primary-bright: #0263CB;   /* Azul Vivo (Destaques, gráficos, acentos) */
  --text-secondary: #41515D;   /* Cinza Azulado (Textos de apoio, labels, legendas) */
  --background: #FFFFFF;       /* Branco (Base de cards, formulários e contraste) */

  /* Estados Funcionais */
  --status-success: #10B981;
  --status-warning: #F59E0B;
  --status-error: #EF4444;
}`}
            </pre>
          </Card>
        </div>
      )}

      {/* Tab 2: Typography */}
      {activeTab === 'typography' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <Card
            title="Hierarquia Tipográfica Oficial (Inter)"
            subtitle="Utilizar tipografia moderna, profissional e altamente legível. Escala hierárquica oficial:"
          >
            <div className="divide-y divide-[#E2E8F0] space-y-4 pt-2">
              <div className="pt-4 flex flex-col md:flex-row md:items-baseline justify-between gap-4">
                <div className="w-48 shrink-0">
                  <span className="text-xs font-mono font-bold text-[#015FC4]">H1 · 30px / 700 Bold</span>
                  <p className="text-xs text-[#41515D]">Títulos principais de páginas</p>
                </div>
                <h1 className="text-h1 flex-1">
                  Gestão Escolar e Académica Integrada de Angola
                </h1>
              </div>

              <div className="pt-4 flex flex-col md:flex-row md:items-baseline justify-between gap-4">
                <div className="w-48 shrink-0">
                  <span className="text-xs font-mono font-bold text-[#015FC4]">H2 · 24px / 600 SemiBold</span>
                  <p className="text-xs text-[#41515D]">Títulos de secção e módulos</p>
                </div>
                <h2 className="text-h2 flex-1">
                  Pauta de Avaliação Trimestral e Rendimento
                </h2>
              </div>

              <div className="pt-4 flex flex-col md:flex-row md:items-baseline justify-between gap-4">
                <div className="w-48 shrink-0">
                  <span className="text-xs font-mono font-bold text-[#015FC4]">H3 · 18px / 600 SemiBold</span>
                  <p className="text-xs text-[#41515D]">Subtítulos e títulos de cards</p>
                </div>
                <h3 className="text-h3 flex-1">
                  Distribuição de Alunos por Províncias e Cursos
                </h3>
              </div>

              <div className="pt-4 flex flex-col md:flex-row md:items-baseline justify-between gap-4">
                <div className="w-48 shrink-0">
                  <span className="text-xs font-mono font-bold text-[#015FC4]">Body · 15px / 400 Regular</span>
                  <p className="text-xs text-[#41515D]">Texto corrente de leitura</p>
                </div>
                <p className="text-body flex-1 max-w-2xl">
                  O sistema EduGest Angola padroniza os processos de matrícula, registo de faltas, lançamento de notas contínuas (MAC), notas de provas do professor (NPP) e provas trimestrais (NPT), garantindo total conformidade legal com os decretos executivos do Ministério da Educação.
                </p>
              </div>

              <div className="pt-4 flex flex-col md:flex-row md:items-baseline justify-between gap-4">
                <div className="w-48 shrink-0">
                  <span className="text-xs font-mono font-bold text-[#015FC4]">Caption · 13px / 400 Regular</span>
                  <p className="text-xs text-[#41515D]">Informação auxiliar e notas</p>
                </div>
                <p className="text-caption flex-1">
                  Documento processado por computador aos 07 de Outubro de 2026. Carimbo institucional e código hash válidos.
                </p>
              </div>

              <div className="pt-4 flex flex-col md:flex-row md:items-baseline justify-between gap-4">
                <div className="w-48 shrink-0">
                  <span className="text-xs font-mono font-bold text-[#015FC4]">Tabular · Mono Tabular</span>
                  <p className="text-xs text-[#41515D]">Números, finanças e pautas</p>
                </div>
                <div className="flex-1 font-mono tabular-nums text-sm font-semibold text-[#012041]">
                  1.480 Alunos · 56.980.000 Kz · Média 17,5 / 20 · Ref: 923456781-MCX
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 3: Component Library Showcase */}
      {activeTab === 'components' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Button Standards */}
          <Card
            title="Componente: Botões Oficiais"
            subtitle="Regras de estilo: Primary (Fundo #015FC4, Texto #FFFFFF, Hover #014FA5) · Secondary (Fundo #FFFFFF, Texto #012041, Borda #015FC4)"
          >
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="primary">Primary Button</Button>
                <Button variant="primary" icon={<Check className="w-4 h-4" />}>
                  Primary com Ícone
                </Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="secondary" icon={<Copy className="w-4 h-4" />}>
                  Secondary com Ícone
                </Button>
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="primary" disabled>
                  Desactivado
                </Button>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg text-xs text-[#41515D]">
                <strong>Comportamento de Hover:</strong> O botão primário escurece suavemente para <code className="font-mono text-[#012041]">#014FA5</code>. O botão secundário mantém o texto institucional <code className="font-mono text-[#012041]">#012041</code> com contorno de <code className="font-mono text-[#012041]">#015FC4</code>.
              </div>
            </div>
          </Card>

          {/* Form Controls Sandbox */}
          <Card
            title="Componente: Inputs & Selects"
            subtitle="Bordas discretas, foco realçado com anel em Azul Tecnológico #015FC4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Nome do Estudante"
                placeholder="Ex: Esperança Kiala"
                value={sandboxInput}
                onChange={(e) => setSandboxInput(e.target.value)}
                hint="Utilize o nome completo conforme o Bilhete de Identidade"
              />

              <Select
                label="Província de Residência"
                value={sandboxSelect}
                onChange={(e) => setSandboxSelect(e.target.value)}
                hint="Selecção geográfica"
              >
                <option value="opt1">Luanda</option>
                <option value="opt2">Benguela</option>
                <option value="opt3">Huambo</option>
                <option value="opt4">Huíla</option>
              </Select>

              <Input
                label="Input com Estado de Erro"
                defaultValue="BI Inválido"
                error="Formato de BI angolano inválido (ex: 006458921LA042)"
              />
            </div>
          </Card>

          {/* Badges and Functional Alerts */}
          <Card
            title="Componente: Badges de Estado & Alertas"
            subtitle="Cores adicionais apenas para comunicar estados funcionais (Verde, Vermelho, Amarelo/Âmbar)"
          >
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-[#012041] block mb-2">
                  Badges Funcionais:
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="success">Sucesso / Regularizado</Badge>
                  <Badge variant="warning">Alerta / Pendente</Badge>
                  <Badge variant="error">Erro / Em Atraso</Badge>
                  <Badge variant="primary">Azul Tecnológico</Badge>
                  <Badge variant="neutral">Neutro / Rascunho</Badge>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <span className="text-xs font-semibold text-[#012041] block mb-2">
                  Componentes de Alerta:
                </span>
                <Alert type="success" title="Operação Concluída com Sucesso">
                  Matrícula homologada e número de processo gerado com carimbo digital.
                </Alert>
                <Alert type="warning" title="Atenção ao Prazo Pedagógico">
                  Restam 3 dias para a conclusão do lançamento das pautas trimestrais.
                </Alert>
                <Alert type="error" title="Inconsistência Detectada">
                  O valor lançado difere do montante registrado na referência Multicaixa Express.
                </Alert>
                <Alert type="info" title="Informação Institucional">
                  Novo módulo de emissão de certificados está disponível no painel da secretaria.
                </Alert>
              </div>
            </div>
          </Card>

          {/* Toast Notification Component Showcase */}
          <Card
            title="Componente: Toasts & Notificações Flutuantes (Design System)"
            subtitle="Padrão oficial para captura e aviso de erros de rede, falhas de processamento de dados e confirmações de ações administrativas."
          >
            <div className="space-y-6">
              {/* Interactive buttons to test live toast stack */}
              <div>
                <span className="text-xs font-semibold text-[#012041] block mb-2">
                  Testar Disparo de Notificações em Tempo Real:
                </span>
                <div className="flex flex-wrap items-center gap-2.5">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() =>
                      onTriggerToast?.({
                        type: 'error',
                        title: 'Erro de Rede (HTTP 503)',
                        message:
                          'Falha de conectividade com o cluster de serviços do EduGest Angola. Timeout ao contactar o servidor.',
                        action: {
                          label: 'Tentar Novamente',
                          onClick: () =>
                            onTriggerToast?.({
                              type: 'info',
                              title: 'Reconexão',
                              message: 'A reestabelecer conexão segura...',
                            }),
                        },
                      })
                    }
                  >
                    Disparar Erro de Rede
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      onTriggerToast?.({
                        type: 'error',
                        title: 'Erro no Processamento de Dados',
                        message:
                          'O NIF institucional fornecido já se encontra associado a outra escola na base de dados.',
                      })
                    }
                  >
                    Disparar Erro de Dados
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      onTriggerToast?.({
                        type: 'success',
                        title: 'Tenant Homologado',
                        message:
                          'Nova instituição escolar cadastrada e provisionada com sucesso no ambiente multi-tenant.',
                      })
                    }
                  >
                    Disparar Sucesso
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      onTriggerToast?.({
                        type: 'warning',
                        title: 'Alerta Operacional',
                        message:
                          'O período experimental (Trial de 30 dias) expira em 5 dias.',
                      })
                    }
                  >
                    Disparar Alerta
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      onTriggerToast?.({
                        type: 'info',
                        title: 'Informação Administrativa',
                        message:
                          'Sessão administrativa sincronizada com os logs de auditoria.',
                      })
                    }
                  >
                    Disparar Info
                  </Button>
                </div>
              </div>

              {/* Static Showcase of the 4 Toast Variants */}
              <div>
                <span className="text-xs font-semibold text-[#012041] block mb-3">
                  Visualização dos Estados Oficiais do Toast:
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Toast Erro de Rede / Processamento */}
                  <div className="p-4 rounded-xl border border-red-200 bg-white shadow-sm flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-red-50 text-red-600 shrink-0">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#012041] text-xs">Erro de Rede ou Processamento</span>
                        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                          Falha
                        </span>
                      </div>
                      <p className="text-[#41515D] text-xs mt-1">
                        Utilizado para capturar falhas de rede (503/timeout), inconsistências de NIF ou transições administrativas negadas.
                      </p>
                    </div>
                  </div>

                  {/* Toast Sucesso */}
                  <div className="p-4 rounded-xl border border-emerald-200 bg-white shadow-sm flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#012041] text-xs">Ação Concluída</span>
                        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                          Concluído
                        </span>
                      </div>
                      <p className="text-[#41515D] text-xs mt-1">
                        Utilizado para confirmações de provisionamento, atualização de cadastros e emissão de recibos.
                      </p>
                    </div>
                  </div>

                  {/* Toast Alerta */}
                  <div className="p-4 rounded-xl border border-amber-200 bg-white shadow-sm flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-50 text-amber-600 shrink-0">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#012041] text-xs">Aviso Administrativo</span>
                        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                          Atenção
                        </span>
                      </div>
                      <p className="text-[#41515D] text-xs mt-1">
                        Utilizado para avisos sobre prazos de trial a expirar ou instituições sob conciliação.
                      </p>
                    </div>
                  </div>

                  {/* Toast Informativo */}
                  <div className="p-4 rounded-xl border border-blue-200 bg-white shadow-sm flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-50 text-[#015FC4] shrink-0">
                      <Info className="w-5 h-5 text-[#015FC4]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#012041] text-xs">Informação do Sistema</span>
                        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-[#015FC4]">
                          SaaS
                        </span>
                      </div>
                      <p className="text-[#41515D] text-xs mt-1">
                        Utilizado para notificações institucionais e alterações de contexto ou tenant.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Cards Specification */}
          <Card
            title="Design dos Cards"
            subtitle="Fundo branco, bordas discretas, cantos ligeiramente arredondados (rounded-xl), sombras suaves."
          >
            <div className="p-4 bg-slate-50 rounded-lg text-xs text-[#41515D] space-y-2">
              <p>
                <strong>Regra:</strong> Os cards devem utilizar fundo branco (<code className="font-mono text-[#012041]">#FFFFFF</code>), bordas discretas (<code className="font-mono text-[#012041]">#E2E8F0</code>), cantos ligeiramente arredondados (<code className="font-mono text-[#012041]">rounded-xl</code>), sombras suaves (<code className="font-mono text-[#012041]">shadow-xs</code>) e hierarquia visual clara.
              </p>
              <p>
                <strong>Restrição:</strong> Evitar excesso de sombras pesadas, gradientes coloridos decorativos ou efeitos que poluam a leitura de dados escolares críticos.
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 4: Rules & Guidelines Checklist */}
      {activeTab === 'rules' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <Card
            title="Regras Visuais Obrigatórias"
            subtitle="Critérios de aceitação e conformidade estrita com o manual da marca"
          >
            <div className="space-y-3">
              {[
                {
                  rule: 'Utilizar o Azul Marinho #012041 como cor institucional principal',
                  detail: 'Aplicado na Sidebar, navegação de topo, elementos de autoridade e títulos H1/H2.',
                },
                {
                  rule: 'Utilizar o Azul Tecnológico #015FC4 como cor principal de acção',
                  detail: 'Aplicado em botões primários, links activos, selecções e indicadores principais.',
                },
                {
                  rule: 'Utilizar o Azul Vivo #0263CB para destaques e elementos interactivos',
                  detail: 'Aplicado em gráficos comparativos, ícones secundários e realces visuais.',
                },
                {
                  rule: 'Utilizar o Cinza Azulado #41515D para informação secundária',
                  detail: 'Aplicado em labels, descrições, notas de rodapé e metadados contextuais.',
                },
                {
                  rule: 'Utilizar o Branco #FFFFFF como base das áreas de conteúdo',
                  detail: 'Garante contraste limpo e legibilidade em formulários e tabelas.',
                },
                {
                  rule: 'Não adicionar outras cores principais à identidade visual',
                  detail: 'A marca é estritamente azul e sóbria. Cores como roxo, laranja ou rosa estão proibidas.',
                },
                {
                  rule: 'Cores funcionais reservadas exclusivamente para estados',
                  detail: 'Verde (sucesso), Vermelho (erro/crítico), Âmbar (alerta) aparecem apenas em componentes de estado e nunca substituem a identidade principal.',
                },
                {
                  rule: 'Design adaptado para dispositivos móveis sem redução forçada',
                  detail: 'Reorganização em gaveta móvel, tabelas convertidas em cartões e áreas tácteis confortáveis (≥ 44px).',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg border border-slate-200 bg-white flex items-start gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xs">
                    <h4 className="font-semibold text-[#012041]">{item.rule}</h4>
                    <p className="text-[#41515D] mt-0.5">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card
            title="Consistência para Novas Fases"
            subtitle="Garantia de produto unificado"
          >
            <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl text-xs text-[#012041] space-y-2">
              <p className="font-semibold text-[#015FC4]">
                Directriz de Escalabilidade:
              </p>
              <p className="leading-relaxed">
                Todas as novas funcionalidades desenvolvidas nas fases seguintes deverão reutilizar este mesmo design system. Não criar uma nova paleta de cores para módulos individuais. A aplicação deve parecer um único produto mesmo quando diferentes módulos forem desenvolvidos em fases diferentes.
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
