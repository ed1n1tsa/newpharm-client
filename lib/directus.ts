// lib/directus.ts
import { createDirectus, rest } from '@directus/sdk';

export const directus = createDirectus('https://directus-admin-vme4.onrender.com/admin/login?reason=SESSION_EXPIRED').with(rest());
