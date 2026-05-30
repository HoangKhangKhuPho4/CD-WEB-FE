/** Cho phép api interceptor gọi refresh profile sau khi renew access token. */
let refreshHandler: (() => Promise<void>) | null = null;

export function registerAuthRefreshHandler(handler: () => Promise<void>) {
  refreshHandler = handler;
}

export function unregisterAuthRefreshHandler() {
  refreshHandler = null;
}

export async function triggerAuthUserRefresh(): Promise<void> {
  if (refreshHandler) {
    await refreshHandler();
  }
}
