"use client";

import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import AuthBrand from "@/features/auth/components/AuthBrand";
import AuthImagePanel from "@/features/auth/components/AuthImagePanel";
import MobileLoginHero from "@/features/auth/login/components/MobileLoginHero";
import { useLogin } from "@/features/auth/login/hooks/useLogin";

export default function LoginPage() {
  const loginPage = useLogin();

  return (
    <main className="flex h-dvh flex-col overflow-y-auto bg-surface lg:flex-row lg:overflow-hidden">
      <MobileLoginHero />
      <AuthImagePanel />

      <section className="relative z-10 -mt-16 flex w-full shrink-0 justify-center rounded-t-[4rem] bg-surface px-6 pb-8 pt-14 text-black sm:-mt-20 sm:rounded-t-[5rem] sm:px-10 sm:pb-10 sm:pt-16 lg:mt-0 lg:h-full lg:min-h-0 lg:w-2/5 lg:overflow-y-auto lg:rounded-none lg:px-12 lg:py-16 xl:px-20">
        <div className="flex w-full max-w-md flex-col lg:min-h-fit">
          <div className="hidden lg:block">
            <AuthBrand />
          </div>

          <div className="lg:my-auto lg:pt-14">
            <div className="mb-6 sm:mb-8 lg:mb-10">
              <h1 className="text-3xl font-semibold tracking-tight text-primary-text sm:text-4xl lg:text-3xl">
                Grow Your Knowledge
              </h1>
              <p className="mt-3 max-w-md text-sm leading-6 text-secondary-text sm:text-base lg:mt-2">
                A learning platform designed to help you grow at your own pace
                through quizzes, flashcards, and reviews.
              </p>
            </div>

            <form onSubmit={loginPage.handleLogin} className="flex flex-col gap-4 sm:gap-5 lg:gap-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="font-medium">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  defaultValue={loginPage.formData.email}
                  onChange={loginPage.handleUserInput}
                  autoComplete="email"
                  className="h-13 w-full rounded-sm border border-border px-4 outline-none transition focus:border-primary-accent focus:ring-2 focus:ring-primary-accent/15 lg:h-12"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="password" className="font-medium">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={loginPage.showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    defaultValue={loginPage.formData.password}
                    onChange={loginPage.handleUserInput}
                    autoComplete="current-password"
                    className="h-13 w-full rounded-sm border border-border px-4 pr-12 outline-none transition focus:border-primary-accent focus:ring-2 focus:ring-primary-accent/15 lg:h-12"
                  />
                  <button
                    type="button"
                    onClick={loginPage.handlePasswordVisibility}
                    aria-label={
                      loginPage.showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute inset-y-0 right-0 flex w-12 cursor-pointer items-center justify-center text-secondary-text"
                  >
                    {loginPage.showPassword ? (
                      <EyeSlashIcon className="size-5" />
                    ) : (
                      <EyeIcon className="size-5" />
                    )}
                  </button>
                </div>
                <div className="flex justify-end">
                  <Link
                    href="/auth/forgot-password"
                    className="cursor-pointer font-medium text-primary-accent"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginPage.isLoggingin}
                className="mt-1 flex h-13 w-full cursor-pointer items-center justify-center rounded-sm bg-primary-accent font-medium text-surface transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70 lg:h-12"
              >
                {loginPage.isLoggingin ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  "Login"
                )}
              </button>
              {loginPage.error && <p className="text-sm text-error">{loginPage.error}</p>}
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
