"use client";

import { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  Chip,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import Header from "./components/Header";

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

export default function Home() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedPassenger = passengers.find(
    (passenger) => passenger.id === selectedId,
  );

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      <Stack component="main" direction="row" sx={{ flex: 1, py: 5 }}>
        <Container
          maxWidth="lg"
          sx={{ display: "flex", justifyContent: "space-between" }}
        >
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
                Your next ride
              </Typography>
              <Chip
                label="Driving"
                size="small"
                sx={{ bgcolor: "primary.light", color: "primary.dark" }}
              />
            </Stack>

            <Stack direction="row" spacing={2} sx={{ mb: 2.5 }}>
              <TextField
                fullWidth
                label="From"
                value={origin}
                onChange={(event) => setOrigin(event.target.value)}
                size="small"
              />
              <TextField
                fullWidth
                label="To"
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
                size="small"
              />
            </Stack>

            <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
              <div style={{ width: "100%", aspectRatio: "1 / 1" }}>
                <Map
                  defaultCenter={{ lat: 37.7749, lng: -122.4194 }}
                  defaultZoom={12}
                  gestureHandling="cooperative"
                  style={{
                    width: "100%",
                    height: "100%",
                    aspectRatio: "1 / 1",
                  }}
                />
              </div>
            </APIProvider>

            <Box aria-live="polite" sx={{ py: 2.5 }}>
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
                    Pick up {selectedPassenger.name} · +
                    {selectedPassenger.detour} min · ${selectedPassenger.fee}{" "}
                    contribution
                  </Typography>
                  <Button size="small" onClick={() => setSelectedId(null)}>
                    Clear
                  </Button>
                </Stack>
              )}
            </Box>
          </Box>

          <Box
            component="section"
            aria-labelledby="passengers-heading"
            sx={{ pt: 3, width: "47%" }}
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
      </Stack>

      <Box
        component="footer"
        sx={{
          borderTop: 1,
          borderColor: "divider",
          py: 3,
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="caption" color="text.secondary">
            © 2026 JALÓN. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
