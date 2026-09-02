import { MembershipRole } from '@prisma/client';

export interface AuthUser {
  sub: string;
  email: string;
}
export interface TenantContext {
  userId: string;
  organizationId: string;
  role: MembershipRole;
}
