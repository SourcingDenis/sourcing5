import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  email: z.string().email(),
  role: z.enum(['lead', 'sourcer']),
  managerId: z.string().uuid().nullable(),
  weeklyCapacityHours: z.number().int().positive().default(40),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateUserSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  role: z.enum(['lead', 'sourcer']),
  managerId: z.string().uuid().optional(),
  weeklyCapacityHours: z.number().int().positive().optional(),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  role: z.enum(['lead', 'sourcer']).optional(),
  managerId: z.string().uuid().nullable().optional(),
  weeklyCapacityHours: z.number().int().positive().optional(),
});

export const TeamSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  leadId: z.string().uuid(),
  createdAt: z.string().datetime(),
});

export const CreateTeamSchema = z.object({
  name: z.string().min(1).max(255),
  leadId: z.string().uuid(),
});

export const UpdateTeamSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  leadId: z.string().uuid().optional(),
});

export const ReqSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(255),
  function: z.string().min(1),
  level: z.string().min(1),
  location: z.string().min(1),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  createdAt: z.string().datetime(),
});

export const CreateReqSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(255),
  function: z.string().min(1),
  level: z.string().min(1),
  location: z.string().min(1),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
});

export const UpdateReqSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  function: z.string().min(1).optional(),
  level: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
});

export const AssignmentSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  reqId: z.string(),
  estimatedHoursPerWeek: z.number().int().positive(),
  status: z.enum(['active', 'paused', 'closed']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateAssignmentSchema = z.object({
  userId: z.string().uuid(),
  reqId: z.string(),
  estimatedHoursPerWeek: z.number().int().positive(),
  status: z.enum(['active', 'paused', 'closed']).optional(),
});

export const UpdateAssignmentSchema = z.object({
  estimatedHoursPerWeek: z.number().int().positive().optional(),
  status: z.enum(['active', 'paused', 'closed']).optional(),
});
