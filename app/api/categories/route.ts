import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Category from '@/models/Category'
import { getSession } from '@/lib/session'

export async function GET() {
  try {
    await connectDB()
    const categories = await Category.find().lean()
    return NextResponse.json({ success: true, data: categories })
  } catch {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'Admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 })
    }

    const { name, description } = await req.json()
    if (!name) return NextResponse.json({ success: false, message: 'Name is required' }, { status: 400 })

    await connectDB()
    const category = await Category.create({ name, description })
    return NextResponse.json({ success: true, data: category }, { status: 201 })
  } catch (error: any) {
    if (error.code === 11000) return NextResponse.json({ success: false, message: 'Category already exists' }, { status: 409 })
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
