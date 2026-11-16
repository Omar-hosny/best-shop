// Boot-time environment checks. Failing here is far better than discovering a
// missing secret as a 500 on the first protected request.
//
// In development a weak JWT_SECRET is only a warning: existing local .env files
// use short secrets and rotating one would silently log every session out.
// In production it is a hard error — a short secret is brute-forceable, and
// NODE_ENV also controls the `secure` cookie flag and stack-trace redaction.

const MIN_JWT_SECRET_LENGTH = 32;

const validateEnv = () => {
  const problems = [];
  const nodeEnv = process.env.NODE_ENV || "development";

  if (!process.env.NODE_ENV) {
    console.warn(
      'NODE_ENV is not set — defaulting to "development". Set it explicitly in production.',
    );
  }

  if (!process.env.MONGO_URI) {
    problems.push("MONGO_URI is required");
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    problems.push("JWT_SECRET is required");
  } else if (secret.length < MIN_JWT_SECRET_LENGTH) {
    const message = `JWT_SECRET must be at least ${MIN_JWT_SECRET_LENGTH} characters (currently ${secret.length})`;
    if (nodeEnv === "production") {
      problems.push(message);
    } else {
      console.warn(`Warning: ${message}. Acceptable locally, not in production.`);
    }
  }

  if (nodeEnv === "production") {
    // Behind a proxy, req.ip is the proxy's address unless the hop count is
    // configured — every IP-based rate limit would collapse into one bucket.
    if (!process.env.TRUST_PROXY) {
      problems.push("TRUST_PROXY must be set in production");
    } else if (process.env.TRUST_PROXY.trim() === "true") {
      problems.push(
        'TRUST_PROXY must be a hop count (e.g. "1") or "loopback", not "true" — "true" lets clients spoof X-Forwarded-For',
      );
    }

    if (
      process.env.SHIPPING_FEE &&
      !Number.isFinite(Number(process.env.SHIPPING_FEE))
    ) {
      problems.push("SHIPPING_FEE must be a number");
    }
  }

  if (problems.length) {
    console.error(`Invalid environment:\n- ${problems.join("\n- ")}`);
    process.exit(1);
  }
};

export default validateEnv;
