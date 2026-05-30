import Carousel from "@/components/carousel";
import { useAtomValue } from "jotai";
import { bannersState } from "@/state";

export default function Banners() {
  const banners = useAtomValue(bannersState);

  return (
    <Carousel
      slides={banners.map((banner) => (
        <img 
          key={banner} 
          className="w-full rounded-lg aspect-[2/1] object-cover" 
          src={banner} 
          alt="Banner Thu Mua Phế Liệu" 
        />
      ))}
    />
  );
}
