import { useSidebarStore } from '../../stores/sidebarStore';
import { useProjects } from '../projects/useProjects';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  shortcut?: string;
}

function SidebarItem({ icon, label, isActive, onClick }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 group ${
        isActive
          ? 'bg-indigo-50 text-indigo-600'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <span className={isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'}>
        {icon}
      </span>
      {label}
    </button>
  );
}

export function Sidebar() {
  const { currentView, selectedProjectId, selectProject, goToInbox, goToSettings } =
    useSidebarStore();
  const { data: projects } = useProjects();

  return (
    <aside className="w-[240px] flex flex-col bg-white border-r border-gray-200 h-full flex-shrink-0">
      <div className="p-4 flex items-center gap-2 mb-2">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <span className="font-bold text-gray-900 tracking-tight">Taskdown</span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 space-y-6 py-2">
        <div className="space-y-1">
          <SidebarItem
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            }
            label="Inbox"
            isActive={currentView === 'inbox'}
            onClick={goToInbox}
          />
        </div>

        <div>
          <div className="px-3 mb-2 flex items-center justify-between group">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Projects
            </h3>
          </div>
          <div className="space-y-1">
            {projects?.map((project) => (
              <SidebarItem
                key={project.id}
                icon={
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block ring-1 ring-inset ring-black/5"
                    style={{ backgroundColor: project.color ?? '#6366f1' }}
                  />
                }
                label={project.name}
                isActive={currentView === 'project' && selectedProjectId === project.id}
                onClick={() => selectProject(project.id)}
              />
            ))}

            {(!projects || projects.length === 0) && (
              <div className="px-3 py-4 text-center">
                <p className="text-xs text-gray-400">프로젝트가 없습니다</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-3 mt-auto border-t border-gray-100">
        <SidebarItem
          icon={
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          }
          label="Settings"
          isActive={currentView === 'settings'}
          onClick={goToSettings}
        />
      </div>
    </aside>
  );
}
