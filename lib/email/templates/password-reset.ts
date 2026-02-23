export function passwordResetTemplate(link: string): string {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
      <h2>重設你的密碼</h2>
      <p>請點擊下方按鈕重設密碼，連結有效期為 1 小時。</p>
      <a href="${link}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none">重設密碼</a>
      <p style="margin-top:24px;color:#6b7280;font-size:14px">若你未申請重設密碼，請忽略此信件。</p>
    </div>
  `
}
