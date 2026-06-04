import logo from "@/assets/balabagdar-logo.png";
import { cn } from "@/lib/utils";

type BrandLogoSize = "xs" | "sm" | "md" | "lg" | "xl";

interface BrandLogoProps {
  size?: BrandLogoSize;
  className?: string;
  alt?: string;
  /** Show white circular background with shadow (default true) */
  framed?: boolean;
}

const sizeMap: Record<BrandLogoSize, { box: string; img: string }> = {
  xs: { box: "w-6 h-6", img: "w-5 h-5" },
  sm: { box: "w-8 h-8", img: "w-6 h-6" },
  md: { box: "w-14 h-14", img: "w-11 h-11" },
  lg: { box: "w-20 h-20", img: "w-16 h-16" },
  xl: { box: "w-36 h-36", img: "w-32 h-32" },
};

const BrandLogo = ({ size = "sm", className, alt = "BalaBagdar", framed = true }: BrandLogoProps) => {
  const { box, img } = sizeMap[size];

  if (!framed) {
    return <img src={logo} alt={alt} className={cn(box, "object-contain", className)} />;
  }

  return (
    <span
      className={cn(
        box,
        "inline-flex items-center justify-center rounded-full bg-white shadow-sm shrink-0",
        className
      )}
    >
      <img src={logo} alt={alt} className={cn(img, "object-contain")} />
    </span>
  );
};

export default BrandLogo;
