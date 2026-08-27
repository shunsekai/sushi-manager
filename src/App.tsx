/*import { menu, SushiMenu } from "./data/menu.ts";*/
import { useState, useEffect } from "react";
/*import { inventory } from "./data/inventory.ts";*/
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

type Stock = {
  id: number;
  ingredient_id: number;
  name: string;
  weight: number;
};
export default function App() {
  const [sales, setSales] = useState<Record<number, number>>({});
  const [safetyMargin, setSafetyMargin] = useState(10);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [stock, setStock] = useState<Stock[]>([]);
  const [preparationMessage, setPreparationMessage] = useState<
    Record<number, string>
  >({});

  useEffect(() => {
    const fetchMenus = async () => {
      const { data, error } = await supabase
        .from("menus")
        .select(
          `
    id,
    name,
    menu_ingredients (weight,
      ingredients (
        id,
        name
      )
    )
  `,
        )
        .order("id", { ascending: true });
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

  useEffect(() => {
    const fetchInventory = async () => {
      const { data, error } = await supabase
        .from("inventory")
        .select(
          `
        id,
        ingredient_id,
        weight,
        ingredients (
          id,
          name
        )
      `,
        )
        .order("id", { ascending: true });

      if (error) {
        console.error(error);
        return;
      }

      const inventoryData = data
        .map((item) => {
          if (!item.ingredient_id || !item.ingredients) {
            return null;
          }

          return {
            id: item.id,
            ingredient_id: item.ingredient_id,
            name: item.ingredients.name ?? "",
            weight: item.weight ?? 0,
          };
        })
        .filter((item) => item !== null);

      setStock(inventoryData);
    };

    fetchInventory();
  }, []);

  const handleSalesChange = (menuId: number, count: number) => {
    setSales((currentSales) => ({
      ...currentSales,
      [menuId]: count,
    }));
  };

  const handlePreparation = async (item: Menu) => {
    const salesCount = sales[item.id] ?? 0;

    const preparationCount = Math.ceil(salesCount * (1 + safetyMargin / 100));

    // ① 全材料の在庫をチェック
    for (const ingredient of item.ingredients) {
      const stockItem = stock.find(
        (stockItem) => stockItem.ingredient_id === ingredient.id,
      );

      if (!stockItem) {
        setPreparationMessage((current) => ({
          ...current,
          [item.id]: `${ingredient.name}の在庫がありません`,
        }));
        return;
      }

      const requiredWeight = ingredient.weight * preparationCount;

      if (stockItem.weight < requiredWeight) {
        setPreparationMessage((current) => ({
          ...current,
          [item.id]: `${stockItem.name}の在庫が足りません`,
        }));
        return;
      }
    }

    // ② 全材料が足りていたらDBを更新
    for (const ingredient of item.ingredients) {
      const stockItem = stock.find(
        (stockItem) => stockItem.ingredient_id === ingredient.id,
      );

      if (!stockItem) {
        return;
      }

      const requiredWeight = ingredient.weight * preparationCount;

      const newWeight = stockItem.weight - requiredWeight;

      const { error } = await supabase
        .from("inventory")
        .update({
          weight: newWeight,
        })
        .eq("id", stockItem.id);

      if (error) {
        console.error(error);

        setPreparationMessage((current) => ({
          ...current,
          [item.id]: "在庫の更新に失敗しました",
        }));

        return;
      }
    }

    // ③ ブラウザ側の在庫も更新
    setStock((currentStock) =>
      currentStock.map((stockItem) => {
        const ingredient = item.ingredients.find(
          (ingredient) => ingredient.id === stockItem.ingredient_id,
        );

        if (!ingredient) {
          return stockItem;
        }

        const requiredWeight = ingredient.weight * preparationCount;

        return {
          ...stockItem,
          weight: stockItem.weight - requiredWeight,
        };
      }),
    );

    // ④ 成功メッセージ
    setPreparationMessage((current) => ({
      ...current,
      [item.id]: "仕込みが完了しました",
    }));
  };

  const handleStockUpdate = async (stockItem: Stock) => {
    const { error } = await supabase
      .from("inventory")
      .update({
        weight: stockItem.weight,
      })
      .eq("id", stockItem.id);

    if (error) {
      console.error(error);
      return;
    }
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
              value={sales[item.id] ?? 0}
              onChange={(e) =>
                handleSalesChange(item.id, Number(e.target.value))
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
        const salesCount = sales[item.id] ?? 0;

        const preparationCount = Math.ceil(
          salesCount * (1 + safetyMargin / 100),
        );

        return (
          <div key={item.id}>
            <h3>{item.name}</h3>

            <p>仕込み数：{preparationCount}皿</p>
            <button onClick={() => handlePreparation(item)}>仕込みする</button>

            {preparationMessage[item.id] && (
              <p>{preparationMessage[item.id]}</p>
            )}
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
        <div key={stockItem.id}>
          <label>
            {stockItem.name}：
            <input
              type="number"
              value={stockItem.weight}
              onChange={(e) => {
                const weight = Number(e.target.value);

                setStock((currentStock) =>
                  currentStock.map((item) =>
                    item.id === stockItem.id ? { ...item, weight } : item,
                  ),
                );
              }}
            />
            g
          </label>

          <button onClick={() => handleStockUpdate(stockItem)}>更新</button>
        </div>
      ))}
    </>
  );
}
