import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Sorry, something went wrong.
              </CardTitle>
            </CardHeader>
            <CardContent>
              {params?.error || params?.message ? (
                <p className="text-sm text-muted-foreground">
                  {params.error ? `Error: ${params.error}` : params.message}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  An unspecified error occurred.
                </p>
              )}
              
              <div className="mt-4 space-y-2">
                <a 
                  href="/auth/signin" 
                  className="inline-block text-sm text-blue-600 hover:underline"
                >
                  Try signing in again
                </a>
                <br />
                <a 
                  href="/auth/signup" 
                  className="inline-block text-sm text-blue-600 hover:underline"
                >
                  Create a new account
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}