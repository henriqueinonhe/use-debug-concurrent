# Use Debug Concurrent

A hook that helps you debug React concurrent features like `useTransition` a `useDeferredValue` by _hooking into_ (no pun intended) concurrent rendering lifecycles, i.e. high priority and low priority render phases.

Debugging components that use concurrent rendering is tricky because they render (at least) twice, once due to the high priority update and another due to the low priority one and they may render even more times before comitting if low priority renders are interrupted.

This can make things very confusing when we want to inspect (e.g. log to console) values during render, especially because some values will differ between high and low priority renders.

With this hook, you can pass callbacks that will only run in a specific render phase, so you can easily inspect values and debug your components.

If you want to dive deeper into concurrent rendering or how this hook works, check [this article](https://blog.codeminer42.com/everything-you-need-to-know-about-concurrent-react-with-a-little-bit-of-suspense/#debugging-concurrent-rendering).

## Installation

```sh
npm install use-debug-concurrent
```

Types are already included.

## Usage

```jsx
import { useDebugConcurrent } from "use-debug-concurrent";

export default function App() {
  // This state will be updated by
  // HIGH priority updates
  const [filter, setFilter] = useState("");
  // This state will be updated by
  // LOW priority updates
  const [delayedFilter, setDelayedFilter] = useState("");
  const [isPending, startTransition] = useTransition();

  useDebugConcurrent({
    onFirstRenderStart: () => console.log("First render started"),
    onFirstRenderEnd: () => console.log("First render ended"),
    onHighPriorityStart: () => console.log("High priority render started"),
    onHighPriorityEnd: () => console.log("High priority render ended"),
    onLowPriorityStart: () => console.log("Low priority render started"),
    onLowPriorityEnd: () => console.log("Low priority render ended"),
  });

  return (
    <div>
      <input
        value={filter}
        onChange={(e) => {
          setFilter(e.target.value);
          startTransition(() => {
            // Here we're triggering the low
            // priority update that will
            // change `delayedFilter`'s value
            setDelayedFilter(e.target.value);
          });
        }}
      />

      <List filter={delayedFilter} />
    </div>
  );
}

const List = memo(({ filter }) => {
  const filteredList = list.filter((entry) =>
    entry.name.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <ul>
      {filteredList.map((item) => (
        <li key={item.id}>
          {item.name} - ${item.price}
        </li>
      ))}
    </ul>
  );
});
```

## Caveats

### First renders are ambiguous in terms of priority

When the component renders for the first time, we cannot know whether that render is a high priority or low priority render just by looking at the component itself, we would need to understand what **triggered** the render in the first place, which comes from higher up in the component tree.

For instance, a component could be conditionally rendered by a parent component, and that parent component could be re-rendered by either a high priority or low priority update, which would make the child component's first render have the same priority as the parent's.

This is why we have two callbacks for first renders, `onFirstRenderStart` and `onFirstRenderEnd`.
