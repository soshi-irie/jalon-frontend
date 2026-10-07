"use client";

import {
  Avatar,
  Box,
  ButtonBase,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import type { passenger } from "../page";
import { useState } from "react";

export default function Riders({
  passengers,
  hasSearched,
}: {
  passengers: passenger[];
  hasSearched: boolean;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedPassenger = passengers.find(
    (passenger) => passenger.id === selectedId,
  );
  return (
    <Box
      component="section"
      aria-labelledby="passengers-heading"
      sx={{ width: "47%" }}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography id="passengers-heading" component="h2" variant="h5">
          Pasajeros con menos de 10 km de desvío
        </Typography>
      </Stack>

      {passengers.length === 0 ? (
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          {hasSearched
            ? "No encontramos pasajeros para este viaje."
            : "Buscá una ruta para ver pasajeros con menos de 10 km de desvío."}
        </Typography>
      ) : (
        <Stack spacing={2}>
          <Typography variant="h6" color="text.secondary">
            {passengers.length} {passengers.length === 1 ? "pasajero" : "pasajeros"}
          </Typography>
          {passengers.map((passenger, index) => {
            const isSelected = passenger.id === selectedId;

            return (
              <ButtonBase
                key={passenger.id}
                aria-pressed={isSelected}
                aria-label={`${isSelected ? "Dejar de seleccionar" : "Seleccionar"} a ${passenger.name}, punto de encuentro: ${passenger.pickup.label}, destino: ${passenger.destination.label}, ${passenger.detour} minutos de desvío, aporte de $ ${passenger.fee}`}
                onClick={() => setSelectedId(isSelected ? null : passenger.id)}
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
                          label="Menor desvío"
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
                          Seleccionado
                        </Typography>
                      )}
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {passenger.pickup.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Hasta {passenger.destination.label}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                    <Typography variant="subtitle2">
                      $ {passenger.fee}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      +{(passenger.detourDistanceMeters! / 1000).toFixed(1)} km
                    </Typography>
                  </Box>
                </Stack>
              </ButtonBase>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
