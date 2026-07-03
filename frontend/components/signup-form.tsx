"use client"

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
import { signupController } from "@/controllers/auth.controller"
import { handleApiError, handleSuccess } from "@/lib/handle-toast"
import { cn } from "@/lib/utils"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<typeof Card>) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    try {
      event.preventDefault()
      setIsLoading(true)

      if (password != confirmPassword) {
        handleApiError(
          new Error("Confirm password doesn't match"),
          "Confirm password doesn't match"
        )
        return
      }

      await signupController({
        name,
        email,
        password,
      })

      handleSuccess(`User created successfully. Please login`)

      router.push("/login")
    } catch (error) {
      handleApiError(error, "Unable to signup. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const inputClassName =
    "h-10 border-input bg-input/20 px-3 text-foreground placeholder:text-muted-foreground focus-visible:border-chart-2 focus-visible:ring-chart-2/25 md:text-sm dark:border-white/10 dark:bg-black/20 dark:text-white dark:placeholder:text-white/35 dark:focus-visible:border-[oklch(0.83_0.12_306)] dark:focus-visible:ring-[oklch(0.83_0.12_306_/_0.24)]"
  const passwordInputClassName =
    "h-10 border-input bg-input/20 px-3 pr-10 text-foreground placeholder:text-muted-foreground focus-visible:border-chart-2 focus-visible:ring-chart-2/25 md:text-sm dark:border-white/10 dark:bg-black/20 dark:text-white dark:placeholder:text-white/35 dark:focus-visible:border-[oklch(0.83_0.12_306)] dark:focus-visible:ring-[oklch(0.83_0.12_306_/_0.24)]"
  const passwordToggleClassName =
    "absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground dark:text-white/50 dark:hover:text-white"

  return (
    <Card
      className={cn(
        "border border-border bg-card/85 text-card-foreground shadow-2xl shadow-foreground/10 backdrop-blur-xl [--card-spacing:--spacing(6)] dark:border-white/10 dark:bg-white/[0.07] dark:text-white dark:shadow-black/25",
        className
      )}
      {...props}
    >
      <CardHeader className="gap-2">
        <CardTitle className="text-xl font-semibold">
          Create an account
        </CardTitle>
        <CardDescription className="text-muted-foreground dark:text-white/60">
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup className="gap-5">
            <Field>
              <FieldLabel
                htmlFor="name"
                className="text-foreground/85 dark:text-white/85"
              >
                Full Name
              </FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={inputClassName}
                required
              />
            </Field>
            <Field>
              <FieldLabel
                htmlFor="email"
                className="text-foreground/85 dark:text-white/85"
              >
                Email
              </FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={inputClassName}
                required
              />
              <FieldDescription className="text-muted-foreground dark:text-white/45">
                We&apos;ll use this to contact you. We will not share your email
                with anyone else.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel
                htmlFor="password"
                className="text-foreground/85 dark:text-white/85"
              >
                Password
              </FieldLabel>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={passwordInputClassName}
                  required
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className={passwordToggleClassName}
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? (
                    <EyeOffIcon className="size-4" />
                  ) : (
                    <EyeIcon className="size-4" />
                  )}
                </button>
              </div>
              <FieldDescription className="text-muted-foreground dark:text-white/45">
                Must be at least 8 characters long.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel
                htmlFor="confirm-password"
                className="text-foreground/85 dark:text-white/85"
              >
                Confirm Password
              </FieldLabel>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className={passwordInputClassName}
                  required
                />
                <button
                  type="button"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                  className={passwordToggleClassName}
                  onClick={() => setShowConfirmPassword((value) => !value)}
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon className="size-4" />
                  ) : (
                    <EyeIcon className="size-4" />
                  )}
                </button>
              </div>
              <FieldDescription className="text-muted-foreground dark:text-white/45">
                Please confirm your password.
              </FieldDescription>
            </Field>
            <FieldGroup>
              <Field>
                <Button
                  type="submit"
                  className="h-10 bg-chart-1 text-[oklch(0.15_0.02_322)] hover:bg-chart-1/90"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account" : "Create Account"}
                </Button>
                <FieldDescription className="px-6 text-center text-muted-foreground dark:text-white/50 [&>a]:text-foreground dark:[&>a]:text-white [&>a:hover]:text-chart-2 dark:[&>a:hover]:text-[oklch(0.83_0.12_306)]">
                  Already have an account?{" "}
                  <a
                    href="/login"
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
                    Sign in
                  </a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
