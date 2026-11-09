/** An error that is safe to show to the client, with its HTTP status. */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly errors: unknown[] = []
  ) {
    super(message)
  }
}

export const notFound = (what: string) => new HttpError(404, `${what} not found`)
export const unauthorized = () => new HttpError(401, "Please log in")
