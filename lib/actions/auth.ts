"use server";

import { signIn, signOut, auth } from "@/auth";


export async function signInAction(email: string, password: string) {

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

 await signIn("credentials", {
    redirectTo: '/',
    email,
    password,
  });
}

export async function signOutAction() {
 await signOut({ redirectTo: '/' });
}

export async function getSession() {
  const session = await auth();
  return session;
}
