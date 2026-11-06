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
