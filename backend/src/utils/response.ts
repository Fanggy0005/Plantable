export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  errors?: unknown[]
}

export function successResponse<T>(data: T, message = "Success"): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
  }
}

export function errorResponse(message: string, errors: unknown[] = []): ApiResponse<null> {
  return {
    success: false,
    message,
    errors,
  }
}

/** Error response from a caught value, which is not guaranteed to be an Error instance. */
export function errorFromCaught(err: unknown, fallbackMessage: string): ApiResponse<null> {
  const message = err instanceof Error && err.message ? err.message : fallbackMessage
  return errorResponse(message, [err])
}
