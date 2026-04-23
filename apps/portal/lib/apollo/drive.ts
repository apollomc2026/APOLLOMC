import { google } from 'googleapis'
import { Readable } from 'node:stream'

export interface DriveUploadArgs {
  subfolderName: string
  docxBuffer: Buffer
  docxFilename: string
  submissionJson: Record<string, unknown>
}

export interface DriveUploadResult {
  folder_id: string
  file_id: string
  file_url: string
}

function getDriveClient() {
  const raw = process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON
  if (!raw) throw new Error('GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON is not set')
  let credentials: Record<string, unknown>
  try {
    credentials = JSON.parse(raw)
  } catch (err) {
    throw new Error(
      `GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON is not valid JSON: ${(err as Error).message}`
    )
  }
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  })
  return google.drive({ version: 'v3', auth })
}

function bufferToStream(buffer: Buffer): Readable {
  return Readable.from(buffer)
}

export async function uploadToDrive(args: DriveUploadArgs): Promise<DriveUploadResult> {
  const parentFolderId = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID
  if (!parentFolderId) throw new Error('GOOGLE_DRIVE_PARENT_FOLDER_ID is not set')

  const drive = getDriveClient()

  const folderRes = await drive.files.create({
    requestBody: {
      name: args.subfolderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentFolderId],
    },
    fields: 'id, webViewLink',
    supportsAllDrives: true,
  })
  const folderId = folderRes.data.id
  if (!folderId) throw new Error('Drive did not return a folder id')

  const docxRes = await drive.files.create({
    requestBody: {
      name: args.docxFilename,
      parents: [folderId],
    },
    media: {
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      body: bufferToStream(args.docxBuffer),
    },
    fields: 'id, webViewLink',
    supportsAllDrives: true,
  })
  const fileId = docxRes.data.id
  const fileUrl = docxRes.data.webViewLink
  if (!fileId || !fileUrl) throw new Error('Drive did not return a file id or url')

  const jsonBuffer = Buffer.from(JSON.stringify(args.submissionJson, null, 2), 'utf8')
  await drive.files.create({
    requestBody: {
      name: 'submission.json',
      parents: [folderId],
    },
    media: {
      mimeType: 'application/json',
      body: bufferToStream(jsonBuffer),
    },
    fields: 'id',
    supportsAllDrives: true,
  })

  return {
    folder_id: folderId,
    file_id: fileId,
    file_url: fileUrl,
  }
}
