// src/app/page.jsx
import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to /admin for login page
  redirect('/admin');
}
