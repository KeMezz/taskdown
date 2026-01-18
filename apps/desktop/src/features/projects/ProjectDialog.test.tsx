import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectDialog } from './ProjectDialog';

describe('ProjectDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnSubmit.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('isOpen이 false이면 렌더링되지 않는다', () => {
    render(
      <ProjectDialog isOpen={false} onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    expect(screen.queryByText('새 프로젝트')).not.toBeInTheDocument();
  });

  it('isOpen이 true이면 다이얼로그가 표시된다', () => {
    render(
      <ProjectDialog isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    expect(screen.getByText('새 프로젝트')).toBeInTheDocument();
  });

  it('커스텀 타이틀을 표시할 수 있다', () => {
    render(
      <ProjectDialog
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        title="프로젝트 수정"
      />
    );

    expect(screen.getByText('프로젝트 수정')).toBeInTheDocument();
  });

  it('초기 데이터가 있으면 입력 필드에 표시된다', () => {
    render(
      <ProjectDialog
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        initialData={{ name: '기존 프로젝트', color: '#ef4444' }}
      />
    );

    const input = screen.getByLabelText('프로젝트 이름');
    expect(input).toHaveValue('기존 프로젝트');
  });

  it('프로젝트 이름을 입력할 수 있다', async () => {
    const user = userEvent.setup();
    render(
      <ProjectDialog isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    const input = screen.getByLabelText('프로젝트 이름');
    await user.type(input, '새 프로젝트');

    expect(input).toHaveValue('새 프로젝트');
  });

  it('생성 버튼 클릭 시 데이터가 제출된다', async () => {
    const user = userEvent.setup();
    render(
      <ProjectDialog isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    const input = screen.getByLabelText('프로젝트 이름');
    await user.type(input, '테스트 프로젝트');

    const submitButton = screen.getByRole('button', { name: '생성' });
    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: '테스트 프로젝트',
      color: '#6366f1', // 기본 색상
    });
  });

  it('이름이 비어있으면 제출되지 않는다', async () => {
    const user = userEvent.setup();
    render(
      <ProjectDialog isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    const submitButton = screen.getByRole('button', { name: '생성' });
    await user.click(submitButton);

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('취소 버튼 클릭 시 onClose가 호출된다', async () => {
    const user = userEvent.setup();
    render(
      <ProjectDialog isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    const cancelButton = screen.getByRole('button', { name: '취소' });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('백드롭 클릭 시 onClose가 호출된다', async () => {
    const user = userEvent.setup();
    render(
      <ProjectDialog isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    // 백드롭을 찾아서 클릭 (aria-hidden=true인 요소)
    const backdrop = document.querySelector('[aria-hidden="true"]') as HTMLElement;
    await user.click(backdrop);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('색상을 선택할 수 있다', async () => {
    const user = userEvent.setup();
    render(
      <ProjectDialog isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    // 빨간색 선택
    const redButton = screen.getByLabelText('색상 #ef4444');
    await user.click(redButton);

    const input = screen.getByLabelText('프로젝트 이름');
    await user.type(input, '빨간 프로젝트');

    const submitButton = screen.getByRole('button', { name: '생성' });
    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: '빨간 프로젝트',
      color: '#ef4444',
    });
  });

  it('initialData가 있으면 버튼 텍스트가 "저장"으로 표시된다', () => {
    render(
      <ProjectDialog
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        initialData={{ name: '기존 프로젝트', color: '#6366f1' }}
      />
    );

    expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument();
  });

  it('생성 버튼은 이름이 없으면 비활성화된다', () => {
    render(
      <ProjectDialog isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    // 생성 버튼은 하나만 있어야 하므로 submit 타입으로 찾기
    const submitButton = screen.getByRole('button', { name: '생성' });
    expect(submitButton).toHaveAttribute('disabled');
  });
});
