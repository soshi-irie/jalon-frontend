type LatLng = { lat: number; lng: number };

export type DriveRoute = {
  encodedPolyline: string;
  distanceMeters: number;
  duration: string;
};

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

async function postRoute(path: string, body: object): Promise<DriveRoute> {
  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor de rutas.");
  }

  let result: unknown;
  try {
    result = await response.json();
  } catch {
    throw new Error("El servidor de rutas devolvió una respuesta no válida.");
  }

  if (!response.ok) {
    const serverMessage =
      typeof result === "object" &&
      result !== null &&
      "message" in result &&
      typeof result.message === "string"
        ? result.message
        : null;
    const localizedMessages: Record<string, string> = {
      "No driving route found": "No se encontró una ruta en auto entre esos lugares.",
      "Google Maps API key is not configured":
        "El servicio de rutas no está configurado.",
      "Google Routes API returned an error":
        "Google Maps no pudo calcular la ruta.",
      "Could not connect to Google Routes API":
        "No se pudo conectar con Google Maps.",
      "Internal server error":
        "Ocurrió un error interno en el servidor de rutas.",
    };
    const message = serverMessage
      ? localizedMessages[serverMessage] ??
        `No se pudo calcular la ruta (${response.status}).`
      : `No se pudo calcular la ruta (${response.status}).`;
    throw new Error(message);
  }

  return result as DriveRoute;
}

async function getRoute(
  origin: LatLng,
  destination: LatLng,
): Promise<DriveRoute> {
  return postRoute("/route", { origin, destination });
}

async function getRouteWithPassenger(
  driverOrigin: LatLng,
  riderOrigin: LatLng,
  riderDestination: LatLng,
  driverDestination: LatLng,
): Promise<DriveRoute> {
  return postRoute("/intermediate", {
    driverOrigin,
    riderOrigin,
    riderDestination,
    driverDestination,
  });
}

export const routeService = { getRoute, getRouteWithPassenger };
