import type { Stock } from "../App";

type InventorySectionProps = {
  stock: Stock[];
  inventoryError: string;
  stockMessage: Record<number, string>;
  handleStockUpdate: (stockItem: Stock) => void;
  setStock: React.Dispatch<React.SetStateAction<Stock[]>>;
  setOriginalStock: React.Dispatch<
    React.SetStateAction<Record<number, number>>
  >;
};

const InventorySection = ({
  stock,
  inventoryError,
  stockMessage,
  handleStockUpdate,
  setStock,
  setOriginalStock,
}: InventorySectionProps) => {
  return (
    <>
      <h2>在庫</h2>

      {inventoryError && <p>{inventoryError}</p>}

      {stock.map((stockItem) => (
        <div key={stockItem.id}>
          <label>
            {stockItem.name}：
            <input
              type="number"
              value={stockItem.weight}
              onChange={(e) => {
                const weight = Number(e.target.value);

                setOriginalStock((current) => {
                  if (current[stockItem.id] === undefined) {
                    return {
                      ...current,
                      [stockItem.id]: stockItem.weight,
                    };
                  }

                  return current;
                });

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

          {stockMessage[stockItem.id] && <p>{stockMessage[stockItem.id]}</p>}
        </div>
      ))}
    </>
  );
};

export default InventorySection;
