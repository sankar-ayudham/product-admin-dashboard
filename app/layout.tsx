import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Product Admin Dashboard",
  description: "Product administration dashboard built with Next.js, Axios and Tailwind CSS.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
