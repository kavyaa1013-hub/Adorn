/**
 * Creates a Razorpay order.
 *
 * This exists because the browser cannot be trusted with the amount. A price sitting
 * in page JavaScript can be edited before it is sent, so the amount is recalculated
 * here from the server's own copy of the price list and the order is created with
 * Razorpay using the secret key, which never leaves this function.
 *
 * Deploy on Vercel, Netlify or Cloudflare (all have a free tier) with two environment
 * variables set:
 *
 *   RAZORPAY_KEY_ID       rzp_live_xxxxxxxx   (also public, goes in js/main.js)
 *   RAZORPAY_KEY_SECRET   never commit this, never put it in the page
 *
 * Then put this function's URL into ADORN_PAYMENT.razorpay.orderApi.
 */

// The authoritative price list, in rupees. Keep this in step with data-price in
// index.html. The browser sends ids and quantities; it never sends prices.
const PRICES = {
  "onyx-bedsheet": 4999,
  "damas-navy": 4999,
  "damas-ivory": 4999,
  "damas-mocha": 4999,
  "damas-khaki": 4999,
  "satin-pearl": 4999,
  "satin-sky": 4999,
  "satin-terracotta": 4999,
  "satin-emerald": 4999,
  "satin-champagne": 4999,
};

const MAX_QTY = 20;

function priceOrder(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("No items in the order.");
  }
  let paise = 0;
  for (const item of items) {
    const rupees = PRICES[item && item.id];
    if (!rupees) throw new Error("Unknown item: " + (item && item.id));
    const qty = Number(item.qty);
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
      throw new Error("Bad quantity for " + item.id);
    }
    paise += rupees * qty * 100;
  }
  return paise;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST." });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return res.status(500).json({ error: "Razorpay keys are not configured." });
  }

  let amountPaise;
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    amountPaise = priceOrder(body && body.items);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  const auth = Buffer.from(keyId + ":" + keySecret).toString("base64");
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: "Basic " + auth,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: "INR",
      receipt: "adorn_" + Date.now(),
    }),
  });

  const order = await response.json();
  if (!response.ok) {
    return res.status(502).json({
      error: (order && order.error && order.error.description) || "Razorpay rejected the order.",
    });
  }

  // Only what the browser needs. The secret and the raw Razorpay payload stay here.
  return res.status(200).json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId,
  });
}
