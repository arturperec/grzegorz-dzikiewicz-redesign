# Grzegorz Dzikiewicz - redesign proposal

Static UI prototype of a premium personal-brand website for Grzegorz Dzikiewicz, Warszawski Dealer Nieruchomości (current site: grzegorzdzikiewicz.pl).

No build step: plain HTML, CSS and a small vanilla JS file.

## Demo switches

- `/` - real skeleton loading: sections reveal in reading order once fonts and the portrait are ready
- `/?skeleton` - keeps the skeleton loading state on screen
- `/?instant` - skips the skeleton

## Structure

- `index.html` - the page
- `assets/site.css` - design tokens, layout, responsive rules (container queries), skeletons
- `assets/app.js` - skeleton reveal, mobile menu, investor-type selector, sign-up form states
- `assets/grzegorz.jpg`, `assets/warsaw.jpg` - photos from the current site

## Still to wire up

- the sign-up form has no backend yet (it shows the sending and success states only)
- the Telegram invite link
- the video file for the "Poznaj mnie i mój zespół" frame

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
