"use client";

import { BottomNavProvider } from "./context/BottomNavContext";
import { MapProvider } from "@/context/MapContext";
import { UserModeProvider } from "./context/UserModeContext";
import { ReservationProvider } from "@/context/ReservationContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MapProvider>
      <UserModeProvider>
        <ReservationProvider>
          <BottomNavProvider>{children}</BottomNavProvider>
        </ReservationProvider>
      </UserModeProvider>
    </MapProvider>
  );
}

