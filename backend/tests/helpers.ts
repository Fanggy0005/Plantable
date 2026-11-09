import { prisma } from "../src/config/db"
import { app } from "../src/index"
import { auth } from "../src/lib/auth"

// Integration tests write to the database. Refuse to run against anything but the test DB.
if (!process.env.DATABASE_URL?.includes("plantable_test")) {
  throw new Error("Integration tests must run against the test database (backend/.env.test)")
}

export interface TestUser {
  userId: string
  cookie: string
}

const createdUserIds: string[] = []

export async function signUp(): Promise<TestUser> {
  const res = await auth.api.signUpEmail({
    body: { email: `test-${crypto.randomUUID()}@example.com`, password: "test-password-123", name: "Test Farmer" },
    asResponse: true,
  })
  const cookie = res.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ")
  const body = (await res.json()) as { user: { id: string } }
  createdUserIds.push(body.user.id)
  return { userId: body.user.id, cookie }
}

/** Delete users created by this test file. Plots and analyses cascade. */
export async function cleanupUsers() {
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } })
}

export interface ApiResult<T = unknown> {
  status: number
  body: { success: boolean; message: string; data: T; errors?: Array<{ path: string; message: string }> }
}

export async function call<T = unknown>(
  method: string,
  path: string,
  options: { body?: unknown; user?: TestUser } = {}
): Promise<ApiResult<T>> {
  const headers: Record<string, string> = {}
  if (options.body !== undefined) headers["Content-Type"] = "application/json"
  if (options.user) headers.Cookie = options.user.cookie

  const res = await app.handle(
    new Request(`http://localhost${path}`, {
      method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    })
  )
  return { status: res.status, body: (await res.json()) as ApiResult<T>["body"] }
}

export async function cropIdByName(name: string): Promise<string> {
  const crop = await prisma.crop.findUniqueOrThrow({ where: { name } })
  return crop.id
}

export const LAB_SOIL = {
  inputMode: "lab",
  ph: 5.2,
  organicMatterPct: 1.1,
  phosphorusMgKg: 8,
  potassiumMgKg: 45,
} as const

export const KIT_SOIL = {
  inputMode: "test_kit",
  ph: 6.2,
  nitrogenLevel: "medium",
  phosphorusLevel: "low",
  potassiumLevel: "high",
} as const

export const UPLAND_SITE = { landType: "upland", waterSupply: "rainfed", soilTexture: "loam" } as const
