import { AppThemeProvider } from "@/src/theme/theme-provider";
import { initDatabase } from "@/src/utils/sqliteDB";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const Provider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    void initDatabase();
  }, []);

  return (
    <AppThemeProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        {children}
      </GestureHandlerRootView>
    </AppThemeProvider>
  );
};

export default Provider;
