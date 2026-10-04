import Image from "next/image";
import { cn } from "@/lib/utils";

/** The UnliSMS mark, cropped the same way as on the design canvas. */
export function LogoMark({ width, height, className, priority }: { width: number; height: number; className?: string; priority?: boolean }) {
  return (
    <Image
      src="/logo/logo.webp"
      alt="UnliSMS"
      width={width}
      height={height}
      priority={priority}
      className={cn("block object-cover object-[52%_50%]", className)}
      style={{ width, height }}
    />
  );
}
