import assert from "node:assert/strict";
import test from "node:test";

const { pickImageFromProxyText } = await import("../lib/image-proxy.ts");

test("pickImageFromProxyText picks article hero image for techrepublic", () => {
  const text = `
![Image 3](https://aorta.clickagy.com/pixel.gif)
![Image 12](https://assets.techrepublic.com/uploads/2026/04/tr-04172026-hackers-abuse-n8n-workflows.jpg)
Image: AndersonPiza/Envato
`;

  const image = pickImageFromProxyText(
    text,
    "https://www.techrepublic.com/article/news-hackers-abuse-n8n-workflows-malware-delivery/",
  );

  assert.equal(
    image,
    "https://assets.techrepublic.com/uploads/2026/04/tr-04172026-hackers-abuse-n8n-workflows.jpg",
  );
});

test("pickImageFromProxyText skips logos and trackers", () => {
  const text = `
![Image](https://www.securityweek.com/wp-content/uploads/2022/04/SecurityWeek-Small-Dark.png)
![Image](https://aorta.clickagy.com/channel-sync/124?clkgypv=jstag)
`;

  const image = pickImageFromProxyText(
    text,
    "https://www.securityweek.com/cochat-launches-ai-collaboration-platform-to-combat-shadow-ai/",
  );

  assert.equal(image, undefined);
});

test("pickImageFromProxyText accepts contentstack article images for darkreading", () => {
  const text = `
![Image 5](https://eu-images.contentstack.com/v3/assets/blt6d90778a997de1cd/blt5cc61f368315b744/69e10ffdc8863fd06c049539/Mac_Mouse_Click_Edwin_Remsberg_Alamy.jpg?width=1280&auto=webp&quality=80&disable=upscale)
`;

  const image = pickImageFromProxyText(
    text,
    "https://www.darkreading.com/vulnerabilities-threats/every-old-vulnerability-ai-vulnerability",
  );

  assert.equal(
    image,
    "https://eu-images.contentstack.com/v3/assets/blt6d90778a997de1cd/blt5cc61f368315b744/69e10ffdc8863fd06c049539/Mac_Mouse_Click_Edwin_Remsberg_Alamy.jpg?width=1280&auto=webp&quality=80&disable=upscale",
  );
});
