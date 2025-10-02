//src/app/adminticket/page.jsx
import React from 'react';
import TicketsSection from '@/components/ticket/ticket'; // If using alias
import ProtectedRoute from '@/components/ProtectedRoute';

export default function page() {
  return (
    <div>
      <TicketsSection />
    </div>
  );
}
