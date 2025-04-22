"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { AlertCircle, ArrowRight } from "lucide-react";
import { useState } from "react";
import { signInAction } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    
    try {
      const result = await signInAction(email, password);
      if (result?.error) {
        setError("Invalid email or password");
        return;
      }
      router.push("/");
    } catch (error) {
      console.error(error);
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <CardContent>
      <form action={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/auth/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            required
          />
        </div>
        <Button type="submit" className="w-full">
          Sign in
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </CardContent>
  );
} 