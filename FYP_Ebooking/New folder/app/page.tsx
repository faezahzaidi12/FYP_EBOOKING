import { redirect } from 'next/navigation'

export default function Page() {
  // The booking engine is a standalone vanilla HTML/CSS/JS file served from /public.
  redirect('/booking.html')
}
