"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { notify } from "@/lib/notify";
import { registerSchema } from "@/lib/validation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = registerSchema.safeParse({ name, email, password, confirmPassword });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = String(issue.path[0] || "form");
        next[key] = issue.message;
      });
      setErrors(next);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await register(parsed.data.name, parsed.data.email, parsed.data.password);
      notify.success("You’re all set!", {
        description: "Your account is ready — let’s go.",
      });
      router.push("/boards");
    } catch (error) {
      notify.error(error, "We couldn’t create your account. Try another email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Name"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoComplete="name"
        placeholder="Your name"
        error={errors.name}
      />
      <Input
        label="Email"
        type="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        placeholder="you@example.com"
        error={errors.email}
      />
      <div className="relative">
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          placeholder="At least 6 characters"
          error={errors.password}
        />
        <button
          type="button"
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute right-2 top-8 rounded-md p-1.5 text-[var(--muted)] hover:text-[var(--ink)]"
          onClick={() => setShowPassword((v) => !v)}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      <Input
        label="Confirm Password"
        type={showPassword ? "text" : "password"}
        name="confirmPassword"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        autoComplete="new-password"
        placeholder="Repeat password"
        error={errors.confirmPassword}
      />
      <Button type="submit" loading={loading} loadingText="Creating…" className="w-full">
        Create Account
      </Button>
    </form>
  );
}
