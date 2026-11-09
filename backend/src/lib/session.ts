import { auth } from "./auth"
import { unauthorized } from "./http-error"

/** Returns the logged-in user's id or throws 401. */
export async function requireUserId(request: Request): Promise<string> {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user?.id) throw unauthorized()
  return session.user.id
}
