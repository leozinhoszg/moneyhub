import Link from "next/link";
import Image from "next/image";

type LogoSize = "sm" | "md" | "lg";

const sizeMap: Record<
  LogoSize,
  { icon: number; text: string; gap: string }
> = {
  sm: { icon: 18, text: "text-[14px]", gap: "gap-2" },
  md: { icon: 32, text: "text-[18px]", gap: "gap-2.5" },
  lg: { icon: 48, text: "text-[26px]", gap: "gap-3" },
};

interface LogoProps {
  /** Visual size preset */
  size?: LogoSize;
  /** Link destination. Pass `false` to render without anchor wrapper. */
  href?: string | false;
  /** Use white "Money" for dark backgrounds. "Hub" stays brand green. */
  inverted?: boolean;
  className?: string;
}

export default function Logo({
  size = "md",
  href = "/",
  inverted = false,
  className = "",
}: LogoProps) {
  const s = sizeMap[size];

  const moneyColor = inverted ? "#ffffff" : "#013a56";
  const hubColor = "#39cc60";

  const content = (
    <span className={`inline-flex items-center ${s.gap} ${className}`}>
      <Image
        src="/logo_money_hub.png"
        alt="MoneyHub"
        width={s.icon}
        height={s.icon}
        className="object-contain"
        priority
      />
      <span
        className={`${s.text} font-bold tracking-tight leading-none whitespace-nowrap`}
        style={{ fontFamily: "var(--font-body), ui-sans-serif, system-ui" }}
      >
        <span style={{ color: moneyColor }}>Money</span>
        <span style={{ color: hubColor }}>Hub</span>
      </span>
    </span>
  );

  if (href === false) return content;
  return <Link href={href}>{content}</Link>;
}
