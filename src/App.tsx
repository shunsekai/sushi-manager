import { menu } from "./data/menu.ts";
import { useState } from "react";

export default function App() {
  const tuna = menu.find((item) => item.name === "マグロ");
  const [salesCount, setSalesCount] = useState(0);
  const [safetyMargin, setSafetyMargin] = useState(10);
  const preparationCount = Math.ceil(salesCount * (1 + safetyMargin / 100));

  return (
    <>
      <h1>Sushi Manager</h1>

      <h2>売上</h2>

      <label>
        マグロ:
        <input
          type="number"
          value={salesCount}
          onChange={(e) => setSalesCount(Number(e.target.value))}
        />
        皿
      </label>

      <label>
        <input
          type="number"
          value={safetyMargin}
          onChange={(e) => setSafetyMargin(Number(e.target.value))}
        />
        %
      </label>

      <h2>必要な材料</h2>

      {tuna?.ingredients.map((ingredient) => (
        <p key={ingredient.name}>
          {ingredient.name}：{ingredient.weight * preparationCount}g
        </p>
      ))}
    </>
  );
}
