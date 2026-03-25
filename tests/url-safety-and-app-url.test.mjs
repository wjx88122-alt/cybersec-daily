import assert from "node:assert/strict";
import test from "node:test";

const { resolveSafeExternalHref, resolveSafeImageUrl } = await import(
  "../lib/remote-url.ts"
);
const { resolveAppBaseUrlFromSources } = await import("../lib/app-url.ts");

test("resolveSafeExternalHref only allows http and https links", () => {
  assert.equal(resolveSafeExternalHref("https://example.com/news"), "https://example.com/news");
  assert.equal(resolveSafeExternalHref("http://example.com/news"), "http://example.com/news");
  assert.equal(resolveSafeExternalHref("javascript:alert(1)"), "#");
  assert.equal(resolveSafeExternalHref("data:text/html,boom"), "#");
});

test("resolveSafeImageUrl rejects local and loopback image hosts", () => {
  assert.equal(
    resolveSafeImageUrl("https://localhost/image.png", "https://example.com/post"),
    null,
  );
  assert.equal(
    resolveSafeImageUrl("https://127.0.0.1/image.png", "https://example.com/post"),
    null,
  );
  assert.equal(
    resolveSafeImageUrl("https://[::1]/image.png", "https://example.com/post"),
    null,
  );
});

test("resolveSafeImageUrl keeps valid remote https images", () => {
  assert.equal(
    resolveSafeImageUrl("/image.png", "https://example.com/post"),
    "https://example.com/image.png",
  );
});

test("resolveAppBaseUrlFromSources prefers request origin over linked Vercel fallback", () => {
  assert.equal(
    resolveAppBaseUrlFromSources({
      requestOrigin: "http://localhost:3000",
      linkedVercelBaseUrl: "https://cybersec-daily.vercel.app",
    }),
    "http://localhost:3000",
  );
});

test("resolveAppBaseUrlFromSources still prefers explicit APP_BASE_URL", () => {
  assert.equal(
    resolveAppBaseUrlFromSources({
      appBaseUrl: "https://custom.example.com",
      requestOrigin: "http://localhost:3000",
      linkedVercelBaseUrl: "https://cybersec-daily.vercel.app",
    }),
    "https://custom.example.com",
  );
});
