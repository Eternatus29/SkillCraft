import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { connectDB } from '@/lib/db'
import Category from '@/models/Category'
import AddCourseClient from './AddCourseClient'

export const metadata: Metadata = { title: 'Add Course' }

async function getCategories() {
  await connectDB()
  const cats = await Category.find().lean()
  return JSON.parse(JSON.stringify(cats))
}

export default async function AddCoursePage() {
  const session = await getSession()
  if (!session || session.role !== 'Instructor') redirect('/dashboard')
  const categories = await getCategories()
  return <AddCourseClient categories={categories} />
}
