"use client";

import { BottomNavProvider } from "./context/BottomNavContext";
import { MapProvider } from "@/context/MapContext";
import { UserModeProvider } from "./context/UserModeContext";
import { ReservationProvider } from "@/context/ReservationContext";
import { UserProfileProvider } from "@/context/UserProfileContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MapProvider>
      <UserModeProvider>
        <UserProfileProvider>
          <ReservationProvider>
            <BottomNavProvider>{children}</BottomNavProvider>
          </ReservationProvider>
        </UserProfileProvider>
      </UserModeProvider>
    </MapProvider>
  );
}

