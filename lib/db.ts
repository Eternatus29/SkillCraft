import mongoose from 'mongoose'
import '@/models/register'

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not defined')
}

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache
}

const cache: MongooseCache = global.mongooseCache ?? { conn: null, promise: null }
global.mongooseCache = cache

export async function connectDB() {
  if (cache.conn) return cache.conn

  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false })
  }

  cache.conn = await cache.promise
  return cache.conn
}
