import { menu } from "./data/menu.ts";
import { useState } from "react";

export default function App() {
  const [sales, setSales] = useState<Record<string, number>>({});
  const [safetyMargin, setSafetyMargin] = useState(10);

  const handleSalesChange = (menuName: string, count: number) => {
    setSales((currentSales) => ({
      ...currentSales,
      [menuName]: count,
    }));
  };

  return (
    <>
      <h1>Sushi Manager</h1>

      <h2>今日の売上</h2>

      {menu.map((item) => (
        <div key={item.name}>
          <label>
            {item.name}：
            <input
              type="number"
              value={sales[item.name] ?? 0}
              onChange={(e) =>
                handleSalesChange(item.name, Number(e.target.value))
              }
            />
            皿
          </label>
        </div>
      ))}

      <h2>安全余裕</h2>

      <label>
        <input
          type="number"
          value={safetyMargin}
          onChange={(e) => setSafetyMargin(Number(e.target.value))}
        />
        %
      </label>

      <h2>仕込み</h2>

      {menu.map((item) => {
        const salesCount = sales[item.name] ?? 0;

        const preparationCount = Math.ceil(
          salesCount * (1 + safetyMargin / 100),
        );

        return (
          <div key={item.name}>
            <h3>{item.name}</h3>

            <p>仕込み数：{preparationCount}皿</p>

            {item.ingredients.map((ingredient) => (
              <p key={ingredient.name}>
                {ingredient.name}：{ingredient.weight * preparationCount}g
              </p>
            ))}
          </div>
        );
      })}
    </>
  );
}
