import { z } from 'zod';
export const prospectSchema = z.object({ name: z.string().trim().min(1).max(120), company: z.string().trim().min(1).max(120), email: z.string().trim().email().max(254).transform(v => v.toLowerCase()) }).strict();
export const projectSchema = z.object({ name: z.string().trim().min(1).max(120), client: z.string().trim().min(1).max(120) }).strict();
export const taskSchema = z.object({ title: z.string().trim().min(1).max(200), projectId: z.string().min(1).max(100), priority: z.enum(['Low', 'Medium', 'High', 'Urgent']) }).strict();
export const taskUpdateSchema = z.object({ status: z.enum(['To do', 'In progress', 'Blocked', 'Done']) }).strict();
