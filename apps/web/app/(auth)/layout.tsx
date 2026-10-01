import { BrandLockup } from "@/components/brand/BrandLockup";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center scenic px-4 py-10">
      <BrandLockup size="lg" />
      <div className="mt-10 flex w-full justify-center">{children}</div>
    </main>
  );
}
