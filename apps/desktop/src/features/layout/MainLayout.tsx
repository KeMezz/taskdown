import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import type { Project } from '@taskdown/db';

interface MainLayoutProps {
  children: ReactNode;
  projects: Project[];
  onNewProject: () => void;
  isLoadingProjects?: boolean;
}

export function MainLayout({ children, projects, onNewProject, isLoadingProjects = false }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar projects={projects} onNewProject={onNewProject} isLoading={isLoadingProjects} />
      <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
    </div>
  );
}
