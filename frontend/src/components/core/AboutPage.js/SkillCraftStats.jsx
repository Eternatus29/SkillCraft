import React from 'react'

const stats = [
  { count: '0', label: 'Active Students' },
  { count: '0', label: 'Mentors' },
  { count: '0', label: 'Courses' },
  { count: '0', label: 'Awards' },
]

const SkillCraftStats = () => {
  return (
    <div className='bg-richblack-700' >
      <div className='w-11/12 mx-auto max-w-maxContent flex flex-col justify-between' >
        <div className='grid grid-cols-2 md:grid-cols-4 text-center' >
          {
            stats.map((stat, index) => (
              <div className='flex flex-col py-5 lg:py-10' key={index} >
                <h1 className='text-richblack-5 font-bold text-2xl lg:text-3xl ' >{stat.count}</h1>
                <h2 className='font-semibold text-base text-richblack-500' >{stat.label}</h2>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}

export default SkillCraftStats
