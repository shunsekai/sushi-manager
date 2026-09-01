import type { Stock } from "../App";
import InventorySection from "../components/InventorySection";

type InventoryPageProps = {
  stock: Stock[];
  inventoryError: string;
  stockMessage: Record<number, string>;
  handleStockUpdate: (stockItem: Stock) => void;
  setStock: React.Dispatch<React.SetStateAction<Stock[]>>;
  setOriginalStock: React.Dispatch<
    React.SetStateAction<Record<number, number>>
  >;
};

const InventoryPage = ({
  stock,
  inventoryError,
  stockMessage,
  handleStockUpdate,
  setStock,
  setOriginalStock,
}: InventoryPageProps) => {
  return (
    <InventorySection
      stock={stock}
      inventoryError={inventoryError}
      stockMessage={stockMessage}
      handleStockUpdate={handleStockUpdate}
      setStock={setStock}
      setOriginalStock={setOriginalStock}
    />
  );
};

export default InventoryPage;
