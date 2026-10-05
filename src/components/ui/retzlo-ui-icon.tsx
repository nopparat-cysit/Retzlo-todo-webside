import Image from "next/image";

const RETZLO_UI_ICON_ASSETS = {
  storyPoint: "/stickers/ui-icons-retzlo/retzlo-ui-story-point-zap.png",
  diary: "/stickers/ui-icons-retzlo/retzlo-ui-notebook.png",
  coffee: "/stickers/ui-icons-retzlo/retzlo-ui-coffee-heart.png"
} as const;

export type RetzloUiIconName = keyof typeof RETZLO_UI_ICON_ASSETS;

export function RetzloUiIcon({
  name,
  size = 16,
  className = ""
}: {
  name: RetzloUiIconName;
  size?: number;
  className?: string;
}) {
  return (
    <Image
      aria-hidden="true"
      alt=""
      className={`shrink-0 object-contain ${className}`.trim()}
      height={size}
      src={RETZLO_UI_ICON_ASSETS[name]}
      width={size}
    />
  );
}
