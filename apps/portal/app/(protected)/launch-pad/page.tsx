import { redirect } from 'next/navigation'

// Preserve the legacy route without maintaining a second, divergent intake flow.
// Mission creation now has one authoritative entrypoint and one approval model.
export default function LaunchPadPage() {
  redirect('/new-mission')
}
