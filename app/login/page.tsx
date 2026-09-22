import { login, signup } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-screen items-center justify-center p-4" style={{ background: '#0d0d0d' }}>
      {/* Subtle background glow */}
      <div
        className="pointer-events-none fixed inset-0 opacity-20"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 30%, rgba(255,118,64,0.15) 0%, transparent 70%)' }}
      />

      <div className="relative w-full max-w-sm">
        {/* Logo / brand */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">
            <span className="copper-text">Expense</span>{" "}
            <span className="text-foreground">Tracker</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-2">Sign in to manage your EMIs and expenses</p>
        </div>

        {/* Glass card */}
        <div className="glass-card p-8">
          {params.error && (
            <div className="mb-4 text-sm text-red-400 font-medium bg-red-500/10 border border-red-500/20 px-3 py-2.5 rounded-lg">
              {params.error}
            </div>
          )}
          <form className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="dark:bg-white/5 dark:border-white/10 focus:ring-copper/40"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="dark:bg-white/5 dark:border-white/10"
              />
            </div>
            <div className="grid gap-2 mt-1">
              <Button formAction={login} type="submit" className="w-full copper-button">
                Sign in
              </Button>
              <Button formAction={signup} type="submit" variant="outline" className="w-full dark:border-white/10 dark:hover:bg-white/5 dark:text-foreground">
                Create account
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
