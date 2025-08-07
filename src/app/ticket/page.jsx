import TicketsSection from '@/components/ticket/ticket'
import React from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'

const page = () => {
  return (
 <ProtectedRoute>
    <div>
      <TicketsSection/>
    </div>
    </ProtectedRoute>
  )
}

export default page
