import { Bus, Car, Plane, Train } from "lucide-react";

/** Returns the appropriate icon element for a transport type. */
export function getTransportIcon(
  type: string,
  className = "h-4 w-4",
): React.ReactNode {
  switch (type) {
    case "flight":
      return <Plane className={className} />;
    case "bus":
      return <Bus className={className} />;
    case "car":
      return <Car className={className} />;
    case "train":
      return <Train className={className} />;
    default:
      return <Plane className={className} />;
  }
}
