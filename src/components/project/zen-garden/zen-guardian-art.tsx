import { cn } from "@/lib/utils";
import { ZenFloraRenderer } from "./zen-vector-art";
import gardenSkin from "./zen-garden-skin.module.css";

const illustratedPlants = new Set([
  "sprout", "blossom", "bamboo", "aloe", "lotus",
  "pampas", "bonsai", "fungi", "ginkgo", "willow"
]);

export function ZenGuardianArt({ plantId, stage = 4, className }: {
  plantId: string;
  stage?: 1 | 2 | 3 | 4 | 5;
  className?: string;
}) {
  if (!illustratedPlants.has(plantId)) {
    return <ZenFloraRenderer plantId={plantId} stage={stage} className={className} />;
  }
  return (
    <span
      aria-hidden="true"
      className={cn(gardenSkin.botanicalArt, className)}
      style={{ backgroundImage: `url("/zen-garden/plants/${plantId}.webp")` }}
    />
  );
}
