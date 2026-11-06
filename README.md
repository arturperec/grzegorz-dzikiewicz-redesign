# Grzegorz Dzikiewicz - redesign proposal

Static UI prototype of a premium personal-brand website for Grzegorz Dzikiewicz, Warszawski Dealer Nieruchomości (current site: grzegorzdzikiewicz.pl).

No build step: plain HTML, CSS and a small vanilla JS file.

## Demo switches

- `/` - text shows immediately; the portrait and video poster show a shimmer and a blurred preview until they load
- `/?skeleton` - shows the full-page skeleton loading state (for demos)
- `/?formfail` - simulates a failed sign-up to show the rollback

## Structure

- `index.html` - the page
- `assets/site.css` - design tokens, layout, responsive rules (container queries), skeletons
- `assets/app.js` - skeleton reveal, mobile menu, investor-type selector, sign-up form states
- `assets/grzegorz.jpg`, `assets/warsaw.jpg` - photos from the current site

## Still to wire up

- the sign-up form has no backend yet. Set `SIGNUP_ENDPOINT` in `assets/app.js`: the form POSTs JSON `{name, email, type}` with an `Idempotency-Key` header. The server should store the key and return the first result for any repeat of it, so a retried sign-up is never saved twice
- the Telegram invite link

## SEO and GEO

Prepared for the production domain `https://grzegorzdzikiewicz.pl/`.

- `index.html` head: title, description, canonical, robots, Open Graph and Twitter cards, local geo tags, structured data
- structured data (`@graph`): WebSite, WebPage, Person (Grzegorz Dzikiewicz), RealEstateAgent (Okazja na flipa, address, coordinates, area served, two services), Organization (MHN sp. z o.o., NIP, REGON), HowTo (7 steps), VideoObject (Vimeo film), FAQPage (same text as the visible questions)
- visible "Najczęstsze pytania" section with self-contained answers that AI search engines can quote
- `robots.txt` allows search and AI search crawlers, `sitemap.xml` lists the page, its image and the video, `llms.txt` summarises the facts
- `assets/og.jpg` (1200x630) share image, `assets/apple-touch-icon.png`

### Launch checklist

1. Fix the expired SSL certificate on grzegorzdzikiewicz.pl
2. Deploy these files to the domain root (robots.txt and sitemap.xml only work at the root)
3. Switch the `og:image`, `twitter:image` and structured-data image URLs from the GitHub Pages host to `https://grzegorzdzikiewicz.pl/assets/`
4. Add the domain to Google Search Console and Bing Webmaster Tools, submit `sitemap.xml`
5. Create or claim a Google Business Profile with exactly this address and phone: ul. Przechodnia 2/510, 00-100 Warszawa, +48 22 257 11 94
6. Use the same name, address and phone on LinkedIn, Instagram and any directory listings
7. Remove the old hidden phone number +48 533 388 533 from the old site's structured data
8. Fill in the missing "[adres e-mail]" in section 6.3 of the Regulamin
9. Test with Google's Rich Results Test and the Schema Markup Validator after launch

## Interface details

- text never waits: skeletons only on the photos and video while they load, blurred previews under them
- fonts self-hosted in `assets/fonts` (Cormorant Garamond, Inter, SIL Open Font License): no requests to Google, so no visitor IPs sent to a third party
- optimistic sign-up: success shows at once and rolls back with a message if the send fails
- idempotency key per sign-up, double-submit guard
- view transitions for the menu, the form result and the process filter
- mobile menu closes with the back button or Android back gesture, and with a swipe down
- interruptible CSS motion, all of it off under reduced motion
- 44px minimum tap targets, safe-area insets for notched phones, equal-width counting numbers, balanced headlines
