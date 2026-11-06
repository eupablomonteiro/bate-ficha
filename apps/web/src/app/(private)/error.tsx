"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-red-500">
        Não foi possível carregar esta página.
      </p>
      <Button onClick={reset}>Tentar novamente</Button>
    </div>
  );
}
