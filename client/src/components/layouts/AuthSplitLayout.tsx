import type { ReactNode } from "react";

interface AuthSplitLayoutProps {
  title: string;
  subtitle: ReactNode;
  form: ReactNode;
  footer: ReactNode;
}

export default function AuthSplitLayout({ title, subtitle, form, footer }: AuthSplitLayoutProps) {
  return (
    <div className="min-h-screen p-3 sm:p-6 md:p-8">
      <div className="mx-auto flex min-h-[calc(100vh-24px)] w-full max-w-6xl overflow-hidden rounded-[28px] bg-white sm:min-h-[calc(100vh-48px)] md:min-h-[calc(100vh-64px)]">
        <section className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-[#4b59ff] via-[#2634d7] to-[#111880] p-10 text-white lg:flex">
          <div className="relative z-10">
            <div className="mb-8 text-7xl font-light leading-none">*</div>
            <h1 className="mb-5 text-6xl font-semibold leading-[1.03]">Hello File Uploader!</h1>
            <p className="max-w-md text-xl leading-relaxed text-white/90">
              Upload, organize, preview, and share your files in one secure workspace. Stay productive with a smoother file workflow.
            </p>
          </div>

          <div className="relative z-10 flex items-center justify-between text-sm text-white/80">
            <button
              type="button"
              className="rounded-2xl bg-white/18 px-5 py-3 font-medium text-white backdrop-blur-sm transition hover:bg-white/30"
            >
              Open Dashboard
            </button>
            <span>2026 File Uploader. All rights reserved.</span>
          </div>

          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-40 top-20 h-[560px] w-[760px] rounded-[56%] border border-white/20" />
            <div className="absolute -left-20 top-28 h-[520px] w-[700px] rounded-[56%] border border-white/18" />
            <div className="absolute left-0 top-36 h-[480px] w-[640px] rounded-[56%] border border-white/16" />
            <div className="absolute left-20 top-44 h-[440px] w-[580px] rounded-[56%] border border-white/14" />
          </div>
        </section>

        <section className="flex w-full items-center justify-center bg-[#f6f6f6] p-6 sm:p-10 lg:w-1/2">
          <div className="w-full max-w-md">
            <div className="mb-12">
              <h2 className="mb-7 text-4xl font-semibold text-[#171717]">File Uploader</h2>
              <h3 className="text-4xl font-semibold tracking-tight text-[#171717]">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#6a6a6a]">{subtitle}</p>
            </div>

            {form}

            <div className="mt-7 text-center text-sm text-[#676767]">{footer}</div>
          </div>
        </section>
      </div>
    </div>
  );
}
