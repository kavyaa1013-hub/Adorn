/**
 * Verifies that a Razorpay payment really happened.
 *
 * Razorpay signs `order_id|payment_id` with your key secret. Recomputing that HMAC
 * here is the only thing that proves a payment is genuine — a browser claiming
 * "payment succeeded" proves nothing, since anyone can send that.
 *
 * Same two environment variables as razorpay-order.js. Put this function's URL into
 * ADORN_PAYMENT.razorpay.verifyApi.
 */

import crypto from "node:crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST." });
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return res.status(500).json({ error: "Razorpay keys are not configured." });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const orderId = body && body.orderId;
  const paymentId = body && body.paymentId;
  const signature = body && body.signature;

  if (!orderId || !paymentId || !signature) {
    return res.status(400).json({ error: "Missing order, payment or signature." });
  }

  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(orderId + "|" + paymentId)
    .digest("hex");

  // Constant-time compare, so a wrong signature cannot be guessed a byte at a time.
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(String(signature), "utf8");
  const verified = a.length === b.length && crypto.timingSafeEqual(a, b);

  if (!verified) {
    return res.status(400).json({ verified: false, error: "Signature did not match." });
  }
  return res.status(200).json({ verified: true, paymentId });
}
