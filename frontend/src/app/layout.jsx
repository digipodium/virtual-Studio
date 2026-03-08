"use client";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {usePathname} from "next/navigation";
import './globals.css';

export const Metadata = {
  title: 'Virtual Studio - AI Avatar content Creation',
  description: 'Interact with your spreadsheet data using plain English.',
};

export default function RootLayout({ children }) {
  const pathname = usePathname();
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen text-gray-900 bg-white">
        <Navbar />
        <main className="flex-grow">{children}</main>
        {pathname !== "/login" && pathname !== "/signup" &&
        <Footer />}
      </body>
    </html>
  );
}