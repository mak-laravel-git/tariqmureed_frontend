import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";

import { LoginForm } from "@/components/admin/SettingsForms";
import { apiConfig } from "@/lib/api/config";
import { firstParam } from "@/lib/url";

export const metadata: Metadata = { title: "Sign in" };

async function LoginBody({ searchParams }: Pick<PageProps<"/admin/login">, "searchParams">) {
  const params = await searchParams;
  const next = firstParam(params.next) ?? "/admin";
  const expired = firstParam(params.expired) === "1";

  return (
    <div className="w-full max-w-[400px] rounded-xl border border-line bg-white p-7 shadow-[0_8px_30px_rgba(17,17,17,0.06)] sm:p-9">
      <Image src="/images/brand/logo-white.png" alt="TMN Sport" width={150} height={22} style={{ width: 150, height: "auto" }} className="invert" priority />
      <h1 className="mt-7 text-2xl leading-8 font-normal tracking-[-0.01em] text-ink">Sign in to the newsroom</h1>
      <p className="mt-1 text-[13px] leading-5 text-muted">Use your administrator account to manage content.</p>

      {expired && (
        <p role="alert" className="mt-5 rounded-md bg-[#fff2c2] px-3 py-2.5 text-xs text-[#8a6500]">
          Your session expired. Please sign in again.
        </p>
      )}

      <div className="mt-6">
        <LoginForm next={next} mock={apiConfig.useMocks} />
      </div>
    </div>
  );
}

export default function AdminLoginPage(props: PageProps<"/admin/login">) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f6f8] px-4 py-10">
      <Suspense fallback={<div role="status" aria-label="Loading" className="h-[420px] w-full max-w-[400px]" />}>
        <LoginBody searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}
