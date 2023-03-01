import type { Component } from "solid-js";
import { createEffect, createSignal } from "solid-js";

const App: Component = () => {
  const [count, setCount] = createSignal(0);
  const [isEven, setIsEven] = createSignal(false);
  createEffect(() => {
    const c = count();
    setIsEven(c !== 0 && c % 2 === 0);
  });
  const doubleCount = () => count() * 2;
  return (
    <div class="p-5">
      <p>Current count: {count()}</p>
      <p>vs x2: {doubleCount()}</p>
      <button onClick={() => setCount(count() + 1)}>Increase count</button>
      {isEven() && <p>it is even!</p>}
    </div>
  );
};

export default App;
