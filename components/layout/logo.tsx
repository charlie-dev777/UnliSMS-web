import Image from "next/image";
import { cn } from "@/lib/utils";

/** The UnliSMS mark from /public/logo, cropped the same way as on the design canvas. */
export function LogoMark({ width, height, className, preload }: { width: number; height: number; className?: string; preload?: boolean }) {
  return (
    <Image
      src="/logo/logo.webp"
      alt="UnliSMS"
      width={width}
      height={height}
      preload={preload}
      className={cn("block object-cover object-[52%_50%]", className)}
      style={{ width, height }}
    />
  );
}
