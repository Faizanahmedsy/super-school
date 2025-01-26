import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Button>
        <Link href="/set-milestones">Go to dashboard</Link>
      </Button>
    </div>
  );
}
