import { Sidebar } from '@/components/Sidebar'
import { BrandKitManager } from '@/components/brand/BrandKitManager'

export default function BrandConfigPage() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <header className="page-heading"><span>IDENTITY SYSTEM · CONTROLLED</span><h1>Brand Configuration</h1><p>Create a brand system from first principles or secure an existing guide for consistent mission output.</p></header>
        <BrandKitManager />
      </main>
    </div>
  )
}
