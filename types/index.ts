export type Role = 'Student' | 'Instructor' | 'Admin'

export interface SessionUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: Role
  avatar?: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
}

export interface CourseCardData {
  _id: string
  title: string
  description: string
  thumbnail: string
  price: number
  averageRating: number
  numberOfEnrolledStudents: number
  instructor: { firstName: string; lastName: string; avatar?: string }
  category: { name: string }
  tags: string[]
  totalDuration: number
  status: 'Draft' | 'Published'
}

export interface SectionData {
  _id: string
  title: string
  subSections: SubSectionData[]
}

export interface SubSectionData {
  _id: string
  title: string
  timeDuration: number
  description?: string
  videoUrl: string
}

export interface CourseDetailData extends CourseCardData {
  whatYouWillLearn: string
  instructions: string[]
  sections: SectionData[]
  reviews: ReviewData[]
  studentsEnrolled: string[]
}

export interface ReviewData {
  _id: string
  review: string
  rating: number
  user: { firstName: string; lastName: string; avatar?: string }
  createdAt: string
}

export interface UserData {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: Role
  avatar?: string
  active: boolean
  approved: boolean
  profile?: ProfileData
  courses: string[]
}

export interface ProfileData {
  gender?: string
  dob?: string
  about?: string
  contactNumber?: string
}

export interface CartItem {
  _id: string
  title: string
  thumbnail: string
  price: number
  instructor: { firstName: string; lastName: string }
  category: { name: string }
}
