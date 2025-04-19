// src/components/ClientLayout.tsx
'use client';

import { AuthProvider } from '@/components/AuthProvider';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import { Session } from '@supabase/supabase-js';
import { ReactNode } from 'react';

type ClientLayoutProps = {
  session: Session | null;
  children: ReactNode;
};

export default function ClientLayout({ session, children }: ClientLayoutProps) {
  return (
    <AuthProvider initialSession={session}>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Header session={session} />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </AuthProvider>
  );
}