import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

const profileFields = {
  phone: z.string().min(8, 'Teléfono requerido'),
  city: z.string().min(2, 'Ciudad requerida'),
  province: z.string().min(2, 'Provincia requerida'),
  address: z.string().optional(),
};

export const registerSchema = z
  .object({
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    firstName: z.string().min(1, 'Nombre requerido'),
    lastName: z.string().min(1, 'Apellido requerido'),
    role: z.enum(['CLIENTE', 'PROFESIONAL', 'EMPRESA']),
    ...profileFields,
    categoryId: z.string().uuid().optional(),
    documentNumber: z.string().optional(),
    licenseNumber: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === 'PROFESIONAL') {
      if (!data.categoryId) {
        ctx.addIssue({ code: 'custom', message: 'Seleccioná tu rubro', path: ['categoryId'] });
      }
      if (!data.documentNumber?.trim()) {
        ctx.addIssue({ code: 'custom', message: 'CUIT o DNI requerido', path: ['documentNumber'] });
      }
    }
  });

export const serviceRequestSchema = z.object({
  categoryId: z.string().uuid('Seleccioná una categoría'),
  title: z.string().min(5, 'Mínimo 5 caracteres').max(255),
  description: z.string().min(20, 'Describí tu necesidad con más detalle'),
  budgetMin: z.coerce.number().optional(),
  budgetMax: z.coerce.number().optional(),
});

export const quotationSchema = z.object({
  serviceRequestId: z.string().uuid(),
  totalAmount: z.coerce.number().min(1),
  estimatedDays: z.coerce.number().min(1),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        description: z.string().min(1),
        quantity: z.coerce.number().min(1),
        unitPrice: z.coerce.number().min(0),
      }),
    )
    .min(1),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;
export type ServiceRequestForm = z.infer<typeof serviceRequestSchema>;
export type QuotationForm = z.infer<typeof quotationSchema>;
