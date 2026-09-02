import type { Menu } from "../App";
import styles from "./SalesSection.module.css";

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
    <section className={styles.section}>
      <h2>今日の売上</h2>
      <div className={styles.salesList}>
        {menus.map((item) => (
          <div className={styles.salesItem} key={item.id}>
            <label>
              {item.name}：
              <input
                className={styles.input}
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
      </div>
    </section>
  );
}
