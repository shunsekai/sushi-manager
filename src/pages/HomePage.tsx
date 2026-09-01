import type { Menu } from "../App";
import SalesSection from "../components/SalesSection";
import PreparationSection from "../components/PreparationSection";

type HomePageProps = {
  menus: Menu[];
  sales: Record<number, number>;
  safetyMargin: number;
  preparedMenus: Record<number, boolean>;
  preparationMessage: Record<number, string>;
  handleSalesChange: (menuId: number, count: number) => void;
  setSafetyMargin: (value: number) => void;
  handlePreparation: (item: Menu) => void;
};

const HomePage = ({
  menus,
  sales,
  safetyMargin,
  preparedMenus,
  preparationMessage,
  handleSalesChange,
  setSafetyMargin,
  handlePreparation,
}: HomePageProps) => {
  return (
    <>
      <SalesSection
        menus={menus}
        sales={sales}
        handleSalesChange={handleSalesChange}
      />

      <PreparationSection
        menus={menus}
        sales={sales}
        safetyMargin={safetyMargin}
        preparedMenus={preparedMenus}
        preparationMessage={preparationMessage}
        setSafetyMargin={setSafetyMargin}
        handlePreparation={handlePreparation}
      />
    </>
  );
};

export default HomePage;
