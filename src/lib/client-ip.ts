let browserIpPromise: Promise<string> | null = null;

export async function getBrowserClientIp(): Promise<string> {
  if (typeof window === "undefined") {
    return "";
  }

  if (!browserIpPromise) {
    browserIpPromise = fetch("https://api.ipify.org?format=json")
      .then((response) => response.json())
      .then((data) => (typeof data?.ip === "string" ? data.ip.trim() : ""))
      .catch(() => "");
  }

  return browserIpPromise;
}

