import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SidebarContextType {
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [showSidebar, setShowSidebar] = useState(true);

  return (
    <SidebarContext.Provider value={{ showSidebar, setShowSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
