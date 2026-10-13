/**
 * Tipos e Interfaces para o Sistema de Exportação Agendada e Segurança de Dados
 * Em estrita conformidade com a Lei nº 22/11 de Protecção de Dados Pessoais de Angola
 * e directrizes da APD (Agência de Protecção de Dados).
 */

export type BackupFrequency = 'daily' | 'weekly' | 'manual';
export type BackupStatus = 'completed' | 'in_progress' | 'failed' | 'scheduled';
export type StorageProvider = 'angola_sovereign_dc' | 'minio_s3_luanda' | 'encrypted_vault_cloud';
export type RetentionPeriodDays = 30 | 90 | 180 | 365 | 730; // 1 mês a 2 anos

export interface ScheduledExportConfig {
  id: string;
  escolaId: string; // Tenant específico (isolamento rigoroso)
  escolaNome: string;
  enabled: boolean;
  frequency: BackupFrequency;
  timeOfDay: string; // Formato HH:mm (Horário de Angola - UTC+1 / West Africa Time)
  daysOfWeek: number[]; // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  retentionDays: RetentionPeriodDays;
  storageTarget: StorageProvider;
  datacenterLocation: string; // Ex: 'Luanda - Datacenter Nacional (Unitel/Angola Telecom Datacenter)'
  
  // Opções de Conteúdo do Backup
  includeStudentsBi: boolean; // Dados cadastrais dos alunos, filiação, BI
  includeAcademicGrades: boolean; // Pautas, MAC, NPP, NPT, médias e trimestres
  includeAttendance: boolean; // Histórico de faltas e presenças
  includeFinancialRecords: boolean; // Recibos e histórico de propinas
  
  // Segurança e Conformidade Regulatória (Lei 22/11)
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  keyFingerprint: string; // Ex: SHA-256 da chave de encriptação soberana
  anonymizeGuardiansInExport: boolean;
  legalBasisNote: string; // Ex: 'Lei nº 22/11 da República de Angola - Notificação APD nº 2024/098'
  contactDPO: string; // Responsável de Protecção de Dados (DPO / EPD)
  
  // Notificações ao Administrador após Exportação Concluída
  notifyAdminOnSuccess?: boolean;
  adminNotificationEmail?: string;
  notifyChannels?: ('email' | 'in_app' | 'sms')[];
  lastNotificationStatus?: 'delivered' | 'pending' | 'failed';
  lastNotificationTimestamp?: string;

  lastRunTimestamp?: string;
  nextScheduledTimestamp: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExportHistoryRecord {
  id: string;
  configId: string;
  escolaId: string;
  escolaNome: string;
  timestamp: string; // Data e hora de execução
  filename: string; // Ex: 'edugest_backup_colegio_esperanca_2026-10-12_aes256.enc.json'
  fileSizeBytes: number;
  totalRecords: {
    students: number;
    grades: number;
    attendance?: number;
    financial?: number;
  };
  checksumSha256: string;
  encryptionKeyId: string;
  status: BackupStatus;
  storageEndpoint: string;
  executionDurationMs: number;
  initiatedBy: 'automated_scheduler' | 'manual_admin' | 'system_cron' | 'scheduled_daemon';
  notificationSentToAdmin?: {
    sent: boolean;
    recipient: string;
    timestamp: string;
    channels: string[];
  };
  complianceSeal: {
    lawReference: 'Lei nº 22/11 de Angola';
    authority: 'Agência de Protecção de Dados (APD)';
    certifiedSovereignty: boolean; // Garantia de que os dados residem em infraestrutura elegível
  };
  errorMessage?: string;
}

export interface DataExportPayload {
  exportMetadata: {
    version: '2.0.0-angola-compliant';
    exportTimestamp: string;
    escola: {
      id: string;
      nome: string;
      nif: string;
      provincia: string;
    };
    regulatoryCompliance: {
      angolanLaw: 'Lei nº 22/11 de 11 de Dezembro (Protecção de Dados Pessoais)';
      authority: 'APD - Agência de Protecção de Dados';
      dataClassification: 'Dados Académicos e Identificação Civil Escolar';
      securityMeasures: 'Criptografia em Repouso AES-256-GCM + Hashing SHA-256';
    };
    checksum: string;
  };
  dataset: {
    alunos: any[];
    notas: any[];
    turmas?: any[];
    assiduidade?: any[];
  };
}
