import { assert, assertEquals, assertMatch, assertNotEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { generateCode, hashCode, OTP_MAX_ATTEMPTS, OTP_RESEND_SECONDS, OTP_TTL_SECONDS } from "../_shared/otp.ts";
Deno.test("codes are six digits", () => { for (let i = 0; i < 500; i++) assertMatch(generateCode(), /^\d{6}$/); });
Deno.test("hash hides and binds code", async () => {
  const h = await hashCode("77001234567", "reset", "123456", "secret");
  assertMatch(h, /^[0-9a-f]{64}$/); assert(!h.includes("123456"));
  assertNotEquals(h, await hashCode("77001234567", "register", "123456", "secret"));
});
Deno.test("limits match requirements", () => { assertEquals([OTP_TTL_SECONDS, OTP_MAX_ATTEMPTS, OTP_RESEND_SECONDS], [300, 5, 60]); });
