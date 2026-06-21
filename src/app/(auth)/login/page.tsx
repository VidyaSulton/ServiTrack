"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "@/lib/auth-client";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/**
 * Login page — DESIGN.md Section 6.1 auth page layout.
 * Centered card, max-width 420px, form with React Hook Form + Zod validation.
 */
export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormData) {
    setServerError("");
    setIsLoading(true);

    await signIn.email(
      {
        email: data.email,
        password: data.password,
        callbackURL: "/dashboard",
      },
      {
        onSuccess: () => {
          router.push("/dashboard");
        },
        onError: (ctx) => {
          setServerError(
            ctx.error.message || "Email atau password salah. Silakan coba lagi."
          );
        },
      }
    );

    setIsLoading(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-[420px] bg-surface-card border border-outline rounded-lg p-8">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4 overflow-hidden">
            <Image 
              src="/ServiTrack_Icon.webp" 
              alt="ServiTrack Logo" 
              width={48} 
              height={48} 
              className="object-cover"
              priority
            />
          </div>
          <h1 className="text-[1.75rem] font-bold text-slate-100">
            ServiTrack
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Masuk ke akun Anda untuk mengelola kendaraan
          </p>
        </div>

        {/* Server Error */}
        {serverError && (
          <div className="mb-6 p-3 rounded-sm bg-rose-500/10 border border-rose-500/20">
            <p className="text-xs text-rose-500 text-center">{serverError}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="email"
            type="email"
            label="Email"
            placeholder="nama@email.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            id="password"
            type="password"
            label="Password"
            placeholder="Masukkan password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />

          <Button
            type="submit"
            className="w-full mt-2"
            isLoading={isLoading}
          >
            Masuk
          </Button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-sm text-slate-400 mt-6">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="text-primary hover:text-primary-hover transition-colors"
          >
            Daftar
          </Link>
        </p>
      </div>
    </main>
  );
}
