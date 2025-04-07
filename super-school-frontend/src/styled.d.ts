// src/types/styled.d.ts

import 'styled-components';

declare module 'styled-components' {
  // Use 'any' type for the theme to bypass all type checking
  export interface DefaultTheme {
    [key: string]: any;

    // This ensures all your theme properties can be accessed without TypeScript errors
    breakpoints: any;
    font: any;
    palette: any;
    sizes: any;
    cardRadius: any;
    gray: any;
    background: any;
  }
}
