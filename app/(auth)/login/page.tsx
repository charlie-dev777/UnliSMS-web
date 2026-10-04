import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/layout/logo";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="flex w-full max-w-[380px] flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-5">
            <LogoMark width={156} height={96} priority />
            <div className="flex flex-col items-center gap-1.5 text-center">
              <h1 className="m-0 text-2xl leading-8 font-semibold tracking-[-0.02em]">Sign in to UnliSMS</h1>
              <p className="m-0 text-sm text-muted-fg">Enter your email and password to continue.</p>
            </div>
          </div>

          <LoginForm />

          <p className="m-0 text-sm text-muted-fg">
            Don’t have an account?{" "}
            <Link href="/register" className="font-medium text-primary-solid hover:text-primary-dark hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </main>
      <footer className="flex flex-wrap justify-center gap-x-5 gap-y-2 px-4 py-6 text-xs text-muted-fg">
        <span>© 2026 UnliSMS</span>
        <Link href="/terms" className="hover:underline">Terms</Link>
        <Link href="/privacy" className="hover:underline">Privacy</Link>
        <Link href="/status" className="hover:underline">Status</Link>
      </footer>
    </div>
  );
}
