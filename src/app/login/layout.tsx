import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "@/app/globals.css";
import { cn } from "@/lib/utils";


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});


export const metadata: Metadata = {
  title: "Login | Renew Mobile Admin",
  description: "Securely login to your account. Access your dashboard and manage your projects efficiently.",
  robots: "noindex, nofollow",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "min-h-screen antialiased font-sans",
        inter.variable,
        jakarta.variable
      )}
    >
      {children}
    </section>
  );
};