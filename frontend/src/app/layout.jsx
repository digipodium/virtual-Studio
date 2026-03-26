
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './globals.css';
import { Toaster } from 'react-hot-toast';


export const metadata = {
  title: 'Virtual Studio,AI Avatar content Creation',
  description: 'Interact with your spreadsheet data using plain English.',
};

export default function RootLayout({ children }) {
  
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen text-gray-900 bg-white">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Toaster/>
             <Footer />
      </body>
    </html>
  );
}