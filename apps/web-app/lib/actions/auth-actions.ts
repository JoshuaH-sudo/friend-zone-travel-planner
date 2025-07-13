"use server"

import { z } from "zod"
import { signIn } from "@/lib/auth"
import { createUser, userExists } from "@/lib/auth-utils"
import { AuthError } from "next-auth"

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required").optional(),
})

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

export async function signup(formData: FormData) {
  try {
    const validatedFields = signupSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
      name: formData.get("name"),
    })

    if (!validatedFields.success) {
      return {
        error: "Invalid fields",
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const { email, password, name } = validatedFields.data

    // Check if user already exists
    if (await userExists(email)) {
      return {
        error: "User with this email already exists",
      }
    }

    // Create the user
    await createUser(email, password, name)

    // Sign in the user after successful signup
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/trips",
    })
  } catch (error) {
    console.error("Signup error:", error)
    return {
      error: "Something went wrong. Please try again.",
    }
  }
}

export async function login(formData: FormData) {
  try {
    const validatedFields = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    })

    if (!validatedFields.success) {
      return {
        error: "Invalid fields",
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const { email, password } = validatedFields.data

    await signIn("credentials", {
      email,
      password,
      redirectTo: "/trips",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            error: "Invalid email or password",
          }
        default:
          return {
            error: "Something went wrong. Please try again.",
          }
      }
    }
    throw error
  }
}

