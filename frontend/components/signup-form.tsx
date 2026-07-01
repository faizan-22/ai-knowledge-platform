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
import { cn } from "@/lib/utils"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<typeof Card>) {
  const inputClassName =
    "h-10 border-white/10 bg-black/20 px-3 text-white placeholder:text-white/35 focus-visible:border-[oklch(0.83_0.12_306)] focus-visible:ring-[oklch(0.83_0.12_306_/_0.24)] md:text-sm"

  return (
    <Card
      className={cn(
        "border border-white/10 bg-white/[0.07] text-white shadow-2xl shadow-black/25 backdrop-blur-xl [--card-spacing:--spacing(6)]",
        className
      )}
      {...props}
    >
      <CardHeader className="gap-2">
        <CardTitle className="text-xl font-semibold">
          Create an account
        </CardTitle>
        <CardDescription className="text-white/60">
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <FieldGroup className="gap-5">
            <Field>
              <FieldLabel htmlFor="name" className="text-white/85">
                Full Name
              </FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                className={inputClassName}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="email" className="text-white/85">
                Email
              </FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                className={inputClassName}
                required
              />
              <FieldDescription className="text-white/45">
                We&apos;ll use this to contact you. We will not share your email
                with anyone else.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="password" className="text-white/85">
                Password
              </FieldLabel>
              <Input
                id="password"
                type="password"
                className={inputClassName}
                required
              />
              <FieldDescription className="text-white/45">
                Must be at least 8 characters long.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel
                htmlFor="confirm-password"
                className="text-white/85"
              >
                Confirm Password
              </FieldLabel>
              <Input
                id="confirm-password"
                type="password"
                className={inputClassName}
                required
              />
              <FieldDescription className="text-white/45">
                Please confirm your password.
              </FieldDescription>
            </Field>
            <FieldGroup>
              <Field>
                <Button
                  type="submit"
                  className="h-10 bg-[oklch(0.83_0.12_306)] text-[oklch(0.15_0.02_322)] hover:bg-[oklch(0.88_0.1_306)]"
                >
                  Create Account
                </Button>
                <FieldDescription className="px-6 text-center text-white/50 [&>a]:text-white [&>a:hover]:text-[oklch(0.83_0.12_306)]">
                  Already have an account? <a href="/login">Sign in</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
