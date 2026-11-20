import type { Metadata } from "next";
import { MeProvider } from "@/components/app/MeContext";
import PhoneShell from "@/components/app/PhoneShell";

export const metadata: Metadata = { title: "Grip Guild · Mechanic App" };

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <MeProvider>
      <PhoneShell>{children}</PhoneShell>
    </MeProvider>
  );
}
