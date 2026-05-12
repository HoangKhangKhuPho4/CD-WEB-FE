/** Google Identity Services / Facebook SDK — tải động qua script */
export {};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (credential: { credential: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: { theme?: string; size?: string; width?: string | number; text?: string; locale?: string }
          ) => void;
          prompt: () => void;
        };
      };
    };
    FB?: {
      init: (params: { appId: string; cookie?: boolean; xfbml?: boolean; version: string }) => void;
      login: (
        callback: (response: { authResponse?: { accessToken: string } }) => void,
        options?: { scope?: string }
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}
