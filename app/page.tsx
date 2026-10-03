/// <reference types="google.maps" />
"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  ButtonBase,
  Chip,
  Container,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  APIProvider,
  ControlPosition,
  Map,
  MapControl,
  Marker,
  Polyline,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";

type Coordinate = { lat: number; lng: number };
type TripPlace = { placeId: string; name: string; location: Coordinate };
type TripRoute = {
  encodedPolyline: string;
  distanceMeters: number;
  durationSeconds: number;
  origin: Coordinate;
  destination: Coordinate;
};

function PlaceInput({ label, value, onChange }: {
  label: string;
  value: string;
  onChange: (value: string, place: TripPlace | null) => void;
}) {
  const places = useMapsLibrary("places");
  const host = useRef<HTMLDivElement>(null);
  const input = useRef<{ value: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const notifyChange = useEffectEvent(onChange);

  useEffect(() => {
    if (!places || !host.current) return;

    let disposed = false;
    let revision = 0;
    const widget = new places.PlaceAutocompleteElement({
      placeholder: label,
      requestedLanguage: "en",
    });
    widget.setAttribute("aria-label", label);
    widget.style.width = "100%";
    widget.style.colorScheme = "light";
    input.current = widget;
    host.current.appendChild(widget);
    widget.addEventListener("input", () => {
      revision += 1;
      setError(null);
      notifyChange(widget.value, null);
    });
    widget.addEventListener("gmp-error", () => {
      setError("Address search is unavailable. Check Places API configuration.");
    });
    widget.addEventListener("gmp-select", async (event) => {
      const selectionRevision = ++revision;
      notifyChange(widget.value, null);
      setError(null);
      try {
        const place = event.placePrediction.toPlace();
        await place.fetchFields({ fields: ["id", "displayName", "formattedAddress", "location"] });
        if (disposed || selectionRevision !== revision) return;
        if (!place.location) throw new Error("This place has no location.");
        const name = place.formattedAddress || place.displayName || widget.value;
        notifyChange(name, {
          placeId: place.id,
          name,
          location: { lat: place.location.lat(), lng: place.location.lng() },
        });
      } catch {
        if (!disposed && selectionRevision === revision) {
          setError("Unable to load this place. Please select it again.");
        }
      }
    });

    return () => {
      disposed = true;
      input.current = null;
      widget.remove();
    };
  }, [places, label]);

  useEffect(() => {
    if (input.current && input.current.value !== value) input.current.value = value;
  }, [value, places]);

  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="caption" component="div" sx={{ mb: 0.5 }}>{label}</Typography>
      <Box ref={host} sx={{ minHeight: 48 }} />
      {!places && <TextField fullWidth disabled size="small" placeholder="Loading address search..." />}
      {error && <Typography role="alert" variant="caption" color="error.main">{error}</Typography>}
    </Box>
  );
}

function RouteDisplay({ route }: { route: TripRoute | null }) {
  const map = useMap();
  const geometry = useMapsLibrary("geometry");
  const core = useMapsLibrary("core");

  useEffect(() => {
    if (!map || !geometry || !core || !route) return;
    const bounds = new core.LatLngBounds();
    const path = geometry.encoding.decodePath(route.encodedPolyline);
    if (!path.length) return;
    path.forEach((point) => bounds.extend(point));
    map.fitBounds(bounds, 48);
  }, [map, geometry, core, route]);

  if (!route || !geometry) return null;

  return (
    <>
      <Polyline path={geometry.encoding.decodePath(route.encodedPolyline)} strokeColor="#285d4d" strokeWeight={5} />
      <Marker position={route.origin} label="A" title="From" />
      <Marker position={route.destination} label="B" title="To" />
    </>
  );
}

const passengers = [
  {
    id: "katie",
    name: "Katie",
    initials: "KT",
    pickup: "Mission Dolores Park",
    destination: "San Francisco Airport",
    detour: 4,
    fee: 6,
    color: "#e8eee6",
  },
  {
    id: "marcus",
    name: "Marcus",
    initials: "MR",
    pickup: "24th Street BART",
    destination: "Millbrae Station",
    detour: 7,
    fee: 8,
    color: "#f3ebcf",
  },
  {
    id: "sofia",
    name: "Sofia",
    initials: "SF",
    pickup: "Glen Park Station",
    destination: "San Bruno",
    detour: 9,
    fee: 5,
    color: "#e7e9f0",
  },
];

function CurrentLocation({ onLocated, centerOnLocation }: {
  onLocated: (location: Coordinate) => void;
  centerOnLocation: boolean;
}) {
  const map = useMap();
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const handleLocation = useEffectEvent((location: Coordinate) => {
    onLocated(location);
    if (centerOnLocation) {
      map?.panTo(location);
      map?.setZoom(15);
    }
  });

  useEffect(() => {
    if (!map) return;

    let cancelled = false;

    new Promise<GeolocationPosition>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Location is not supported by your browser."));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        (locationError) => {
          const message = locationError.code === 1
            ? "Location access denied. Allow location access in your browser settings."
            : locationError.code === 3
              ? "Finding your location timed out. Please reload to try again."
              : "Your location is unavailable. Please reload to try again.";
          reject(new Error(message));
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
      );
    })
      .then(({ coords }) => {
        if (cancelled) return;

        const location = { lat: coords.latitude, lng: coords.longitude };
        setPosition(location);
        handleLocation(location);
      })
      .catch((locationError: Error) => {
        if (!cancelled) setError(locationError.message);
      });

    return () => {
      cancelled = true;
    };
  }, [map]);

  return (
    <>
      {position && <Marker position={position} title="You are here" />}
      {!position && (
        <MapControl position={ControlPosition.BOTTOM_CENTER}>
          <Alert severity={error ? "warning" : "info"} sx={{ m: 1, maxWidth: 360 }}>
            {error || "Finding your location..."}
          </Alert>
        </MapControl>
      )}
    </>
  );
}

export default function Home() {
  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""} language="en">
      <RidePage />
    </APIProvider>
  );
}

function RidePage() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [fromPlace, setFromPlace] = useState<TripPlace | null>(null);
  const [toPlace, setToPlace] = useState<TripPlace | null>(null);
  const [currentPosition, setCurrentPosition] = useState<Coordinate | null>(null);
  const [route, setRoute] = useState<TripRoute | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const routeRequest = useRef<AbortController | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedPassenger = passengers.find(
    (passenger) => passenger.id === selectedId,
  );

  useEffect(() => () => routeRequest.current?.abort(), []);

  function updatePlace(field: "from" | "to", value: string, place: TripPlace | null) {
    routeRequest.current?.abort();
    setLoadingRoute(false);
    setRoute(null);
    setRouteError(null);
    setSelectedId(null);
    if (field === "from") {
      setOrigin(value);
      setFromPlace(place);
    } else {
      setDestination(value);
      setToPlace(place);
    }
  }

  async function findRoute() {
    if (!fromPlace || !toPlace) return;
    routeRequest.current?.abort();
    const controller = new AbortController();
    routeRequest.current = controller;
    setLoadingRoute(true);
    setRouteError(null);
    setRoute(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await fetch(`${apiUrl.replace(/\/$/, "")}/routes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin: fromPlace.location, destination: toPlace.location }),
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(typeof result.message === "string" ? result.message : "Unable to calculate a route.");
      }
      if (controller.signal.aborted) return;
      setRoute({ ...result, origin: fromPlace.location, destination: toPlace.location });
    } catch (error) {
      if (!controller.signal.aborted) {
        setRouteError(error instanceof Error ? error.message : "Unable to calculate a route. Please try again.");
      }
    } finally {
      if (!controller.signal.aborted) setLoadingRoute(false);
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Box component="header" sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Container maxWidth="lg">
          <Stack
            direction="row"
            sx={{
              alignItems: "center",
              justifyContent: "space-between",
              minHeight: 80,
            }}
          >
            <Typography
              component="h1"
              sx={{ fontSize: 28, fontWeight: 800, color: "primary.main" }}
            >
              JALÓN
              <Box component="span" sx={{ color: "secondary.main" }}>
                .
              </Box>
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <Typography variant="body2" color="text.secondary">
                David
              </Typography>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: "primary.light",
                  color: "primary.dark",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                DA
              </Avatar>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container component="main" maxWidth="sm" sx={{ flex: 1, py: 5 }}>
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: "center", justifyContent: "space-between", mb: 3 }}
        >
          <Typography component="h2" variant="h5">
            Your next ride
          </Typography>
          <Chip
            label="Driving"
            size="small"
            sx={{ bgcolor: "primary.light", color: "primary.dark" }}
          />
        </Stack>

        <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
          <PlaceInput
            label="From"
            value={origin}
            onChange={(value, place) => updatePlace("from", value, place)}
          />
          <PlaceInput
            label="To"
            value={destination}
            onChange={(value, place) => updatePlace("to", value, place)}
          />
        </Stack>
        <Stack direction="row" spacing={2} sx={{ mb: 2.5, justifyContent: "space-between" }}>
          <Button
            size="small"
            disabled={!currentPosition}
            onClick={() => {
              if (currentPosition) updatePlace("from", "Current location", {
                placeId: "current-location",
                name: "Current location",
                location: currentPosition,
              });
            }}
          >Use current location</Button>
          <Button variant="contained" disabled={!fromPlace || !toPlace || loadingRoute} onClick={findRoute}>
            {loadingRoute ? "Finding route..." : "Find route"}
          </Button>
        </Stack>
        {routeError && <Alert severity="error" sx={{ mb: 2 }}>{routeError}</Alert>}
          <Map
            defaultCenter={{ lat: 37.7749, lng: -122.4194 }}
            defaultZoom={12}
            style={{ width: "100%", aspectRatio: "1 / 1" }}
            gestureHandling="cooperative"
          >
            <CurrentLocation onLocated={setCurrentPosition} centerOnLocation={!fromPlace && !toPlace} />
            <RouteDisplay route={route} />
          </Map>

        <Box aria-live="polite" sx={{ py: 2.5 }}>
          {route && <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {(route.distanceMeters / 1000).toFixed(1)} km · {Math.ceil(route.durationSeconds / 60)} min driving
          </Typography>}
          <Typography variant="overline" color="text.secondary">
            {selectedPassenger ? "Shared route" : "Your route"}
          </Typography>
          <Typography
            variant="body2"
            sx={{ mt: 0.5, overflowWrap: "anywhere" }}
          >
            {origin.trim() || "Choose an origin"}
            {selectedPassenger &&
              ` → ${selectedPassenger.pickup} → ${selectedPassenger.destination}`}
            {(!selectedPassenger ||
              selectedPassenger.destination !== destination.trim()) &&
              ` → ${destination.trim() || "Choose a destination"}`}
          </Typography>
          {selectedPassenger && (
            <Stack
              direction="row"
              spacing={2}
              sx={{
                alignItems: "center",
                justifyContent: "space-between",
                mt: 1.5,
              }}
            >
              <Typography variant="body2" color="primary.main">
                Pick up {selectedPassenger.name} · +{selectedPassenger.detour}{" "}
                min · ${selectedPassenger.fee} contribution
              </Typography>
              <Button size="small" onClick={() => setSelectedId(null)}>
                Clear
              </Button>
            </Stack>
          )}
        </Box>

        <Divider />

        <Box
          component="section"
          aria-labelledby="passengers-heading"
          sx={{ pt: 3 }}
        >
          <Stack
            direction="row"
            sx={{
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Typography id="passengers-heading" component="h2" variant="h6">
              People along your way
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {passengers.length} riders
            </Typography>
          </Stack>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mb: 2 }}
          >
            Sample matches · Fees and detours are estimates
          </Typography>

          <Stack spacing={1}>
            {passengers.map((passenger, index) => {
              const isSelected = passenger.id === selectedId;

              return (
                <ButtonBase
                  key={passenger.id}
                  aria-pressed={isSelected}
                  aria-label={`${isSelected ? "Deselect" : "Select"} ${passenger.name}, pickup at ${passenger.pickup}, destination ${passenger.destination}, ${passenger.detour} minute detour, $${passenger.fee} contribution`}
                  onClick={() =>
                    setSelectedId(isSelected ? null : passenger.id)
                  }
                  sx={{
                    width: "100%",
                    p: 2,
                    textAlign: "left",
                    display: "block",
                    border: 1,
                    borderColor: isSelected ? "primary.main" : "divider",
                    borderRadius: 1,
                    bgcolor: isSelected ? "#f0f6f3" : "background.paper",
                    transition: "background-color 150ms, border-color 150ms",
                    "&:hover": { bgcolor: "#f0f6f3" },
                    "&.Mui-focusVisible": {
                      outline: "2px solid",
                      outlineColor: "primary.main",
                      outlineOffset: 3,
                    },
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{ alignItems: "center" }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: passenger.color,
                        color: "text.primary",
                        width: 44,
                        height: 44,
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                    >
                      {passenger.initials}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: "center", mb: 0.5 }}
                      >
                        <Typography variant="subtitle2">
                          {passenger.name}
                        </Typography>
                        {index === 0 && (
                          <Chip
                            label="Closest match"
                            size="small"
                            sx={{
                              height: 22,
                              bgcolor: "#f3ebcf",
                              fontSize: 10,
                            }}
                          />
                        )}
                        {isSelected && (
                          <Typography variant="caption" color="primary.main">
                            Selected
                          </Typography>
                        )}
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {passenger.pickup}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        To {passenger.destination}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                      <Typography variant="subtitle2">
                        ${passenger.fee}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        +{passenger.detour} min
                      </Typography>
                    </Box>
                  </Stack>
                </ButtonBase>
              );
            })}
          </Stack>
        </Box>
      </Container>

      <Box
        component="footer"
        sx={{
          borderTop: 1,
          borderColor: "divider",
          py: 3,
          textAlign: "center",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          © {new Date().getFullYear()} JALÓN. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}
