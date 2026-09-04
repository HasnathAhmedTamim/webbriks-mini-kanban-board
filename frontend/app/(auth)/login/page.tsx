import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--canvas)] px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="mb-6 text-center">
          <Link href="/" className="text-xl font-semibold text-[var(--ink)]">
            MiniKanban
          </Link>
          <h1 className="mt-3 text-lg font-semibold text-[var(--ink)]">Login</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Sign in to your account</p>
        </div>
        <LoginForm />
        <p className="mt-5 text-center text-sm text-[var(--muted)]">
          Don’t have an account?{" "}
          <Link href="/register" className="font-medium text-[var(--accent)] hover:underline">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}
