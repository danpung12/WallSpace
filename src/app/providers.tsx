"use client";

import { SWRConfig } from 'swr';
import { BottomNavProvider } from "./context/BottomNavContext";
import { MapProvider } from "@/context/MapContext";
import { UserModeProvider } from "./context/UserModeContext";
import { ReservationProvider } from "@/context/ReservationContext";
import { UserProfileProvider } from "@/context/UserProfileContext";
import { swrConfig } from "@/lib/swr";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={swrConfig}>
      <MapProvider>
        <UserModeProvider>
          <UserProfileProvider>
            <ReservationProvider>
              <BottomNavProvider>{children}</BottomNavProvider>
            </ReservationProvider>
          </UserProfileProvider>
        </UserModeProvider>
      </MapProvider>
    </SWRConfig>
  );
}

