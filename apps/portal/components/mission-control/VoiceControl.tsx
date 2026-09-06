'use client'

import { useEffect, useRef, useState } from 'react'
import { Mic, MicOff, ShieldAlert } from 'lucide-react'

type SpeechResult = {
  isFinal: boolean
  0: { transcript: string; confidence: number }
}

type SpeechResultEvent = Event & {
  resultIndex: number
  results: ArrayLike<SpeechResult>
}

type SpeechRecognitionLike = {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechResultEvent) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
  start(): void
  stop(): void
  abort(): void
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}

type VoiceControlProps = {
  disabled?: boolean
  onTranscript: (text: string) => void
}

const criticalValuePattern = /(?:\$\s?\d|\b\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?\b|\b\d{1,2}:\d{2}\b|@|\b(?:street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr)\b)/i

export function VoiceControl({ disabled, onTranscript }: VoiceControlProps) {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [confidence, setConfidence] = useState<number | null>(null)
  const [requiresReview, setRequiresReview] = useState(false)
  const [unavailable, setUnavailable] = useState(false)

  useEffect(() => () => recognitionRef.current?.abort(), [])

  function stop() {
    recognitionRef.current?.stop()
    setListening(false)
  }

  function start() {
    if (disabled || listening) return
    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition
    if (!Recognition) {
      setUnavailable(true)
      return
    }

    const recognition = new Recognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = navigator.language || 'en-US'
    recognition.onresult = event => {
      let provisional = ''
      let committed = ''
      let finalConfidence: number | null = null
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index]
        if (result.isFinal) {
          committed += result[0].transcript
          finalConfidence = result[0].confidence
        } else {
          provisional += result[0].transcript
        }
      }
      setInterim(provisional.trim())
      if (committed.trim()) {
        const text = committed.trim()
        onTranscript(text)
        setConfidence(finalConfidence)
        setRequiresReview(criticalValuePattern.test(text) || (finalConfidence !== null && finalConfidence < 0.78))
      }
    }
    recognition.onerror = () => {
      setListening(false)
      setInterim('')
    }
    recognition.onend = () => setListening(false)
    recognitionRef.current = recognition
    recognition.start()
    setUnavailable(false)
    setRequiresReview(false)
    setListening(true)
  }

  return (
    <div className="mc-voice">
      <button
        type="button"
        className={`mc-icon-button${listening ? ' active' : ''}`}
        onClick={listening ? stop : start}
        disabled={disabled}
        aria-pressed={listening}
        aria-label={listening ? 'Stop voice intake' : 'Start voice intake'}
      >
        {listening ? <MicOff size={18} /> : <Mic size={18} />}
        <span>{listening ? 'Stop listening' : 'Speak'}</span>
      </button>
      {interim ? <span className="mc-voice-interim" aria-live="polite">Hearing: {interim}</span> : null}
      {requiresReview ? <span className="mc-voice-review"><ShieldAlert size={13} />Review names, dates, amounts, addresses, and obligations before sending{confidence !== null ? ` · ${Math.round(confidence * 100)}% confidence` : ''}</span> : null}
      {unavailable ? <span className="mc-voice-review">Voice intake is unavailable in this browser. You can continue by typing.</span> : null}
    </div>
  )
}
