# Mobile Customization Examples

## Common Customization Requests

### 1. Change the Number of Jobs Visible on Mobile

**Current**: Jobs take 85% of viewport width (85vw)

**To show more of the next card (e.g., 75% width):**
```jsx
// In JobSeekerHome.js, find this line:
<div className="flex-shrink-0 w-[85vw] snap-center">

// Change to:
<div className="flex-shrink-0 w-[75vw] snap-center">
```

**To show slightly less (e.g., 90% width):**
```jsx
<div className="flex-shrink-0 w-[90vw] snap-center">
```

### 2. Adjust Statistics Grid on Mobile

**Current**: 2×2 grid on mobile

**To make all stats in one column on very small screens:**
```jsx
// Change from:
<div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">

// To:
<div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
```

**To keep 2×2 but make it 1×4 on tablets:**
```jsx
<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-8">
```

### 3. Add Active Dot Indicator for Carousel

Add this state to track the current visible card:

```jsx
// At the top of JobSeekerHome component, add:
const [currentSlide, setCurrentSlide] = useState(0);
const scrollContainerRef = useRef(null);

// Add scroll event listener:
useEffect(() => {
  const container = scrollContainerRef.current;
  if (!container) return;

  const handleScroll = () => {
    const scrollLeft = container.scrollLeft;
    const cardWidth = container.offsetWidth * 0.85; // 85vw
    const index = Math.round(scrollLeft / cardWidth);
    setCurrentSlide(index);
  };

  container.addEventListener('scroll', handleScroll);
  return () => container.removeEventListener('scroll', handleScroll);
}, [recommendedJobs]);

// Update the scroll container div:
<div 
  ref={scrollContainerRef}
  className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4"
>
  {/* ... job cards ... */}
</div>

// Update the dots section:
<div className="flex justify-center gap-2 mt-4">
  {recommendedJobs.map((_, index) => (
    <div 
      key={index} 
      className={`w-2 h-2 rounded-full transition-colors ${
        index === currentSlide ? 'bg-gray-800' : 'bg-gray-300'
      }`}
    ></div>
  ))}
</div>
```

### 4. Add Navigation Arrows for Job Cards

```jsx
// Add these functions in JobSeekerHome:
const scrollToCard = (index) => {
  const container = scrollContainerRef.current;
  if (!container) return;
  
  const cardWidth = container.offsetWidth * 0.85;
  container.scrollTo({
    left: cardWidth * index,
    behavior: 'smooth'
  });
};

// Add arrow buttons:
<div className="relative">
  <div 
    ref={scrollContainerRef}
    className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4"
  >
    {/* ... job cards ... */}
  </div>
  
  {/* Left Arrow */}
  <button
    onClick={() => scrollToCard(Math.max(0, currentSlide - 1))}
    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white border-2 border-gray-800 rounded-full p-2 shadow-lg"
    disabled={currentSlide === 0}
  >
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  </button>
  
  {/* Right Arrow */}
  <button
    onClick={() => scrollToCard(Math.min(recommendedJobs.length - 1, currentSlide + 1))}
    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white border-2 border-gray-800 rounded-full p-2 shadow-lg"
    disabled={currentSlide === recommendedJobs.length - 1}
  >
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  </button>
</div>
```

### 5. Adjust Font Sizes for Better Readability

```jsx
// In the statistics section:
// Current:
<div className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-1 md:mb-2">

// Larger on mobile:
<div className="text-3xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-1 md:mb-2">

// Or even bigger:
<div className="text-4xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-1 md:mb-2">
```

### 6. Change Scroll Snap Behavior

**Current**: Snap to center

**To snap to start (cards aligned to left):**
```jsx
// Change:
<div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
  <div className="flex-shrink-0 w-[85vw] snap-center">

// To:
<div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
  <div className="flex-shrink-0 w-[85vw] snap-start">
```

**To disable snap (free scrolling):**
```jsx
// Remove snap classes:
<div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
  <div className="flex-shrink-0 w-[85vw]">
```

### 7. Add Padding Between Cards

**Current**: 4 unit gap (1rem / 16px)

**To increase spacing:**
```jsx
// Change from:
<div className="flex gap-4 overflow-x-auto...">

// To larger gap:
<div className="flex gap-6 overflow-x-auto...">
// Or even larger:
<div className="flex gap-8 overflow-x-auto...">
```

### 8. Make Cards Slightly Transparent for Preview Effect

```jsx
// Add opacity classes to cards:
<div className="flex-shrink-0 w-[85vw] snap-center opacity-60 transition-opacity duration-200 [&:nth-child(1)]:opacity-100">
  <JobSummaryCard job={job} />
</div>

// With JavaScript to highlight centered card:
<div 
  className={`flex-shrink-0 w-[85vw] snap-center transition-opacity duration-200 ${
    index === currentSlide ? 'opacity-100' : 'opacity-60'
  }`}
>
  <JobSummaryCard job={job} />
</div>
```

### 9. Add Loading Skeleton for Job Cards

```jsx
// Create a skeleton card component:
const JobCardSkeleton = () => (
  <div className="job-card animate-pulse">
    <div className="card-body">
      <div className="flex gap-3 pb-3 border-b border-gray-100">
        <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  </div>
);

// Use while loading:
{recommendedLoading ? (
  <div className="md:hidden">
    <div className="flex gap-4 overflow-x-auto pb-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex-shrink-0 w-[85vw]">
          <JobCardSkeleton />
        </div>
      ))}
    </div>
  </div>
) : (
  // ... normal job cards
)}
```

### 10. Add Pull-to-Refresh Functionality

```jsx
// Install: npm install react-pull-to-refresh

import PullToRefresh from 'react-pull-to-refresh';

// Wrap your content:
<PullToRefresh 
  onRefresh={async () => {
    // Refresh data
    await fetchRecommendedJobs();
  }}
  className="md:hidden"
>
  <div className="flex gap-4 overflow-x-auto...">
    {/* ... job cards ... */}
  </div>
</PullToRefresh>
```

## Responsive Breakpoint Customization

If you want to add custom breakpoints, edit `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    screens: {
      'xs': '475px',     // Extra small devices
      'sm': '640px',     // Small devices
      'md': '768px',     // Medium devices (default tablet)
      'lg': '1024px',    // Large devices
      'xl': '1280px',    // Extra large devices
      '2xl': '1536px',   // 2X large devices
    },
  },
}
```

## Color Customization

To change the accent colors:

```jsx
// Instead of gray-800, use a custom color:
<div className="bg-blue-600 text-white...">

// Or define custom colors in tailwind.config.js:
module.exports = {
  theme: {
    extend: {
      colors: {
        'brand': {
          50: '#f0f9ff',
          // ... add all shades
          900: '#0c4a6e',
        }
      }
    }
  }
}
```

## Performance Optimization

### Lazy Load Job Cards

```jsx
import { lazy, Suspense } from 'react';

const JobSummaryCard = lazy(() => import('./components/JobSummaryCard'));

// Use with Suspense:
<Suspense fallback={<JobCardSkeleton />}>
  <JobSummaryCard job={job} />
</Suspense>
```

### Implement Virtual Scrolling for Many Cards

For 50+ cards, consider using `react-window`:

```bash
npm install react-window
```

```jsx
import { FixedSizeList as List } from 'react-window';

<List
  height={400}
  itemCount={recommendedJobs.length}
  itemSize={350}
  width="100%"
  layout="horizontal"
>
  {({ index, style }) => (
    <div style={style}>
      <JobSummaryCard job={recommendedJobs[index]} />
    </div>
  )}
</List>
```

## Testing Helpers

### Add Visual Debug Indicators

```jsx
// Add this during development to see breakpoints:
<div className="fixed bottom-0 right-0 bg-black text-white p-2 text-xs z-50">
  <span className="sm:hidden">XS</span>
  <span className="hidden sm:block md:hidden">SM</span>
  <span className="hidden md:block lg:hidden">MD</span>
  <span className="hidden lg:block xl:hidden">LG</span>
  <span className="hidden xl:block">XL</span>
</div>
```

### Log Scroll Position

```jsx
const handleScroll = (e) => {
  console.log('Scroll position:', e.target.scrollLeft);
  console.log('Card width:', e.target.offsetWidth * 0.85);
  console.log('Current card:', Math.round(e.target.scrollLeft / (e.target.offsetWidth * 0.85)));
};

<div onScroll={handleScroll} className="flex gap-4 overflow-x-auto...">
```

---

## Quick Reference: Common Tailwind Classes

```
Width:
w-[85vw]  - 85% of viewport width
w-full    - 100% of parent
w-screen  - 100% of viewport

Gap/Spacing:
gap-2   - 0.5rem (8px)
gap-4   - 1rem (16px)
gap-6   - 1.5rem (24px)
gap-8   - 2rem (32px)

Text Size:
text-xs   - 0.75rem (12px)
text-sm   - 0.875rem (14px)
text-base - 1rem (16px)
text-lg   - 1.125rem (18px)
text-xl   - 1.25rem (20px)
text-2xl  - 1.5rem (24px)
text-3xl  - 1.875rem (30px)
text-4xl  - 2.25rem (36px)

Responsive Prefixes:
sm:   - min-width: 640px
md:   - min-width: 768px
lg:   - min-width: 1024px
xl:   - min-width: 1280px
```

Need more customizations? Just ask! 🚀
