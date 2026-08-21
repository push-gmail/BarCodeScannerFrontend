# Frontend

React + TypeScript + Vite frontend for the Home-category QR recovery platform.

## Main website

- `/` ecommerce-style Home category page
- `/cart` cart, payment summary and Place Order

## Affiliate WEB portal

This is intentionally a web portal first. It uses the same user credentials created on the ecommerce website.

- `/affiliate/login`
- `/affiliate/dashboard`
- `/affiliate/products`
- `/affiliate/scans`
- `/affiliate/notifications`

The Android APK should be created later by packaging this Affiliate web experience, not by designing a second unrelated product.

## Admin

- `/admin/login`
- `/admin/dashboard`
- `/admin/users`
- `/admin/orders`
- `/admin/scans`

## Environment

Copy `.env.example` to `.env`.

`VITE_AFFILIATE_WEB_URL` is optional. Leave it blank when the Affiliate portal is served from the same React build. Set it only when Affiliate is deployed at a separate web origin/domain.
