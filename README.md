# Use Debug Concurrent

A hook that helps you debug React concurrent features like `useTransition` a `useDeferredValue` by _hooking into_ (no pun intended) concurrent rendering lifecycles, i.e. high priority and low priority render phases.

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
