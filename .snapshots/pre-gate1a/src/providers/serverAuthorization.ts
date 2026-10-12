/**
 * Server Endpoint Authorization Guard
 * 所有 server endpoint 必须显式验证：
 * 1. authenticated identity
 * 2. family membership
 * 3. role
 * 4. resource ownership
 * 5. scope
 *
 * 铁律：
 * - 绝不依赖客户端声明，在服务端做严格授权。
 * - Child 不创建独立 Google 账号，绑定 scoped child device。
 * - Researcher 不能读 raw family content。
 * - Child device 不能读 caregiver private notes，不能改变 caregiver。
 * - Family A 不能读 Family B。
 */

import { AuthSession, UserRole } from './authProvider';

export class AuthorizationError extends Error {
  constructor(public readonly code: string, message: string) {
    super(`[${code}] ${message}`);
    this.name = 'AuthorizationError';
  }
}

export interface EndpointAuthorizationRequest {
  readonly session: AuthSession | null;
  readonly targetFamilyId: string;
  readonly requiredRole?: UserRole | readonly UserRole[];
  readonly requiredScope?: string;
  readonly resourceOwnerId?: string;
  readonly actionType: 'READ' | 'WRITE' | 'DELETE' | 'MUTATE_CAREGIVER' | 'RESEARCH_EXPORT';
}

export function verifyEndpointAuthorization(req: EndpointAuthorizationRequest): void {
  const { session, targetFamilyId, requiredRole, requiredScope, resourceOwnerId, actionType } = req;

  // 1. Verify Authenticated Identity
  if (!session || !session.uid) {
    throw new AuthorizationError('UNAUTHENTICATED', 'Request lacks valid authenticated session');
  }

  // 2. Researcher Isolation: Researcher 不能读 raw family content
  if (session.role === 'RESEARCHER') {
    if (actionType !== 'RESEARCH_EXPORT') {
      throw new AuthorizationError('FORBIDDEN_RESEARCHER_ACCESS', 'Researcher cannot access raw family content');
    }
    // 研究员仅可访问聚合去标识化层
    return;
  }

  // 3. Verify Family Membership: Family A 不能读写 Family B
  if (!session.familyId || session.familyId !== targetFamilyId) {
    throw new AuthorizationError('FAMILY_MISMATCH', 'Session family does not match target family');
  }

  // 4. Verify Role
  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!allowedRoles.includes(session.role)) {
      throw new AuthorizationError('ROLE_FORBIDDEN', `Role ${session.role} not permitted for this action`);
    }
  }

  // 5. Verify Scopes (对于 Child Device，必须严格限制 scope)
  if (requiredScope && !session.scopes.includes(requiredScope)) {
    throw new AuthorizationError('SCOPE_MISSING', `Required scope ${requiredScope} not granted to session`);
  }

  // 6. Child Device Restricted Guardrails:
  // - Child device 不能改变 caregiver
  // - Child device 不能读取 caregiver private notes
  if (session.role === 'CHILD_DEVICE') {
    if (actionType === 'MUTATE_CAREGIVER') {
      throw new AuthorizationError('CHILD_CANNOT_MUTATE_CAREGIVER', 'Child device is strictly forbidden from mutating caregivers');
    }
    if (session.scopes.includes('write:caregiver_config')) {
      throw new AuthorizationError('ILLEGAL_CHILD_SCOPE', 'Child device cannot hold caregiver configuration scopes');
    }
  }

  // 7. Verify Resource Ownership (如 Caregiver Private Notes 隔离)
  if (resourceOwnerId && session.uid !== resourceOwnerId) {
    // 即使在同一个家庭中，Caregiver A 也绝不能读/写 Caregiver B 的 private reflection notes
    throw new AuthorizationError('RESOURCE_OWNERSHIP_VIOLATION', 'User does not own the target private resource');
  }
}
