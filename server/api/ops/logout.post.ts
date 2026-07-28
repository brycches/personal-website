/** POST /api/ops/logout — clears the admin cookie. */
export default defineEventHandler((event) => {
  clearAdminCookie(event)
  return { ok: true }
})
