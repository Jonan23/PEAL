import { browser } from "$app/environment";

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleButtonOptions = {
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with";
  shape?: "rectangular" | "pill" | "circle" | "square";
  width?: number;
};

type GoogleInitializeOptions = {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
};

type GoogleIdentityApi = {
  initialize: (options: GoogleInitializeOptions) => void;
  renderButton: (element: HTMLElement, options: GoogleButtonOptions) => void;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleIdentityApi;
      };
    };
  }
}

const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";
const GOOGLE_SCRIPT_ID = "google-identity-services";

export function getGoogleClientId(): string {
  return (import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim();
}

export async function loadGoogleIdentityScript(): Promise<void> {
  if (!browser) return;

  if (window.google?.accounts?.id) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(
      GOOGLE_SCRIPT_ID,
    ) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Failed to load Google Identity Services")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(script);
  });
}

export async function renderGoogleButton(
  container: HTMLElement,
  onCredential: (idToken: string) => void,
  options?: GoogleButtonOptions,
): Promise<void> {
  const clientId = getGoogleClientId();
  if (!clientId) {
    throw new Error("Google sign-in is not configured");
  }

  await loadGoogleIdentityScript();

  if (!window.google?.accounts?.id) {
    throw new Error("Google sign-in is unavailable");
  }

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: (response) => {
      if (response.credential) {
        onCredential(response.credential);
      }
    },
  });

  container.innerHTML = "";
  window.google.accounts.id.renderButton(container, {
    theme: "outline",
    size: "large",
    text: "continue_with",
    shape: "pill",
    width: 360,
    ...options,
  });
}
