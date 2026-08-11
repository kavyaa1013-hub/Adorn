ADORN — website files
=====================

Everything in this folder is the website. There is nothing to install, compile or
build. Upload these files to a web host and the site is live.


HOW TO PUT IT ONLINE
--------------------

Whatever host you use, the rule is the same: the CONTENTS of this folder go into
the host's public folder, with index.html sitting at the top level. Do not upload
the "adorn-website" folder itself — upload what is inside it, or the site will
only load at yoursite.com/adorn-website/.

The folder must keep its shape. index.html looks for css/style.css, js/main.js
and assets/products/... exactly where they are now. Move or rename a folder and
the page loads without its styling.

  Netlify (free, easiest)
    1. Go to app.netlify.com/drop
    2. Drag this folder onto the page.
    3. It gives you a live address straight away. A custom domain can be added
       later in the site settings.

  GitHub Pages (free)
    Repository → Settings → Pages → Source: your branch, folder: / (root).
    The site appears at <username>.github.io/<repository>.

  cPanel / Hostinger / GoDaddy / most paid hosting
    Open File Manager, go into public_html, and upload the contents of this
    folder there. Delete any default index.html the host put in first.

To look at it on your own computer before uploading, open index.html in a
browser by double-clicking it. Everything works that way except that the product
photos need the folder kept intact.


WHAT IS IN HERE
---------------

  index.html            The whole site — all three pages live in this one file.
  css/style.css         Colours, fonts, layout, animations.
  js/main.js            The intro animation, the shop, the bag, the checkout.
  assets/products/      Product photographs.
  assets/upi-qr.png     Your PhonePe QR code, shown at checkout.

The site has three pages, and they are all inside index.html — the script swaps
between them. The landing page with the Shop Now button, the shop itself, and
the checkout.


THINGS YOU WILL WANT TO CHANGE
------------------------------

1. THE PRICES. Every product currently shows Rs 4,999. That is your real price
   for the Onyx set, repeated across the whole range as a placeholder. It is NOT
   the right price for the other nine.

   Open index.html, search for data-price="4999", and change the number on each
   product. Whole rupees, no comma, no Rs sign. For example:

       data-price="4999"     becomes     data-price="3200"

   The shop, the bag and the checkout total all read that one number, so it is
   the only place you have to change it.

2. YOUR UPI ID AND ORDER EMAIL. These are at the very top of js/main.js:

       upiId: "6239073929-2@axl",
       orderEmail: "adorn.2026@gmail.com",

   If you empty the UPI ID, the checkout says payment is not set up rather than
   showing a customer somewhere wrong to send money. That is deliberate — never
   put a made-up UPI ID there as a placeholder.

3. BANK TRANSFER is switched off on purpose. Your account details would be
   visible to anyone who visits the site, so that is your decision, not a
   default. To turn it on, fill in the three fields just below the UPI ID in
   js/main.js and the checkout adds a bank transfer line by itself.

4. ADDRESS AND PHONE are in index.html, in the contact section near the bottom.


ADDING A PRODUCT PHOTO
----------------------

Each product looks for a photo named after its ID. A product with
data-id="satin-sky" shows assets/products/satin-sky.jpg.

Drop a file with the matching name into assets/products/ and the photo appears.
No code change. Until the file exists, the site draws a woven pattern in its
place, so a missing photo never leaves a broken image on the page.

Best results: landscape, roughly 1200 x 900, under 300 KB each.


HOW AN ORDER REACHES YOU AT THE MOMENT
--------------------------------------

The customer fills in their delivery details, pays you by UPI from their own
phone, types in the reference number their UPI app gave them, and presses the
button. That opens THEIR email app with the whole order written out and
addressed to adorn.2026@gmail.com — and they have to press send themselves.

So the order only reaches you if the customer completes that last step, and it
needs a working email app on their phone.

You then match the UPI reference against the money that arrived in your account
before you dispatch. Nothing is automatic: the site does not charge anyone, and
no payment is confirmed without you looking at it.


A NOTE ON CARD PAYMENTS
-----------------------

There is no debit or credit card option, deliberately. Taking a card needs a
licensed payment gateway account (Razorpay or similar) registered in your name.
A bank account alone is not enough — that is only where the money lands. Until
that account exists, any card form on the site would either be fake or would let
the customer choose what they pay. UPI is the honest option.
