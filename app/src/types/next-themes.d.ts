declare module 'next-themes' {
    import React from 'react';
    
    export interface ThemeProviderProps {
      attribute?: string;
      defaultTheme?: string;
      enableSystem?: boolean;
      storageKey?: string;
      children?: React.ReactNode;
      value?: unknown;
    }
    
    export interface UseThemeProps {
      themes: string[];
      setTheme: (theme: string) => void;
      theme?: string;
      systemTheme?: string;
      resolvedTheme?: string;
    }
    
    export function ThemeProvider(props: ThemeProviderProps): JSX.Element;
    
    export function useTheme(): UseThemeProps;
  }
  
  declare module 'next-themes/dist/types' {
    export interface ThemeProviderProps {
      attribute?: string;
      defaultTheme?: string;
      enableSystem?: boolean;
      storageKey?: string;
      children?: React.ReactNode;
      value?: unknown;
    }
  }