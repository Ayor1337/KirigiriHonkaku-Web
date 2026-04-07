import { LoadingSpinner } from "./LoadingSpinner";

interface LoadingOverlayProps {
  className?: string;
  spinnerSize?: "sm" | "md" | "lg";
}

export function LoadingOverlay({
  className = "",
  spinnerSize = "md",
}: LoadingOverlayProps) {
  return (
    <div
      className={`absolute inset-0 z-20 flex items-center justify-center bg-(--bg-primary)/60 backdrop-blur-[1px] ${className}`}
    >
      <LoadingSpinner size={spinnerSize} />
    </div>
  );
}
