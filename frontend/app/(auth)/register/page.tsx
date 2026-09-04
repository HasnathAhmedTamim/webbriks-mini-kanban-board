import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="mb-6 text-center">
        <Link href="/" className="text-2xl font-semibold text-[var(--ink)]">
          MiniKanban
        </Link>
        <p className="mt-2 text-sm text-[var(--muted)]">Create your account</p>
      </div>
      <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6">
        <RegisterForm />
        <p className="mt-5 text-center text-sm text-[var(--muted)]">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[var(--accent)] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
