import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('Example Component', () => {
  it('renders heading', () => {
    render(
      <div>
        <h1>Hello, Jest!</h1>
      </div>
    );
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Hello, Jest!');
  });

  // 여기에 더 많은 테스트 케이스를 추가하세요
});
