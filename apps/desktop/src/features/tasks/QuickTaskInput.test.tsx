import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuickTaskInput } from './QuickTaskInput';

describe('QuickTaskInput', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('플레이스홀더를 표시한다', () => {
    render(<QuickTaskInput onSubmit={mockOnSubmit} placeholder="새 태스크 추가..." />);
    expect(screen.getByPlaceholderText('새 태스크 추가...')).toBeInTheDocument();
  });

  it('텍스트 입력이 가능하다', async () => {
    const user = userEvent.setup();
    render(<QuickTaskInput onSubmit={mockOnSubmit} />);

    const input = screen.getByRole('textbox');
    await user.type(input, '새로운 태스크');

    expect(input).toHaveValue('새로운 태스크');
  });

  it('Enter 키로 제출할 수 있다', async () => {
    const user = userEvent.setup();
    render(<QuickTaskInput onSubmit={mockOnSubmit} />);

    const input = screen.getByRole('textbox');
    await user.type(input, '테스트 태스크{enter}');

    expect(mockOnSubmit).toHaveBeenCalledWith('테스트 태스크');
  });

  it('제출 후 입력 필드가 비워진다', async () => {
    const user = userEvent.setup();
    render(<QuickTaskInput onSubmit={mockOnSubmit} />);

    const input = screen.getByRole('textbox');
    await user.type(input, '테스트 태스크{enter}');

    expect(input).toHaveValue('');
  });

  it('빈 문자열은 제출되지 않는다', async () => {
    const user = userEvent.setup();
    render(<QuickTaskInput onSubmit={mockOnSubmit} />);

    const input = screen.getByRole('textbox');
    await user.type(input, '{enter}');

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('공백만 있는 경우 제출되지 않는다', async () => {
    const user = userEvent.setup();
    render(<QuickTaskInput onSubmit={mockOnSubmit} />);

    const input = screen.getByRole('textbox');
    await user.type(input, '   {enter}');

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('제출된 텍스트는 트리밍된다', async () => {
    const user = userEvent.setup();
    render(<QuickTaskInput onSubmit={mockOnSubmit} />);

    const input = screen.getByRole('textbox');
    await user.type(input, '  태스크  {enter}');

    expect(mockOnSubmit).toHaveBeenCalledWith('태스크');
  });

  it('텍스트가 있으면 추가 버튼이 표시된다', async () => {
    const user = userEvent.setup();
    render(<QuickTaskInput onSubmit={mockOnSubmit} />);

    expect(screen.queryByRole('button', { name: /추가/i })).not.toBeInTheDocument();

    const input = screen.getByRole('textbox');
    await user.type(input, '태스크');

    expect(screen.getByRole('button', { name: /추가/i })).toBeInTheDocument();
  });

  it('Escape 키로 입력을 비울 수 있다', async () => {
    const user = userEvent.setup();
    render(<QuickTaskInput onSubmit={mockOnSubmit} />);

    const input = screen.getByRole('textbox');
    await user.type(input, '테스트');
    await user.keyboard('{Escape}');

    expect(input).toHaveValue('');
  });
});
