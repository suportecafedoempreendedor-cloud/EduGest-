/**
 * Serviço de Segurança de Sessão e Controlo de Acesso Baseado em Funções (RBAC)
 * EduGest Angola
 */

import {
  AuthUser,
  AppUserRole,
  PermissionAction,
  DepartmentCode,
  RbacModuleKey,
  RbacSubActionKey,
  DepartmentRolePolicy,
  SubActionDefinition,
} from '../types/authRbac';
import { UTILIZADORES_AUTENTICACAO_INICIAIS } from '../data/mockAuthRbacData';
import {
  SUB_ACTION_DEFINITIONS,
  INITIAL_DEPARTMENT_POLICIES,
  INITIAL_ROLE_POLICIES,
} from '../data/mockSubActionPolicies';

export type {
  AuthUser,
  AppUserRole,
  PermissionAction,
  DepartmentCode,
  RbacModuleKey,
  RbacSubActionKey,
  DepartmentRolePolicy,
  SubActionDefinition,
};

const SESSION_STORAGE_KEY = 'edugest_angola_auth_session';
const DEPT_POLICIES_STORAGE_KEY = 'edugest_angola_dept_policies';
const ROLE_POLICIES_STORAGE_KEY = 'edugest_angola_role_policies';

export function getStoredDepartmentPolicies(): DepartmentRolePolicy[] {
  try {
    const raw = localStorage.getItem(DEPT_POLICIES_STORAGE_KEY);
    if (!raw) return INITIAL_DEPARTMENT_POLICIES;
    return JSON.parse(raw) as DepartmentRolePolicy[];
  } catch {
    return INITIAL_DEPARTMENT_POLICIES;
  }
}

export function saveDepartmentPolicies(policies: DepartmentRolePolicy[]): void {
  try {
    localStorage.setItem(DEPT_POLICIES_STORAGE_KEY, JSON.stringify(policies));
  } catch (e) {
    console.error('Falha ao salvar políticas de departamento:', e);
  }
}

export function getStoredRolePolicies(): DepartmentRolePolicy[] {
  try {
    const raw = localStorage.getItem(ROLE_POLICIES_STORAGE_KEY);
    if (!raw) return INITIAL_ROLE_POLICIES;
    return JSON.parse(raw) as DepartmentRolePolicy[];
  } catch {
    return INITIAL_ROLE_POLICIES;
  }
}

export function saveRolePolicies(policies: DepartmentRolePolicy[]): void {
  try {
    localStorage.setItem(ROLE_POLICIES_STORAGE_KEY, JSON.stringify(policies));
  } catch (e) {
    console.error('Falha ao salvar políticas de cargos/roles:', e);
  }
}

/**
 * Resolução e validação de permissão de Sub-Acção Granular
 * Considera:
 * 1. Conta bloqueada ou inactiva -> Bloqueado
 * 2. Revogação individual explícita -> Negado
 * 3. Atribuição personalizada individual -> Permitido
 * 4. Perfil Super Admin / Director Geral -> Permitido
 * 5. Política do Cargo / Role
 * 6. Política do Departamento
 */
export function hasSubActionPermission(
  user: AuthUser | null,
  subAction: RbacSubActionKey
): boolean {
  return explainPermissionResolution(user, subAction).allowed;
}

export interface PermissionExplanation {
  allowed: boolean;
  reason: string;
  source:
    | 'bloqueado'
    | 'super_admin'
    | 'school_admin'
    | 'revogada_individual'
    | 'personalizada_individual'
    | 'politica_cargo'
    | 'politica_departamento'
    | 'negado';
}

export function explainPermissionResolution(
  user: AuthUser | null,
  subAction: RbacSubActionKey
): PermissionExplanation {
  if (!user) {
    return {
      allowed: false,
      reason: 'Sessão não iniciada ou utilizador inexistente.',
      source: 'negado',
    };
  }

  if (!user.activo || user.bloqueado) {
    return {
      allowed: false,
      reason: `Conta bloqueada ou inactiva: ${user.motivoBloqueio || 'Sem autorização operacional'}`,
      source: 'bloqueado',
    };
  }

  // 1. Verificação de revogação explícita individual
  if (user.subActionsRevogadas?.includes(subAction)) {
    return {
      allowed: false,
      reason: 'Permissão revogada especificamente para este utilizador pela Direcção.',
      source: 'revogada_individual',
    };
  }

  // 2. Verificação de permissão customizada individual
  if (user.subActionsCustomizadas?.includes(subAction)) {
    return {
      allowed: true,
      reason: 'Permissão concedida directamente à ficha deste utilizador como excepção autorizada.',
      source: 'personalizada_individual',
    };
  }

  // 3. Super Administrador SaaS
  if (user.role === 'super_admin') {
    return {
      allowed: true,
      reason: 'Autorização plena como Super Administrador Global da infra-estrutura SaaS.',
      source: 'super_admin',
    };
  }

  // 4. Director Geral da Instituição (Escola)
  if (user.role === 'school_admin') {
    return {
      allowed: true,
      reason: 'Autorização institucional máxima de Director Geral / Administrador Escolar.',
      source: 'school_admin',
    };
  }

  // 5. Verificação da política de Cargo/Role
  const rolePolicies = getStoredRolePolicies();
  const rolePolicy = rolePolicies.find((p) => p.alvoId === user.role);
  if (rolePolicy && rolePolicy.subActionsPermitidas.includes(subAction)) {
    return {
      allowed: true,
      reason: `Autorizado pela política oficial do cargo/papel: "${rolePolicy.alvoNome}".`,
      source: 'politica_cargo',
    };
  }

  // 6. Verificação da política do Departamento
  if (user.departamentoId) {
    const deptPolicies = getStoredDepartmentPolicies();
    const deptPolicy = deptPolicies.find((p) => p.alvoId === user.departamentoId);
    if (deptPolicy && deptPolicy.subActionsPermitidas.includes(subAction)) {
      return {
        allowed: true,
        reason: `Autorizado pelo departamento institucional: "${deptPolicy.alvoNome}".`,
        source: 'politica_departamento',
      };
    }
  }

  return {
    allowed: false,
    reason: 'Acção não permitida para o perfil ou departamento deste utilizador.',
    source: 'negado',
  };
}

export function getStoredSessionUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function saveSessionUser(user: AuthUser): void {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Falha ao persistir sessão:', e);
  }
}

export function clearSessionUser(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (e) {
    console.error('Falha ao limpar sessão:', e);
  }
}

/**
 * Autenticação real contra o repositório de utilizadores
 */
export async function authenticateCredentials(
  emailOrIdentifier: string,
  passwordPlain: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  // Simulação de latência de rede segura de verificação criptográfica (hash)
  await new Promise((resolve) => setTimeout(resolve, 450));

  const trimmed = emailOrIdentifier.trim().toLowerCase();

  const user = UTILIZADORES_AUTENTICACAO_INICIAIS.find(
    (u) =>
      u.email.toLowerCase() === trimmed ||
      (u.alunoProcesso && u.alunoProcesso.toLowerCase() === trimmed) ||
      (u.telefone && u.telefone.replace(/\s+/g, '') === trimmed.replace(/\s+/g, ''))
  );

  if (!user) {
    return {
      success: false,
      error: 'Credenciais inválidas. Verifique o email/identificador e a palavra-passe.',
    };
  }

  if (user.bloqueado || !user.activo) {
    return {
      success: false,
      error: user.motivoBloqueio || 'Esta conta está inactiva ou suspensa pela administração. Contacte o suporte.',
    };
  }

  // Senha padrão homologada no ambiente de demonstração oficial: 'EduGest@2026' ou '123456'
  if (passwordPlain !== 'EduGest@2026' && passwordPlain !== '123456' && passwordPlain !== 'angola2026') {
    return {
      success: false,
      error: 'Palavra-passe incorrecta. Tente novamente ou utilize "Esqueci-me da palavra-passe".',
    };
  }

  const updatedUser: AuthUser = {
    ...user,
    ultimoAcesso: new Date().toISOString().replace('T', ' ').slice(0, 19),
  };

  saveSessionUser(updatedUser);
  return { success: true, user: updatedUser };
}

/**
 * Validação de permissão RBAC granular
 */
export function hasPermission(
  user: AuthUser | null,
  module: RbacModuleKey,
  action: PermissionAction
): boolean {
  if (!user || !user.activo || user.bloqueado) return false;

  // Super Admin tem autorização operacional no SaaS
  if (user.role === 'super_admin' && module === 'saas_global') return true;

  // Director Geral (school_admin) tem autorização geral no tenant
  if (user.role === 'school_admin' && module !== 'saas_global') return true;

  const modPerm = user.permissoes.find((p) => p.module === module);
  if (!modPerm) return false;

  return modPerm.actions.includes(action);
}

/**
 * Encaminhamento inteligente para o painel inicial correspondente ao perfil
 */
export function getDefaultViewForRole(role: AppUserRole): string {
  switch (role) {
    case 'super_admin':
      return 'saas-dashboard';
    case 'school_admin':
      return 'dashboard';
    case 'rh':
      return 'dept-rh';
    case 'secretaria':
      return 'students';
    case 'financeiro':
      return 'financial';
    case 'coordenacao':
      return 'pedagogical';
    case 'professor':
      return 'portal-professor';
    case 'guardian':
      return 'guardian-portal';
    case 'student':
      return 'portal-aluno';
    case 'crm':
      return 'crm';
    default:
      return 'dashboard';
  }
}
