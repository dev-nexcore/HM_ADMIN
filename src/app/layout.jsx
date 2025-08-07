import { Geist, Geist_Mono } from "next/font/google";
import "@fontsource/inter"; // This loads default weights
import { Poppins } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";

// Fonts setup
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "KGF_HM | Admin Portal ",
  description: "Easily create, edit, and manage notices for the KGF_HM Admin Portal. Improve communication with a streamlined interface.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* 👇 Add suppressHydrationWarning here */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} antialiased`}
        suppressHydrationWarning
      >
        <LayoutWrapper>
          {children}</LayoutWrapper>
      </body>
    </html>
  );
}
