import { Elysia } from "elysia"
import { errorResponse } from "../utils/response"
import { HttpError } from "./http-error"

/** Maps every error to the response envelope. Internal details never reach the client. */
export const errorHandler = new Elysia({ name: "error-handler" }).onError(
  { as: "global" },
  ({ code, error, set, request }) => {
    if (error instanceof HttpError) {
      set.status = error.status
      return errorResponse(error.message, error.errors)
    }

    if (code === "VALIDATION") {
      set.status = 422
      const details = error.all.map((e) => ({
        path: e.path,
        message: e.summary ?? e.message,
      }))
      return errorResponse("Validation Error", details)
    }

    if (code === "NOT_FOUND") {
      set.status = 404
      return errorResponse("Not found")
    }

    if (code === "PARSE") {
      set.status = 400
      return errorResponse("Invalid request body")
    }

    console.error(`[${request.method} ${new URL(request.url).pathname}]`, error)
    set.status = 500
    return errorResponse("Something went wrong. Please try again.")
  }
)
