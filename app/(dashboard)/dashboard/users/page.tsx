import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { connectDB } from '@/lib/db'
import User from '@/models/User'

export const metadata: Metadata = { title: 'Manage Users' }

async function getUsers() {
    await connectDB()
    const users = await User.find()
        .select('firstName lastName email role active approved createdAt')
        .sort({ createdAt: -1 })
        .lean()
    return JSON.parse(JSON.stringify(users))
}

function roleBadge(role: string) {
    if (role === 'Admin') return 'bg-rose-100 text-rose-700'
    if (role === 'Instructor') return 'bg-blue-100 text-blue-700'
    return 'bg-emerald-100 text-emerald-700'
}

export default async function UsersPage() {
    const session = await getSession()
    if (!session) redirect('/login?redirect=/dashboard/users')
    if (session.role !== 'Admin') redirect('/dashboard')

    const users = await getUsers()

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                <p className="text-sm text-gray-500 mt-1">Manage platform users and roles.</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-600">
                            <tr>
                                <th className="text-left font-semibold px-4 py-3">Name</th>
                                <th className="text-left font-semibold px-4 py-3">Email</th>
                                <th className="text-left font-semibold px-4 py-3">Role</th>
                                <th className="text-left font-semibold px-4 py-3">Status</th>
                                <th className="text-left font-semibold px-4 py-3">Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No users found.</td>
                                </tr>
                            ) : (
                                users.map((u: any) => (
                                    <tr key={u._id} className="border-b border-gray-100 last:border-0">
                                        <td className="px-4 py-3 text-gray-900 font-medium">{u.firstName} {u.lastName}</td>
                                        <td className="px-4 py-3 text-gray-600">{u.email}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${roleBadge(u.role)}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${u.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {u.active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{new Date(u.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
