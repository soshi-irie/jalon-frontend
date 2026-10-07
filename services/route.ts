type LatLng = { lat: number; lng: number };

export type DriveRoute = {
  encodedPolyline: string;
  distanceMeters: number;
  duration: string;
};

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

async function getRoute(
  origin: LatLng,
  destination: LatLng,
): Promise<DriveRoute> {
  const response = await fetch(`${apiBaseUrl}/route`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      origin,
      destination,
    }),
  });

  const result: unknown = await response.json();

  if (!response.ok) {
    const message =
      typeof result === "object" &&
      result !== null &&
      "message" in result &&
      typeof result.message === "string"
        ? result.message
        : `Route request failed (${response.status})`;
    throw new Error(message);
  }

  return result as DriveRoute;
}

async function getRouteWithPassenger(
  driverOrigin: LatLng,
  riderOrigin: LatLng,
  riderDestination: LatLng,
  driverDestination: LatLng,
): Promise<DriveRoute> {
  const response = await fetch(`${apiBaseUrl}/intermediate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      driverOrigin,
      riderOrigin,
      riderDestination,
      driverDestination,
    }),
  });

  const result: unknown = await response.json();

  if (!response.ok) {
    const message =
      typeof result === "object" &&
      result !== null &&
      "message" in result &&
      typeof result.message === "string"
        ? result.message
        : `Route request failed (${response.status})`;
    throw new Error(message);
  }

  return result as DriveRoute;
}

export const routeService = { getRoute, getRouteWithPassenger };
