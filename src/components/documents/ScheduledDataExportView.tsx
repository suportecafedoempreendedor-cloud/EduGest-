import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  HardDrive,
  Clock,
  Calendar,
  Lock,
  Download,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileText,
  KeyRound,
  Server,
  Layers,
  Info,
  Hash,
  Database,
  Eye,
  Sliders,
  Check,
  ChevronRight,
  ExternalLink,
  Bell,
  Mail,
  Send,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Modal } from '../ui/Modal';
import {
  School,
  Student,
  NotaItem,
  Section,
  StudentAttendanceRecord,
  UserRole,
} from '../../types';
import {
  ScheduledExportConfig,
  ExportHistoryRecord,
  DataExportPayload,
  StorageProvider,
  RetentionPeriodDays,
} from '../../types/dataExportSecurity';
import {
  INITIAL_EXPORT_CONFIGS,
  INITIAL_EXPORT_HISTORY,
} from '../../data/mockDataExportSecurity';
import {
  generateBackupPayload,
  packageEncryptedExport,
  downloadEncryptedFile,
  computeSha256Hex,
} from '../../services/dataExportSecurityService';

interface ScheduledDataExportViewProps {
  currentSchool: School;
  students: Student[];
  notas: NotaItem[];
  sections: Section[];
  attendanceRecords: StudentAttendanceRecord[];
  userRole: UserRole;
  onNotify?: (notification: {
    type: 'success' | 'error' | 'info';
    title?: string;
    message: string;
  }) => void;
}

export const ScheduledDataExportView: React.FC<ScheduledDataExportViewProps> = ({
  currentSchool,
  students,
  notas,
  sections,
  attendanceRecords,
  userRole,
  onNotify,
}) => {
  // Configuração por escola
  const [config, setConfig] = useState<ScheduledExportConfig>(() => {
    return (
      INITIAL_EXPORT_CONFIGS[currentSchool.id] || {
        id: `cfg-${currentSchool.id}`,
        escolaId: currentSchool.id,
        escolaNome: currentSchool.nome,
        enabled: true,
        frequency: 'daily',
        timeOfDay: '02:00',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        retentionDays: 180,
        storageTarget: 'angola_sovereign_dc',
        datacenterLocation: 'Luanda - Datacenter Nacional Soberano (Angola Telecom)',
        includeStudentsBi: true,
        includeAcademicGrades: true,
        includeAttendance: true,
        includeFinancialRecords: false,
        encryptionAlgorithm: 'AES-256-GCM',
        keyFingerprint: 'SHA256:7a9f8c12b4e5d6a89c01fe23ba45dc781290fe34',
        anonymizeGuardiansInExport: false,
        legalBasisNote: 'Lei nº 22/11 de Angola · Processo de Notificação APD nº 2025/AO-1048',
        contactDPO: `dpo@${currentSchool.email.split('@')[1] || 'escola.edu.ao'}`,
        lastRunTimestamp: new Date().toISOString(),
        nextScheduledTimestamp: new Date(Date.now() + 86400000).toISOString(),
        createdAt: '2025-09-01T08:00:00Z',
        updatedAt: new Date().toISOString(),
      }
    );
  });

  // Histórico de backups
  const [history, setHistory] = useState<ExportHistoryRecord[]>(() => {
    return INITIAL_EXPORT_HISTORY.filter((h) => h.escolaId === currentSchool.id);
  });

  // Estados de execução e modal
  const [isExecutingNow, setIsExecutingNow] = useState(false);
  const [inspectRecord, setInspectRecord] = useState<ExportHistoryRecord | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewPayload, setPreviewPayload] = useState<DataExportPayload | null>(null);
  const [activeTab, setActiveTab] = useState<'config' | 'history' | 'compliance'>('config');

  // Estados do Agendador Automático & Notificação ao Administrador
  const [adminNotificationEmail, setAdminNotificationEmail] = useState<string>(
    config.adminNotificationEmail || 'suportecafedoempreendedor@gmail.com'
  );
  const [notifyAdminOnSuccess, setNotifyAdminOnSuccess] = useState<boolean>(
    config.notifyAdminOnSuccess ?? true
  );
  const [notifyInApp, setNotifyInApp] = useState<boolean>(true);
  const [notifySms, setNotifySms] = useState<boolean>(false);
  const [isSimulatingCron, setIsSimulatingCron] = useState<boolean>(false);
  const [lastAdminNotificationReceipt, setLastAdminNotificationReceipt] = useState<{
    timestamp: string;
    recipient: string;
    subject: string;
    recordsSummary: string;
    checksumSha256: string;
    channels: string[];
    status: 'delivered';
  } | null>(() => {
    return {
      timestamp: new Date().toISOString(),
      recipient: 'suportecafedoempreendedor@gmail.com',
      subject: `[EduGest Angola] Relatório de Backup Automático Diário · ${currentSchool.nome}`,
      recordsSummary: `${students.length} alunos · ${notas.length} avaliações · AES-256-GCM`,
      checksumSha256: 'a9f8c12b4e5d6a89c01fe23ba45dc781290fe34b8c7123ef',
      channels: ['Email Oficial (SMTP)', 'Notificação In-App'],
      status: 'delivered',
    };
  });

  // Filtra dados pertencentes a esta escola
  const schoolStudents = useMemo(() => {
    return students.filter(
      (s) => s.escolaId === currentSchool.id || s.escolaNome === currentSchool.nome
    );
  }, [students, currentSchool]);

  const schoolNotas = useMemo(() => {
    const studentIds = new Set(schoolStudents.map((s) => s.id));
    return notas.filter((n) => studentIds.has(n.alunoId));
  }, [notas, schoolStudents]);

  // Manipulador: Disparo da Rotina Diária Automática Agendada (com envio de notificação ao admin)
  const handleTriggerScheduledRun = async () => {
    try {
      setIsSimulatingCron(true);
      const startTime = performance.now();

      // 1. Gerar payload estruturado
      const { payload, jsonString, sha256 } = await generateBackupPayload(
        currentSchool,
        students,
        notas,
        sections,
        attendanceRecords,
        config
      );

      // 2. Empacotar e cifrar com selo de integridade
      const { filename, fileSizeBytes } = await packageEncryptedExport(
        currentSchool,
        jsonString,
        sha256,
        config
      );

      const endTime = performance.now();
      const executionDurationMs = Math.round(endTime - startTime);

      const activeChannels: string[] = [];
      if (notifyAdminOnSuccess) activeChannels.push('Email Oficial');
      if (notifyInApp) activeChannels.push('In-App EduGest');
      if (notifySms) activeChannels.push('SMS Alerta APD');

      // 3. Criar registro de histórico marcado como rotina agendada
      const newHistoryRecord: ExportHistoryRecord = {
        id: `exp-cron-${Date.now()}`,
        configId: config.id,
        escolaId: currentSchool.id,
        escolaNome: currentSchool.nome,
        timestamp: new Date().toISOString(),
        filename,
        fileSizeBytes,
        totalRecords: {
          students: payload.dataset.alunos.length,
          grades: payload.dataset.notas.length,
          attendance: payload.dataset.assiduidade?.length || 0,
        },
        checksumSha256: sha256,
        encryptionKeyId: `KMS-ANG-${currentSchool.id.toUpperCase()}-VAULT`,
        status: 'completed',
        storageEndpoint: `vault://${config.storageTarget}.ao/${currentSchool.id}/daily/${new Date().toISOString().split('T')[0]}/`,
        executionDurationMs,
        initiatedBy: 'scheduled_daemon',
        notificationSentToAdmin: {
          sent: true,
          recipient: adminNotificationEmail,
          timestamp: new Date().toISOString(),
          channels: activeChannels,
        },
        complianceSeal: {
          lawReference: 'Lei nº 22/11 de Angola',
          authority: 'Agência de Protecção de Dados (APD)',
          certifiedSovereignty: true,
        },
      };

      setHistory((prev) => [newHistoryRecord, ...prev]);

      // Atualiza estado do comprovativo da notificação
      setLastAdminNotificationReceipt({
        timestamp: new Date().toISOString(),
        recipient: adminNotificationEmail,
        subject: `[EduGest Angola] Sucesso: Backup Diário Criptografado da Base de Dados (${currentSchool.nome})`,
        recordsSummary: `${payload.dataset.alunos.length} alunos · ${payload.dataset.notas.length} notas protegidos com AES-256-GCM`,
        checksumSha256: sha256,
        channels: activeChannels,
        status: 'delivered',
      });

      // Actualiza data de última execução na configuração
      setConfig((prev) => ({
        ...prev,
        lastRunTimestamp: new Date().toISOString(),
        nextScheduledTimestamp: new Date(Date.now() + 86400000).toISOString(),
        lastNotificationStatus: 'delivered',
        lastNotificationTimestamp: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      // Dispara a notificação oficial ao administrador
      onNotify?.({
        type: 'success',
        title: '🔔 Relatório de Backup Automático Enviado ao Admin',
        message: `Rotina diária automática concluída com sucesso às ${config.timeOfDay}. Cópia de segurança de ${payload.dataset.alunos.length} alunos e ${payload.dataset.notas.length} notas gravada no Storage Soberano. Notificação e selo de conformidade APD entregues a ${adminNotificationEmail}.`,
      });
    } catch (err: any) {
      onNotify?.({
        type: 'error',
        title: 'Falha no Agendamento Diário',
        message: err?.message || 'Ocorreu um erro no daemon de backup diário.',
      });
    } finally {
      setIsSimulatingCron(false);
    }
  };

  // Manipulador: Executar Exportação Imediata
  const handleExecuteBackupNow = async () => {
    try {
      setIsExecutingNow(true);
      const startTime = performance.now();

      // 1. Gerar payload estruturado
      const { payload, jsonString, sha256 } = await generateBackupPayload(
        currentSchool,
        students,
        notas,
        sections,
        attendanceRecords,
        config
      );

      // 2. Empacotar e cifrar com selo de integridade
      const { encryptedPackage, filename, fileSizeBytes } = await packageEncryptedExport(
        currentSchool,
        jsonString,
        sha256,
        config
      );

      const endTime = performance.now();
      const executionDurationMs = Math.round(endTime - startTime);

      // 3. Criar registro de histórico
      const newHistoryRecord: ExportHistoryRecord = {
        id: `exp-${Date.now()}`,
        configId: config.id,
        escolaId: currentSchool.id,
        escolaNome: currentSchool.nome,
        timestamp: new Date().toISOString(),
        filename,
        fileSizeBytes,
        totalRecords: {
          students: payload.dataset.alunos.length,
          grades: payload.dataset.notas.length,
          attendance: payload.dataset.assiduidade?.length || 0,
        },
        checksumSha256: sha256,
        encryptionKeyId: `KMS-ANG-${currentSchool.id.toUpperCase()}-VAULT`,
        status: 'completed',
        storageEndpoint: `vault://${config.storageTarget}.ao/${currentSchool.id}/daily/${new Date().toISOString().split('T')[0]}/`,
        executionDurationMs,
        initiatedBy: 'manual_admin',
        complianceSeal: {
          lawReference: 'Lei nº 22/11 de Angola',
          authority: 'Agência de Protecção de Dados (APD)',
          certifiedSovereignty: true,
        },
      };

      setHistory((prev) => [newHistoryRecord, ...prev]);

      // Actualiza data de última execução na configuração
      setConfig((prev) => ({
        ...prev,
        lastRunTimestamp: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      // Baixar ficheiro cifrado para guarda do operador
      downloadEncryptedFile(filename, encryptedPackage);

      onNotify?.({
        type: 'success',
        title: 'Exportação Segura Concluída',
        message: `Base de dados de ${payload.dataset.alunos.length} alunos e ${payload.dataset.notas.length} notas exportada e criptografada (AES-256-GCM) para o storage seguro.`,
      });
    } catch (err: any) {
      onNotify?.({
        type: 'error',
        title: 'Falha na Exportação',
        message: err?.message || 'Ocorreu um erro ao processar o backup seguro.',
      });
    } finally {
      setIsExecutingNow(false);
    }
  };

  // Pré-visualizar estrutura do Payload antes do envio
  const handleOpenPreview = async () => {
    const { payload } = await generateBackupPayload(
      currentSchool,
      students,
      notas,
      sections,
      attendanceRecords,
      config
    );
    setPreviewPayload(payload);
    setIsPreviewModalOpen(true);
  };

  // Salvar alterações de configuração
  const handleSaveConfig = () => {
    const activeChannels: ('email' | 'in_app' | 'sms')[] = [];
    if (notifyAdminOnSuccess) activeChannels.push('email');
    if (notifyInApp) activeChannels.push('in_app');
    if (notifySms) activeChannels.push('sms');

    setConfig((prev) => ({
      ...prev,
      adminNotificationEmail,
      notifyAdminOnSuccess,
      notifyChannels: activeChannels,
      updatedAt: new Date().toISOString(),
    }));

    onNotify?.({
      type: 'success',
      title: 'Políticas & Notificações Guardadas',
      message: `O agendamento diário (${config.timeOfDay}) e o envio de notificações para ${adminNotificationEmail} foram actualizados com sucesso.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* ========================================================
          CABEÇALHO OFICIAL: EXPORTAÇÃO AGENDADA & LEI 22/11
         ======================================================== */}
      <div className="bg-gradient-to-r from-[#012041] via-[#08305c] to-[#015FC4] rounded-xl p-6 sm:p-8 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-200 mb-2">
            <span className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              Conformidade Lei nº 22/11 (APD Angola)
            </span>
            <span aria-hidden="true">·</span>
            <span>{currentSchool.nome}</span>
            <span aria-hidden="true">·</span>
            <span>NIF: {currentSchool.nif}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Exportação Agendada Diária & Storage Seguro
          </h1>
          <p className="mt-2 text-sm text-blue-100 leading-relaxed max-w-3xl">
            Rotina automatizada de cópia de segurança encriptada (AES-256-GCM) da base de dados de alunos,
            pautas e notas académicas para repositório institucional soberano, cumprindo a legislação
            de salvaguarda e privacidade de dados da República de Angola.
          </p>

          {/* Abas Superiores */}
          <div className="flex flex-wrap items-center gap-2 mt-6">
            <button
              onClick={() => setActiveTab('config')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'config'
                  ? 'bg-white text-[#012041] shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Configuração & Agendamento</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'history'
                  ? 'bg-white text-[#012041] shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Histórico de Backups ({history.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('compliance')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'compliance'
                  ? 'bg-white text-[#012041] shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Soberania & Normas APD Angola</span>
            </button>
          </div>
        </div>

        {/* Resumo Rápido no Topo */}
        <div className="mt-6 pt-6 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-blue-300 block">Estado do Agendamento</span>
            <span className="font-semibold text-white flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {config.enabled ? 'Activo (Diário às 02:00)' : 'Desactivado'}
            </span>
          </div>
          <div>
            <span className="text-blue-300 block">Criptografia em Repouso</span>
            <span className="font-semibold text-white mt-0.5 block">
              {config.encryptionAlgorithm} + SHA-256
            </span>
          </div>
          <div>
            <span className="text-blue-300 block">Alunos & Notas do Tenant</span>
            <span className="font-semibold text-white mt-0.5 block">
              {schoolStudents.length} Alunos · {schoolNotas.length} Notas
            </span>
          </div>
          <div>
            <span className="text-blue-300 block">Destino de Soberania</span>
            <span className="font-semibold text-white mt-0.5 block truncate">
              Datacenter Nacional (Luanda)
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================
          ABA 1: CONFIGURAÇÃO & AGENDAMENTO DIÁRIO
         ======================================================== */}
      {activeTab === 'config' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div>
                    <h2 className="text-base font-bold text-[#012041]">
                      Parâmetros da Rotina Diária Automática
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Defina o horário nocturno e os dados incluídos na cópia diária da escola.
                    </p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs font-medium text-gray-700">
                      {config.enabled ? 'Agendamento Activado' : 'Agendamento Pausado'}
                    </span>
                    <input
                      type="checkbox"
                      checked={config.enabled}
                      onChange={(e) =>
                        setConfig((prev) => ({ ...prev, enabled: e.target.checked }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#015FC4]" />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Horário de Execução Diária (Hora de Luanda / WAT)
                    </label>
                    <div className="relative">
                      <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="time"
                        value={config.timeOfDay}
                        onChange={(e) =>
                          setConfig((prev) => ({ ...prev, timeOfDay: e.target.value }))
                        }
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4]"
                      />
                    </div>
                    <span className="text-[11px] text-gray-500 mt-1 block">
                      Recomendado entre 01:00 e 04:00 para não sobrecarregar as ligações escolares.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Período de Retenção de Dados no Vault
                    </label>
                    <select
                      value={config.retentionDays}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          retentionDays: Number(e.target.value) as RetentionPeriodDays,
                        }))
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4]"
                    >
                      <option value={30}>30 Dias (Cópia transitória)</option>
                      <option value={90}>90 Dias (1 Trimestre Lectivo)</option>
                      <option value={180}>180 Dias (6 Meses · Recomendado)</option>
                      <option value={365}>365 Dias (1 Ano Lectivo Completo)</option>
                      <option value={730}>730 Dias (2 Anos Lectivos)</option>
                    </select>
                    <span className="text-[11px] text-gray-500 mt-1 block">
                      Em conformidade com o tempo legal de arquivo exigido pelo MED.
                    </span>
                  </div>
                </div>

                {/* Selecção de Módulos Inclusos */}
                <div>
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                    Conteúdo da Cópia de Segurança
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.includeStudentsBi}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            includeStudentsBi: e.target.checked,
                          }))
                        }
                        className="mt-0.5 rounded text-[#015FC4] focus:ring-[#015FC4]"
                      />
                      <div>
                        <span className="text-xs font-semibold text-gray-900 block">
                          Identificação de Alunos & Processos
                        </span>
                        <span className="text-[11px] text-gray-500">
                          Nome, número de processo, BI angolano, naturalidade e turma.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.includeAcademicGrades}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            includeAcademicGrades: e.target.checked,
                          }))
                        }
                        className="mt-0.5 rounded text-[#015FC4] focus:ring-[#015FC4]"
                      />
                      <div>
                        <span className="text-xs font-semibold text-gray-900 block">
                          Pautas, Avaliações & Notas (0-20)
                        </span>
                        <span className="text-[11px] text-gray-500">
                          MAC, NPP, NPT, médias trimestrais e histórico pedagógico.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.includeAttendance}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            includeAttendance: e.target.checked,
                          }))
                        }
                        className="mt-0.5 rounded text-[#015FC4] focus:ring-[#015FC4]"
                      />
                      <div>
                        <span className="text-xs font-semibold text-gray-900 block">
                          Assiduidade & Faltas
                        </span>
                        <span className="text-[11px] text-gray-500">
                          Presenças, faltas justificadas/injustificadas por disciplina.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.anonymizeGuardiansInExport}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            anonymizeGuardiansInExport: e.target.checked,
                          }))
                        }
                        className="mt-0.5 rounded text-[#015FC4] focus:ring-[#015FC4]"
                      />
                      <div>
                        <span className="text-xs font-semibold text-gray-900 block">
                          Minimização dos Contactos de Encarregados
                        </span>
                        <span className="text-[11px] text-gray-500">
                          Aplica máscara nos telefones dos pais (Artigo 5º da Lei 22/11).
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Storage Seguro Destino */}
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                    Storage Seguro de Destino & Soberania
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      config.storageTarget === 'angola_sovereign_dc'
                        ? 'border-[#015FC4] bg-blue-50/50'
                        : 'border-gray-200 bg-white'
                    }`}>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="storageTarget"
                          value="angola_sovereign_dc"
                          checked={config.storageTarget === 'angola_sovereign_dc'}
                          onChange={() =>
                            setConfig((prev) => ({
                              ...prev,
                              storageTarget: 'angola_sovereign_dc',
                              datacenterLocation: 'Luanda - Datacenter Nacional Soberano (Angola Telecom)',
                            }))
                          }
                          className="text-[#015FC4]"
                        />
                        <span className="text-xs font-bold text-gray-900">
                          Datacenter Nacional Soberano (Luanda)
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1 pl-5">
                        Infraestrutura em território angolano elegível para dados públicos e sensíveis.
                      </p>
                    </label>

                    <label className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      config.storageTarget === 'minio_s3_luanda'
                        ? 'border-[#015FC4] bg-blue-50/50'
                        : 'border-gray-200 bg-white'
                    }`}>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="storageTarget"
                          value="minio_s3_luanda"
                          checked={config.storageTarget === 'minio_s3_luanda'}
                          onChange={() =>
                            setConfig((prev) => ({
                              ...prev,
                              storageTarget: 'minio_s3_luanda',
                              datacenterLocation: 'Talatona - Luanda Cloud Storage S3 Compatível On-Premise',
                            }))
                          }
                          className="text-[#015FC4]"
                        />
                        <span className="text-xs font-bold text-gray-900">
                          S3 Vault Privado On-Premise (Talatona)
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1 pl-5">
                        Armazenamento de alta resiliência cifrado localmente com chaves KMS da escola.
                      </p>
                    </label>
                  </div>
                </div>

                {/* Notificações ao Administrador após Exportação Concluída */}
                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-[#015FC4]" />
                      <span>Notificações Automáticas ao Administrador (Conclusão do Backup)</span>
                    </h3>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded uppercase">
                      Activo
                    </span>
                  </div>

                  <p className="text-xs text-gray-600">
                    Após cada rotina de exportação agendada diária, o sistema compila o relatório de integridade, 
                    valida o selo da Lei nº 22/11 (APD Angola) e envia imediatamente a notificação de confirmação.
                  </p>

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                    <label className="flex items-center gap-2.5 text-xs text-gray-800 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifyAdminOnSuccess}
                        onChange={(e) => setNotifyAdminOnSuccess(e.target.checked)}
                        className="rounded text-[#015FC4] focus:ring-[#015FC4]"
                      />
                      <span>Enviar notificação de sucesso e comprovativo de integridade ao Administrador</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                          Email do Administrador / Responsável de Segurança:
                        </label>
                        <div className="relative">
                          <Mail className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="email"
                            value={adminNotificationEmail}
                            onChange={(e) => setAdminNotificationEmail(e.target.value)}
                            placeholder="admin@escola.edu.ao"
                            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4] bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                          Canais de Envio Selecionados:
                        </label>
                        <div className="flex flex-wrap items-center gap-3 pt-1">
                          <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notifyAdminOnSuccess}
                              onChange={(e) => setNotifyAdminOnSuccess(e.target.checked)}
                              className="rounded text-[#015FC4] text-xs"
                            />
                            <span>Email Oficial</span>
                          </label>

                          <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notifyInApp}
                              onChange={(e) => setNotifyInApp(e.target.checked)}
                              className="rounded text-[#015FC4] text-xs"
                            />
                            <span>In-App EduGest</span>
                          </label>

                          <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notifySms}
                              onChange={(e) => setNotifySms(e.target.checked)}
                              className="rounded text-[#015FC4] text-xs"
                            />
                            <span>SMS APD</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Comprovativo da Última Notificação Entregue */}
                    {lastAdminNotificationReceipt && (
                      <div className="mt-2 pt-2 border-t border-gray-200/70 text-[11px] text-gray-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>
                            Última notificação entregue com sucesso para:{' '}
                            <strong className="text-gray-900 font-semibold">{lastAdminNotificationReceipt.recipient}</strong>
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-gray-400">
                          {new Date(lastAdminNotificationReceipt.timestamp).toLocaleString('pt-AO')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Info className="w-4 h-4 text-gray-400" />
                    <span>Última actualização: {new Date(config.updatedAt).toLocaleString('pt-AO')}</span>
                  </div>
                  <Button variant="primary" size="sm" onClick={handleSaveConfig}>
                    Guardar Parâmetros de Agendamento & Notificações
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Painel Lateral: Execução Imediata & Verificação */}
          <div className="space-y-6">
            <Card>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[#012041] uppercase tracking-wider">
                  <HardDrive className="w-4 h-4 text-[#015FC4]" />
                  <span>Ações Imediatas</span>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed">
                  Pode disparar manualmente o backup criptografado a qualquer momento para inspeção,
                  migração ou auditoria da inspecção geral do Ministério da Educação.
                </p>

                <div className="space-y-2 pt-2">
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full justify-center"
                    icon={<Play className="w-4 h-4" />}
                    onClick={handleExecuteBackupNow}
                    disabled={isExecutingNow}
                  >
                    {isExecutingNow ? 'A Processar e Criptografar...' : 'Executar Exportação Manual'}
                  </Button>

                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full justify-center bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border-emerald-300 font-semibold"
                    icon={<Send className="w-4 h-4 text-emerald-600" />}
                    onClick={handleTriggerScheduledRun}
                    disabled={isSimulatingCron}
                  >
                    {isSimulatingCron
                      ? 'A Executar Cron Diário & Notificar...'
                      : 'Simular Cron Diário & Notificar Admin'}
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full justify-center"
                    icon={<Eye className="w-4 h-4" />}
                    onClick={handleOpenPreview}
                  >
                    Inspecionar Estrutura do Payload
                  </Button>
                </div>

                <div className="pt-4 border-t border-gray-100 space-y-2 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Rotina automática diária:</span>
                    <span className="font-semibold text-emerald-700 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Activo às {config.timeOfDay} (UTC+1)
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Notificar admin em:</span>
                    <span className="font-semibold text-gray-900 truncate max-w-[150px]" title={adminNotificationEmail}>
                      {adminNotificationEmail}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Último backup:</span>
                    <span className="font-semibold text-gray-900">
                      {config.lastRunTimestamp
                        ? new Date(config.lastRunTimestamp).toLocaleString('pt-AO')
                        : 'Pendente'}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Criptografia:</span>
                    <span className="font-semibold text-emerald-600 font-mono">
                      {config.encryptionAlgorithm}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-amber-200">
              <div className="p-6 space-y-3 bg-amber-50/50">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase">
                  <Lock className="w-4 h-4 text-amber-700" />
                  <span>Chave Mestra de Cifra (KMS)</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Cada escola possui uma chave KMS isolada. O arquivo só pode ser decifrado pelo
                  administrador oficial ou pelas autoridades judiciais angolanas mediante mandado.
                </p>
                <div className="p-2.5 rounded bg-white border border-amber-200 font-mono text-[11px] text-gray-700 break-all select-all">
                  {config.keyFingerprint}
                </div>
                <div className="text-[11px] text-amber-800 flex items-center justify-between">
                  <span>DPO Responsável:</span>
                  <span className="font-semibold">{config.contactDPO}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================
          ABA 2: HISTÓRICO DE BACKUPS GERADOS
         ======================================================== */}
      {activeTab === 'history' && (
        <Card>
          <div className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-[#012041]">
                  Histórico de Cópias Diárias Criptografadas
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Registro de auditoria com hash SHA-256 e confirmação de integridade institucional.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Play className="w-3.5 h-3.5" />}
                  onClick={handleExecuteBackupNow}
                  disabled={isExecutingNow}
                >
                  Novo Backup Manual
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/75 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Data & Hora</th>
                    <th className="py-3 px-4">Ficheiro no Vault</th>
                    <th className="py-3 px-4">Alunos / Notas</th>
                    <th className="py-3 px-4">Tamanho</th>
                    <th className="py-3 px-4">Algoritmo & Checksum</th>
                    <th className="py-3 px-4">Origem</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.map((record) => (
                    <tr key={record.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-gray-900">
                          {new Date(record.timestamp).toLocaleDateString('pt-AO')}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {new Date(record.timestamp).toLocaleTimeString('pt-AO')} (WAT)
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono text-gray-800 font-medium truncate max-w-xs" title={record.filename}>
                          {record.filename}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono truncate max-w-xs" title={record.storageEndpoint}>
                          {record.storageEndpoint}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-semibold text-gray-900">
                          {record.totalRecords.students}
                        </span>{' '}
                        alunos ·{' '}
                        <span className="font-semibold text-gray-900">
                          {record.totalRecords.grades}
                        </span>{' '}
                        notas
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-gray-700">
                        {(record.fileSizeBytes / 1024).toFixed(1)} KB
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 font-mono text-[10px] text-gray-600">
                          <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-800 font-semibold">
                            AES-256
                          </span>
                          <span className="truncate max-w-[120px]" title={record.checksumSha256}>
                            {record.checksumSha256.slice(0, 16)}...
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-700">
                          {record.initiatedBy === 'automated_scheduler' ? 'Automático (02:00)' : 'Manual (Admin)'}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Concluído
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => setInspectRecord(record)}
                          className="text-[#015FC4] hover:text-[#012041] font-semibold hover:underline"
                        >
                          Detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {/* ========================================================
          ABA 3: SOBERANIA & NORMAS APD (LEI 22/11 DE ANGOLA)
         ======================================================== */}
      {activeTab === 'compliance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <div className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-[#015FC4] flex items-center justify-center font-bold">
                  22/11
                </div>
                <h3 className="text-sm font-bold text-[#012041]">
                  Lei de Protecção de Dados Pessoais
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Garante que o tratamento e salvaguarda das identidades civis (BI) e histórico dos
                  estudantes obedeçam aos princípios da licitude, finalidade e segurança técnica.
                </p>
                <div className="text-[11px] font-medium text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-100 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Artigo 5º & 24º Plenamente Cumpridos</span>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  APD
                </div>
                <h3 className="text-sm font-bold text-[#012041]">
                  Registo & Notificação na APD
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  A plataforma gera automaticamente os termos de conformidade e o registo do
                  responsável de protecção de dados (DPO) para submissão junto da Agência de Protecção de Dados.
                </p>
                <div className="text-[11px] font-medium text-blue-700 bg-blue-50 p-2 rounded border border-blue-100">
                  Notificação Escolar: {config.legalBasisNote}
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  AES
                </div>
                <h3 className="text-sm font-bold text-[#012041]">
                  Criptografia & Segregação Multitenant
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Nenhum dado é exportado em texto limpo. Cada cópia diária possui selo de integridade
                  SHA-256 e chave de cifra AES-256-GCM inviolável entre estabelecimentos de ensino.
                </p>
                <div className="text-[11px] font-medium text-purple-700 bg-purple-50 p-2 rounded border border-purple-100">
                  Isolamento Total: Base de {currentSchool.nome}
                </div>
              </div>
            </Card>
          </div>

          <Card>
            <div className="p-6 space-y-4">
              <h2 className="text-base font-bold text-[#012041] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Declaração de Soberania Tecnológica e DPO da Instituição</span>
              </h2>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-700 space-y-3 leading-relaxed">
                <p>
                  <strong>Atestado de Conformidade Institucional:</strong> Os dados dos alunos, pautas de avaliação
                  e registros pedagógicos gerados no <strong>{currentSchool.nome}</strong> (NIF {currentSchool.nif})
                  são exportados em conformidade com o <em>Regulamento de Segurança das Redes e Sistemas de Informação</em> e
                  com a Lei nº 22/11 de 11 de Dezembro da República de Angola.
                </p>
                <p>
                  O destino primário das cópias diárias de segurança é mantido no{' '}
                  <span className="font-semibold text-gray-900">{config.datacenterLocation}</span>,
                  assegurando soberania digital, redundância geográfica em Luanda e Benguela e vedando a transferência
                  internacional indiscriminada sem autorização prévia da APD.
                </p>
                <div className="pt-2 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4 text-[11px]">
                  <div>
                    <span className="text-gray-500">Encarregado de Proteção de Dados (DPO):</span>{' '}
                    <span className="font-semibold text-gray-900">{config.contactDPO}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Autoridade Supervisora:</span>{' '}
                    <span className="font-semibold text-gray-900">Agência de Protecção de Dados de Angola (APD)</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================
          MODAL: INSPEÇÃO DE REGISTRO DO HISTÓRICO
         ======================================================== */}
      {inspectRecord && (
        <Modal
          isOpen={!!inspectRecord}
          onClose={() => setInspectRecord(null)}
          title={`Registo de Exportação Segura · ${inspectRecord.id}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="font-semibold text-[#012041]">
                Arquivo Criptografado: {inspectRecord.filename}
              </div>
              <div className="text-[11px] text-blue-700 mt-0.5">
                Destino: {inspectRecord.storageEndpoint}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-500 block">Data de Execução</span>
                <span className="font-semibold text-gray-900">
                  {new Date(inspectRecord.timestamp).toLocaleString('pt-AO')}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Duração do Processo</span>
                <span className="font-semibold text-gray-900">
                  {inspectRecord.executionDurationMs} ms
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Volume de Alunos</span>
                <span className="font-semibold text-gray-900">
                  {inspectRecord.totalRecords.students} alunos registados
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Volume de Notas e Avaliações</span>
                <span className="font-semibold text-gray-900">
                  {inspectRecord.totalRecords.grades} notas e médias
                </span>
              </div>
            </div>

            <div>
              <span className="text-gray-500 block mb-1">Hash Criptográfico SHA-256 (Integridade)</span>
              <div className="p-2.5 bg-gray-100 rounded font-mono text-[11px] text-gray-800 break-all select-all">
                {inspectRecord.checksumSha256}
              </div>
            </div>

            <div>
              <span className="text-gray-500 block mb-1">Selo Legal da República de Angola</span>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-[11px] space-y-1">
                <div>✓ Legislação: {inspectRecord.complianceSeal.lawReference}</div>
                <div>✓ Autoridade Reguladora: {inspectRecord.complianceSeal.authority}</div>
                <div>✓ Soberania de Dados: Certificada no Datacenter Nacional de Angola</div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-gray-100">
              <Button variant="secondary" size="sm" onClick={() => setInspectRecord(null)}>
                Fechar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================
          MODAL: PRÉ-VISUALIZAÇÃO DO PAYLOAD
         ======================================================== */}
      {isPreviewModalOpen && previewPayload && (
        <Modal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          title="Pré-visualização do Payload Sanitizado para Exportação"
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-gray-50 border border-gray-200 rounded text-gray-600">
              Esta é a estrutura de dados JSON que é convertida e encriptada com AES-256-GCM antes
              de ser despachada para o storage diário seguro.
            </div>

            <div>
              <span className="font-semibold text-gray-900 block mb-1">
                Metadados Regulatórios do Cabeçalho:
              </span>
              <pre className="p-3 bg-[#012041] text-blue-200 rounded text-[11px] font-mono overflow-x-auto max-h-40">
                {JSON.stringify(previewPayload.exportMetadata, null, 2)}
              </pre>
            </div>

            <div>
              <span className="font-semibold text-gray-900 block mb-1">
                Amostra de Alunos ({previewPayload.dataset.alunos.length}) e Notas ({previewPayload.dataset.notas.length}):
              </span>
              <pre className="p-3 bg-gray-900 text-emerald-400 rounded text-[11px] font-mono overflow-x-auto max-h-56">
                {JSON.stringify(
                  {
                    amostraAlunos: previewPayload.dataset.alunos.slice(0, 2),
                    amostraNotas: previewPayload.dataset.notas.slice(0, 2),
                  },
                  null,
                  2
                )}
              </pre>
            </div>

            <div className="flex justify-end pt-3 border-t border-gray-100">
              <Button variant="primary" size="sm" onClick={() => setIsPreviewModalOpen(false)}>
                Entendido
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
