import FileSystem from '@/components/files/FileSystem'

export default function FilesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">My Files</h1>
        <p className="text-gray-400 mt-1">All your completed missions and deliverables.</p>
      </div>

      <FileSystem />
    </div>
  )
}
