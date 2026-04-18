import assert from "node:assert/strict";
import test from "node:test";

const { pickFeedImage } = await import("../lib/feed-image.ts");

test("pickFeedImage prefers media content url", () => {
  const image = pickFeedImage(
    {
      link: "https://example.com/post",
      mediaContent: [
        { $: { url: "https://cdn.example.com/main.jpg", type: "image/jpeg" } },
      ],
      mediaThumbnail: [
        { $: { url: "https://cdn.example.com/thumb.jpg" } },
      ],
    },
  );

  assert.equal(image, "https://cdn.example.com/main.jpg");
});

test("pickFeedImage falls back to media thumbnail and enclosure", () => {
  const image = pickFeedImage(
    {
      link: "https://example.com/post",
      mediaThumbnail: [{ $: { url: "https://cdn.example.com/thumb.jpg" } }],
      enclosure: [{ $: { url: "https://cdn.example.com/enclosure.jpg" } }],
    },
  );

  assert.equal(image, "https://cdn.example.com/thumb.jpg");
});

test("pickFeedImage falls back to img in html content and rejects unsafe urls", () => {
  const image = pickFeedImage(
    {
      link: "https://example.com/post",
      content: '<p>x</p><img src="/cover.webp"/><img src="http://insecure.example.com/a.jpg"/>',
    },
  );

  assert.equal(image, "https://example.com/cover.webp");
});

test("pickFeedImage returns undefined when no valid image candidate exists", () => {
  const image = pickFeedImage(
    {
      link: "https://example.com/post",
      content: '<img src="data:image/png;base64,abc"/>',
      mediaContent: [{ $: { url: "https://localhost/bad.jpg" } }],
    },
  );

  assert.equal(image, undefined);
});
