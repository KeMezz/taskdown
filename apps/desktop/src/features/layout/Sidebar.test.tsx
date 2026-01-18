import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar } from './Sidebar';
import type { Project } from '@taskdown/db';
import { useSidebarStore } from '../../stores';

const createMockProject = (overrides: Partial<Project> = {}): Project => ({
  id: 'project-1',
  name: '테스트 프로젝트',
  color: '#6366f1',
  icon: null,
  sortOrder: 0,
  createdAt: new Date('2026-01-18T00:00:00Z'),
  updatedAt: new Date('2026-01-18T00:00:00Z'),
  ...overrides,
});

describe('Sidebar', () => {
  const mockOnNewProject = vi.fn();

  beforeEach(() => {
    mockOnNewProject.mockClear();
    useSidebarStore.getState().reset();
  });

  afterEach(() => {
    cleanup();
  });

  describe('기본 렌더링', () => {
    it('Taskdown 타이틀을 표시한다', () => {
      render(<Sidebar projects={[]} onNewProject={mockOnNewProject} />);
      expect(screen.getByText('Taskdown')).toBeInTheDocument();
    });

    it('Inbox 항목을 표시한다', () => {
      render(<Sidebar projects={[]} onNewProject={mockOnNewProject} />);
      expect(screen.getByText('Inbox')).toBeInTheDocument();
    });

    it('설정 항목을 표시한다', () => {
      render(<Sidebar projects={[]} onNewProject={mockOnNewProject} />);
      expect(screen.getByText('설정')).toBeInTheDocument();
    });

    it('프로젝트 섹션 제목을 표시한다', () => {
      render(<Sidebar projects={[]} onNewProject={mockOnNewProject} />);
      expect(screen.getByText('프로젝트')).toBeInTheDocument();
    });
  });

  describe('프로젝트 목록', () => {
    it('프로젝트 목록을 표시한다', () => {
      const projects = [
        createMockProject({ id: 'p1', name: '프로젝트 1' }),
        createMockProject({ id: 'p2', name: '프로젝트 2' }),
      ];
      render(<Sidebar projects={projects} onNewProject={mockOnNewProject} />);

      expect(screen.getByText('프로젝트 1')).toBeInTheDocument();
      expect(screen.getByText('프로젝트 2')).toBeInTheDocument();
    });

    it('프로젝트가 없으면 빈 상태 메시지를 표시한다', () => {
      render(<Sidebar projects={[]} onNewProject={mockOnNewProject} />);
      expect(screen.getByText('프로젝트가 없습니다')).toBeInTheDocument();
    });

    it('로딩 중이면 로딩 메시지를 표시한다', () => {
      render(<Sidebar projects={[]} onNewProject={mockOnNewProject} isLoading />);
      expect(screen.getByText('로딩 중...')).toBeInTheDocument();
    });
  });

  describe('프로젝트 선택', () => {
    it('Inbox 클릭 시 프로젝트 ID가 null로 설정된다', async () => {
      const user = userEvent.setup();
      useSidebarStore.getState().selectProject('some-project');

      render(<Sidebar projects={[]} onNewProject={mockOnNewProject} />);
      await user.click(screen.getByText('Inbox'));

      expect(useSidebarStore.getState().selectedProjectId).toBeNull();
    });

    it('프로젝트 클릭 시 해당 프로젝트 ID가 설정된다', async () => {
      const user = userEvent.setup();
      const projects = [createMockProject({ id: 'proj-123', name: '내 프로젝트' })];

      render(<Sidebar projects={projects} onNewProject={mockOnNewProject} />);
      await user.click(screen.getByText('내 프로젝트'));

      expect(useSidebarStore.getState().selectedProjectId).toBe('proj-123');
    });

    it('설정 클릭 시 __settings__ ID가 설정된다', async () => {
      const user = userEvent.setup();
      render(<Sidebar projects={[]} onNewProject={mockOnNewProject} />);
      await user.click(screen.getByText('설정'));

      expect(useSidebarStore.getState().selectedProjectId).toBe('__settings__');
    });
  });

  describe('새 프로젝트', () => {
    it('새 프로젝트 버튼 클릭 시 onNewProject가 호출된다', async () => {
      const user = userEvent.setup();
      render(<Sidebar projects={[]} onNewProject={mockOnNewProject} />);

      const addButton = screen.getByLabelText('새 프로젝트');
      await user.click(addButton);

      expect(mockOnNewProject).toHaveBeenCalledTimes(1);
    });
  });

  describe('사이드바 접기/펼치기', () => {
    it('접기 버튼 클릭 시 사이드바가 접힌다', async () => {
      const user = userEvent.setup();
      render(<Sidebar projects={[]} onNewProject={mockOnNewProject} />);

      const collapseButton = screen.getByLabelText('사이드바 접기');
      await user.click(collapseButton);

      expect(useSidebarStore.getState().isCollapsed).toBe(true);
    });

    it('접힌 상태에서 펼치기 버튼이 표시된다', async () => {
      useSidebarStore.getState().setCollapsed(true);
      render(<Sidebar projects={[]} onNewProject={mockOnNewProject} />);

      expect(screen.getByLabelText('사이드바 펼치기')).toBeInTheDocument();
    });

    it('접힌 상태에서 펼치기 버튼 클릭 시 사이드바가 펼쳐진다', async () => {
      const user = userEvent.setup();
      useSidebarStore.getState().setCollapsed(true);
      render(<Sidebar projects={[]} onNewProject={mockOnNewProject} />);

      const expandButton = screen.getByLabelText('사이드바 펼치기');
      await user.click(expandButton);

      expect(useSidebarStore.getState().isCollapsed).toBe(false);
    });
  });

  describe('선택 상태 스타일링', () => {
    it('선택된 Inbox는 하이라이트된다', () => {
      useSidebarStore.getState().selectProject(null);
      render(<Sidebar projects={[]} onNewProject={mockOnNewProject} />);

      const inboxButton = screen.getByRole('button', { name: /Inbox/i });
      expect(inboxButton).toHaveClass('bg-indigo-100');
    });

    it('선택된 프로젝트는 하이라이트된다', () => {
      const projects = [createMockProject({ id: 'proj-1', name: '선택된 프로젝트' })];
      useSidebarStore.getState().selectProject('proj-1');
      render(<Sidebar projects={projects} onNewProject={mockOnNewProject} />);

      const projectButton = screen.getByRole('button', { name: /선택된 프로젝트/i });
      expect(projectButton).toHaveClass('bg-indigo-100');
    });
  });
});
