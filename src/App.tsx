import { menu, SushiMenu } from "./data/menu.ts";
import { useState, useEffect } from "react";
import { inventory } from "./data/inventory.ts";
import { supabase } from "./lib/supabase.ts";
type Ingredient = {
  id: number;
  name: string;
  weight: number;
};

type Menu = {
  id: number;
  name: string;
  ingredients: Ingredient[];
};
export default function App() {
  const [sales, setSales] = useState<Record<string, number>>({});
  const [safetyMargin, setSafetyMargin] = useState(10);
  const [stock, setStock] = useState(inventory);
  const [menus, setMenus] = useState<Menu[]>([]);

  useEffect(() => {
    const fetchMenus = async () => {
      const { data, error } = await supabase.from("menus").select(`
    id,
    name,
    menu_ingredients (weight,
      ingredients (
        id,
        name
      )
    )
  `);

      if (error) {
        console.error(error);
        return;
      }
      console.log(data);
      const menusWithIngredients = data.map((menu) => ({
        id: menu.id,
        name: menu.name ?? "",
        ingredients: menu.menu_ingredients
          .map((item) => {
            if (!item.ingredients) {
              return null;
            }

            return {
              id: item.ingredients.id,
              name: item.ingredients.name ?? "",
              weight: item.weight ?? 0,
            };
          })
          .filter((ingredient) => ingredient !== null),
      }));

      setMenus(menusWithIngredients);
    };

    fetchMenus();
  }, []);

  const handleSalesChange = (menuName: string, count: number) => {
    setSales((currentSales) => ({
      ...currentSales,
      [menuName]: count,
    }));
  };

  const handlePreparation = (item: Menu) => {
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

      {menus.map((item) => (
        <div key={item.id}>
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

      {menus.map((item) => {
        const salesCount = sales[item.name] ?? 0;

        const preparationCount = Math.ceil(
          salesCount * (1 + safetyMargin / 100),
        );

        return (
          <div key={item.id}>
            <h3>{item.name}</h3>

            <p>仕込み数：{preparationCount}皿</p>
            <button onClick={() => handlePreparation(item)}>仕込みする</button>

            {item.ingredients.map((ingredient) => (
              <p key={ingredient.id}>
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
