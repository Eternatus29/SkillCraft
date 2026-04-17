// The home page "/" is handled by app/page.tsx (root level).
// This file exists only because of the route group structure; it
// redirects to /courses so it never creates a circular loop if
// Next.js resolves it instead of the root page.tsx.
// TODO: delete this file before production build to avoid the
//       build-time route conflict warning.
import { redirect } from 'next/navigation'
export default function PublicGroupRoot() {
  redirect('/courses')
}
