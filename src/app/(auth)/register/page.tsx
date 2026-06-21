"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Image from "next/image";
import { signUp } from "@/lib/auth-client";
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/**
 * Register page — DESIGN.md Section 6.1 auth page layout.
 * Centered card, max-width 420px, form with React Hook Form + Zod validation.
 */
export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: RegisterFormData) {
    setServerError("");
    setIsLoading(true);

    await signUp.email(
      {
        name: data.name,
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
            ctx.error.message || "Gagal membuat akun. Silakan coba lagi."
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
            Buat Akun Baru
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Daftar untuk mulai memantau servis kendaraan Anda
          </p>
        </div>

        {/* Server Error */}
        {serverError && (
          <div className="mb-6 p-3 rounded-sm bg-rose-500/10 border border-rose-500/20">
            <p className="text-xs text-rose-500 text-center">{serverError}</p>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="name"
            type="text"
            label="Nama Lengkap"
            placeholder="Masukkan nama lengkap"
            autoComplete="name"
            error={errors.name?.message}
            {...register("name")}
          />

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
            placeholder="Minimal 8 karakter, 1 huruf besar, 1 angka"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password")}
          />

          <Input
            id="confirmPassword"
            type="password"
            label="Konfirmasi Password"
            placeholder="Ulangi password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <Button
            type="submit"
            className="w-full mt-2"
            isLoading={isLoading}
          >
            Daftar
          </Button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-sm text-slate-400 mt-6">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="text-primary hover:text-primary-hover transition-colors"
          >
            Masuk
          </Link>
        </p>
      </div>
    </main>
  );
}
