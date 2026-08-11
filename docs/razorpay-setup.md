# Turning on card payments with Razorpay

The code is written and tested. What is left needs your business identity, so only you
can do it. Two routes below — start with the quick one if you want cards working this
week, move to the proper one when you have a spare hour.

---

## First, for either route: open the Razorpay account

1. Sign up at **razorpay.com** with `adorn.2026@gmail.com`.
2. Complete KYC. Have ready:
   - **PAN** of the business or proprietor
   - **Bank proof** — the Punjab National Bank cancelled cheque you already have
   - **Address proof** for Barsat Road, Noorwala, Panipat 132103
   - **GSTIN** if you have one (not required for a proprietorship below the threshold)
3. Wait for activation. Usually 2–4 working days.

Until KYC clears you can still build and test everything using **Test Mode** keys.

---

## Route A — Payment Page. No developer work, works today.

Good enough to start taking cards. The one weakness: the customer types the amount
themselves, so a wrong amount is possible and you must check it before dispatch.

1. Razorpay Dashboard → **Payment Pages** → **Create Payment Page**.
2. Title it *Adorn — Order Payment*. Add one field: **Amount (customer enters)**.
3. Publish. Copy the link — it looks like `https://rzp.io/l/xxxxxxxx`.
4. Send me that link, or paste it yourself into `js/main.js`:

```js
cardLink: "https://rzp.io/l/xxxxxxxx",
```

The Card option turns into a working **Pay by Card** button immediately. The checkout
shows the customer the exact amount to enter, and they paste the payment ID back.

---

## Route B — Proper integration. The amount is locked by the server.

The customer cannot mistype or tamper with the amount, and every payment is verified
before you see it. This is what `api/razorpay-order.js` and `api/razorpay-verify.js`
are for.

### 1. Get your keys

Dashboard → **Settings → API Keys → Generate Key**. You get two:

| Key | Where it goes | Secret? |
| --- | --- | --- |
| **Key ID** (`rzp_live_…`) | `js/main.js`, visible in the page | No — public by design |
| **Key Secret** | Only the deploy's environment variables | **Yes — never commit it** |

If the secret ever ends up in this repository, regenerate it in the dashboard
immediately. Anyone holding it can move money.

### 2. Deploy the two functions

They are plain Node with no dependencies, so any of these work on a free tier.
Vercel is the shortest path:

1. Go to **vercel.com**, sign in with GitHub, **Import** this repository.
2. Framework preset: **Other**. No build command needed.
3. **Environment Variables** → add both:
   - `RAZORPAY_KEY_ID` = `rzp_live_…`
   - `RAZORPAY_KEY_SECRET` = your secret
4. Deploy. The functions land at:
   - `https://<your-project>.vercel.app/api/razorpay-order`
   - `https://<your-project>.vercel.app/api/razorpay-verify`

### 3. Point the site at them

In `js/main.js`:

```js
razorpay: {
  keyId:     "rzp_live_xxxxxxxx",
  orderApi:  "https://<your-project>.vercel.app/api/razorpay-order",
  verifyApi: "https://<your-project>.vercel.app/api/razorpay-verify"
},
```

Filling these in takes priority over `cardLink` automatically.

### 4. Keep the price list in step

`api/razorpay-order.js` holds its own copy of the prices, deliberately — that copy is
what the customer is actually charged, and the browser cannot influence it. **When you
change a price in `index.html`, change it there too.** If they drift apart, the customer
is charged the server's figure.

### 5. Test before going live

Use **Test Mode** keys first. Razorpay's test card:

```
Card    4111 1111 1111 1111
Expiry  any future date
CVV     any 3 digits
```

Place a real order end to end, check it appears in the dashboard, then swap the test
keys for live ones.

---

## What happens on the customer's side

1. They fill in delivery details and pick **Debit / Credit Card**.
2. **Pay by Card** asks your server for an order at the correct amount.
3. Razorpay's own window opens — card, netbanking, wallets. Card details never touch
   this site, which is why you are not liable for storing them.
4. On success the payment is verified against your secret, the payment ID drops into
   the form, and they send the order.

If they close the window, the card is declined, or verification fails, the checkout
says so plainly and nothing is charged.

---

## A note on what is still manual

Orders arrive by email and you confirm them by hand. Razorpay confirms the *money*;
nothing yet writes orders into a system or emails the customer a receipt. That is the
next thing worth building if order volume grows.
