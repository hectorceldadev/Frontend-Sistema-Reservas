import { z } from 'zod';

// NUEVA REGEX DE TELÉFONO (MÁS AMIGABLE)
// Acepta:
// +34 600 123 456 (Espacios)
// 600-123-456 (Guiones)
// 0033 612345678 (Internacionales)
// Mínimo 9 dígitos en total, máximo 15 (estándar internacional)
const phoneRegex = /^(?:(?:\+|00)\d{1,3})?[ -]?\d{3,}(?:[ -]?\d+)+$/;

export const clientFormSchema = z.object({
  name: z
    .string()
    .trim() // Elimina espacios al inicio y final automágicamente
    .min(1, { message: "El nombre es obligatorio" })
    .min(2, { message: "El nombre debe tener al menos 2 letras" })
    .max(100, { message: "El nombre es demasiado largo" }), // Subimos a 100 por seguridad
  
  email: z
    .string()
    .trim() // Elimina espacios del autocompletado
    .min(1, { message: "El email es obligatorio" })
    .email({ message: "Introduce un email válido (ej: hola@gmail.com)" }),
  
  phone: z
    .string()
    .trim()
    .min(1, { message: "El teléfono es obligatorio" })
    .min(9, { message: "El teléfono es demasiado corto" })
    .regex(phoneRegex, { message: "Número inválido. Prueba sin símbolos extraños." }),
    
  comment: z
    .string()
    .trim()
    .max(500, { message: "El comentario no puede superar los 500 caracteres" })
    .optional(),
});

// Esquema de búsqueda
export const emailSearchSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, { message: "Introduce un email" })
        .email({ message: "Introduce un email válido" })
});

export type ClientFormData = z.infer<typeof clientFormSchema>;