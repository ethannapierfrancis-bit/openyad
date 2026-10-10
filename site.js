/* ------------------------------------------------------------------
   SITE SETTINGS
   Change the words between the "quote marks" and save the file.
   ------------------------------------------------------------------ */
window.SITE = {
  name: "OpenYad",
  tagline: "Volunteering in Dubai, made easy for students",

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
   icon   = an emoji shown on the category card
   colour = the category's colour
   ------------------------------------------------------------------ */
window.CATEGORIES = [
  { id: "environment",   name: "Environment and clean-ups",  icon: "🌿", colour: "#2F855A" },
  { id: "animals",       name: "Animals",                    icon: "🐾", colour: "#B7791F" },
  { id: "sports",        name: "Sports and coaching",        icon: "⚽", colour: "#2B6CB0" },
  { id: "teaching",      name: "Teaching and tutoring",      icon: "📚", colour: "#6B46C1" },
  { id: "children",      name: "Children and youth",         icon: "🧒", colour: "#D53F8C" },
  { id: "elderly",       name: "Elderly",                    icon: "👵", colour: "#975A16" },
  { id: "determination", name: "People of determination",    icon: "🤝", colour: "#00838F" },
  { id: "health",        name: "Health and wellbeing",       icon: "💚", colour: "#C53030" },
  { id: "community",     name: "Community events",           icon: "🎪", colour: "#DD6B20" },
  { id: "arts",          name: "Arts and culture",           icon: "🎨", colour: "#805AD5" },
  { id: "food",          name: "Food and hunger relief",     icon: "🍲", colour: "#C05621" },
  { id: "tech",          name: "Technology and digital skills", icon: "💻", colour: "#3182CE" },
  { id: "home",          name: "Volunteer from home",        icon: "🏠", colour: "#319795" }
];
