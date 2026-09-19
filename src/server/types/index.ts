/**
 * Tipos compartilhados do backend.
 */

import { Role } from '../../generated/prisma/client';

export interface AuthPayload {
  userId: string;
  tenantId: string;
  role: Role;
  name: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
      tenantId?: string;
    }
  }
}

export {};
