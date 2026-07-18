import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/provider/theme-provider";
import { ReactQueryProvider } from "@/provider/react-query-provider";
import { AuthProvider } from "@/provider/AuthProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Sales Support AI Copilot",
    description:
        "A sales support AI copilot that helps you generate sales emails, proposals, and other sales-related content.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
        >
            <body>
                <ThemeProvider>
                    <ReactQueryProvider>
                        <AuthProvider>
                            <TooltipProvider>{children}</TooltipProvider>
                            <Toaster position="bottom-right" theme="system" richColors />
                        </AuthProvider>
                    </ReactQueryProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
