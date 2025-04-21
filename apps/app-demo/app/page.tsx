import {LoginForm} from "@repo/core-shadcn-ui/components/login-form";

export default function Page() {
  return (
    <main>
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <a href="#" className="flex items-center gap-2 self-center font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            </div>
            Acme Inc.1
          </a>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
