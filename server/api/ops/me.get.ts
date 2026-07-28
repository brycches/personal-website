/** GET /api/ops/me — non-throwing auth probe for the ops route middleware. */
export default defineEventHandler(async (event) => {
  try {
    return { admin: await isAdmin(event) }
  } catch {
    return { admin: false }
  }
})
