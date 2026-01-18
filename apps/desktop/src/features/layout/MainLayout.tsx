import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Toolbar } from './Toolbar';

interface MainLayoutProps {
  children?: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden font-sans text-gray-900 selection:bg-indigo-100 selection:text-indigo-900">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        <Toolbar />
        <main className="flex-1 overflow-auto relative">
          <div className="h-full w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
