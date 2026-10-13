-- =====================================================================
-- EDUGEST ANGOLA | Cloudflare D1 Database Schema
-- Migração 0001: Esquema Relacional Multi-Tenant Oficial
-- =====================================================================

-- 1. Instituições de Ensino (Tenants)
CREATE TABLE IF NOT EXISTS institutions (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  commercial_name TEXT,
  nif TEXT UNIQUE NOT NULL,
  province TEXT NOT NULL DEFAULT 'Luanda',
  municipality TEXT NOT NULL DEFAULT 'Luanda',
  address TEXT,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  website TEXT,
  logo_url TEXT,
  status TEXT NOT NULL DEFAULT 'trial' CHECK(status IN ('trial', 'activa', 'suspensa', 'cancelada')),
  plan TEXT NOT NULL DEFAULT 'Plano Pro' CHECK(plan IN ('Plano Básico', 'Plano Pro', 'Plano Enterprise', 'Plano Governamental')),
  monthly_value_kz REAL NOT NULL DEFAULT 450000,
  trial_ends_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_institutions_status ON institutions(status);
CREATE INDEX IF NOT EXISTS idx_institutions_nif ON institutions(nif);

-- 2. Departamentos da Instituição
CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  institution_id TEXT NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  acronym TEXT NOT NULL,
  description TEXT,
  manager_name TEXT,
  color TEXT DEFAULT 'blue',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(institution_id, code)
);

CREATE INDEX IF NOT EXISTS idx_departments_institution ON departments(institution_id);

-- 3. Utilizadores (Users)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  bi_number TEXT,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  primary_role TEXT NOT NULL CHECK(primary_role IN (
    'super_admin', 'school_admin', 'rh', 'secretaria', 
    'financeiro', 'coordenacao', 'professor', 'guardian', 'student', 'crm'
  )),
  job_title TEXT,
  department_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
  institution_id TEXT REFERENCES institutions(id) ON DELETE CASCADE,
  is_active INTEGER NOT NULL DEFAULT 1,
  is_blocked INTEGER NOT NULL DEFAULT 0,
  block_reason TEXT,
  mfa_enabled INTEGER NOT NULL DEFAULT 0,
  mfa_secret TEXT,
  last_login_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_institution ON users(institution_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(primary_role);

-- 4. Relação Multi-Tenant Utilizador - Instituições (Para Diretores ou Coordenadores Multi-Polo)
CREATE TABLE IF NOT EXISTS user_institutions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  institution_id TEXT NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  is_primary INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, institution_id)
);

-- 5. Papéis (Roles) e Permissões Granulares (RBAC)
CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  scope TEXT NOT NULL CHECK(scope IN ('global', 'institution')),
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS permissions (
  id TEXT PRIMARY KEY,
  module TEXT NOT NULL,
  action TEXT NOT NULL,
  description TEXT,
  UNIQUE(module, action)
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id TEXT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  institution_id TEXT REFERENCES institutions(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- 6. Sessões de Autenticação Seguras (Tokens Opostos a Cookies HttpOnly)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  institution_id TEXT REFERENCES institutions(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TEXT NOT NULL,
  is_revoked INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_active_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- 7. Tokens de Recuperação de Palavra-Passe
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT UNIQUE NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_reset_token ON password_reset_tokens(token_hash);

-- 8. Pedidos de Registo e Credenciamento de Instituições
CREATE TABLE IF NOT EXISTS pending_institution_registrations (
  id TEXT PRIMARY KEY,
  institution_name TEXT NOT NULL,
  commercial_name TEXT,
  nif TEXT UNIQUE NOT NULL,
  official_email TEXT NOT NULL,
  phone TEXT NOT NULL,
  province TEXT NOT NULL DEFAULT 'Luanda',
  municipality TEXT NOT NULL DEFAULT 'Luanda',
  address TEXT NOT NULL,
  institution_type TEXT NOT NULL, -- Primário, II Ciclo, Técnico, etc.
  manager_name TEXT NOT NULL,
  manager_email TEXT NOT NULL,
  manager_phone TEXT NOT NULL,
  requested_plan TEXT NOT NULL DEFAULT 'Plano Pro',
  estimated_students INTEGER NOT NULL DEFAULT 350,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK(status IN ('pendente', 'em_analise', 'aprovado', 'rejeitado')),
  rejection_reason TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  reviewed_at TEXT,
  reviewed_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_pending_reg_status ON pending_institution_registrations(status);

-- 9. Logs Imutáveis de Auditoria de Segurança e Operacional
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  role TEXT NOT NULL,
  institution_id TEXT REFERENCES institutions(id) ON DELETE SET NULL,
  module TEXT NOT NULL,
  action TEXT NOT NULL,
  target_id TEXT,
  target_description TEXT NOT NULL,
  details TEXT,
  ip_address TEXT,
  status TEXT NOT NULL DEFAULT 'SUCESSO' CHECK(status IN ('SUCESSO', 'FALHA', 'BLOQUEADO')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_institution ON audit_logs(institution_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);

-- 10. Configurações por Instituição
CREATE TABLE IF NOT EXISTS institution_settings (
  id TEXT PRIMARY KEY,
  institution_id TEXT NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  setting_key TEXT NOT NULL,
  setting_value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(institution_id, setting_key)
);
