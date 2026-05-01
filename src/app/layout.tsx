import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/context/ThemeContext";
import ThemeBtn from "@/context/ThemeButton";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const jakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' });

export const metadata: Metadata = {
  title: "Renew Mobile Admin",
  description: "Renew Mobile Admin resources for disciples of Jesus...",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", inter.variable, jakartaSans.variable, "font-sans")}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <div className="absolute top-5 right-5">
            {/* <ThemeBtn /> */}
          </div>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
