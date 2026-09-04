import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--canvas)] px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="mb-6 text-center">
          <Link href="/" className="text-xl font-semibold text-[var(--ink)]">
            MiniKanban
          </Link>
          <h1 className="mt-3 text-lg font-semibold text-[var(--ink)]">Create Account</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Register to start managing boards</p>
        </div>
        <RegisterForm />
        <p className="mt-5 text-center text-sm text-[var(--muted)]">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[var(--accent)] hover:underline">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
