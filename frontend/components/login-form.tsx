"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { loginController } from "@/controllers/auth.controller"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { handleApiError, handleSuccess } from "@/lib/handle-toast"
import { EyeIcon, EyeOffIcon } from "lucide-react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    try {
      const response = await loginController({
        email,
        password,
      })

      handleSuccess(response.data.message)

      router.replace("/dashboard")
    } catch (error) {
      handleApiError(error, "Unable to login. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border border-border bg-card/85 text-card-foreground shadow-2xl shadow-foreground/10 backdrop-blur-xl [--card-spacing:--spacing(6)] dark:border-white/10 dark:bg-white/[0.07] dark:text-white dark:shadow-black/25">
        <CardHeader className="gap-2">
          <CardTitle className="text-xl font-semibold">
            Login to your account
          </CardTitle>
          <CardDescription className="text-muted-foreground dark:text-white/60">
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup className="gap-5">
              <Field>
                <FieldLabel htmlFor="email" className="text-foreground/85 dark:text-white/85">
                  Email
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-10 border-input bg-input/20 px-3 text-foreground placeholder:text-muted-foreground focus-visible:border-chart-2 focus-visible:ring-chart-2/25 md:text-sm dark:border-white/10 dark:bg-black/20 dark:text-white dark:placeholder:text-white/35 dark:focus-visible:border-[oklch(0.83_0.12_306)] dark:focus-visible:ring-[oklch(0.83_0.12_306_/_0.24)]"
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password" className="text-foreground/85 dark:text-white/85">
                    Password
                  </FieldLabel>
                  <a
                    href="#"
                    aria-disabled={isLoading}
                    tabIndex={isLoading ? -1 : undefined}
                    className={cn(
                      "ml-auto inline-block text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline dark:text-white/50 dark:hover:text-white",
                      isLoading && "pointer-events-none opacity-50"
                    )}
                    onClick={(event) => {
                      if (isLoading) {
                        event.preventDefault()
                      }
                    }}
                  >
                    Forgot your password?
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-10 border-input bg-input/20 px-3 pr-10 text-foreground placeholder:text-muted-foreground focus-visible:border-chart-2 focus-visible:ring-chart-2/25 md:text-sm dark:border-white/10 dark:bg-black/20 dark:text-white dark:placeholder:text-white/35 dark:focus-visible:border-[oklch(0.83_0.12_306)] dark:focus-visible:ring-[oklch(0.83_0.12_306_/_0.24)]"
                    required
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground dark:text-white/50 dark:hover:text-white"
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="size-4" />
                    ) : (
                      <EyeIcon className="size-4" />
                    )}
                  </button>
                </div>
              </Field>
              <Field>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-10 bg-chart-1 text-[oklch(0.15_0.02_322)] hover:bg-chart-1/90"
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
                <FieldDescription className="text-center text-muted-foreground [&>a]:text-foreground [&>a:hover]:text-chart-2 dark:text-white/50 dark:[&>a]:text-white dark:[&>a:hover]:text-[oklch(0.83_0.12_306)]">
                  Don&apos;t have an account?{" "}
                  <a
                    href="/signup"
                    aria-disabled={isLoading}
                    tabIndex={isLoading ? -1 : undefined}
                    className={cn(
                      isLoading && "pointer-events-none opacity-50"
                    )}
                    onClick={(event) => {
                      if (isLoading) {
                        event.preventDefault()
                      }
                    }}
                  >
                    Sign up
                  </a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
