/**
 * Database seed script — run with: npm run seed
 *
 * Creates:
 *  - 6 categories
 *  - 1 admin, 2 instructors, 3 students (all with profiles)
 *  - 4 courses with sections and lessons
 *  - Course enrollments
 *  - Course progress (partial completion for one student)
 *  - Reviews
 */

import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

// ── Models (import directly to avoid Next.js module resolution) ──────────────
const ProfileSchema = new mongoose.Schema({
  gender: String,
  dob: Date,
  about: String,
  contactNumber: String,
})

const UserSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: { type: String, unique: true },
    password: String,
    role: String,
    avatar: String,
    active: { type: Boolean, default: true },
    approved: { type: Boolean, default: true },
    profile: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    courseProgress: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CourseProgress' }],
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  },
  { timestamps: true }
)

const CategorySchema = new mongoose.Schema({
  name: { type: String, unique: true },
  description: String,
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
})

const SubSectionSchema = new mongoose.Schema({
  title: String,
  timeDuration: Number,
  description: String,
  videoUrl: String,
})

const SectionSchema = new mongoose.Schema({
  title: String,
  subSections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubSection' }],
})

const CourseSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    whatYouWillLearn: String,
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    price: Number,
    tags: [String],
    thumbnail: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    averageRating: { type: Number, default: 0 },
    numberOfEnrolledStudents: { type: Number, default: 0 },
    sections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Section' }],
    totalDuration: { type: Number, default: 0 },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
    studentsEnrolled: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    instructions: [String],
    status: { type: String, default: 'Published' },
  },
  { timestamps: true }
)

const ReviewSchema = new mongoose.Schema(
  {
    review: String,
    rating: Number,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  },
  { timestamps: true }
)

const CourseProgressSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  completedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubSection' }],
})

const Profile = mongoose.models.Profile || mongoose.model('Profile', ProfileSchema)
const User = mongoose.models.User || mongoose.model('User', UserSchema)
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema)
const SubSection = mongoose.models.SubSection || mongoose.model('SubSection', SubSectionSchema)
const Section = mongoose.models.Section || mongoose.model('Section', SectionSchema)
const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema)
const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema)
const CourseProgress = mongoose.models.CourseProgress || mongoose.model('CourseProgress', CourseProgressSchema)

// ── Helpers ──────────────────────────────────────────────────────────────────
const avatar = (name: string, bg = '7c3aed') =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=fff&bold=true`

// Public domain sample video URLs (Google Cloud Storage)
const VIDEOS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
]
const vid = (i: number) => VIDEOS[i % VIDEOS.length]

async function makeSection(title: string, lessons: { title: string; desc: string; dur: number; vidIdx: number }[]) {
  const subs = await SubSection.insertMany(
    lessons.map((l) => ({
      title: l.title,
      description: l.desc,
      timeDuration: l.dur,
      videoUrl: vid(l.vidIdx),
    }))
  )
  const section = await Section.create({ title, subSections: subs.map((s) => s._id) })
  return { section, subs, totalDur: lessons.reduce((s, l) => s + l.dur, 0) }
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function seed() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI not set in .env')

  console.log('🔌 Connecting to MongoDB…')
  await mongoose.connect(uri, { bufferCommands: false })
  console.log('✅ Connected\n')

  // ── Wipe existing seed data ──
  console.log('🗑  Clearing existing data…')
  await Promise.all([
    Profile.deleteMany({}),
    User.deleteMany({}),
    Category.deleteMany({}),
    SubSection.deleteMany({}),
    Section.deleteMany({}),
    Course.deleteMany({}),
    Review.deleteMany({}),
    CourseProgress.deleteMany({}),
  ])
  console.log('✅ Cleared\n')

  // ── 1. Categories ──
  console.log('📁 Seeding categories…')
  const cats = await Category.insertMany([
    { name: 'Web Development', description: 'HTML, CSS, JavaScript, React, Next.js and more' },
    { name: 'Data Science', description: 'Python, ML, data analysis, visualization' },
    { name: 'Mobile Development', description: 'iOS, Android, React Native, Flutter' },
    { name: 'UI/UX Design', description: 'Figma, design systems, user research' },
    { name: 'Cybersecurity', description: 'Ethical hacking, penetration testing, OWASP' },
    { name: 'Cloud Computing', description: 'AWS, GCP, Azure, DevOps, Docker, Kubernetes' },
  ])
  const catMap = Object.fromEntries(cats.map((c) => [c.name, c._id]))
  console.log(`   Created ${cats.length} categories`)

  // ── 2. Users ──
  console.log('\n👤 Seeding users…')
  const hash = (pw: string) => bcrypt.hash(pw, 10)

  // Admin
  const adminProfile = await Profile.create({ about: 'Platform administrator' })
  const admin = await User.create({
    firstName: 'Admin',
    lastName: 'SkillCraft',
    email: 'admin@skillcraft.dev',
    password: await hash('Admin@123'),
    role: 'Admin',
    avatar: avatar('Admin SkillCraft', '1e1b4b'),
    profile: adminProfile._id,
  })

  // Instructors
  const [instrProfileA, instrProfileB] = await Profile.insertMany([
    { gender: 'Male', about: 'Senior full-stack developer with 8 years of experience. Loves teaching JavaScript and React.', contactNumber: '9876543210' },
    { gender: 'Female', about: 'Data scientist and ML engineer. Passionate about making complex topics accessible.', contactNumber: '9123456780' },
  ])

  const [instrA, instrB] = await User.insertMany([
    {
      firstName: 'Arjun',
      lastName: 'Sharma',
      email: 'arjun@skillcraft.dev',
      password: await hash('Instructor@123'),
      role: 'Instructor',
      avatar: avatar('Arjun Sharma', '4f46e5'),
      profile: instrProfileA._id,
    },
    {
      firstName: 'Priya',
      lastName: 'Nair',
      email: 'priya@skillcraft.dev',
      password: await hash('Instructor@123'),
      role: 'Instructor',
      avatar: avatar('Priya Nair', '0891b2'),
      profile: instrProfileB._id,
    },
  ])

  // Students
  const [stuProfileA, stuProfileB, stuProfileC] = await Profile.insertMany([
    { gender: 'Male', dob: new Date('1999-06-15'), about: 'Aspiring full-stack developer', contactNumber: '9000111222' },
    { gender: 'Female', dob: new Date('2001-03-22'), about: 'Learning data science and ML', contactNumber: '9000333444' },
    { gender: 'Male', dob: new Date('1998-11-08'), about: 'Frontend developer transitioning to full-stack', contactNumber: '9000555666' },
  ])

  const [stuA, stuB, stuC] = await User.insertMany([
    {
      firstName: 'Rahul',
      lastName: 'Das',
      email: 'rahul@skillcraft.dev',
      password: await hash('Student@123'),
      role: 'Student',
      avatar: avatar('Rahul Das', '059669'),
      profile: stuProfileA._id,
    },
    {
      firstName: 'Ananya',
      lastName: 'Bose',
      email: 'ananya@skillcraft.dev',
      password: await hash('Student@123'),
      role: 'Student',
      avatar: avatar('Ananya Bose', 'dc2626'),
      profile: stuProfileB._id,
    },
    {
      firstName: 'Vikram',
      lastName: 'Patel',
      email: 'vikram@skillcraft.dev',
      password: await hash('Student@123'),
      role: 'Student',
      avatar: avatar('Vikram Patel', 'd97706'),
      profile: stuProfileC._id,
    },
  ])
  console.log('   Created 1 admin, 2 instructors, 3 students')

  // ── 3. Courses ──
  console.log('\n📚 Seeding courses…')

  // Course 1 — Complete JavaScript Mastery (Arjun, Web Dev)
  const { section: s1a, subs: ss1a, totalDur: td1a } = await makeSection('JavaScript Fundamentals', [
    { title: 'Introduction & Setup', desc: 'Set up your dev environment and write your first JS program.', dur: 540, vidIdx: 0 },
    { title: 'Variables, Data Types & Operators', desc: 'Learn var, let, const, and all primitive types.', dur: 780, vidIdx: 1 },
    { title: 'Control Flow: if, loops, switch', desc: 'Master conditional logic and iteration patterns.', dur: 900, vidIdx: 2 },
    { title: 'Functions & Scope', desc: 'Function declarations, expressions, arrow functions, closures.', dur: 1020, vidIdx: 3 },
  ])
  const { section: s1b, subs: ss1b, totalDur: td1b } = await makeSection('DOM & Browser APIs', [
    { title: 'Selecting & Manipulating the DOM', desc: 'querySelector, innerHTML, classList, and events.', dur: 840, vidIdx: 4 },
    { title: 'Event Handling Deep Dive', desc: 'Bubbling, capturing, delegation, and custom events.', dur: 960, vidIdx: 0 },
    { title: 'Fetch API & JSON', desc: 'Make HTTP requests, handle responses, parse JSON.', dur: 720, vidIdx: 1 },
  ])
  const { section: s1c, subs: ss1c, totalDur: td1c } = await makeSection('Asynchronous JavaScript', [
    { title: 'Callbacks & Callback Hell', desc: 'Understand the problem async programming solves.', dur: 600, vidIdx: 2 },
    { title: 'Promises from Scratch', desc: 'Create, chain, and handle errors in promises.', dur: 900, vidIdx: 3 },
    { title: 'Async/Await Pattern', desc: 'Modern async syntax with try/catch error handling.', dur: 780, vidIdx: 4 },
    { title: 'Real Project: Weather App', desc: 'Build a weather app using the OpenWeather API.', dur: 1800, vidIdx: 0 },
  ])
  const course1 = await Course.create({
    title: 'Complete JavaScript Mastery',
    description: 'Go from absolute beginner to confident JavaScript developer. Covers ES6+, DOM, async programming, and a real-world project.',
    whatYouWillLearn: 'Write clean modern JavaScript\nUnderstand the event loop and async patterns\nBuild interactive web applications\nWork confidently with APIs and JSON\nDebug and optimise JS code',
    instructor: instrA._id,
    price: 999,
    tags: ['javascript', 'web development', 'es6', 'dom', 'async'],
    thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=640&h=360&fit=crop',
    category: catMap['Web Development'],
    sections: [s1a._id, s1b._id, s1c._id],
    totalDuration: td1a + td1b + td1c,
    instructions: ['Basic computer skills', 'A modern web browser (Chrome/Firefox)', 'No prior programming experience needed'],
    status: 'Published',
    studentsEnrolled: [stuA._id, stuC._id],
    numberOfEnrolledStudents: 2,
  })
  await Category.findByIdAndUpdate(catMap['Web Development'], { $push: { courses: course1._id } })

  // Course 2 — React & Next.js Bootcamp (Arjun, Web Dev)
  const { section: s2a, subs: ss2a, totalDur: td2a } = await makeSection('React Foundations', [
    { title: 'Why React? Virtual DOM & JSX', desc: 'Understand what React solves and how JSX works.', dur: 720, vidIdx: 1 },
    { title: 'Components & Props', desc: 'Build reusable UI components and pass data via props.', dur: 840, vidIdx: 2 },
    { title: 'useState & Event Handling', desc: 'Manage local component state and handle user interactions.', dur: 960, vidIdx: 3 },
    { title: 'useEffect & Data Fetching', desc: 'Side effects, lifecycle equivalents, and fetching from APIs.', dur: 1080, vidIdx: 4 },
  ])
  const { section: s2b, subs: ss2b, totalDur: td2b } = await makeSection('Next.js App Router', [
    { title: 'App Router vs Pages Router', desc: 'Understand the new App Router paradigm.', dur: 660, vidIdx: 0 },
    { title: 'Server & Client Components', desc: 'When to use each and how they interact.', dur: 900, vidIdx: 1 },
    { title: 'Layouts, Loading & Error UI', desc: 'Build nested layouts and handle loading/error states.', dur: 780, vidIdx: 2 },
    { title: 'Server Actions & Data Mutations', desc: 'Mutate data from the server without a separate API.', dur: 1020, vidIdx: 3 },
  ])
  const { section: s2c, subs: ss2c, totalDur: td2c } = await makeSection('Full-Stack Project', [
    { title: 'Project Overview & Setup', desc: 'Plan and scaffold a full-stack Next.js application.', dur: 480, vidIdx: 4 },
    { title: 'Authentication with Cookies', desc: 'Implement JWT session management.', dur: 1200, vidIdx: 0 },
    { title: 'Database Integration (MongoDB)', desc: 'Connect Mongoose and create data models.', dur: 900, vidIdx: 1 },
    { title: 'Deployment to Vercel', desc: 'Deploy your app and set up environment variables.', dur: 600, vidIdx: 2 },
  ])
  const course2 = await Course.create({
    title: 'React & Next.js Bootcamp',
    description: 'Master React 19 and Next.js 16 App Router. Build production-ready full-stack applications with Server Components, Server Actions, and MongoDB.',
    whatYouWillLearn: 'Build full-stack apps with Next.js App Router\nMaster Server vs Client Components\nImplement authentication with cookies\nIntegrate MongoDB with Mongoose\nDeploy to Vercel',
    instructor: instrA._id,
    price: 1499,
    tags: ['react', 'next.js', 'full-stack', 'typescript', 'mongodb'],
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=640&h=360&fit=crop',
    category: catMap['Web Development'],
    sections: [s2a._id, s2b._id, s2c._id],
    totalDuration: td2a + td2b + td2c,
    instructions: ['Solid JavaScript fundamentals (ES6+)', 'Basic HTML & CSS', 'Command line basics'],
    status: 'Published',
    studentsEnrolled: [stuB._id],
    numberOfEnrolledStudents: 1,
  })
  await Category.findByIdAndUpdate(catMap['Web Development'], { $push: { courses: course2._id } })

  // Course 3 — Python for Data Science (Priya, Data Science)
  const { section: s3a, subs: ss3a, totalDur: td3a } = await makeSection('Python Essentials', [
    { title: 'Python Setup & First Script', desc: 'Install Python, set up VS Code, write hello world.', dur: 480, vidIdx: 3 },
    { title: 'Data Types, Lists & Dicts', desc: 'Core Python data structures explained clearly.', dur: 720, vidIdx: 4 },
    { title: 'Functions & Modules', desc: 'Write reusable code and import standard library modules.', dur: 660, vidIdx: 0 },
    { title: 'File I/O & Exception Handling', desc: 'Read/write files and handle errors gracefully.', dur: 600, vidIdx: 1 },
  ])
  const { section: s3b, subs: ss3b, totalDur: td3b } = await makeSection('NumPy & Pandas', [
    { title: 'NumPy Arrays & Operations', desc: 'Vectorised computation with n-dimensional arrays.', dur: 900, vidIdx: 2 },
    { title: 'Pandas DataFrames', desc: 'Load, clean, and explore tabular data.', dur: 1080, vidIdx: 3 },
    { title: 'Data Cleaning Techniques', desc: 'Handle missing values, duplicates, and type conversions.', dur: 840, vidIdx: 4 },
    { title: 'GroupBy & Aggregations', desc: 'Summarise data with groupby, pivot tables, and merge.', dur: 960, vidIdx: 0 },
  ])
  const { section: s3c, subs: ss3c, totalDur: td3c } = await makeSection('Data Visualisation & ML Intro', [
    { title: 'Matplotlib & Seaborn', desc: 'Create publication-quality charts and graphs.', dur: 780, vidIdx: 1 },
    { title: 'Intro to Scikit-learn', desc: 'Train your first ML model with linear regression.', dur: 1200, vidIdx: 2 },
    { title: 'Capstone: Sales Analysis', desc: 'End-to-end data analysis project with real dataset.', dur: 2100, vidIdx: 3 },
  ])
  const course3 = await Course.create({
    title: 'Python for Data Science',
    description: 'Learn Python from scratch and apply it to real-world data analysis. Covers NumPy, Pandas, Matplotlib, and an intro to machine learning with Scikit-learn.',
    whatYouWillLearn: 'Write Python programs with confidence\nManipulate data with NumPy and Pandas\nClean and transform messy datasets\nCreate insightful visualisations\nBuild and evaluate ML models',
    instructor: instrB._id,
    price: 1299,
    tags: ['python', 'data science', 'pandas', 'numpy', 'machine learning'],
    thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=640&h=360&fit=crop',
    category: catMap['Data Science'],
    sections: [s3a._id, s3b._id, s3c._id],
    totalDuration: td3a + td3b + td3c,
    instructions: ['No programming experience required', 'Basic maths (GCSE / 10th grade level)', 'A laptop or desktop computer'],
    status: 'Published',
    studentsEnrolled: [stuA._id, stuB._id],
    numberOfEnrolledStudents: 2,
  })
  await Category.findByIdAndUpdate(catMap['Data Science'], { $push: { courses: course3._id } })

  // Course 4 — UI/UX Design Fundamentals (Priya, Design) — FREE course
  const { section: s4a, subs: ss4a, totalDur: td4a } = await makeSection('Design Thinking', [
    { title: 'What is UX Design?', desc: 'Overview of the UX design process and career paths.', dur: 600, vidIdx: 4 },
    { title: 'User Research Methods', desc: 'Interviews, surveys, personas, and empathy maps.', dur: 900, vidIdx: 0 },
    { title: 'Defining the Problem', desc: 'How to frame problems with How Might We statements.', dur: 540, vidIdx: 1 },
  ])
  const { section: s4b, subs: ss4b, totalDur: td4b } = await makeSection('Visual Design Principles', [
    { title: 'Typography & Colour Theory', desc: 'Choose fonts and colours that communicate meaning.', dur: 780, vidIdx: 2 },
    { title: 'Layout, Grids & Spacing', desc: 'Design systems, 8pt grid, and white space.', dur: 720, vidIdx: 3 },
    { title: 'Figma Essentials', desc: 'Frames, components, auto-layout, and prototyping.', dur: 1200, vidIdx: 4 },
  ])
  const { section: s4c, subs: ss4c, totalDur: td4c } = await makeSection('Prototyping & Handoff', [
    { title: 'Wireframes to High-Fidelity', desc: 'Progress from sketches to polished designs.', dur: 960, vidIdx: 0 },
    { title: 'Interactive Prototypes in Figma', desc: 'Add transitions, overlays, and smart animate.', dur: 840, vidIdx: 1 },
    { title: 'Developer Handoff & Specs', desc: 'Prepare assets and specs for engineering.', dur: 600, vidIdx: 2 },
  ])
  const course4 = await Course.create({
    title: 'UI/UX Design Fundamentals',
    description: 'A beginner-friendly introduction to UI/UX design. Learn the design thinking process, visual design principles, and Figma — all in one free course.',
    whatYouWillLearn: 'Apply design thinking to solve real problems\nConduct user research and create personas\nUse typography, colour, and layout effectively\nDesign wireframes and hi-fi mockups in Figma\nPrototype and hand off designs to developers',
    instructor: instrB._id,
    price: 0,
    tags: ['ui/ux', 'design', 'figma', 'prototyping', 'user research'],
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=640&h=360&fit=crop',
    category: catMap['UI/UX Design'],
    sections: [s4a._id, s4b._id, s4c._id],
    totalDuration: td4a + td4b + td4c,
    instructions: ['No design experience required', 'Download Figma (free) before starting'],
    status: 'Published',
    studentsEnrolled: [stuC._id],
    numberOfEnrolledStudents: 1,
  })
  await Category.findByIdAndUpdate(catMap['UI/UX Design'], { $push: { courses: course4._id } })

  console.log('   Created 4 courses with sections and lessons')

  // ── 4. Update instructors' course lists ──
  await User.findByIdAndUpdate(instrA._id, { courses: [course1._id, course2._id] })
  await User.findByIdAndUpdate(instrB._id, { courses: [course3._id, course4._id] })

  // ── 5. Update students' course lists ──
  // Rahul → JS Mastery + Python
  await User.findByIdAndUpdate(stuA._id, { courses: [course1._id, course3._id] })
  // Ananya → React + Python
  await User.findByIdAndUpdate(stuB._id, { courses: [course2._id, course3._id] })
  // Vikram → JS Mastery + Design (free)
  await User.findByIdAndUpdate(stuC._id, { courses: [course1._id, course4._id] })

  // ── 6. Course progress ──
  console.log('\n📈 Seeding course progress…')

  // Rahul has completed half of JS Mastery (first 2 sections fully)
  const rahulJsProgress = await CourseProgress.create({
    courseId: course1._id,
    userId: stuA._id,
    completedVideos: [...ss1a.map((s) => s._id), ...ss1b.map((s) => s._id)],
  })
  await User.findByIdAndUpdate(stuA._id, { $push: { courseProgress: rahulJsProgress._id } })

  // Rahul has just started Python (only first lesson done)
  const rahulPyProgress = await CourseProgress.create({
    courseId: course3._id,
    userId: stuA._id,
    completedVideos: [ss3a[0]._id],
  })
  await User.findByIdAndUpdate(stuA._id, { $push: { courseProgress: rahulPyProgress._id } })

  // Ananya has completed React course fully
  const allCourse2Subs = [...ss2a, ...ss2b, ...ss2c]
  const ananyaReactProgress = await CourseProgress.create({
    courseId: course2._id,
    userId: stuB._id,
    completedVideos: allCourse2Subs.map((s) => s._id),
  })
  await User.findByIdAndUpdate(stuB._id, { $push: { courseProgress: ananyaReactProgress._id } })

  // Vikram just started JS Mastery (first lesson done)
  const vikramProgress = await CourseProgress.create({
    courseId: course1._id,
    userId: stuC._id,
    completedVideos: [ss1a[0]._id],
  })
  await User.findByIdAndUpdate(stuC._id, { $push: { courseProgress: vikramProgress._id } })

  console.log('   Created progress records for 3 students')

  // ── 7. Reviews ──
  console.log('\n⭐ Seeding reviews…')

  const r1 = await Review.create({
    review: 'Absolutely fantastic course! Arjun explains complex concepts so clearly. The async/await section alone is worth the price. Already building my own projects.',
    rating: 5,
    user: stuA._id,
    course: course1._id,
  })
  const r2 = await Review.create({
    review: "Best JS course I've taken. The progression from fundamentals to async programming is perfectly paced. Highly recommend for beginners.",
    rating: 5,
    user: stuC._id,
    course: course1._id,
  })
  const r3 = await Review.create({
    review: 'Great introduction to Next.js App Router! The Server Actions section is eye-opening. Would love more content on deployment and CI/CD.',
    rating: 4,
    user: stuB._id,
    course: course2._id,
  })
  const r4 = await Review.create({
    review: 'Priya is an excellent instructor. The Pandas section saved me hours of googling. The capstone project is very practical.',
    rating: 5,
    user: stuA._id,
    course: course3._id,
  })
  const r5 = await Review.create({
    review: 'Great course for a data science beginner. The visualisation section could go deeper but overall really solid for the price.',
    rating: 4,
    user: stuB._id,
    course: course3._id,
  })

  // Attach reviews to courses and update averages
  await Course.findByIdAndUpdate(course1._id, {
    reviews: [r1._id, r2._id],
    averageRating: 5.0,
  })
  await Course.findByIdAndUpdate(course2._id, {
    reviews: [r3._id],
    averageRating: 4.0,
  })
  await Course.findByIdAndUpdate(course3._id, {
    reviews: [r4._id, r5._id],
    averageRating: 4.5,
  })

  // Attach reviews to users
  await User.findByIdAndUpdate(stuA._id, { reviews: [r1._id, r4._id] })
  await User.findByIdAndUpdate(stuB._id, { reviews: [r3._id, r5._id] })
  await User.findByIdAndUpdate(stuC._id, { reviews: [r2._id] })

  console.log('   Created 5 reviews across 3 courses')

  // ── Summary ──
  console.log('\n' + '─'.repeat(52))
  console.log('🌱 Seed complete! Login credentials:\n')
  console.log('  Role        Email                      Password')
  console.log('  ─────────── ─────────────────────────  ────────────')
  console.log('  Admin       admin@skillcraft.dev        Admin@123')
  console.log('  Instructor  arjun@skillcraft.dev        Instructor@123')
  console.log('  Instructor  priya@skillcraft.dev        Instructor@123')
  console.log('  Student     rahul@skillcraft.dev        Student@123')
  console.log('  Student     ananya@skillcraft.dev       Student@123')
  console.log('  Student     vikram@skillcraft.dev       Student@123')
  console.log('─'.repeat(52))

  await mongoose.disconnect()
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
