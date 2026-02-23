export function verificationTemplate(link: string): string {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
      <h2>驗證你的 Email</h2>
      <p>請點擊下方按鈕完成 Email 驗證，連結有效期為 24 小時。</p>
      <a href="${link}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none">驗證 Email</a>
      <p style="margin-top:24px;color:#6b7280;font-size:14px">若你未申請此帳號，請忽略此信件。</p>
    </div>
  `
}
