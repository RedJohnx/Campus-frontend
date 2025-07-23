import { render, screen } from '@testing-library/react'
import { 
  DashboardSkeleton, 
  StatsCardSkeleton, 
  ChartSkeleton,
  DashboardError,
  LoadingTransition 
} from '../dashboard-skeletons'

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => children,
}))

// Mock animation utils
jest.mock('@/lib/animation-utils', () => ({
  prefersReducedMotion: () => true,
}))

describe('Dashboard Skeletons', () => {
  test('renders DashboardSkeleton without crashing', () => {
    render(<DashboardSkeleton />)
    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument()
  })

  test('renders StatsCardSkeleton with proper structure', () => {
    render(<StatsCardSkeleton />)
    // Should render a card structure
    const card = screen.getByRole('generic')
    expect(card).toBeInTheDocument()
  })

  test('renders ChartSkeleton with different types', () => {
    const { rerender } = render(<ChartSkeleton type="pie" />)
    expect(screen.getByRole('generic')).toBeInTheDocument()
    
    rerender(<ChartSkeleton type="bar" />)
    expect(screen.getByRole('generic')).toBeInTheDocument()
    
    rerender(<ChartSkeleton type="line" />)
    expect(screen.getByRole('generic')).toBeInTheDocument()
  })

  test('renders DashboardError with retry functionality', () => {
    const mockRetry = jest.fn()
    render(<DashboardError error="Test error" onRetry={mockRetry} />)
    
    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Test error')).toBeInTheDocument()
    
    const retryButton = screen.getByText('Try Again')
    expect(retryButton).toBeInTheDocument()
    
    retryButton.click()
    expect(mockRetry).toHaveBeenCalledTimes(1)
  })

  test('LoadingTransition shows skeleton when loading', () => {
    const skeleton = <div data-testid="skeleton">Loading...</div>
    const content = <div data-testid="content">Content</div>
    
    const { rerender } = render(
      <LoadingTransition isLoading={true} skeleton={skeleton}>
        {content}
      </LoadingTransition>
    )
    
    expect(screen.getByTestId('skeleton')).toBeInTheDocument()
    expect(screen.queryByTestId('content')).not.toBeInTheDocument()
    
    rerender(
      <LoadingTransition isLoading={false} skeleton={skeleton}>
        {content}
      </LoadingTransition>
    )
    
    expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument()
    expect(screen.getByTestId('content')).toBeInTheDocument()
  })
})