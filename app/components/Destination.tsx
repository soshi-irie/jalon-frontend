/// <reference types="google.maps" />

"use client";

import {
  Autocomplete,
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  APIProvider,
  AdvancedMarker,
  Map,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { useEffect, useRef, useState } from "react";
import { routeService, type DriveRoute } from "../../services/route";
import RouteLine from "./Route";
import type { passenger } from "../page";

export default function Destination({
  passengers,
  onSearchStart,
  onEligiblePassengersChange,
}: {
  passengers: passenger[];
  onSearchStart: () => void;
  onEligiblePassengersChange: (passengers: passenger[]) => void;
}) {
  return (
    <APIProvider
      apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
      libraries={["places"]}
    >
      <DestinationContent
        passengers={passengers}
        onSearchStart={onSearchStart}
        onEligiblePassengersChange={onEligiblePassengersChange}
      />
    </APIProvider>
  );
}

type SelectedPlace = {
  label: string;
  location: google.maps.LatLngLiteral;
};

function FitTripBounds({
  origin,
  destination,
}: {
  origin: SelectedPlace | null;
  destination: SelectedPlace | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || !origin) return;

    if (!destination) {
      map.panTo(origin.location);
      map.setZoom(13);
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    bounds.extend(origin.location);
    bounds.extend(destination.location);
    map.fitBounds(bounds, 64);
  }, [destination, map, origin]);

  return null;
}

function distanceFromDirectSegmentMeters(
  point: google.maps.LatLngLiteral,
  start: google.maps.LatLngLiteral,
  end: google.maps.LatLngLiteral,
) {
  const radiansPerDegree = Math.PI / 180;
  const metersPerLatitudeDegree = 111_132;
  const averageLatitudeRadians =
    ((start.lat + end.lat + point.lat) / 3) * radiansPerDegree;
  const metersPerLongitudeDegree =
    111_320 * Math.cos(averageLatitudeRadians);
  const endX = (end.lng - start.lng) * metersPerLongitudeDegree;
  const endY = (end.lat - start.lat) * metersPerLatitudeDegree;
  const pointX = (point.lng - start.lng) * metersPerLongitudeDegree;
  const pointY = (point.lat - start.lat) * metersPerLatitudeDegree;
  const segmentLengthSquared = endX * endX + endY * endY;
  const projection =
    segmentLengthSquared === 0
      ? 0
      : Math.max(
          0,
          Math.min(1, (pointX * endX + pointY * endY) / segmentLengthSquared),
        );

  return Math.hypot(pointX - projection * endX, pointY - projection * endY);
}

function PlaceAutocompleteField({
  label,
  inputValue,
  selectedPlace,
  onInputValueChange,
  onPlaceSelect,
}: {
  label: string;
  inputValue: string;
  selectedPlace: SelectedPlace | null;
  onInputValueChange: (value: string) => void;
  onPlaceSelect: (place: SelectedPlace | null) => void;
}) {
  const places = useMapsLibrary("places");
  const sessionToken =
    useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const [predictions, setPredictions] = useState<
    google.maps.places.PlacePrediction[]
  >([]);

  useEffect(() => {
    if (!places || selectedPlace || inputValue.trim().length < 3) return;

    let isCurrentRequest = true;
    const timeoutId = window.setTimeout(async () => {
      try {
        sessionToken.current ??= new places.AutocompleteSessionToken();
        const { suggestions } =
          await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input: inputValue.trim(),
            sessionToken: sessionToken.current,
          });

        if (isCurrentRequest) {
          setPredictions(
            suggestions.flatMap((suggestion) =>
              suggestion.placePrediction ? [suggestion.placePrediction] : [],
            ),
          );
        }
      } catch {
        if (isCurrentRequest) setPredictions([]);
      }
    }, 250);

    return () => {
      isCurrentRequest = false;
      window.clearTimeout(timeoutId);
    };
  }, [inputValue, places, selectedPlace]);

  async function handlePredictionSelect(
    prediction: google.maps.places.PlacePrediction,
  ) {
    const placeDetails = prediction.toPlace();
    await placeDetails.fetchFields({
      fields: ["formattedAddress", "location"],
    });

    const location = placeDetails.location?.toJSON();
    if (!location) return;

    const place = {
      label: placeDetails.formattedAddress ?? prediction.text.toString(),
      location,
    };

    onInputValueChange(place.label);
    onPlaceSelect(place);
    sessionToken.current = null;
    setPredictions([]);
  }

  return (
    <Autocomplete<google.maps.places.PlacePrediction>
      fullWidth
      options={predictions}
      value={null}
      inputValue={inputValue}
      filterOptions={(options) => options}
      getOptionLabel={(option) => option.text.toString()}
      getOptionKey={(option) => option.placeId}
      noOptionsText={
        inputValue.trim().length < 3
          ? "Type at least 3 characters"
          : "No places found"
      }
      onInputChange={(_, value, reason) => {
        if (reason !== "input" && reason !== "clear") return;
        onInputValueChange(value);
        onPlaceSelect(null);
        setPredictions([]);
      }}
      onChange={(_, prediction) => {
        if (prediction) void handlePredictionSelect(prediction);
      }}
      renderInput={(params) => (
        <TextField {...params} label={label} size="small" required />
      )}
    />
  );
}

function DestinationContent({
  passengers,
  onSearchStart,
  onEligiblePassengersChange,
}: {
  passengers: passenger[];
  onSearchStart: () => void;
  onEligiblePassengersChange: (passengers: passenger[]) => void;
}) {
  const [pos, setPos] = useState<GeolocationPosition | null>(null);
  const [originLabel, setOriginLabel] = useState("");
  const [destinationLabel, setDestinationLabel] = useState("");
  const [origin, setOrigin] = useState<SelectedPlace | null>(null);
  const [destination, setDestination] = useState<SelectedPlace | null>(null);
  const [route, setRoute] = useState<DriveRoute | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (location: GeolocationPosition) => {
        setPos(location);
        setOriginLabel("Current Location");
        setOrigin({
          label: "Current Location",
          location: {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
          },
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            console.error("User denined the request for Geolocation");
            break;
          case error.POSITION_UNAVAILABLE:
            console.error("Location information is unavailable");
            break;
          case error.TIMEOUT:
            console.error("The request to get user location timed out.");
            break;
          default:
            console.error("An unknown error occured.");
            break;
        }
      },
      {
        enableHighAccuracy: true, // Use GPS if available
        timeout: 10000,
        maximumAge: 0, // Prevent cache from giving inaccurate information
      },
    );
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!origin || !destination) {
      setErrorMessage("Choose a suggested place for both locations.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setRoute(null);
    onSearchStart();

    try {
      const directRoute = await routeService.getRoute(
        origin.location,
        destination.location,
      );

      setRoute(directRoute);

      const nearbyPassengers = passengers.filter(
        (passenger) =>
          distanceFromDirectSegmentMeters(
            passenger.pickup.location,
            origin.location,
            destination.location,
          ) <= 3_000,
      );

      const evaluatedPassengers = await Promise.all(
        nearbyPassengers.map(async (passenger) => {
          const passengerRoute = await routeService.getRouteWithPassenger(
            origin.location,
            passenger.pickup.location,
            passenger.destination.location,
            destination.location,
          );
          const detourDistanceMeters = Math.max(
            0,
            passengerRoute.distanceMeters - directRoute.distanceMeters,
          );
          const detourSeconds = Math.max(
            0,
            Number.parseFloat(passengerRoute.duration) -
              Number.parseFloat(directRoute.duration),
          );

          return {
            ...passenger,
            detour: Math.ceil(detourSeconds / 60),
            detourDistanceMeters,
          };
        }),
      );

      onEligiblePassengersChange(
        evaluatedPassengers
          .filter((passenger) => passenger.detourDistanceMeters < 10_000)
          .sort(
            (first, second) =>
              first.detourDistanceMeters - second.detourDistanceMeters,
          ),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not find a route.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Box component="section" sx={{ width: "47%" }}>
      <Stack
        direction="row"
        spacing={2}
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Typography component="h2" variant="h5">
          Enter your destination to find riders
        </Typography>
      </Stack>

      <Box component="form" onSubmit={handleSubmit}>
        <Stack direction="row" spacing={2} sx={{ mb: 2.5 }}>
          <PlaceAutocompleteField
            label="From"
            inputValue={originLabel}
            selectedPlace={origin}
            onInputValueChange={setOriginLabel}
            onPlaceSelect={setOrigin}
          />
          <PlaceAutocompleteField
            label="To"
            inputValue={destinationLabel}
            selectedPlace={destination}
            onInputValueChange={setDestinationLabel}
            onPlaceSelect={setDestination}
          />
        </Stack>
        <Button
          type="submit"
          variant="contained"
          disabled={isLoading || !origin || !destination}
          sx={{ mb: 2.5 }}
        >
          {isLoading ? "Finding route…" : "Find route"}
        </Button>
      </Box>

      {(route || errorMessage) && (
        <Typography
          role={errorMessage ? "alert" : "status"}
          color={errorMessage ? "error" : "text.primary"}
          sx={{ mb: 2 }}
        >
          {errorMessage ??
            `Route found · ${(route!.distanceMeters / 1000).toFixed(1)} km · ${Math.ceil(Number.parseFloat(route!.duration) / 60)} min`}
        </Typography>
      )}

      <div style={{ width: "100%", aspectRatio: "1 / 1" }}>
        <Map
          mapId={process.env.NEXT_PUBLIC_GOOGLE_MAP_ID ?? "DEMO_MAP_ID"}
          defaultCenter={{
            lat: pos?.coords.latitude ?? -34.6037,
            lng: pos?.coords.longitude ?? -58.3816,
          }}
          defaultZoom={12}
          gestureHandling="cooperative"
          style={{
            width: "100%",
            height: "100%",
            aspectRatio: "1 / 1",
          }}
        >
          <FitTripBounds origin={origin} destination={destination} />
          {origin && (
            <AdvancedMarker position={origin.location} title={origin.label} />
          )}
          {destination && (
            <AdvancedMarker
              position={destination.location}
              title={destination.label}
            />
          )}
          {route && <RouteLine encodedPolyline={route.encodedPolyline} />}
        </Map>
      </div>

      {/* <Box aria-live="polite" sx={{ py: 2.5 }}>
          <Typography variant="overline" color="text.secondary">
            {selectedPassenger ? "Shared route" : "Your route"}
          </Typography>
          <Typography
            variant="body2"
            sx={{ mt: 0.5, overflowWrap: "anywhere" }}
          >
            {origin?.label.trim() || "Choose an origin"}
            {selectedPassenger &&
              ` → ${selectedPassenger.pickup} → ${selectedPassenger.destination}`}
            {(!selectedPassenger ||
              selectedPassenger.destination !== destination?.label.trim()) &&
              ` → ${destination?.label.trim() || "Choose a destination"}`}
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
        </Box> */}
    </Box>
  );
}
