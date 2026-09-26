import { cn } from "@/lib/utils";

interface ClubInitialAvatarProps {
  name?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-10 w-10 rounded-xl text-lg",
  md: "h-14 w-14 rounded-2xl text-2xl",
  lg: "h-24 w-24 rounded-3xl text-5xl",
};

const toneClasses = [
  "bg-primary",
  "bg-primary/90",
  "bg-primary/80",
  "bg-primary/70",
];

const getInitial = (name?: string | null) => {
  const firstCharacter = name?.trim().match(/[\p{L}\p{N}]/u)?.[0];
  return firstCharacter?.toLocaleUpperCase() || "B";
};

const ClubInitialAvatar = ({ name, size = "md", className }: ClubInitialAvatarProps) => {
  const initial = getInitial(name);
  const tone = toneClasses[(initial.codePointAt(0) ?? 0) % toneClasses.length];

  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center font-black text-primary-foreground shadow-sm",
        sizeClasses[size],
        tone,
        className,
      )}
    >
      {initial}
    </div>
  );
};

export default ClubInitialAvatar;