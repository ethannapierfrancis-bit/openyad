/* ------------------------------------------------------------------
   SITE SETTINGS
   Change the words between the "quote marks" and save the file.
   ------------------------------------------------------------------ */
window.SITE = {
  name: "OpenYad",
  tagline: "Volunteering in Dubai, sorted for students",

  // The email address used by the "Suggest an opportunity" link.
  // Replace this with the new email address you create for the site.
  contactEmail: "your-site-email@example.com",

  // Only listings from this city (plus "Online" ones) are shown.
  // Later you can add more cities to your listings and change this.
  city: "Dubai"
};

/* ------------------------------------------------------------------
   CATEGORIES
   id     = the short word you type in a listing's "categories" list
   name   = what visitors see
   short  = a one or two word version for small buttons
   icon   = an emoji used only if the site has no drawn icon for it
   colour = the category's colour
   ------------------------------------------------------------------ */
window.CATEGORIES = [
  { id: "environment",   name: "Environment and clean-ups",  short: "Environment", icon: "🌿", colour: "#34C27B" },
  { id: "animals",       name: "Animals",                    short: "Animals",     icon: "🐾", colour: "#E08A3C" },
  { id: "sports",        name: "Sports and coaching",        short: "Sports",      icon: "⚽", colour: "#4C8DF6" },
  { id: "teaching",      name: "Teaching and tutoring",      short: "Teaching",    icon: "📚", colour: "#8B7CF6" },
  { id: "children",      name: "Children and youth",         short: "Children",    icon: "🧒", colour: "#FB7FA4" },
  { id: "elderly",       name: "Elderly",                    short: "Elderly",     icon: "👵", colour: "#D3A46A" },
  { id: "determination", name: "People of determination",    short: "Inclusion",   icon: "🤝", colour: "#2CC6B8" },
  { id: "health",        name: "Health and wellbeing",       short: "Health",      icon: "💚", colour: "#F26B6B" },
  { id: "community",     name: "Community events",           short: "Events",      icon: "🎪", colour: "#FF9838" },
  { id: "arts",          name: "Arts and culture",           short: "Arts",        icon: "🎨", colour: "#D477EE" },
  { id: "food",          name: "Food and hunger relief",     short: "Food",        icon: "🍲", colour: "#F2C230" },
  { id: "tech",          name: "Technology and digital skills", short: "Tech",     icon: "💻", colour: "#3FB6E8" },
  { id: "home",          name: "Volunteer from home",        short: "From home",   icon: "🏠", colour: "#A4D34A" }
];
