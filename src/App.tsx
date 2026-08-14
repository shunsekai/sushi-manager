import { menu, SushiMenu } from "./data/menu.ts";
import { useState } from "react";
import { inventory } from "./data/inventory.ts";

export default function App() {
  const [sales, setSales] = useState<Record<string, number>>({});
  const [safetyMargin, setSafetyMargin] = useState(10);
  const [stock, setStock] = useState(inventory);

  const handleSalesChange = (menuName: string, count: number) => {
    setSales((currentSales) => ({
      ...currentSales,
      [menuName]: count,
    }));
  };

  const handlePreparation = (item: SushiMenu) => {
    const salesCount = sales[item.name] ?? 0;

    const preparationCount = Math.ceil(salesCount * (1 + safetyMargin / 100));

    setStock((currentStock) =>
      currentStock.map((stockItem) => {
        const ingredient = item.ingredients.find(
          (ingredient) => ingredient.name === stockItem.name,
        );

        if (!ingredient) {
          return stockItem;
        }

        return {
          ...stockItem,
          weight: stockItem.weight - ingredient.weight * preparationCount,
        };
      }),
    );
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
            <button onClick={() => handlePreparation(item)}>仕込みする</button>

            {item.ingredients.map((ingredient) => (
              <p key={ingredient.name}>
                {ingredient.name}：{ingredient.weight * preparationCount}g
              </p>
            ))}
          </div>
        );
      })}

      <h2>在庫</h2>
      {stock.map((stockItem) => (
        <p key={stockItem.name}>
          {stockItem.name}:{stockItem.weight}g
        </p>
      ))}
    </>
  );
}
