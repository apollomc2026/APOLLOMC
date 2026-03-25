'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'

// ─── Data ──────────────────────────────────────────────────────────────────

const INDUSTRIES = [
  {
    id: 'consulting',
    icon: '📊',
    iconClass: 'consulting',
    name: 'Management Consulting',
    nameShort: 'Consulting',
    desc: 'Strategy, performance, and transformation engagements for enterprise clients.',
    payloadCount: 6,
    accentColor: 'var(--cyan)',
  },
  {
    id: 'legal',
    icon: '⚖️',
    iconClass: 'legal',
    name: 'Legal Services',
    nameShort: 'Legal',
    desc: 'Corporate law, M&A, compliance documentation, and litigation support.',
    payloadCount: 5,
    accentColor: 'var(--purple)',
  },
  {
    id: 'government',
    icon: '🏛️',
    iconClass: 'government',
    name: 'Government & Federal',
    nameShort: 'Gov / Federal',
    desc: 'Prime contractor proposals, capability statements, and federal submissions.',
    payloadCount: 6,
    accentColor: 'var(--orange)',
  },
]

interface Payload {
  id: string
  icon: string
  name: string
  desc: string
  formats: string[]
  industry: string[]
  estimatedPages?: string
}

const PAYLOADS: Payload[] = [
  // Consulting
  {
    id: 'exec-presentation',
    icon: '📽️',
    name: 'Executive Presentation',
    desc: 'Board-ready slide deck with data visualization and executive narrative.',
    formats: ['PPTX', 'PDF'],
    industry: ['consulting'],
    estimatedPages: '15–30 slides',
  },
  {
    id: 'business-plan',
    icon: '📋',
    name: 'Business Plan',
    desc: 'Comprehensive plan covering market, financials, operations, and strategy.',
    formats: ['DOCX', 'PDF'],
    industry: ['consulting'],
    estimatedPages: '30–60 pages',
  },
  {
    id: 'market-analysis',
    icon: '📈',
    name: 'Market Analysis Report',
    desc: 'Competitive landscape, TAM/SAM/SOM sizing, and growth opportunity mapping.',
    formats: ['DOCX', 'PDF', 'XLSX'],
    industry: ['consulting'],
    estimatedPages: '20–40 pages',
  },
  {
    id: 'strategy-deck',
    icon: '🎯',
    name: 'Strategy Deck',
    desc: 'McKinsey-style strategic framework and recommendation presentation.',
    formats: ['PPTX', 'PDF'],
    industry: ['consulting'],
    estimatedPages: '20–35 slides',
  },
  {
    id: 'data-room',
    icon: '🗂️',
    name: 'Data Room Package',
    desc: 'Due diligence-ready document bundle with index and formatted exhibits.',
    formats: ['ZIP', 'PDF'],
    industry: ['consulting'],
    estimatedPages: 'Full package',
  },
  {
    id: 'exec-summary',
    icon: '📄',
    name: 'Executive Summary',
    desc: 'One-to-two page distillation of findings, recommendations, and next steps.',
    formats: ['DOCX', 'PDF'],
    industry: ['consulting'],
    estimatedPages: '1–2 pages',
  },

  // Legal
  {
    id: 'legal-memo',
    icon: '📜',
    name: 'Legal Memorandum',
    desc: 'Formal legal analysis and opinion memo with issue-rule-analysis-conclusion structure.',
    formats: ['DOCX', 'PDF'],
    industry: ['legal'],
    estimatedPages: '10–25 pages',
  },
  {
    id: 'contract-package',
    icon: '📑',
    name: 'Contract Document Package',
    desc: 'Full contract bundle including MSA, SOW, exhibits, and schedules.',
    formats: ['DOCX', 'PDF', 'ZIP'],
    industry: ['legal'],
    estimatedPages: 'Full package',
  },
  {
    id: 'due-diligence',
    icon: '🔍',
    name: 'Due Diligence Report',
    desc: 'Structured review of corporate, IP, regulatory, and financial risk items.',
    formats: ['DOCX', 'PDF'],
    industry: ['legal'],
    estimatedPages: '25–50 pages',
  },
  {
    id: 'compliance-summary',
    icon: '✅',
    name: 'Compliance Summary',
    desc: 'Regulatory requirement mapping, gap analysis, and remediation recommendations.',
    formats: ['DOCX', 'PDF', 'XLSX'],
    industry: ['legal'],
    estimatedPages: '15–30 pages',
  },
  {
    id: 'litigation-brief',
    icon: '⚖️',
    name: 'Litigation Brief',
    desc: 'Argument structure, case law summary, and procedural timeline documentation.',
    formats: ['DOCX', 'PDF'],
    industry: ['legal'],
    estimatedPages: '20–40 pages',
  },

  // Government
  {
    id: 'rfp-response',
    icon: '🏛️',
    name: 'Federal Proposal (RFP)',
    desc: 'Section-by-section RFP response with technical volume, management volume, and price narrative.',
    formats: ['DOCX', 'PDF', 'ZIP'],
    industry: ['government'],
    estimatedPages: '40–120 pages',
  },
  {
    id: 'capability-statement',
    icon: '📢',
    name: 'Capability Statement',
    desc: 'One-page contractor capability statement formatted to NAICS, DUNS, and core competency standards.',
    formats: ['DOCX', 'PDF'],
    industry: ['government'],
    estimatedPages: '1–2 pages',
  },
  {
    id: 'technical-volume',
    icon: '🔧',
    name: 'Technical Volume',
    desc: 'Standalone technical approach narrative meeting federal proposal page and format limits.',
    formats: ['DOCX', 'PDF'],
    industry: ['government'],
    estimatedPages: '15–40 pages',
  },
  {
    id: 'past-performance',
    icon: '🏆',
    name: 'Past Performance Volume',
    desc: 'Formatted CPARS-aligned past performance narratives with relevance mapping.',
    formats: ['DOCX', 'PDF'],
    industry: ['government'],
    estimatedPages: '10–25 pages',
  },
  {
    id: 'sources-sought',
    icon: '📡',
    name: 'Sources Sought Response',
    desc: 'Company capability synopsis for market research and pre-solicitation responses.',
    formats: ['DOCX', 'PDF'],
    industry: ['government'],
    estimatedPages: '3–8 pages',
  },
  {
    id: 'sam-narrative',
    icon: '📝',
    name: 'SAM.gov Narrative Package',
    desc: 'SAM registration narratives, SBA profile content, and small business certifications.',
    formats: ['DOCX', 'PDF'],
    industry: ['government'],
    estimatedPages: '5–15 pages',
  },
]

// ─── Component ─────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter()
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null)
  const [selectedPayloads, setSelectedPayloads] = useState<string[]>([])

  const visiblePayloads = selectedIndustry
    ? PAYLOADS.filter(p => p.industry.includes(selectedIndustry))
    : []

  function togglePayload(id: string) {
    setSelectedPayloads(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  function handleIndustrySelect(id: string) {
    if (selectedIndustry === id) {
      setSelectedIndustry(null)
      setSelectedPayloads([])
    } else {
      setSelectedIndustry(id)
      setSelectedPayloads([])
    }
  }

  const canLaunch = selectedIndustry !== null && selectedPayloads.length > 0

  function handleLaunch() {
    if (!canLaunch) return
    const params = new URLSearchParams({
      industry: selectedIndustry!,
      payloads: selectedPayloads.join(','),
    })
    router.push(`/launch-pad?${params.toString()}`)
  }

  return (
    <>
      {/* Ambient Background */}
      <div className="apollo-bg">
        <div className="apollo-bg-grid" />
        <div className="apollo-bg-glow-1" />
        <div className="apollo-bg-glow-2" />
        <div className="apollo-bg-scan" />
      </div>

      <div className="app-shell">
        <Sidebar />

        <main className="main-content">

          {/* ── Page Header ── */}
          <div className="page-header">
            <div className="page-header-left">
              <h1>
                Mission Control
                <span className="live-indicator">
                  <span className="live-dot" />
                  ONLINE
                </span>
              </h1>
              <p className="page-header-subtitle">
                Select your sector, configure your payload, and initiate mission
              </p>
            </div>
            <div className="page-header-actions">
              <button className="btn btn-ghost" style={{ fontSize: 13 }}>
                📖 Docs
              </button>
              <button className="btn btn-ghost" style={{ fontSize: 13 }}>
                ⚙️ Settings
              </button>
            </div>
          </div>

          {/* ── Stats Row ── */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-label">Active Missions</div>
              <div className="stat-value cyan">0</div>
              <div className="stat-sub">No active executions</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Queue Depth</div>
              <div className="stat-value orange">0</div>
              <div className="stat-sub">Launch Pad clear</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Completed</div>
              <div className="stat-value green">0</div>
              <div className="stat-sub">Lifetime missions</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">AI Credits</div>
              <div className="stat-value white">∞</div>
              <div className="stat-sub" style={{ color: 'var(--orange)', fontWeight: 600 }}>
                Mercury — Free Tier
              </div>
            </div>
          </div>

          {/* ── Select Sector ── */}
          <div className="section-header" style={{ animationDelay: '0.2s' }}>
            <div className="section-title">01 · Select Sector</div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {selectedIndustry
                ? `${INDUSTRIES.find(i => i.id === selectedIndustry)?.nameShort} selected`
                : 'Choose your industry vertical'}
            </span>
          </div>

          <div className="industry-grid">
            {INDUSTRIES.map(industry => (
              <div
                key={industry.id}
                className={`industry-card ${selectedIndustry === industry.id ? 'selected' : ''}`}
                onClick={() => handleIndustrySelect(industry.id)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && handleIndustrySelect(industry.id)}
                aria-pressed={selectedIndustry === industry.id}
              >
                <div className={`industry-card-icon ${industry.iconClass}`}>
                  {industry.icon}
                </div>
                <div className="industry-card-name">{industry.name}</div>
                <div className="industry-card-desc">{industry.desc}</div>
                <div className="industry-card-meta">
                  <span className="industry-card-payload-count">
                    {industry.payloadCount} payloads available
                  </span>
                  <span className="industry-card-select-chip">
                    {selectedIndustry === industry.id ? '✓ SELECTED' : 'SELECT'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* ── Select Payloads ── */}
          {selectedIndustry && (
            <>
              <div className="section-header" style={{ animation: 'fadeUp 0.35s ease both' }}>
                <div className="section-title">02 · Select Payloads</div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {selectedPayloads.length > 0
                    ? `${selectedPayloads.length} payload${selectedPayloads.length > 1 ? 's' : ''} selected`
                    : 'Choose one or more deliverables'}
                </span>
              </div>

              <div className="payload-grid">
                {visiblePayloads.map((payload, i) => (
                  <div
                    key={payload.id}
                    className={`payload-card ${selectedPayloads.includes(payload.id) ? 'selected' : ''}`}
                    onClick={() => togglePayload(payload.id)}
                    style={{ animationDelay: `${i * 0.05}s` }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && togglePayload(payload.id)}
                    aria-pressed={selectedPayloads.includes(payload.id)}
                  >
                    <div className="payload-icon">{payload.icon}</div>
                    <div className="payload-name">{payload.name}</div>
                    <div className="payload-desc">{payload.desc}</div>
                    {payload.estimatedPages && (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                        ≈ {payload.estimatedPages}
                      </div>
                    )}
                    <div className="payload-format-badges">
                      {payload.formats.map(fmt => (
                        <span key={fmt} className="payload-badge">{fmt}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── Launch Bar ── */}
          <div className={`launch-bar ${canLaunch ? 'ready' : ''}`}>
            <div className="launch-bar-status">
              <div className="launch-bar-title">
                {canLaunch
                  ? `🔥 Ready to Launch — ${selectedPayloads.length} payload${selectedPayloads.length > 1 ? 's' : ''} configured`
                  : '🛰️ Configure your mission to enable launch'}
              </div>
              <div className="launch-bar-sub">
                {canLaunch
                  ? 'Proceed to Launch Pad to complete briefing and initiate execution'
                  : 'Select a sector and at least one payload to proceed'}
              </div>
            </div>

            <div className="launch-bar-checklist">
              <div className={`launch-check ${selectedIndustry ? 'done' : ''}`}>
                <span className="launch-check-dot" />
                SECTOR
              </div>
              <div className={`launch-check ${selectedPayloads.length > 0 ? 'done' : ''}`}>
                <span className="launch-check-dot" />
                PAYLOAD
              </div>
              <div className="launch-check">
                <span className="launch-check-dot" />
                BRIEFING
              </div>
            </div>

            <button
              className="btn btn-launch"
              disabled={!canLaunch}
              onClick={handleLaunch}
              aria-label="Proceed to Launch Pad"
            >
              🚀 Proceed to Launch Pad
            </button>
          </div>

          {/* ── Recent Missions ── */}
          <div className="section-header">
            <div className="section-title">Recent Missions</div>
          </div>

          <div className="empty-missions">
            <div className="empty-missions-icon">🌌</div>
            <div className="empty-missions-title">Launch Pad is Clear</div>
            <div className="empty-missions-sub">
              No missions have been initiated yet. Select a sector and payload above,
              then proceed to Launch Pad to begin your first mission.
            </div>
          </div>

        </main>
      </div>
    </>
  )
}
