import SkeletonLoader from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export function Skeleton({ className }: { className?: string }) {
  return (
    <SkeletonLoader
      className={className}
      baseColor="var(--secondary-background)"
      highlightColor="var(--background)"
    />
  );
}
