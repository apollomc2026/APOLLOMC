import Link from 'next/link'
import { Rocket } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 px-4">
      <div className="text-center max-w-2xl">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Rocket className="w-10 h-10 text-red-500" />
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Apollo MC</h1>
        </div>
        <p className="text-xl text-gray-400 mb-8">
          Professional documents, powered by AI. Legal memos, business plans, pitch decks — built in minutes, not weeks.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            Sign In
          </Link>
        </div>
        <div className="mt-12 text-gray-600 text-sm">
          <p>On Spot Solutions LLC — Boston, Massachusetts</p>
          <div className="mt-2 flex items-center justify-center gap-4">
            <Link href="/terms" className="hover:text-gray-400">Terms of Service</Link>
            <span>·</span>
            <Link href="/privacy" className="hover:text-gray-400">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
