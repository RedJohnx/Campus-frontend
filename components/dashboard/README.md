# Dashboard Loading States & Skeleton Loaders

This directory contains enhanced loading states and skeleton loaders for the dashboard components, implementing sophisticated animations and smooth transitions.

## Features Implemented

### ✅ Task 3.3: Dashboard Loading States and Skeleton Loaders

#### 1. Elegant Skeleton Loaders
- **Enhanced ShimmerSkeleton**: Multiple animation variants (shimmer, pulse, wave)
- **StatsCardSkeleton**: Sophisticated card loading with staggered content animations
- **ChartSkeleton**: Dynamic chart loaders for pie, bar, and line charts
- **InsightCardSkeleton**: Elegant insight card loading with glow effects
- **TableSkeleton**: Animated table loading with staggered row animations
- **MetricCardSkeleton**: Financial metric card loading with 3D effects

#### 2. Staggered Loading Animations
- **Progressive Loading**: Multi-stage loading with progress tracking
- **Staggered Children**: Sequential animation of multiple components
- **Delay Management**: Configurable delays for smooth visual flow
- **Container Animations**: Parent-child animation coordination

#### 3. Smooth Transitions
- **LoadingTransition**: Wrapper for seamless loading/loaded state changes
- **State Management**: Context-based loading state management
- **Progressive Enhancement**: Graceful degradation for reduced motion preferences
- **Memory Management**: Proper cleanup of animation resources

#### 4. Enhanced Error States
- **Interactive Error UI**: Sophisticated error display with retry animations
- **Loading Feedback**: Visual feedback during retry operations
- **Error Recovery**: Smooth transitions from error to loading states
- **User Guidance**: Clear messaging and actionable retry buttons

## Components

### Core Skeleton Components

```tsx
// Basic shimmer skeleton with variants
<ShimmerSkeleton className="h-4 w-24" variant="shimmer" />
<ShimmerSkeleton className="h-8 w-20" variant="pulse" />
<ShimmerSkeleton className="h-6 w-32" variant="wave" />

// Stats card skeleton with delay
<StatsCardSkeleton delay={0.1} />

// Chart skeletons for different types
<ChartSkeleton delay={0.5} type="pie" />
<ChartSkeleton delay={0.6} type="bar" />
<ChartSkeleton delay={0.7} type="line" />

// Complete dashboard skeleton
<DashboardSkeleton />
```

### Loading State Management

```tsx
// Loading provider for state management
<LoadingProvider>
  <DashboardContent />
</LoadingProvider>

// Progressive loading hook
const { currentStage, progress, nextStage, reset } = useProgressiveLoading([
  "Connecting to server...",
  "Fetching dashboard data...",
  "Processing statistics...",
  "Loading charts...",
  "Finalizing display..."
])

// Loading overlay with progress
<LoadingOverlay 
  isVisible={loading} 
  progress={progress} 
  stage={currentStage}
/>
```

### Transition Components

```tsx
// Smooth loading transitions
<LoadingTransition
  isLoading={loading}
  skeleton={<StatsCardSkeleton />}
>
  <StatsCard {...props} />
</LoadingTransition>

// Staggered loading container
<StaggeredLoader isLoading={loading} staggerDelay={0.1}>
  {children}
</StaggeredLoader>
```

### Error Handling

```tsx
// Enhanced error state with retry
<DashboardError 
  error="Failed to load dashboard data" 
  onRetry={fetchDashboardData} 
/>
```

## Animation Features

### Performance Optimizations
- **GPU Acceleration**: Transform-based animations for better performance
- **Reduced Motion**: Respects user's motion preferences
- **Animation Batching**: Efficient handling of multiple simultaneous animations
- **Lazy Loading**: Deferred animation loading for off-screen elements

### Visual Enhancements
- **Gradient Backgrounds**: Modern card styling with gradients
- **Shadow Effects**: Sophisticated shadow and glow effects
- **3D Transforms**: Subtle 3D effects for depth perception
- **Micro-interactions**: Satisfying hover and click animations

### Accessibility
- **Motion Preferences**: Automatic detection and respect for reduced motion
- **Focus Management**: Proper focus handling during animations
- **Screen Reader Support**: Appropriate ARIA labels for animated content
- **Keyboard Navigation**: Smooth keyboard interaction support

## Usage Examples

### Basic Dashboard Loading
```tsx
function Dashboard() {
  const [loading, setLoading] = useState(true)
  
  if (loading) {
    return <DashboardSkeleton />
  }
  
  return <DashboardContent />
}
```

### Advanced Loading with Transitions
```tsx
function EnhancedDashboard() {
  const [loading, setLoading] = useState(true)
  const { currentStage, progress, nextStage } = useProgressiveLoading(stages)
  
  return (
    <LoadingProvider>
      <LoadingOverlay isVisible={loading} progress={progress} stage={currentStage} />
      
      <LoadingTransition
        isLoading={loading}
        skeleton={<DashboardSkeleton />}
      >
        <DashboardContent />
      </LoadingTransition>
    </LoadingProvider>
  )
}
```

### Individual Component Loading
```tsx
function StatsSection() {
  return (
    <LoadingTransition
      isLoading={statsLoading}
      skeleton={
        <div className="grid gap-6 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <StatsCardSkeleton key={i} delay={i * 0.15} />
          ))}
        </div>
      }
    >
      <StatsCards />
    </LoadingTransition>
  )
}
```

## Requirements Satisfied

### ✅ Requirement 6.3: Loading States
- Elegant skeleton loaders for each dashboard component
- Smooth transitions between loading and loaded states
- Professional loading animations that match the theme

### ✅ Requirement 8.1: Performance
- GPU-accelerated animations for smooth performance
- Animation batching for multiple simultaneous animations
- Lazy loading for off-screen animated components
- Proper animation cleanup and memory management

### ✅ Requirement 8.3: Error Handling
- Professional error states with animated retry buttons
- Progressive loading with timeout indicators
- Smooth error recovery transitions
- Clear user guidance and feedback

## Testing

The components include comprehensive tests covering:
- Skeleton component rendering
- Loading state transitions
- Error handling and retry functionality
- Animation performance and accessibility
- Reduced motion preference handling

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

All animations gracefully degrade in older browsers and respect user motion preferences.