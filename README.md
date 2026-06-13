# mikey

Personal one-page site for Mikey (gswsniper30). Plain HTML, CSS, and JS, no build step.
Modern minimal, blue theme, light + dark mode, English / 中文 toggle.

## Preview locally

```powershell
cd C:\Users\jxh\Desktop\mikey-website
python -m http.server 5180
```

Then open http://127.0.0.1:5180

## Files

- `index.html` - all the content and sections
- `styles.css` - colors, layout, light/dark, animations
- `script.js` - theme + language toggle, ET clock, scroll reveals, FAQ, copy handle
- `assets/images/` - drop real photos here

## How to edit stuff

- **Text**: edit it in `index.html`. Every translatable bit has two copies:
  `data-en="English"` and `data-cn="中文"`. Change both so the toggle stays in sync.
- **Colors / blue shade**: top of `styles.css`, the `--blue` variables (one set for light,
  one inside `body.dark`).
- **Photos**: drop image files into `assets/images/`, then swap a `.ph` placeholder block
  in the Photos section for an `<img src="assets/images/your-photo.jpg" alt="...">`.
- **Email / socials**: Contact section in `index.html`, update the `mailto:` and Instagram links.

## Add a real Spotify embed

1. In Spotify, open a playlist or song, hit Share, then "Embed playlist", and copy the iframe.
2. In `index.html`, find the `spotify-slot` block in the Music section and replace it with your
   iframe, e.g.

   ```html
   <iframe style="border-radius:18px" src="https://open.spotify.com/embed/playlist/PLAYLIST_ID"
           width="100%" height="352" frameborder="0" allow="encrypted-media" loading="lazy"></iframe>
   ```

## Deploy (GitHub Pages)

This pushes to https://github.com/gswsniper30/website. Once pushed, enable Pages in the repo
settings (Settings then Pages, pick the branch and `/root`). The site shows up at
`https://gswsniper30.github.io/website/`.
