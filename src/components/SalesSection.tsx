import type { Menu } from "../App";

type SalesSectionProps = {
  menus: Menu[];
  sales: Record<number, number>;
  handleSalesChange: (menuId: number, count: number) => void;
};

export default function SalesSection({
  menus,
  sales,
  handleSalesChange,
}: SalesSectionProps) {
  return (
    <section>
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
    </section>
  );
}
