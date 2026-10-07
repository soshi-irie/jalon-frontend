import { Polyline, useMapsLibrary } from "@vis.gl/react-google-maps";

export default function Route({
  encodedPolyline,
}: {
  encodedPolyline: string;
}) {
  const geometry = useMapsLibrary("geometry");
  const path = geometry?.encoding.decodePath(encodedPolyline);
  if (!path) return null;
  return (
    <Polyline
      path={path}
      strokeColor="#285d4d"
      strokeOpacity={0.9}
      strokeWeight={5}
    />
  );
}
