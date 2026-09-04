import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="mb-6 text-center">
        <Link href="/" className="text-2xl font-semibold text-[var(--ink)]">
          MiniKanban
        </Link>
        <p className="mt-2 text-sm text-[var(--muted)]">Sign in to continue</p>
      </div>
      <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6">
        <LoginForm />
        <p className="mt-5 text-center text-sm text-[var(--muted)]">
          New here?{" "}
          <Link href="/register" className="font-medium text-[var(--accent)] hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
