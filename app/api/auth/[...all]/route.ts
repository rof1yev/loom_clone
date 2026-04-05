import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import aj from "@/lib/arcjet";
import { ArcjetDecision, slidingWindow, validateEmail } from "@arcjet/next";
import ip from "@arcjet/ip";

const emailValidation = aj.withRule(
  validateEmail({
    mode: "LIVE",
    deny: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
  }),
);

const rateLimit = aj.withRule(
  slidingWindow({
    mode: "LIVE",
    max: 2,
    interval: "2m",
    characteristics: ["fingerprint"],
  }),
);

const protectedAuth = async (req: NextRequest): Promise<ArcjetDecision> => {
  const session = await auth.api.getSession({ headers: req.headers });

  let userId: string;

  if (session?.user.id) userId = session.user.id;
  else userId = ip(req) || "127.0.0.1";

  if (req.nextUrl.pathname.startsWith("/api/auth/sign-in")) {
    try {
      const body = await req.clone().json();

      if (typeof body.email === "string")
        return emailValidation.protect(req, { email: body.email });
    } catch (e) {
      console.error("Failed to parse request body for email validation:", e);
    }
  }

  return rateLimit.protect(req, { fingerprint: userId });
};

const authHandler = toNextJsHandler(auth.handler);

export const { GET } = authHandler;

export const POST = async (req: NextRequest) => {
  const decision = await protectedAuth(req);

  if (decision.reason.isEmail()) {
    return NextResponse.json(
      { error: "Email verification failed. Please use a valid email address." },
      { status: 400 },
    );
  }

  if (decision.reason.isRateLimit()) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  if (decision.reason.isShield()) {
    return NextResponse.json({ error: "Request blocked" }, { status: 403 });
  }

  return authHandler.POST(req);
};
