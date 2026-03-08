import type { Metadata, Viewport } from "next";
import { Outfit, Inter, Poppins } from "next/font/google"; // Added Poppins
import { Toaster } from "sonner";
import { ModalProvider } from "@/components/ui/modal/ModalContext";
import { GlobalModalRenderer } from "@/components/ui/modal/GlobalModal";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bodhi Board | Modern Preschool ERP",
  description: "Enterprise management solution for progressive preschools and child care centers.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#2563EB",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${outfit.variable} ${inter.variable} ${poppins.variable} antialiased`}
      >
        <ModalProvider>
          {children}
          <GlobalModalRenderer />
        </ModalProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
