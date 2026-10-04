"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { signIn, type SignInState } from "@/lib/auth/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: SignInState = { email: "" };

/** One sign-in for both portals; the account's role decides where it lands. */
export function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, initialState);
  const [show, setShow] = useState(false);
  const errors = state.errors ?? {};

  return (
    <form action={formAction} noValidate className="flex w-full flex-col gap-4">
      {errors.form && (
        <Alert variant="danger">
          <AlertCircle aria-hidden />
          <AlertDescription>{errors.form}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          defaultValue={state.email}
          key={state.email}
          className="h-10"
          required
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && (
          <span id="email-error" className="text-xs text-destructive">
            {errors.email}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link href="/forgot-password" className="text-[13px] font-medium text-primary hover:text-primary-hover hover:underline">
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={show ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="current-password"
            className="h-10 pr-11"
            required
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            aria-pressed={show}
            className="absolute top-0.5 right-0.5 flex size-9 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {errors.password && (
          <span id="password-error" className="text-xs text-destructive">
            {errors.password}
          </span>
        )}
      </div>

      <Button type="submit" size="lg" className="mt-2 w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
