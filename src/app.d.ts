// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    interface Locals {
      accessToken?: string;
      refreshToken?: string;
      isAuthenticated?: boolean;
      userId?: string;
    }
    // interface Error {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
