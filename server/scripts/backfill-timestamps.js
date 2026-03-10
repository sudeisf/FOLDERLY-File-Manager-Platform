require('dotenv').config()
const { MongoClient } = require('mongodb')

async function run() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    throw new Error('DATABASE_URL is not set')
  }

  const client = new MongoClient(dbUrl)
  await client.connect()

  const dbName = (new URL(dbUrl)).pathname.replace(/^\//, '').split('?')[0] || 'FileUploader'
  const db = client.db(dbName)
  const now = new Date()

  const pipeline = [
    {
      $set: {
        createdAt: { $ifNull: ['$createdAt', now] },
        updatedAt: { $ifNull: ['$updatedAt', '$createdAt', now] },
      },
    },
  ]

  const folderRes = await db.collection('Folder').updateMany(
    {
      $or: [
        { createdAt: { $exists: false } },
        { createdAt: null },
        { updatedAt: { $exists: false } },
        { updatedAt: null },
      ],
    },
    pipeline
  )

  const fileRes = await db.collection('File').updateMany(
    {
      $or: [
        { createdAt: { $exists: false } },
        { createdAt: null },
        { updatedAt: { $exists: false } },
        { updatedAt: null },
      ],
    },
    pipeline
  )

  const notificationRes = await db.collection('Notification').updateMany(
    {
      $or: [
        { createdAt: { $exists: false } },
        { createdAt: null },
        { updatedAt: { $exists: false } },
        { updatedAt: null },
      ],
    },
    pipeline
  )

  console.log('Folder backfill matched:', folderRes.matchedCount, 'modified:', folderRes.modifiedCount)
  console.log('File backfill matched:', fileRes.matchedCount, 'modified:', fileRes.modifiedCount)
  console.log('Notification backfill matched:', notificationRes.matchedCount, 'modified:', notificationRes.modifiedCount)

  await client.close()
}

run().catch((error) => {
  console.error('Backfill failed:', error.message)
  process.exit(1)
})
