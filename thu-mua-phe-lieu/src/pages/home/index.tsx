import Banners from "./banners";
import FlashSales from "./flash-sales";

const HomePage: React.FunctionComponent = () => {
  return (
    <div className="min-h-full space-y-2 py-2">
      <div className="bg-section">
        <Banners />
      </div>
      <FlashSales />
    </div>
  );
};

export default HomePage;
