import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

const ses = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const FROM = process.env.SES_FROM_ADDRESS || 'missions@apollomc.ai'

interface EmailParams {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: EmailParams) {
  await ses.send(
    new SendEmailCommand({
      Source: FROM,
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject },
        Body: {
          Html: { Data: html },
          ...(text ? { Text: { Data: text } } : {}),
        },
      },
    })
  )
}

export function welcomeEmail(name: string) {
  return {
    subject: 'Welcome to Apollo MC',
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a1a2e;">Welcome to Apollo MC</h1>
        <p>Hi ${name || 'there'},</p>
        <p>Your account is ready. Apollo MC creates professional documents powered by AI — legal memos, business plans, pitch decks, and more.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; padding: 12px 24px; background: #e94560; color: white; text-decoration: none; border-radius: 6px;">Go to Dashboard</a></p>
        <p style="color: #666; font-size: 14px;">— Apollo MC by On Spot Solutions</p>
      </div>
    `,
  }
}

export function briefReadyEmail(deliverableName: string, missionId: string) {
  return {
    subject: `Your ${deliverableName} mission brief is ready for approval`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a1a2e;">Mission Brief Ready</h1>
        <p>Your <strong>${deliverableName}</strong> mission brief has been assembled and is ready for your review and approval.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/new-mission/brief?mission=${missionId}" style="display: inline-block; padding: 12px 24px; background: #e94560; color: white; text-decoration: none; border-radius: 6px;">Review Mission Brief</a></p>
        <p style="color: #666; font-size: 14px;">No build will start until you approve the brief.</p>
      </div>
    `,
  }
}

export function buildStartedEmail(deliverableName: string, missionId: string) {
  return {
    subject: `Building your ${deliverableName}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a1a2e;">Build Started</h1>
        <p>Your <strong>${deliverableName}</strong> is now being built. You can track progress in real time on your mission board.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/mission/${missionId}" style="display: inline-block; padding: 12px 24px; background: #e94560; color: white; text-decoration: none; border-radius: 6px;">View Progress</a></p>
      </div>
    `,
  }
}

export function reviewReadyEmail(deliverableName: string, missionId: string) {
  return {
    subject: `Your ${deliverableName} is ready for review`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a1a2e;">Ready for Review</h1>
        <p>Your <strong>${deliverableName}</strong> build is complete! Review the preview, make any edits, then approve for download.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/review/${missionId}" style="display: inline-block; padding: 12px 24px; background: #e94560; color: white; text-decoration: none; border-radius: 6px;">Review Deliverable</a></p>
      </div>
    `,
  }
}

export function deliveryEmail(deliverableName: string, downloadUrl: string) {
  return {
    subject: `Your ${deliverableName} is ready for download`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a1a2e;">Download Ready</h1>
        <p>Payment confirmed! Your <strong>${deliverableName}</strong> is ready for download.</p>
        <p><a href="${downloadUrl}" style="display: inline-block; padding: 12px 24px; background: #e94560; color: white; text-decoration: none; border-radius: 6px;">Download Now</a></p>
        <p style="color: #666; font-size: 14px;">This link expires in 15 minutes. You can always re-download from your Files page.</p>
      </div>
    `,
  }
}

export function rebuildCompleteEmail(deliverableName: string, sectionName: string, missionId: string) {
  return {
    subject: `Section rebuild complete: ${sectionName}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a1a2e;">Rebuild Complete</h1>
        <p>The <strong>${sectionName}</strong> section of your ${deliverableName} has been rebuilt.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/review/${missionId}" style="display: inline-block; padding: 12px 24px; background: #e94560; color: white; text-decoration: none; border-radius: 6px;">Review Updated Deliverable</a></p>
      </div>
    `,
  }
}

export function failedEmail(deliverableName: string, missionId: string) {
  return {
    subject: `Issue with your ${deliverableName} build`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a1a2e;">Build Issue</h1>
        <p>We encountered an issue building your <strong>${deliverableName}</strong>. Our team has been notified and will investigate.</p>
        <p>Mission ID: ${missionId}</p>
        <p style="color: #666; font-size: 14px;">If you need immediate assistance, contact support@apollomc.ai</p>
      </div>
    `,
  }
}
