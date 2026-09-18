import {redirect} from 'next/navigation'

export default async function MissionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/new-mission?mission=${encodeURIComponent(id)}`)
}
