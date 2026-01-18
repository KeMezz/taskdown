import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskCard } from './TaskCard';
import type { Task } from '@taskdown/db';

const createMockTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-1',
  title: '테스트 태스크',
  content: '{}',
  projectId: null,
  status: 'backlog',
  dueDate: null,
  sortOrder: 0,
  createdAt: new Date('2026-01-18T00:00:00Z'),
  updatedAt: new Date('2026-01-18T00:00:00Z'),
  ...overrides,
});

describe('TaskCard', () => {
  const mockOnClick = vi.fn();
  const mockOnStatusChange = vi.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
    mockOnStatusChange.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('태스크 제목을 표시한다', () => {
    const task = createMockTask({ title: '중요한 태스크' });
    render(<TaskCard task={task} onClick={mockOnClick} onStatusChange={mockOnStatusChange} />);

    expect(screen.getByText('중요한 태스크')).toBeInTheDocument();
  });

  it('클릭하면 onClick이 호출된다', async () => {
    const user = userEvent.setup();
    const task = createMockTask();
    render(<TaskCard task={task} onClick={mockOnClick} onStatusChange={mockOnStatusChange} />);

    await user.click(screen.getByText('테스트 태스크'));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('상태 드롭다운이 현재 상태를 표시한다', () => {
    const task = createMockTask({ status: 'next' });
    render(<TaskCard task={task} onClick={mockOnClick} onStatusChange={mockOnStatusChange} />);

    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('next');
  });

  it('상태 변경 시 onStatusChange가 호출된다', async () => {
    const user = userEvent.setup();
    const task = createMockTask({ status: 'backlog' });
    render(<TaskCard task={task} onClick={mockOnClick} onStatusChange={mockOnStatusChange} />);

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'done');

    expect(mockOnStatusChange).toHaveBeenCalledWith('done');
  });

  it('상태 드롭다운 클릭 시 카드 클릭이 전파되지 않는다', async () => {
    const user = userEvent.setup();
    const task = createMockTask();
    render(<TaskCard task={task} onClick={mockOnClick} onStatusChange={mockOnStatusChange} />);

    const select = screen.getByRole('combobox');
    await user.click(select);

    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('마감일이 있으면 표시한다', () => {
    const task = createMockTask({ dueDate: new Date('2026-01-20') });
    render(<TaskCard task={task} onClick={mockOnClick} onStatusChange={mockOnStatusChange} />);

    expect(screen.getByText(/📅/)).toBeInTheDocument();
    expect(screen.getByText(/1월 20일/)).toBeInTheDocument();
  });

  it('마감일이 없으면 날짜를 표시하지 않는다', () => {
    const task = createMockTask({ dueDate: null });
    render(<TaskCard task={task} onClick={mockOnClick} onStatusChange={mockOnStatusChange} />);

    expect(screen.queryByText(/📅/)).not.toBeInTheDocument();
  });

  it('완료된 태스크는 취소선이 표시된다', () => {
    const task = createMockTask({ status: 'done' });
    render(<TaskCard task={task} onClick={mockOnClick} onStatusChange={mockOnStatusChange} />);

    const title = screen.getByText('테스트 태스크');
    expect(title).toHaveClass('line-through');
  });

  it('완료되지 않은 태스크는 취소선이 없다', () => {
    const task = createMockTask({ status: 'backlog' });
    render(<TaskCard task={task} onClick={mockOnClick} onStatusChange={mockOnStatusChange} />);

    const title = screen.getByText('테스트 태스크');
    expect(title).not.toHaveClass('line-through');
  });
});
