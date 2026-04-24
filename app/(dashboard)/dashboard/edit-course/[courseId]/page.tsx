import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { connectDB } from '@/lib/db'
import Category from '@/models/Category'
import Course from '@/models/Course'
import EditCourseClient from '@/app/(dashboard)/dashboard/edit-course/[courseId]/EditCourseClient'

export const metadata: Metadata = { title: 'Edit Course' }

interface Props {
    params: Promise<{ courseId: string }>
}

async function getCategories() {
    await connectDB()
    const cats = await Category.find().lean()
    return JSON.parse(JSON.stringify(cats))
}

async function getCourse(courseId: string) {
    await connectDB()
    const course = await Course.findById(courseId).lean()
    return JSON.parse(JSON.stringify(course))
}

export default async function EditCoursePage({ params }: Props) {
    const session = await getSession()
    if (!session || (session.role !== 'Instructor' && session.role !== 'Admin')) redirect('/dashboard')

    const { courseId } = await params
    const [course, categories] = await Promise.all([getCourse(courseId), getCategories()])

    if (!course) notFound()
    if (course.instructor?.toString() !== session.id && session.role !== 'Admin') redirect('/dashboard/my-courses')

    return <EditCourseClient categories={categories} course={course} />
}
