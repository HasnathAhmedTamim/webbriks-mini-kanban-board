import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { AppProviders } from "@/providers/QueryProvider";
import { AuthProvider } from "@/hooks/useAuth";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MiniKanban",
  description: "Collaborative mini kanban board",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} antialiased`}>
        <AppProviders>
          <AuthProvider>{children}</AuthProvider>
        </AppProviders>
      </body>
    </html>
  );
}
