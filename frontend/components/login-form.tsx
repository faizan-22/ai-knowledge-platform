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

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border border-white/10 bg-white/[0.07] text-white shadow-2xl shadow-black/25 backdrop-blur-xl [--card-spacing:--spacing(6)]">
        <CardHeader className="gap-2">
          <CardTitle className="text-xl font-semibold">
            Login to your account
          </CardTitle>
          <CardDescription className="text-white/60">
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <FieldGroup className="gap-5">
              <Field>
                <FieldLabel htmlFor="email" className="text-white/85">
                  Email
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  className="h-10 border-white/10 bg-black/20 px-3 text-white placeholder:text-white/35 focus-visible:border-[oklch(0.83_0.12_306)] focus-visible:ring-[oklch(0.83_0.12_306_/_0.24)] md:text-sm"
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password" className="text-white/85">
                    Password
                  </FieldLabel>
                  <a
                    href="#"
                    className="ml-auto inline-block text-xs text-white/50 underline-offset-4 hover:text-white hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  className="h-10 border-white/10 bg-black/20 px-3 text-white placeholder:text-white/35 focus-visible:border-[oklch(0.83_0.12_306)] focus-visible:ring-[oklch(0.83_0.12_306_/_0.24)] md:text-sm"
                  required
                />
              </Field>
              <Field>
                <Button
                  type="submit"
                  className="h-10 bg-[oklch(0.83_0.12_306)] text-[oklch(0.15_0.02_322)] hover:bg-[oklch(0.88_0.1_306)]"
                >
                  Login
                </Button>
                <FieldDescription className="text-center text-white/50 [&>a]:text-white [&>a:hover]:text-[oklch(0.83_0.12_306)]">
                  Don&apos;t have an account? <a href="/signup">Sign up</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
