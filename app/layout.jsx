import "./globals.css";

import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { ToastProvider } from "@/components/ui/toast-provider";

import localFont from 'next/font/local';

export const glacial = localFont({
  src: [
    {
      path: '/fonts/GlacialIndifference-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '/fonts/GlacialIndifference-Bold.otf',
      weight: '700',
      style: 'normal',
    },
  ]
});



export const metadata = {
  title: "Beauty AI",
  description: "Your beauty questions, solved",
};

export default async function RootLayout({ children }) {
  const session = await auth();

  return (
    <html lang="en">
      <SessionProvider session={session}>
        <body
          className={`${glacial.className} [background-image:var(--gradient-main)] text-white antialiased flex flex-col h-svh`}
        >
          <ToastProvider>
            {children}
          </ToastProvider>
        </body>
      </SessionProvider>
    </html>
  );
}
