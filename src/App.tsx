import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase.ts";
import "./App.css";
import HomePage from "./pages/HomePage";
import InventoryPage from "./pages/InventoryPage";
import NotFoundPage from "./pages/NotFoundPage.tsx";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

export type Ingredient = {
  id: number;
  name: string;
  weight: number;
};

export type Menu = {
  id: number;
  name: string;
  ingredients: Ingredient[];
};

export type Stock = {
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
  const [preparedMenus, setPreparedMenus] = useState<Record<number, boolean>>(
    {},
  );

  const [originalStock, setOriginalStock] = useState<Record<number, number>>(
    {},
  );

  const [inventoryError, setInventoryError] = useState("");
  const [stockMessage, setStockMessage] = useState<Record<number, string>>({});

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
        setInventoryError("在庫の取得に失敗しました");
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

    if (preparationCount <= 0) {
      setPreparationMessage((current) => ({
        ...current,
        [item.id]: "仕込み数が0皿です",
      }));
      return;
    }
    
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

    
    setPreparationMessage((current) => ({
      ...current,
      [item.id]: "仕込みが完了しました",
    }));

    setPreparedMenus((current) => ({
      ...current,
      [item.id]: true,
    }));
  };

  const handleStockUpdate = async (stockItem: Stock) => {
    const oldWeight = originalStock[stockItem.id];

    const { error } = await supabase
      .from("inventory")
      .update({
        weight: stockItem.weight,
      })
      .eq("id", stockItem.id);

    if (error) {
      console.error(error);

      if (oldWeight !== undefined) {
        setStock((currentStock) =>
          currentStock.map((item) =>
            item.id === stockItem.id ? { ...item, weight: oldWeight } : item,
          ),
        );
      }
      setStockMessage((current) => ({
        ...current,
        [stockItem.id]: "在庫の更新に失敗しました。元の値に戻しました。",
      }));

      return;
    }

    setOriginalStock((current) => {
      const newOriginalStock = { ...current };
      delete newOriginalStock[stockItem.id];
      return newOriginalStock;
    });

    setStockMessage((current) => {
      const newMessages = { ...current };
      delete newMessages[stockItem.id];
      return newMessages;
    });
  };
  return (
    <BrowserRouter>
      <header className="site-header">
        <h1>Sushi Manager</h1>
        <nav>
          <Link to="/">ホーム</Link>
          <Link to="/inventory">在庫管理</Link>
        </nav>
      </header>
      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                menus={menus}
                sales={sales}
                safetyMargin={safetyMargin}
                preparedMenus={preparedMenus}
                preparationMessage={preparationMessage}
                handleSalesChange={handleSalesChange}
                setSafetyMargin={setSafetyMargin}
                handlePreparation={handlePreparation}
              />
            }
          />

          <Route
            path="/inventory"
            element={
              <InventoryPage
                stock={stock}
                inventoryError={inventoryError}
                stockMessage={stockMessage}
                handleStockUpdate={handleStockUpdate}
                setStock={setStock}
                setOriginalStock={setOriginalStock}
              />
            }
          />

           <Route path="*" element={<NotFoundPage />} />

        </Routes>
      </main>
    </BrowserRouter>
  );
}
