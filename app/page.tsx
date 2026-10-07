"use client";

import { Stack } from "@mui/material";
import { useState } from "react";
import Riders from "./components/Riders";
import Destination from "./components/Destination";

const originalPassengers: passenger[] = [
  {
    id: "katie",
    name: "Katie",
    initials: "KT",
    pickup: {
      label: "Autopista Dellepiane, Villa Lugano",
      location: { lat: -34.675, lng: -58.4654 },
    },
    destination: {
      label: "Aeropuerto Internacional Ezeiza",
      location: { lat: -34.8222, lng: -58.5358 },
    },
    detour: 4,
    fee: 6,
    color: "#e8eee6",
  },
  {
    id: "marcus",
    name: "Marcus",
    initials: "MR",
    pickup: {
      label: "Estación Liniers",
      location: { lat: -34.6559, lng: -58.5158 },
    },
    destination: {
      label: "Monte Grande",
      location: { lat: -34.818, lng: -58.464 },
    },
    detour: 7,
    fee: 8,
    color: "#f3ebcf",
  },
  {
    id: "sofia",
    name: "Sofia",
    initials: "SF",
    pickup: {
      label: "Parque Avellaneda",
      location: { lat: -34.6461, lng: -58.4757 },
    },
    destination: {
      label: "Estación Ezeiza",
      location: { lat: -34.8538, lng: -58.5229 },
    },
    detour: 9,
    fee: 5,
    color: "#e7e9f0",
  },
];

export type place = {
  label: string;
  location: { lat: number; lng: number };
};

export type passenger = {
  id: string;
  name: string;
  initials: string;
  pickup: place;
  destination: place;
  detour: number;
  fee: number;
  color: string;
  detourDistanceMeters?: number;
};

const aeroparque: place = {
  label: "Aeroparque Internacional Jorge Newbery",
  location: { lat: -34.5592, lng: -58.4156 },
};

const corridorPassengers: passenger[] = [
  {
    id: "route-match-001",
    name: "Laura",
    initials: "LA",
    pickup: {
      label: "Plaza San Martin",
      location: { lat: -34.5953, lng: -58.3778 },
    },
    destination: aeroparque,
    detour: 0,
    fee: 5,
    color: "#e8eee6",
  },
  {
    id: "route-match-002",
    name: "Mateo",
    initials: "MA",
    pickup: {
      label: "Retiro Station",
      location: { lat: -34.5914, lng: -58.3747 },
    },
    destination: aeroparque,
    detour: 0,
    fee: 6,
    color: "#f3ebcf",
  },
  {
    id: "route-match-003",
    name: "Valentina",
    initials: "VA",
    pickup: {
      label: "Catalinas Norte",
      location: { lat: -34.5945, lng: -58.3768 },
    },
    destination: aeroparque,
    detour: 0,
    fee: 4,
    color: "#e7e9f0",
  },
  {
    id: "route-match-004",
    name: "Tomas",
    initials: "TO",
    pickup: {
      label: "Recoleta Cemetery",
      location: { lat: -34.5888, lng: -58.3934 },
    },
    destination: aeroparque,
    detour: 0,
    fee: 7,
    color: "#e8eee6",
  },
  {
    id: "route-match-005",
    name: "Camila",
    initials: "CA",
    pickup: {
      label: "Museo Nacional de Bellas Artes",
      location: { lat: -34.5837, lng: -58.3936 },
    },
    destination: aeroparque,
    detour: 0,
    fee: 5,
    color: "#f3ebcf",
  },
  {
    id: "route-match-006",
    name: "Nicolas",
    initials: "NI",
    pickup: {
      label: "Facultad de Derecho",
      location: { lat: -34.5834, lng: -58.3938 },
    },
    destination: aeroparque,
    detour: 0,
    fee: 6,
    color: "#e7e9f0",
  },
  {
    id: "route-match-007",
    name: "Martina",
    initials: "MA",
    pickup: {
      label: "MALBA",
      location: { lat: -34.5777, lng: -58.4037 },
    },
    destination: aeroparque,
    detour: 0,
    fee: 5,
    color: "#e8eee6",
  },
  {
    id: "route-match-008",
    name: "Joaquin",
    initials: "JO",
    pickup: {
      label: "Jardin Japones",
      location: { lat: -34.5745, lng: -58.4111 },
    },
    destination: aeroparque,
    detour: 0,
    fee: 7,
    color: "#f3ebcf",
  },
  {
    id: "route-match-009",
    name: "Emilia",
    initials: "EM",
    pickup: {
      label: "Planetario Galileo Galilei",
      location: { lat: -34.5686, lng: -58.4116 },
    },
    destination: aeroparque,
    detour: 0,
    fee: 4,
    color: "#e7e9f0",
  },
  {
    id: "route-match-010",
    name: "Diego",
    initials: "DI",
    pickup: {
      label: "Costanera Norte",
      location: { lat: -34.563, lng: -58.4105 },
    },
    destination: aeroparque,
    detour: 0,
    fee: 6,
    color: "#e8eee6",
  },
];

const farPickupAreas = [
  { label: "Moron", location: { lat: -34.653, lng: -58.619 } },
  { label: "Tigre", location: { lat: -34.426, lng: -58.579 } },
  { label: "Quilmes", location: { lat: -34.72, lng: -58.27 } },
  { label: "La Plata", location: { lat: -34.921, lng: -57.954 } },
  { label: "Lujan", location: { lat: -34.57, lng: -59.1 } },
  { label: "Merlo", location: { lat: -34.666, lng: -58.729 } },
  { label: "Berazategui", location: { lat: -34.765, lng: -58.205 } },
  { label: "San Miguel", location: { lat: -34.543, lng: -58.712 } },
  { label: "Canuelas", location: { lat: -35.05, lng: -58.76 } },
];

const distantPassengers: passenger[] = Array.from(
  { length: 90 },
  (_, index) => {
    const area = farPickupAreas[index % farPickupAreas.length];
    const variation = Math.floor(index / farPickupAreas.length);

    return {
      id: `distant-passenger-${index + 1}`,
      name: `Passenger ${String(index + 4).padStart(3, "0")}`,
      initials: `P${String(index + 1).slice(-1)}`,
      pickup: {
        label: `${area.label} - sample pickup ${variation + 1}`,
        location: {
          lat: area.location.lat + variation * 0.0004,
          lng: area.location.lng + variation * 0.0004,
        },
      },
      destination: aeroparque,
      detour: 0,
      fee: 4 + (index % 7),
      color: ["#e8eee6", "#f3ebcf", "#e7e9f0"][index % 3],
    };
  },
);

const passengers: passenger[] = [
  ...originalPassengers,
  ...corridorPassengers,
  ...distantPassengers,
];

export default function Home() {
  const [matchingPassengers, setMatchingPassengers] = useState<passenger[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  return (
    <Stack
      sx={{ mt: 4, minHeight: "100vh", justifyContent: "space-between" }}
      direction="row"
    >
      <Destination
        passengers={passengers}
        onSearchStart={() => {
          setHasSearched(false);
          setMatchingPassengers([]);
        }}
        onEligiblePassengersChange={(matches) => {
          setMatchingPassengers(matches);
          setHasSearched(true);
        }}
      />
      <Riders passengers={matchingPassengers} hasSearched={hasSearched} />
    </Stack>
  );
}
