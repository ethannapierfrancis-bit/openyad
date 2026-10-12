# OpenYad

A free directory of volunteering opportunities in Dubai for students aged 13 to 18.
It is a plain static website: no backend, no database, no accounts, no tracking.

## What is in this folder

| File or folder | What it is |
| --- | --- |
| `index.html` | Home page (the finder sentence and cause tiles) |
| `browse.html` | All listings with tap-to-filter chips and sorting |
| `match.html` | Quick Match, the swipe deck |
| `saved.html` | The visitor's "Save for later" shortlist |
| `hand.html` | "My Hand", the points page |
| `suggest.html` | "Suggest an opportunity" (an email link only) |
| `about.html` | About page |
| `listings.js` | **Every listing. This is the file you edit.** |
| `areas.js` | Areas of Dubai and their map positions (for distance) |
| `site.js` | Site name, your contact email, and the categories |
| `style.css` | Colours and layout |
| `app.js` | The code that builds the pages from the data |

---

## 1. Open the site on your own computer

1. Open Finder and go to your home folder, then the `dubai-volunteering` folder.
2. Double-click `index.html`. It opens in your web browser.

That is all. The site works straight from the folder, with no internet needed
(the links to organisations do need internet).

After you edit a file, save it and press refresh in the browser to see the change.

---

## 2. Put it online for free with GitHub Pages

You need a free GitHub account. GitHub requires you to be 13 or older; ask a parent
before signing up, because it needs an email address.

**First, change the contact email**

1. Create a new free email address just for the site.
2. Open `site.js` in TextEdit (right-click the file, Open With, TextEdit).
3. Replace `your-site-email@example.com` with your new address. Keep the quote marks. Save.

**Then publish**

1. Go to https://github.com and sign up, or sign in.
2. Click the **+** at the top right, then **New repository**.
3. Repository name: `openyad`. Choose **Public**. Click **Create repository**.
4. On the next page, click the link **uploading an existing file**.
5. Open the `dubai-volunteering` folder in Finder. Select everything inside it
   (press Cmd+A) and drag it all onto the GitHub page. Wait for the upload to finish.
   All 13 files must show in the list.
6. Click **Commit changes**.
7. Click **Settings** (top of the repository), then **Pages** in the left menu.
8. Under "Build and deployment", set **Source** to "Deploy from a branch",
   set **Branch** to `main` and the folder to `/ (root)`. Click **Save**.
9. Wait one or two minutes and refresh the page. Your link appears at the top:
   `https://YOUR-USERNAME.github.io/openyad/`

That link is the one you share.

**Updating the site later**

1. Open your repository on GitHub and click `listings.js`.
2. Click the pencil icon to edit.
3. Make your change and click **Commit changes**. The live site updates in about a minute.

---

## 3. Add or edit a listing

All listings live in `listings.js`. Each one is a block that starts with `{`
and ends with `},`. The top of that file explains every line.

**To edit:** find the listing, change the words inside the quote marks, save.

**To remove:** delete the whole block from `{` to `},`.

**To add:** copy an existing block, paste it underneath, and change the details.

### Worked example

Imagine you confirm that a (made-up) group called "Example Beach Crew" runs a
clean-up at Kite Beach every Saturday from 8am to 9:30am, for ages 13 and up with a
parent's consent, and people sign up on its website. You would paste this block
after another listing's closing `},`:

```js
  {
    id: "example-beach-crew",
    title: "Saturday beach clean-up",
    organisation: "Example Beach Crew",
    categories: ["environment"],
    description: "Pick up litter along Kite Beach with a group and sort it for recycling. Gloves and bags are provided.",
    minAge: 13,
    ageNote: "",
    parent: "Under-18s need a parent's consent.",
    sessionLength: "Saturdays, 8am to 9:30am.",
    duration: ["1to3"],
    frequency: ["weekly"],
    mode: "inperson",
    city: "Dubai",
    areas: ["Umm Suqeim"],
    locationText: "Kite Beach, Umm Suqeim",
    metro: CHECK,
    dofe: "likely",
    dofeNote: "It runs every week, so it could be regular. Ask your Award leader.",
    nextSteps: [
      "Open their website and choose a Saturday.",
      "Ask a parent to give consent.",
      "Turn up at 8am in closed shoes with water."
    ],
    button: "signup",
    link: "https://www.example.org/volunteer",
    contact: "hello@example.org",
    source: "https://www.example.org/volunteer",
    lastChecked: "2026-10-10"
  },
```

Rules that keep the file working:

- Every line ends with a comma, except the last line inside a list `[ ... ]`.
- Words go inside "quote marks". Numbers, `null` and `CHECK` do not.
- `id` must be unique.
- `areas` must match a name in `areas.js` exactly. Use `[]` if there is no fixed place.
- If you are not sure about a detail, write `CHECK` (it shows "Check with organiser")
  or `null` for the age. Never guess.
- If the page goes blank after an edit, a comma or quote mark is probably missing
  in the block you just changed. Undo and try again.

---

## 4. Monthly checklist

Do this once a month. It takes about an hour.

1. Open `browse.html` and click every listing's button. Does the link still open
   the right page? If not, find the new page or remove the listing.
2. For each listing, re-read the organisation's page: minimum age, times, place,
   how to sign up. Fix anything that changed.
3. Update `lastChecked` to today's date on every listing you checked.
4. Remove or update anything with a date that has passed (events, campaigns, deadlines).
5. Look ahead: add dated events coming in the next two months (Ramadan, Dubai
   Fitness Challenge, festivals, clean-up campaigns).
6. Read emails sent to the site address. Check each suggestion on the organisation's
   own website before adding it.
7. Check the hard rules again: no donation or fundraising listings, no private
   contact details, nothing invented.
8. If you emailed an organisation to confirm a detail and got an answer, replace
   `CHECK` or `null` with the real answer.
9. Upload the changed `listings.js` to GitHub and open the live site on your phone
   to check it looks right.

---

## Research notes (checked 10 October 2026)

54 listings, every one with a link that opened when tested. 15 can be done from home.

**Listings per category** (a listing can be in more than one):
Community events 17 · From home 15 · Arts and culture 12 · Environment 11 ·
People of determination 10 · Teaching 9 · Children and youth 9 · Sports 6 · Tech 6 ·
Animals 5 · Health 4 · Food 3 · Elderly 2

**Thin categories**

- **Elderly (2):** both are letter-writing from home, posted abroad. No in-person
  elderly volunteering in Dubai could be confirmed. Dubai's Community Development
  Authority has run a "Waleef" programme for seniors living alone; phone 800 2121 to ask
  whether students can take part.
- **Food (3):** only one has a confirmed age rule (The Giving Family).
- **Health (4)** and **Animals (5)** are also light.

**Minimum age confirmed on the organiser's own site (17 of 54)**

K9 Friends (14), Al Noor (16), Sanad Village (16), Emirates Literature Foundation (16),
Thrift for Good youth programme (15 to 17) and shop (18), Emirates Dubai 7s
(16 for on-field spotters), Art Dubai (18), BSO Young Leaders (14), Steel City Codes
(grades 9 to 12), Schoolhouse (13), ENGin (13), Zooniverse, volunteers.ae and
The Giving Family (no minimum).

**Organisations to email about minimum age** (shown as "Check with organiser")

Dubai Autism Center (only says under-16s need consent), Stray Dogs Center (Dubai
adoption days), Yanni Animal Welfare, SNF, Emirates Down Syndrome Association,
Rashid Center, Special Olympics UAE, Heroes of Hope, Mohammed Bin Rashid Library,
Jameel Arts Centre, Dubai Design Week, Emirates Environmental Group, AZRAQ, Goumbook,
Emirates Nature-WWF (also ask about the membership fee), Connect with Nature,
Dubai Municipality (protected areas and Food Bank), Dubai Cares, The Tutoring
Initiative, SmartLife, Al Jalila Foundation, Aster Volunteers, CDA Dubai Volunteering
Center, Aftir, Be My Eyes, Learn To Be (also ask whether UAE tutors are accepted).

**Other details not confirmed**

- K9 Friends: the shelter address is not on its website.
- Emirates Dubai 7s: the venue and the age for roles other than spotter.
- Art Dubai and Dubai Design Week: their volunteer pages still describe 2023.
- Session length is unconfirmed for most in-person listings.
- Nearest Metro is filled in for only four listings, and marked approximate.

**Looked at but left out**

- Emirates Red Crescent: the site blocked automated reading and its home page is
  mostly donation appeals.
- Riding for the Disabled Association of Dubai: no working website found.
- Feline Friends (the site found is Abu Dhabi), 38 Smiles (site under construction),
  Make-A-Wish UAE (volunteer page "coming soon"), Sparkle Foundation (UAE role is
  fundraising), Yalla Mangroves (ambassador role includes funding).
- Dubai Foundation for Women and Children (asks for professionals with a CV).

**One for you to decide:** EEG's Can Collection Drive is a recycling campaign, not
fundraising, so it is included. If you read "no collection drives" more strictly,
delete the block with `id: "eeg-can-collection"`.
