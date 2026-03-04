import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  email: z.string().email(),
  role: z.enum(['lead', 'sourcer', 'admin']),
  managerId: z.string().uuid().nullable(),
  weeklyCapacityHours: z.number().int().positive().default(40),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateUserSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  role: z.enum(['lead', 'sourcer', 'admin']),
  managerId: z.string().uuid().optional(),
  weeklyCapacityHours: z.number().int().positive().optional(),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  role: z.enum(['lead', 'sourcer', 'admin']).optional(),
  managerId: z.string().uuid().nullable().optional(),
  weeklyCapacityHours: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

export const AssignRoleSchema = z.object({
  userId: z.string().uuid(),
  ashbyRoleId: z.string().optional(),
  reqId: z.string().optional(),
  notes: z.string().optional(),
  assignedBy: z.string().uuid().optional(),
}).refine((d) => d.ashbyRoleId || d.reqId, {
  message: 'Either ashbyRoleId or reqId must be provided',
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
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  estimatedHoursPerWeek: z.number().int().positive(),
  status: z.enum(['active', 'paused', 'closed']).optional(),
});

export const UpdateAssignmentSchema = z.object({
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  estimatedHoursPerWeek: z.number().int().positive().optional(),
  status: z.enum(['active', 'paused', 'closed']).optional(),
});

// -------------------------------------------------------
// Funnel Metrics
// -------------------------------------------------------

export const CreateFunnelMetricSchema = z.object({
  userId:          z.string().uuid(),
  reqId:           z.string().min(1),
  weekStartDate:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  outreachSent:    z.number().int().min(0),
  replies:         z.number().int().min(0),
  positiveReplies: z.number().int().min(0),
  screensBooked:   z.number().int().min(0).optional().default(0),
}).refine((d) => d.replies <= d.outreachSent, {
  message: 'replies cannot exceed outreachSent',
  path: ['replies'],
}).refine((d) => d.positiveReplies <= d.replies, {
  message: 'positiveReplies cannot exceed replies',
  path: ['positiveReplies'],
});

export const UpdateFunnelMetricSchema = z.object({
  outreachSent:    z.number().int().min(0).optional(),
  replies:         z.number().int().min(0).optional(),
  positiveReplies: z.number().int().min(0).optional(),
  screensBooked:   z.number().int().min(0).optional(),
});

// -------------------------------------------------------
// App Settings
// -------------------------------------------------------

export const UpdateSettingSchema = z.object({
  value: z.string(),
});

// -------------------------------------------------------
// Experiment Hub
// -------------------------------------------------------

export const CreateExperimentSchema = z.object({
  name:       z.string().min(1, 'Name is required').max(200),
  hypothesis: z.string().min(10, 'Hypothesis must be at least 10 characters').max(1000),
  startDate:  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  endDate:    z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  ownerId:    z.string().uuid('ownerId must be a UUID'),
});

export const UpdateExperimentSchema = z.object({
  status:  z.enum(['active', 'completed']).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
});

export const CreateVariantSchema = z.object({
  name:        z.string().min(1, 'Variant name is required').max(100),
  description: z.string().min(1, 'Description is required').max(500),
});

export const CreateResultSchema = z.object({
  variantId:       z.string().uuid('variantId must be a UUID'),
  outreachSent:    z.number().int().min(0),
  replies:         z.number().int().min(0),
  positiveReplies: z.number().int().min(0),
}).refine(d => d.replies <= d.outreachSent, {
  message: 'replies cannot exceed outreachSent',
  path: ['replies'],
}).refine(d => d.positiveReplies <= d.replies, {
  message: 'positiveReplies cannot exceed replies',
  path: ['positiveReplies'],
});
