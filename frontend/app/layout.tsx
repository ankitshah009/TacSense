import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TacSense AI - Real-time Situational Awareness Dashboard',
  description: 'AI-driven multimodal situational awareness system for military commanders integrating voice, text, and visual intelligence.',
  keywords: ['AI', 'Military', 'Situational Awareness', 'Voice Recognition', 'Computer Vision', 'Command and Control'],
  authors: [{ name: 'TacSense AI Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-military-900 text-white antialiased`}>
        <div className="min-h-screen tactical-grid">
          {children}
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#f9fafb',
              border: '1px solid #374151',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#f9fafb',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#f9fafb',
              },
            },
          }}
        />
      </body>
    </html>
  )
} 