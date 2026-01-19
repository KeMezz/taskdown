import { useSidebarStore } from '../../stores';
import type { Project } from '@taskdown/db';

interface SidebarProps {
  projects: Project[];
  onNewProject: () => void;
  onRenameProject?: (project: Project) => void;
  onDeleteProject?: (project: Project) => void;
  isLoading?: boolean;
}

export function Sidebar({
  projects,
  onNewProject,
  onRenameProject,
  onDeleteProject,
  isLoading = false,
}: SidebarProps) {
  const { selectedProjectId, selectProject, isCollapsed, toggleCollapsed } = useSidebarStore();

  const handleContextMenu = (e: React.MouseEvent, project: Project) => {
    e.preventDefault();
    if (onRenameProject && onDeleteProject) {
      // 컨텍스트 메뉴 이벤트를 부모에게 전달
      const event = new CustomEvent('project-context-menu', {
        detail: { project, x: e.clientX, y: e.clientY },
      });
      window.dispatchEvent(event);
    }
  };

  if (isCollapsed) {
    return (
      <aside className="w-12 bg-gray-100 border-r border-gray-200 flex flex-col items-center py-4">
        <button
          onClick={toggleCollapsed}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          aria-label="사이드바 펼치기"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-60 bg-gray-100 border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-200">
        <h1 className="font-semibold text-gray-900">Taskdown</h1>
        <button
          onClick={toggleCollapsed}
          className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
          aria-label="사이드바 접기"
        >
          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        {/* Inbox */}
        <button
          onClick={() => selectProject(null)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
            selectedProjectId === null
              ? 'bg-indigo-100 text-indigo-700'
              : 'text-gray-700 hover:bg-gray-200'
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <span className="font-medium">Inbox</span>
        </button>

        {/* Projects Section */}
        <div className="mt-6">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">프로젝트</span>
            <button
              onClick={onNewProject}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              aria-label="새 프로젝트"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {isLoading ? (
            <div className="px-3 py-2 text-sm text-gray-500">로딩 중...</div>
          ) : projects.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">프로젝트가 없습니다</div>
          ) : (
            <ul className="space-y-0.5">
              {projects.map((project) => (
                <li key={project.id}>
                  <button
                    onClick={() => selectProject(project.id)}
                    onContextMenu={(e) => handleContextMenu(e, project)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                      selectedProjectId === project.id
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: project.color || '#6366f1' }}
                    />
                    <span className="truncate">{project.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </nav>

      {/* Footer - Settings */}
      <div className="p-2 border-t border-gray-200">
        <button
          onClick={() => selectProject('__settings__')}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
            selectedProjectId === '__settings__'
              ? 'bg-indigo-100 text-indigo-700'
              : 'text-gray-700 hover:bg-gray-200'
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>설정</span>
        </button>
      </div>
    </aside>
  );
}
