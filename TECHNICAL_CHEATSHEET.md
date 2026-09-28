# Technical Concepts Quick Reference
## Senior Frontend Developer Interview - IKG Team

---

## React Hooks - Quick Reference

### useState
```javascript
const [count, setCount] = useState(0);
// Update: setCount(1) or setCount(prev => prev + 1)
```
**Use for:** Simple local state (counters, toggles, form inputs)

### useEffect
```javascript
useEffect(() => {
  // Side effect code
  return () => {
    // Cleanup
  };
}, [dependencies]);
```
**Use for:** Data fetching, subscriptions, DOM manipulation  
**Empty array []:** Runs once on mount  
**No array:** Runs after every render  
**Cleanup:** Runs before unmount or re-run

### useContext
```javascript
const theme = useContext(ThemeContext);
```
**Use for:** Accessing global state without prop drilling

### useReducer
```javascript
const [state, dispatch] = useReducer(reducer, initialState);
// dispatch({ type: 'INCREMENT', payload: 1 })
```
**Use for:** Complex state logic with multiple actions  
**Better than useState when:** State transitions are complex, next state depends on previous

### useMemo
```javascript
const expensiveResult = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);
```
**Use for:** Memoizing expensive calculations  
**Avoid overuse:** Only when computation is measurably expensive

### useCallback
```javascript
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```
**Use for:** Memoizing function references to prevent child re-renders  
**Common use:** Passing callbacks to optimized child components

### useRef
```javascript
const inputRef = useRef(null);
// Access: inputRef.current.focus()
```
**Use for:** Accessing DOM elements, storing mutable values that don't trigger re-renders

---

## State Management Comparison

| Approach | Best For | Complexity | Boilerplate |
|----------|----------|------------|-------------|
| **useState + useContext** | Small-medium apps, simple global state | Low | Low |
| **Redux** | Large apps, complex state, time-travel debugging | High | High |
| **Zustand** | Medium apps, simpler Redux alternative | Medium | Low |
| **Jotai** | Atomic state, bottom-up approach | Medium | Low |
| **MobX** | Object-oriented state, observables | Medium | Medium |

**When to use what:**
- **Context API**: Theming, i18n, authentication state
- **Redux**: Heavy state manipulation, need for middleware, large team
- **Local state**: Component-specific data that doesn't need sharing

---

## Performance Optimization Techniques

### React-Specific

1. **React.memo** - Prevent re-renders
```javascript
const MyComponent = React.memo(({ prop }) => {
  return <div>{prop}</div>;
});
```

2. **Code Splitting**
```javascript
const LazyComponent = React.lazy(() => import('./Component'));

<Suspense fallback={<Loading />}>
  <LazyComponent />
</Suspense>
```

3. **Virtual Lists** - For long lists
```javascript
// Use react-window or react-virtualized
// Only render visible items
```

4. **Debouncing/Throttling**
```javascript
// Debounce: Wait for pause in events
const debouncedSearch = debounce(searchFunction, 300);

// Throttle: Limit frequency
const throttledScroll = throttle(scrollHandler, 100);
```

### General Web Performance

**Critical Rendering Path:**
1. HTML → DOM tree
2. CSS → CSSOM tree
3. DOM + CSSOM → Render tree
4. Layout (position/size calculation)
5. Paint (pixels to screen)

**Optimization Priorities:**
1. Minimize critical resources
2. Reduce round trips (HTTP/2, CDN)
3. Minimize bytes (compression, minification)
4. Optimize image loading (lazy load, WebP)
5. Use code splitting for JavaScript

**60 FPS = 16.67ms per frame**
- 10ms for your code (budget)
- 6ms for browser rendering

**GPU-Accelerated Properties:**
- ✅ `transform` (translate, scale, rotate)
- ✅ `opacity`
- ❌ `top/left/width/height` (triggers layout)

---

## PixiJS Key Concepts

### Basic Setup
```javascript
const app = new PIXI.Application({
  width: 800,
  height: 600,
  backgroundColor: 0x1099bb
});
document.body.appendChild(app.view);
```

### Core Elements

**Sprite** - Image on screen
```javascript
const texture = PIXI.Texture.from('image.png');
const sprite = new PIXI.Sprite(texture);
sprite.x = 100;
sprite.y = 100;
app.stage.addChild(sprite);
```

**Container** - Group objects
```javascript
const container = new PIXI.Container();
container.addChild(sprite1, sprite2);
app.stage.addChild(container);
```

**Graphics** - Draw shapes
```javascript
const graphics = new PIXI.Graphics();
graphics.beginFill(0xFF0000);
graphics.drawRect(0, 0, 100, 100);
graphics.endFill();
```

**Ticker** - Animation loop
```javascript
app.ticker.add((delta) => {
  sprite.rotation += 0.01 * delta;
});
```

### Performance Tips
- **Sprite batching**: Group similar sprites to reduce draw calls
- **Texture atlases**: Combine images into one texture
- **Object pooling**: Reuse objects instead of create/destroy
- **Culling**: Don't render off-screen objects
- **Cache as bitmap**: Convert complex containers to textures

---

## Spine Animation Basics

### What is Spine?
- 2D skeletal animation tool
- Creates smooth animations from bones + images
- More efficient than frame-by-frame animation

### Key Concepts

**Skeleton** - Bone structure
- Hierarchy of bones
- Each bone controls attached images

**Skins** - Visual variations
- Same skeleton, different appearance
- Switch costumes without new animations

**Animations** - Movement sequences
- Defined as keyframes
- Smooth interpolation between poses

**Attachments** - Images on bones
- Sprites attached to skeleton parts
- Move with bone transformations

### Spine + PixiJS Integration
```javascript
// Using pixi-spine library
PIXI.Loader.shared
  .add('character', 'character.json')
  .load((loader, resources) => {
    const animation = new PIXI.spine.Spine(resources.character.spineData);
    animation.state.setAnimation(0, 'walk', true);
    app.stage.addChild(animation);
  });
```

### Common Use Cases
- Character animations (walk, run, jump, attack)
- UI animations (buttons, transitions)
- Card dealing, chip movements
- Celebration effects

---

## Storybook Overview

### What is Storybook?
Tool for building and documenting UI components in isolation

### Key Features

**Stories** - Component states
```javascript
export default {
  title: 'Button',
  component: Button
};

export const Primary = () => <Button variant="primary">Click me</Button>;
export const Disabled = () => <Button disabled>Can't click</Button>;
```

**Args/Controls** - Interactive props
```javascript
export const Configurable = (args) => <Button {...args} />;
Configurable.args = {
  label: 'Button',
  variant: 'primary',
  disabled: false
};
```

**Addons**
- Accessibility testing (a11y)
- Responsive viewports
- Action logging
- Documentation generation

### Benefits for Gaming
- Develop UI components (buttons, cards, HUD) in isolation
- Test different states (normal, hover, active, disabled)
- Visual regression testing
- Designer-developer collaboration
- Component library documentation

---

## Web Performance Profiling

### Chrome DevTools Performance Tab

**How to use:**
1. Open DevTools (F12) → Performance tab
2. Click Record, interact with page, stop recording
3. Analyze flame graph

**What to look for:**
- **Long tasks** (>50ms) - Break them up
- **Layout/Reflow** - Minimize DOM changes
- **Paint** - Reduce painted area
- **Script execution** - Optimize JavaScript
- **FPS drops** - Find performance bottlenecks

**Key Metrics:**
- **FCP** (First Contentful Paint): When content appears
- **LCP** (Largest Contentful Paint): Main content loaded
- **TTI** (Time to Interactive): Page becomes interactive
- **FPS** (Frames Per Second): Animation smoothness

### React DevTools Profiler

**How to use:**
1. Install React DevTools extension
2. Profiler tab → Record interactions
3. View component render times

**What to look for:**
- Components re-rendering unnecessarily
- Expensive renders (>10ms)
- Cascading updates (one change triggers many re-renders)

**Common fixes:**
- Add React.memo for expensive components
- Use useMemo/useCallback for stable references
- Split large components
- Optimize state structure

---

## Cross-Browser/Device Testing

### Responsive Breakpoints (Common)
```css
/* Mobile: 320-480px */
@media (max-width: 480px) { }

/* Tablet: 481-768px */
@media (min-width: 481px) and (max-width: 768px) { }

/* Desktop: 769px+ */
@media (min-width: 769px) { }
```

### Touch vs Mouse Events

**Touch Events:**
- `touchstart` - Finger touches screen
- `touchmove` - Finger moves on screen
- `touchend` - Finger leaves screen

**Pointer Events (Unified):**
- `pointerdown` - Works for mouse & touch
- `pointermove`
- `pointerup`

**Recommendation:** Use Pointer Events for broader compatibility

### Common Browser Issues

**Safari:**
- 100vh includes address bar (use `100dvh` in modern Safari)
- Requires `-webkit-` prefixes for some features
- Limited PWA support

**iOS Safari:**
- Touch delay (use `touch-action: manipulation`)
- No click on body (add to specific elements)
- Safe area for notches (`env(safe-area-inset-*)`)

**Chrome/Edge:**
- Generally most standards-compliant
- Good DevTools support

**Firefox:**
- Good standards support
- Slightly different rendering engine

### Testing Tools
- **BrowserStack**: Test on real devices
- **Chrome DevTools Device Mode**: Emulate devices
- **Responsive Design Mode** (Firefox): Test breakpoints
- **Can I Use** (caniuse.com): Check feature support

---

## Common Interview Code Questions

### 1. Debounce Function
```javascript
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// Usage
const debouncedSearch = debounce((query) => {
  console.log('Searching for:', query);
}, 300);
```

### 2. Throttle Function
```javascript
function throttle(func, delay) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func.apply(this, args);
    }
  };
}

// Usage
const throttledScroll = throttle(() => {
  console.log('Scroll position:', window.scrollY);
}, 100);
```

### 3. Custom useDebounce Hook
```javascript
import { useEffect, useState } from 'react';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Usage
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearchTerm = useDebounce(searchTerm, 500);

useEffect(() => {
  if (debouncedSearchTerm) {
    // API call with debouncedSearchTerm
  }
}, [debouncedSearchTerm]);
```

### 4. useLocalStorage Hook
```javascript
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setStoredValue = (newValue) => {
    try {
      setValue(newValue);
      window.localStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.error(error);
    }
  };

  return [value, setStoredValue];
}
```

---

## Design Patterns in React

### 1. Container/Presentational Pattern
```javascript
// Container (logic)
function UserContainer() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    fetchUser().then(setUser);
  }, []);
  return <UserPresentation user={user} />;
}

// Presentational (UI)
function UserPresentation({ user }) {
  if (!user) return <Loading />;
  return <div>{user.name}</div>;
}
```

### 2. Compound Components Pattern
```javascript
function Tabs({ children }) {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  );
}

Tabs.List = function TabsList({ children }) {
  return <div className="tabs-list">{children}</div>;
};

Tabs.Tab = function Tab({ index, children }) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  return (
    <button onClick={() => setActiveTab(index)}>
      {children}
    </button>
  );
};

// Usage
<Tabs>
  <Tabs.List>
    <Tabs.Tab index={0}>Tab 1</Tabs.Tab>
    <Tabs.Tab index={1}>Tab 2</Tabs.Tab>
  </Tabs.List>
</Tabs>
```

### 3. Higher-Order Component (HOC)
```javascript
function withLoading(Component) {
  return function WithLoadingComponent({ isLoading, ...props }) {
    if (isLoading) return <Loading />;
    return <Component {...props} />;
  };
}

const UserListWithLoading = withLoading(UserList);
```

### 4. Render Props Pattern
```javascript
function DataFetcher({ url, render }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch(url).then(res => res.json()).then(setData);
  }, [url]);
  return render(data);
}

// Usage
<DataFetcher
  url="/api/users"
  render={(users) => <UserList users={users} />}
/>
```

---

## Key Terminology

### Frontend
- **DOM** - Document Object Model (tree structure of HTML)
- **Virtual DOM** - In-memory representation (React uses this)
- **Reconciliation** - Process of updating real DOM from virtual DOM
- **Hydration** - Adding interactivity to server-rendered HTML
- **SSR** - Server-Side Rendering
- **CSR** - Client-Side Rendering
- **SSG** - Static Site Generation

### Performance
- **TTI** - Time to Interactive
- **FCP** - First Contentful Paint
- **LCP** - Largest Contentful Paint
- **CLS** - Cumulative Layout Shift
- **FID** - First Input Delay
- **TBT** - Total Blocking Time

### Graphics
- **FPS** - Frames Per Second
- **WebGL** - Web Graphics Library (3D/2D graphics API)
- **Canvas** - HTML element for drawing graphics
- **GPU** - Graphics Processing Unit (hardware acceleration)
- **Sprite** - 2D image in games
- **Texture** - Image applied to 3D/2D objects
- **Atlas** - Combined image containing multiple sprites

### Gaming
- **Game Loop** - Continuous update-render cycle
- **Delta Time** - Time elapsed since last frame
- **Tick** - Single iteration of game loop
- **Latency** - Delay between action and response
- **Interpolation** - Smooth movement between states
- **Collision Detection** - Detecting object intersections

---

## Quick Mental Models

### When to Optimize Performance
1. **Measure first** - Don't optimize prematurely
2. **Profile** - Use DevTools to find actual bottlenecks
3. **Fix the biggest issues** - 80/20 rule applies
4. **Measure again** - Verify improvement

### Component Design Principles
1. **Single Responsibility** - One component, one job
2. **Reusability** - Design for multiple contexts
3. **Composability** - Build complex from simple
4. **Predictability** - Same props = same output

### Debugging Approach
1. **Reproduce** - Can you make it happen reliably?
2. **Isolate** - Narrow down the cause
3. **Fix** - Implement solution
4. **Verify** - Ensure it's actually fixed
5. **Prevent** - Add tests or safeguards

---

## Pre-Interview Confidence Boosters

### Things You Know Well ✅
- React fundamentals and hooks
- Component architecture and state management
- Building complex interactive UIs
- Problem-solving and debugging
- Working with APIs and data
- Responsive design and CSS

### Things You'll Learn Quickly 🚀
- PixiJS for game rendering
- Spine for animations
- Storybook for component development
- Gaming-specific patterns

### Remember
- **You were invited** - They see potential in you
- **React expertise is core** - That's the foundation
- **Gaming tech can be learned** - You have the fundamentals
- **Your approach matters** - How you think and learn counts
- **Be genuine** - Show your real enthusiasm and curiosity

---

*Print this out or keep it open for quick reference!*
