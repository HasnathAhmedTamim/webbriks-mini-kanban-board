import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { AuthRedirect } from "@/components/auth/AuthRedirect";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthRedirect>
      <main className="flex min-h-screen items-center justify-center bg-[var(--canvas)] px-4 py-12">
        <div className="w-full max-w-md rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-semibold text-[var(--ink)]">Welcome back</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">Sign in to continue to your boards</p>
          </div>
          <LoginForm />
          <p className="mt-5 text-center text-sm text-[var(--muted)]">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-[var(--accent)] hover:underline">
              Register
            </Link>
          </p>
        </div>
      </main>
    </AuthRedirect>
  );
}
