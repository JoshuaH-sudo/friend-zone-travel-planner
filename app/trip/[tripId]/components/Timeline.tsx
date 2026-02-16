import { ReactNode } from "react";

interface TimelineProps {
  children: ReactNode;
  className?: string;
  lineClassName?: string;
  endMarker?: ReactNode;
}

export function Timeline({
  children,
  className,
  lineClassName = "absolute top-4 bottom-0 left-0 border-l-2",
  endMarker,
}: TimelineProps) {
  return (
    <div className={className ? `relative ${className}` : "relative"}>
      <div className={lineClassName} />
      {children}
      {endMarker}
    </div>
  );
}
