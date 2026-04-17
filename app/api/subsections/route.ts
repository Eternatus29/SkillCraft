import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Section from '@/models/Section'
import SubSection from '@/models/SubSection'
import { getSession } from '@/lib/session'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'Instructor') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 })
    }

    const fd = await req.formData()
    const title = fd.get('title') as string
    const description = fd.get('description') as string ?? ''
    const sectionId = fd.get('sectionId') as string
    const videoFile = fd.get('video') as File | null

    if (!title || !sectionId) return NextResponse.json({ success: false, message: 'Title and sectionId required' }, { status: 400 })

    let videoUrl = ''
    if (videoFile && videoFile.size > 0) {
      // In production: upload to Cloudinary
      videoUrl = '' // placeholder
    }

    await connectDB()
    const subSection = await SubSection.create({ title, description, videoUrl, timeDuration: 0 })
    await Section.findByIdAndUpdate(sectionId, { $push: { subSections: subSection._id } })

    return NextResponse.json({ success: true, data: subSection }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'Instructor') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 })
    }

    const { subSectionId, title, description } = await req.json()
    if (!subSectionId) return NextResponse.json({ success: false, message: 'subSectionId required' }, { status: 400 })

    await connectDB()
    const sub = await SubSection.findByIdAndUpdate(subSectionId, { title, description }, { new: true })
    return NextResponse.json({ success: true, data: sub })
  } catch {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'Instructor') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 })
    }

    const { subSectionId, sectionId } = await req.json()
    await connectDB()

    await SubSection.findByIdAndDelete(subSectionId)
    await Section.findByIdAndUpdate(sectionId, { $pull: { subSections: subSectionId } })

    return NextResponse.json({ success: true, message: 'Lesson deleted' })
  } catch {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
