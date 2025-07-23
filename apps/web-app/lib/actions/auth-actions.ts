import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
})

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // Validate form data
  const validatedFields = signupSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    name: formData.get('name'),
  })

  if (!validatedFields.success) {
    return {
      error: 'Invalid form data. Please check your inputs.',
      details: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password, name } = validatedFields.data

  try {
    // Sign up the user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })

    if (error) {
      console.error('Signup error:', error)
      
      // Handle specific Supabase Auth errors
      switch (error.message) {
        case 'User already registered':
          return { error: 'An account with this email already exists.' }
        case 'Password should be at least 6 characters':
          return { error: 'Password must be at least 6 characters long.' }
        case 'Invalid email':
          return { error: 'Please enter a valid email address.' }
        default:
          return { error: 'Failed to create account. Please try again.' }
      }
    }

    if (!data.user) {
      return { error: 'Failed to create account. Please try again.' }
    }

    // Check if email confirmation is required
    if (!data.session) {
      return { 
        success: true, 
        message: 'Please check your email to confirm your account before signing in.' 
      }
    }

    // If auto-confirmed, redirect to home
    redirect('/home')
  } catch (error) {
    console.error('Signup error:', error)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  // Validate form data
  const validatedFields = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return {
      error: 'Invalid form data. Please check your inputs.',
      details: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password } = validatedFields.data

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Login error:', error)
      
      // Handle specific Supabase Auth errors
      switch (error.message) {
        case 'Invalid login credentials':
          return { error: 'Invalid email or password. Please try again.' }
        case 'Email not confirmed':
          return { error: 'Please check your email and confirm your account before signing in.' }
        case 'Too many requests':
          return { error: 'Too many login attempts. Please try again later.' }
        default:
          return { error: 'Failed to sign in. Please try again.' }
      }
    }

    if (!data.user) {
      return { error: 'Failed to sign in. Please try again.' }
    }

    // Successful login - redirect to home
    redirect('/home')
  } catch (error) {
    console.error('Login error:', error)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

export async function signInWithGoogle() {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      },
    })

    if (error) {
      console.error('Google sign-in error:', error)
      return { error: 'Failed to sign in with Google. Please try again.' }
    }

    // The redirect will be handled by Supabase
    if (data.url) {
      redirect(data.url)
    }
  } catch (error) {
    console.error('Google sign-in error:', error)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

export async function signOut() {
  const supabase = await createClient()

  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Sign out error:', error)
      return { error: 'Failed to sign out. Please try again.' }
    }

    redirect('/signin')
  } catch (error) {
    console.error('Sign out error:', error)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

