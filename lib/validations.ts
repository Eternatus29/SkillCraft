import { z } from 'zod'

export const signupSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').trim(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').trim(),
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-zA-Z]/, 'Must contain at least one letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  role: z.enum(['Student', 'Instructor']),
  otp: z.string().length(6, 'OTP must be 6 digits'),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
})

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const profileSchema = z.object({
  firstName: z.string().min(2).trim().optional(),
  lastName: z.string().min(2).trim().optional(),
  gender: z
    .enum(['Male', 'Female', 'Non-Binary', 'Prefer not to say', 'Other'])
    .optional(),
  dob: z.string().optional(),
  about: z.string().max(500).optional(),
  contactNumber: z
    .string()
    .regex(/^\d{10}$/, 'Must be 10 digits')
    .optional()
    .or(z.literal('')),
})

export const courseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').trim(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  whatYouWillLearn: z.string().min(10, 'Required'),
  price: z.number().min(0, 'Price must be non-negative'),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).min(1, 'Add at least one tag'),
  instructions: z.array(z.string()).optional(),
  status: z.enum(['Draft', 'Published']).optional(),
})

export const contactSchema = z.object({
  firstName: z.string().min(2).trim(),
  lastName: z.string().min(2).trim(),
  email: z.string().email().trim(),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type CourseInput = z.infer<typeof courseSchema>
export type ContactInput = z.infer<typeof contactSchema>
