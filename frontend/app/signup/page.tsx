import { SignupForm } from "@/components/signup-form"
import { ThemeToggle } from "@/components/theme-toggle"
import { Brain } from "lucide-react"

export default function Page() {
  return (
    <div className="relative isolate flex min-h-svh w-full items-center justify-center overflow-hidden bg-background px-6 py-10 text-foreground dark:bg-[oklch(0.15_0.02_322)] dark:text-white">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      <div className="absolute inset-x-0 top-0 -z-10 h-52 bg-[linear-gradient(to_bottom,oklch(0.83_0.12_306_/_0.22),transparent)] dark:bg-[linear-gradient(to_bottom,oklch(0.63_0.24_304_/_0.24),transparent)]" />

      <div className="grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[1fr_400px]">
        <section className="max-w-xl">
          <div className="mb-4 flex size-16 items-center justify-center rounded-2xl border border-border bg-card shadow-2xl shadow-foreground/10 dark:border-white/10 dark:bg-white/10 dark:shadow-black/20">
            <Brain className="size-9 text-chart-2 dark:text-[oklch(0.83_0.12_306)]" />
          </div>
          <p className="mb-3 text-sm font-medium text-chart-2 dark:text-[oklch(0.83_0.12_306)]">
            AI Knowledge Platform
          </p>
          <h1 className="text-4xl font-semibold tracking-normal text-balance md:text-5xl">
            Create your workspace
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground dark:text-white/60">
            Start organizing documents, chats, and retrieval-ready knowledge in
            one place.
          </p>
        </section>

        <div className="w-full">
          <SignupForm />
        </div>
      </div>
    </div>
  )
}
