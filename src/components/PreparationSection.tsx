import type { Menu } from "../App";
import styles from "./PreparationSection.module.css";

type PreparationSectionProps = {
  menus: Menu[];
  sales: Record<number, number>;
  safetyMargin: number;
  preparedMenus: Record<number, boolean>;
  preparationMessage: Record<number, string>;
  setSafetyMargin: (value: number) => void;
  handlePreparation: (item: Menu) => void;
};

const PreparationSection = ({
  menus,
  sales,
  safetyMargin,
  preparedMenus,
  preparationMessage,
  setSafetyMargin,
  handlePreparation,
}: PreparationSectionProps) => {
  return (
    <>
      <section className={styles.section}>
        <h2>安全余裕</h2>

        <label className={styles.marginInput}>
          <input
            className={styles.input}
            type="number"
            value={safetyMargin}
            onChange={(e) => setSafetyMargin(Number(e.target.value))}
          />
          %
        </label>

        <h2 className={styles.preparationTitle}>仕込み</h2>
        <div className={styles.preparationList}>
          {menus.map((item) => {
            const salesCount = sales[item.id] ?? 0;

            const preparationCount = Math.ceil(
              salesCount * (1 + safetyMargin / 100),
            );

            return (
              <div className={styles.card} key={item.id}>
                <h3>{item.name}</h3>

                <p>仕込み数：{preparationCount}皿</p>

                <button
                  className={styles.button}
                  onClick={() => handlePreparation(item)}
                  disabled={preparedMenus[item.id]}
                >
                  {preparedMenus[item.id] ? "仕込み済み" : "仕込みする"}
                </button>

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
        </div>
      </section>
    </>
  );
};

export default PreparationSection;
