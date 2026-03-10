"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const loginSchema = z.object({
    email: z.string().email({ message: "E-mail inválido" }),
    password: z.string().min(1, { message: "A senha é obrigatória" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
    const urlError = searchParams.get("error");

    const [isLoading, setIsLoading] = useState(false);
    const [authError, setAuthError] = useState<string | null>(
        urlError === "CredentialsSignin" ? "Credenciais inválidas. Verifique seu e-mail e senha." : null
    );

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);
        setAuthError(null);

        try {
            const res = await signIn("credentials", {
                redirect: false,
                email: data.email,
                password: data.password,
                callbackUrl,
            });

            if (res?.error) {
                setAuthError("Credenciais inválidas. Tente novamente.");
                setIsLoading(false);
            } else if (res?.url) {
                window.location.href = res.url;
            }
        } catch (error) {
            setAuthError("Ocorreu um erro inesperado. Tente novamente mais tarde.");
            setIsLoading(false);
        }
    };

    return (
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="flex justify-center mb-6">
                <div className="size-12 flex items-center justify-center bg-[#ff6e00]/10 rounded-xl">
                    <span className="material-symbols-outlined text-[#ff6e00] text-3xl">corporate_fare</span>
                </div>
            </div>
            <h2 className="mt-2 text-center text-3xl font-black text-slate-900 tracking-tight">
                Acesse sua conta
            </h2>
            <p className="mt-2 text-center text-sm text-slate-500">
                Bem-vindo ao Finandash
            </p>

            <div className="mt-8 bg-white py-8 px-4 shadow-sm border border-slate-200 sm:rounded-xl sm:px-10">
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-bold text-slate-700"
                        >
                            E-mail
                        </label>
                        <div className="mt-1">
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                className={`block w-full appearance-none rounded-lg border ${errors.email ? "border-red-300" : "border-slate-300"
                                    } px-3 py-2 placeholder-slate-400 shadow-sm focus:border-[#ff6e00] focus:outline-none focus:ring-[#ff6e00] sm:text-sm bg-slate-50`}
                                {...register("email")}
                            />
                            {errors.email && (
                                <p className="mt-2 text-sm text-red-600">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-bold text-slate-700"
                        >
                            Senha
                        </label>
                        <div className="mt-1">
                            <input
                                id="password"
                                type="password"
                                autoComplete="current-password"
                                className={`block w-full appearance-none rounded-lg border ${errors.password ? "border-red-300" : "border-slate-300"
                                    } px-3 py-2 placeholder-slate-400 shadow-sm focus:border-[#ff6e00] focus:outline-none focus:ring-[#ff6e00] sm:text-sm bg-slate-50`}
                                {...register("password")}
                            />
                            {errors.password && (
                                <p className="mt-2 text-sm text-red-600">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {authError && (
                        <div className="rounded-md bg-red-50 p-4 border border-red-200">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <span className="material-symbols-outlined text-red-400 text-sm">
                                        error
                                    </span>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">
                                        {authError}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex w-full justify-center rounded-lg border border-transparent bg-[#ff6e00] py-2.5 px-4 text-sm font-bold text-white shadow-sm hover:bg-[#ff6e00]/90 focus:outline-none focus:ring-2 focus:ring-[#ff6e00] focus:ring-offset-2 disabled:opacity-50 transition-colors"
                        >
                            {isLoading ? "Entrando..." : "Entrar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="text-center text-slate-500">Carregando...</div>}>
            <LoginForm />
        </Suspense>
    );
}
