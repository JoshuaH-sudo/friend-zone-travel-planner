"use server"

import { signOut } from "@/lib/actions/auth-actions"

export async function handleLogout() {
  await signOut()
}

