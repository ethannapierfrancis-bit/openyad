/* OpenYad: all the site's behaviour lives in this one file.
   It reads the data files (site.js, areas.js, listings.js)
   and builds each page. Nothing is sent to any server. */
(function () {
  "use strict";

  var SITE = window.SITE, CATS = window.CATEGORIES, AREAS = window.AREAS;
  var CHECK = "Check with organiser";
  // Only show listings for the site's city, plus online ones.
  var LISTINGS = window.LISTINGS.filter(function (l) {
    return l.city === SITE.city || l.city === "Online";
  });
  var CALM = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- small helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function cat(id) { return CATS.filter(function (c) { return c.id === id; })[0] || CATS[0]; }
  function listing(id) { return LISTINGS.filter(function (l) { return l.id === id; })[0]; }

  // Saved in the visitor's own browser only. Works even if storage is blocked.
  function load(key, fallback) {
    try { var v = localStorage.getItem("openyad." + key); return v ? JSON.parse(v) : fallback; }
    catch (e) { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem("openyad." + key, JSON.stringify(value)); } catch (e) { /* ignore */ }
  }

  /* ---------- drawn icons (simple line drawings, no emoji) ---------- */
  var ICONS = {
    environment: '<path d="M5 19C5 11 10 6 19 5c0 9-5 14-13 14"/><path d="M5 19c3-5 6-8 10-10"/>',
    animals: '<circle cx="7" cy="10" r="1.8"/><circle cx="12" cy="7" r="1.8"/><circle cx="17" cy="10" r="1.8"/><path d="M8 17c0-2.500 2-4.500 4-4.500s4 2 4 4.500c0 1.500-1.200 2.500-2.500 2.200-1-.300-2-.300-3 0C9.200 19.500 8 18.500 8 17z"/>',
    sports: '<circle cx="12" cy="12" r="8.500"/><path d="M12 7.500l4 3-1.500 4.500h-5L8 10.500z"/><path d="M12 3.500v4M16 10.500l4-1.500M14.500 15l2.500 3.500M9.500 15L7 18.500M8 10.500L4 9"/>',
    teaching: '<path d="M4 6c3-1 6-1 8 1 2-2 5-2 8-1v12c-3-1-6-1-8 1-2-2-5-2-8-1z"/><path d="M12 7v12"/>',
    children: '<path d="M12 3.500l2.600 5.300 5.900.800-4.300 4.100 1.100 5.800L12 16.700l-5.300 2.800 1.100-5.800L3.500 9.600l5.900-.800z"/>',
    elderly: '<path d="M5 9h11v4.500a5 5 0 01-5 5h-1a5 5 0 01-5-5z"/><path d="M16 10.500h1.300a2.300 2.300 0 010 4.600H16"/><path d="M8.500 3.500v2.500M12 3.500v2.500"/>',
    determination: '<circle cx="12" cy="5" r="2"/><path d="M4.500 9.500c5 1.500 10 1.500 15 0M12 10.600V16M12 16l-3.500 5M12 16l3.500 5"/>',
    health: '<path d="M12 20s-7.500-4.600-7.500-10A4.200 4.200 0 0112 7.400 4.200 4.200 0 0119.500 10c0 5.400-7.500 10-7.500 10z"/><path d="M7.500 12.500h2.300l1.400-2.500 1.900 4.500 1.400-2h2"/>',
    community: '<path d="M6 21V4"/><path d="M6 5c4-2 6 2 11 0v8c-5 2-7-2-11 0"/>',
    arts: '<path d="M12 3.500a8.500 8.500 0 100 17c1.500 0 2-1 1.500-2.200-.600-1.300.200-2.300 1.500-2.300H17a3.500 3.500 0 003.500-3.500c0-5-3.800-9-8.500-9z"/><circle cx="8" cy="11" r=".9"/><circle cx="11" cy="7.500" r=".9"/><circle cx="15.500" cy="8.500" r=".9"/>',
    food: '<path d="M3.500 11h17c0 5-3.800 8.500-8.500 8.500S3.500 16 3.500 11z"/><path d="M9 7.500c0-1.500 1.500-1.500 1.500-3.500M13.500 7.500c0-1.500 1.500-1.500 1.500-3.500"/>',
    tech: '<rect x="5" y="5" width="14" height="10" rx="1.500"/><path d="M3 18.500h18"/>',
    home: '<path d="M4 11l8-7 8 7"/><path d="M6.500 9.500V20h11V9.500"/><path d="M10.500 20v-5h3v5"/>',
    search: '<circle cx="11" cy="11" r="6.500"/><path d="M16 16l4.500 4.500"/>',
    star: '<path d="M12 3.500l2.600 5.300 5.900.800-4.300 4.100 1.100 5.800L12 16.700l-5.300 2.800 1.100-5.800L3.500 9.600l5.900-.800z"/>',
    cards: '<rect x="7" y="4" width="11" height="15" rx="2" transform="rotate(8 12 12)"/><rect x="5" y="5" width="11" height="15" rx="2" transform="rotate(-6 10 12)"/>',
    hand: '<path d="M8 13V6.500a1.500 1.500 0 013 0V11M11 11V5a1.500 1.500 0 013 0v6M14 11V6.500a1.500 1.500 0 013 0V15a6 6 0 01-6 6h-.500a5.500 5.500 0 01-4.600-2.500L4 14.500a1.500 1.500 0 012.500-1.600L8 15"/>',
    list: '<path d="M9 6.500h11M9 12h11M9 17.500h11"/><circle cx="4.500" cy="6.500" r="1"/><circle cx="4.500" cy="12" r="1"/><circle cx="4.500" cy="17.500" r="1"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    undo: '<path d="M8 5L4 9l4 4"/><path d="M4 9h10a5.500 5.500 0 010 11h-3"/>',
    clock: '<circle cx="12" cy="12" r="8.500"/><path d="M12 7.500V12l3 2"/>',
    repeat: '<path d="M17 3.500l3 3-3 3"/><path d="M20 6.500H8a4 4 0 00-4 4v1M7 20.500l-3-3 3-3"/><path d="M4 17.500h12a4 4 0 004-4v-1"/>',
    pin: '<path d="M12 21s6.500-6.200 6.500-11a6.500 6.500 0 00-13 0c0 4.800 6.500 11 6.500 11z"/><circle cx="12" cy="10" r="2.300"/>',
    share: '<path d="M12 15V4M8 7.500l4-4 4 4"/><path d="M6 12v7.500h12V12"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>'
  };
  function ic(name) { return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[name] || "") + "</svg>"; }
  function catIcon(c) { return ICONS[c.id] ? ic(c.id) : '<span aria-hidden="true">' + c.icon + "</span>"; }

  /* ---------- little pop-up message ---------- */
  var toastTimer;
  function toast(msg) {
    var t = $("#toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2600);
  }

  /* ---------- header, phone tab bar and footer (same on every page) ---------- */
  var LOGO = '<svg viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="16.500" fill="#FF5A36" stroke="#15120F" stroke-width="2"/>' +
    '<g fill="#15120F"><rect x="10.500" y="10" width="3.400" height="11" rx="1.700"/><rect x="14.700" y="7.500" width="3.400" height="13" rx="1.700"/>' +
    '<rect x="18.900" y="8.500" width="3.400" height="12" rx="1.700"/><rect x="23" y="11.500" width="3.200" height="9.500" rx="1.600"/>' +
    '<rect x="10.500" y="17" width="15.700" height="11" rx="5.500"/><rect x="6" y="17" width="3.400" height="8.500" rx="1.700" transform="rotate(-35 7.700 21)"/></g></svg>';

  function layout() {
    var page = document.body.dataset.page;
    function cur(p) { return p === page ? ' aria-current="page"' : ""; }
    var pill = ' <span class="pill" data-saved-count></span>';
    $("#site-header").innerHTML = '<div class="wrap"><a class="brand" href="index.html">' + LOGO + "<span>OpenYad</span></a>" +
      '<nav class="nav" aria-label="Main">' +
      '<a href="index.html"' + cur("index") + ">Home</a>" +
      '<a href="browse.html"' + cur("browse") + ">Browse</a>" +
      '<a href="match.html"' + cur("match") + ">Quick Match</a>" +
      '<a href="saved.html"' + cur("saved") + ">Saved" + pill + "</a>" +
      '<a href="hand.html"' + cur("hand") + ">My Hand</a>" +
      '<a href="about.html"' + cur("about") + ">About</a></nav>" +
      '<a class="head-link" href="about.html">About</a></div>';

    var bar = document.createElement("nav");
    bar.className = "tabbar"; bar.setAttribute("aria-label", "Main");
    bar.innerHTML =
      '<a href="index.html"' + cur("index") + ">" + ic("home") + "Home</a>" +
      '<a href="browse.html"' + cur("browse") + ">" + ic("list") + "Browse</a>" +
      '<a href="match.html"' + cur("match") + ">" + ic("cards") + "Match</a>" +
      '<a href="saved.html"' + cur("saved") + ">" + ic("star") + "Saved" + pill + "</a>" +
      '<a href="hand.html"' + cur("hand") + ">" + ic("hand") + "My Hand</a>";
    document.body.appendChild(bar);

    $("#site-footer").innerHTML = '<div class="wrap"><nav aria-label="Footer">' +
      '<a href="browse.html">Browse</a><a href="match.html">Quick Match</a><a href="saved.html">Saved</a><a href="hand.html">My Hand</a>' +
      '<a href="suggest.html">Suggest an opportunity</a><a href="about.html">About</a></nav>' +
      "<p>" + esc(SITE.name) + " is a directory. It only links to each organisation's own website or public contact details, " +
      "and never registers volunteers itself. Always confirm details with the organiser, and ask a parent or guardian before you sign up.</p>" +
      '<p class="muted">No accounts, no tracking, no adverts, no donations. Your saved list and points stay in your own browser.</p></div>';
    updateSavedCount();

    // Slide things in as they scroll into view, unless the visitor prefers less motion.
    if (!CALM && "IntersectionObserver" in window) {
      document.documentElement.classList.add("anim");
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
      }, { rootMargin: "0px 0px -8% 0px" });
      $$(".reveal").forEach(function (el) { io.observe(el); });
    }
  }
  function updateSavedCount() {
    var n = load("saved", []).length;
    $$("[data-saved-count]").forEach(function (el) { el.textContent = n || ""; el.style.display = n ? "" : "none"; });
  }

  /* ---------- labels ---------- */
  function ageLabel(l) {
    if (l.minAge === null || l.minAge === undefined) return CHECK;
    if (l.minAge === 0) return "No minimum age";
    return l.minAge + "+";
  }
  function stamp(l) {
    if (l.minAge === null || l.minAge === undefined)
      return '<div class="stamp ask" role="img" aria-label="Minimum age not confirmed: check with organiser"><span><small>Age</small>Ask</span></div>';
    if (l.minAge === 0) return '<div class="stamp" role="img" aria-label="No minimum age"><span><small>Ages</small>All</span></div>';
    return '<div class="stamp' + (l.minAge >= 18 ? " adult" : "") + '" role="img" aria-label="Minimum age ' + l.minAge + '"><span><small>Age</small>' + l.minAge + "+</span></div>";
  }
  var FREQ = { oneoff: "One-off", weekly: "Weekly", flexible: "Flexible" };
  function freqLabel(l) {
    return l.frequency.length ? l.frequency.map(function (f) { return FREQ[f]; }).join(" or ") : CHECK;
  }
  var DOFE = {
    yes: "Yes: the organiser says so",
    likely: "Could count: it is a regular commitment",
    unlikely: "Unlikely: it is a one-off",
    check: CHECK
  };
  function niceDate(iso) {
    var p = iso.split("-"), m = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return Number(p[2]) + " " + m[Number(p[1]) - 1] + " " + p[0];
  }

  /* ---------- distance (worked out in the browser, no GPS) ---------- */
  function areaByName(name) { return AREAS.filter(function (a) { return a.name === name; })[0]; }
  function km(a, b) {
    var R = 6371, rad = Math.PI / 180;
    var dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  // Distance from the visitor's chosen area to the listing's nearest site, or null.
  function distanceTo(l, fromName) {
    var from = areaByName(fromName); if (!from || !l.areas.length) return null;
    var best = null;
    l.areas.forEach(function (n) {
      var a = areaByName(n); if (!a) return;
      var d = km(from, a); if (best === null || d < best) best = d;
    });
    return best;
  }
  function whereHTML(l, fromArea) {
    var where = l.mode === "home" ? "From home" : esc(l.locationText);
    var d = fromArea && l.mode !== "home" ? distanceTo(l, fromArea) : null;
    if (d !== null) where += ' <span class="badge sun">about ' + (d < 1 ? "under 1" : Math.round(d)) + " km away</span>";
    return where;
  }

  /* ---------- the filter rules (shared by every page) ---------- */
  function matches(l, f) {
    if (f.id) return l.id === f.id;
    if (f.cat && l.categories.indexOf(f.cat) === -1) return false;
    if (f.mode && l.mode !== f.mode) return false;
    var unsure = f.unsure !== false;
    if (f.age) {
      if (l.minAge === null) { if (!unsure) return false; }
      else if (l.minAge > Number(f.age)) return false;
    }
    if (f.time) {
      if (!l.duration.length) { if (!unsure) return false; }
      else if (l.duration.indexOf(f.time) === -1) return false;
    }
    if (f.freq) {
      if (!l.frequency.length) { if (!unsure) return false; }
      else if (l.frequency.indexOf(f.freq) === -1) return false;
    }
    if (f.q) {
      var hay = (l.title + " " + l.organisation + " " + l.description + " " + l.locationText + " " +
        l.categories.map(function (id) { return cat(id).name; }).join(" ")).toLowerCase();
      var words = f.q.toLowerCase().split(/\s+/).filter(Boolean);
      for (var i = 0; i < words.length; i++) if (hay.indexOf(words[i]) === -1) return false;
    }
    return true;
  }
  // "Best for students": confirmed under-18 ages first, then unconfirmed, then adults only.
  function ageRank(l) { return l.minAge === null ? 1 : (l.minAge >= 18 ? 2 : 0); }
  var AGES = [["", "Any"], ["13", "13"], ["14", "14"], ["15", "15"], ["16", "16"], ["17", "17"], ["18", "18+"]];
  var TIMES = [["", "Any"], ["under1", "Under 1 hour"], ["1to3", "1 to 3 hours"], ["halfday", "Half day or more"]];
  var FREQS = [["", "Any"], ["oneoff", "One-off"], ["weekly", "Weekly"], ["flexible", "Flexible"]];
  var MODES = [["", "Anywhere"], ["inperson", "In person"], ["home", "From home"]];

  function chips(name, options, selected, extraClass) {
    return options.map(function (o) {
      return '<label class="chip ' + (extraClass || "") + '"' + (o[2] ? ' style="--c:' + o[2] + '"' : "") + '><input type="radio" name="' + name + '" value="' + esc(o[0]) + '"' +
        (String(selected) === o[0] ? " checked" : "") + "><span>" + (o[3] || "") + esc(o[1]) + "</span></label>";
    }).join("");
  }
  function areaOptions(selected, firstLabel) {
    return '<option value="">' + firstLabel + "</option>" + AREAS.map(function (a) {
      return "<option" + (a.name === selected ? " selected" : "") + ">" + esc(a.name) + "</option>";
    }).join("");
  }

  /* ---------- one listing card ---------- */
  function headHTML(l) {
    var main = cat(l.categories[0]);
    var others = l.categories.slice(1).map(function (id) { return cat(id).short || cat(id).name; }).join(" · ");
    return '<span class="blob sm" style="--c:' + main.colour + '">' + catIcon(main) + '</span><div class="cats">' + esc(main.name) +
      (others ? "<small>also " + esc(others) + "</small>" : "") + "</div>";
  }
  function cardHTML(l, fromArea, i) {
    var main = cat(l.categories[0]);
    var saved = load("saved", []).indexOf(l.id) > -1;
    var btn = l.button === "signup" ? "Sign up on their website" : "Contact them";
    return '<article class="card" style="--c:' + main.colour + ";--i:" + Math.min(i || 0, 8) + '" data-id="' + esc(l.id) + '">' +
      '<div class="card-head">' + headHTML(l) +
      '<button class="icon-btn" type="button" data-share="' + esc(l.id) + '" aria-label="Share ' + esc(l.title) + ' with a friend">' + ic("share") + "</button>" +
      '<button class="icon-btn" type="button" aria-pressed="' + saved + '" data-save="' + esc(l.id) + '" aria-label="Save ' + esc(l.title) + ' for later">' + ic("star") + "</button></div>" +
      '<div class="card-body"><div class="title-row"><div><h3>' + esc(l.title) + '</h3><p class="org">' + esc(l.organisation) + "</p></div>" + stamp(l) + "</div>" +
      "<p>" + esc(l.description) + "</p>" +
      '<ul class="facts">' +
      "<li>" + ic("clock") + "<span>" + esc(l.sessionLength) + "</span></li>" +
      "<li>" + ic("repeat") + "<span>" + esc(freqLabel(l)) + (l.dofe === "yes" ? ' <span class="badge sun">Award-friendly</span>' : "") + "</span></li>" +
      "<li>" + ic("pin") + "<span>" + whereHTML(l, fromArea) + "</span></li></ul>" +
      "<details><summary>Full details and what happens next</summary><dl>" +
      "<div><dt>Minimum age</dt><dd>" + esc(ageLabel(l)) + (l.ageNote ? ". " + esc(l.ageNote) : "") + "</dd></div>" +
      "<div><dt>Parent or guardian</dt><dd>" + esc(l.parent) + "</dd></div>" +
      "<div><dt>Nearest Metro</dt><dd>" + esc(l.metro) + "</dd></div>" +
      "<div><dt>Duke of Edinburgh or school service hours</dt><dd>" + esc(DOFE[l.dofe]) + ". " + esc(l.dofeNote) + "</dd></div>" +
      "<div><dt>What happens next</dt><dd><ol>" + l.nextSteps.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ol></dd></div>" +
      "<div><dt>Public contact details</dt><dd>" + esc(l.contact) + "</dd></div>" +
      "<div><dt>Listing last checked</dt><dd>" + niceDate(l.lastChecked) + ' · <a href="' + esc(l.source) +
      '" target="_blank" rel="noopener noreferrer">source page</a></dd></div>' +
      "</dl></details>" +
      '<a class="btn block" href="' + esc(l.link) + '" target="_blank" rel="noopener noreferrer">' + btn + " ↗</a>" +
      "</div></article>";
  }

  function toggleSaved(id) {
    var saved = load("saved", []), i = saved.indexOf(id);
    if (i > -1) saved.splice(i, 1); else saved.push(id);
    save("saved", saved); updateSavedCount();
    return i === -1;
  }
  // One click handler for every Save and Share button on the page.
  function wireCards(onChange) {
    document.addEventListener("click", function (e) {
      var b = e.target.closest("[data-save]");
      if (b) {
        var now = toggleSaved(b.dataset.save);
        b.setAttribute("aria-pressed", now);
        b.classList.remove("popped"); void b.offsetWidth; b.classList.add("popped");
        toast(now ? "Saved to your shortlist" : "Removed from your shortlist");
        if (onChange) onChange();
        return;
      }
      var s = e.target.closest("[data-share]");
      if (s) {
        var l = listing(s.dataset.share), url = new URL("browse.html?id=" + encodeURIComponent(l.id), location.href).href;
        if (navigator.share) navigator.share({ title: l.title + " · " + SITE.name, url: url }).catch(function () {});
        else if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { toast("Link copied. Send it to a friend."); }, function () { toast(url); });
        else toast(url);
      }
    });
  }

  /* ---------- the hand drawing (used on Home and My Hand) ---------- */
  var FINGERS = [
    { x: 108, y: 208, len: 118, w: 28, ang: -8, dots: [0.3, 0.57, 0.84] },
    { x: 138, y: 204, len: 134, w: 28, ang: -2, dots: [0.3, 0.57, 0.84] },
    { x: 168, y: 206, len: 122, w: 28, ang: 5, dots: [0.3, 0.57, 0.84] },
    { x: 196, y: 216, len: 94, w: 24, ang: 14, dots: [0.3, 0.57, 0.84] },
    { x: 95, y: 268, len: 80, w: 30, ang: -55, dots: [0.45, 0.8] }
  ];
  // Where each of the 40 shapes sits on the hand, in the order they fill in.
  function shapes() {
    var out = [], cx = 150, cy = 255, i, a;
    out.push({ t: "dot", x: cx, y: cy, r: 9 });
    for (i = 0; i < 8; i++) { a = i * 45; out.push({ t: "petal", x: cx + 22 * Math.cos(a * Math.PI / 180), y: cy + 22 * Math.sin(a * Math.PI / 180), rot: a }); }
    for (i = 0; i < 12; i++) { a = i * 30 + 15; out.push({ t: "dot", x: cx + 42 * Math.cos(a * Math.PI / 180), y: cy + 42 * Math.sin(a * Math.PI / 180), r: 4.5 }); }
    FINGERS.forEach(function (fg) {
      fg.dots.forEach(function (t, n) {
        var s = Math.sin(fg.ang * Math.PI / 180), c = Math.cos(fg.ang * Math.PI / 180);
        out.push({ t: "dot", x: fg.x + t * fg.len * s, y: fg.y - t * fg.len * c, r: 6.5 - n });
      });
    });
    for (i = 0; i < 5; i++) out.push({ t: "dot", x: 118 + i * 16, y: 309, r: 4 });
    return out;
  }
  // colours: one colour per filled shape. newFrom: shapes from this number on pop in.
  function handSVG(colours, label, newFrom, light) {
    var skin = light ? "#F4EFE6" : "#15120F", dash = light ? "#B9AE9C" : "#6B635A";
    var s = '<svg class="hand" viewBox="0 0 300 350" role="img" aria-label="' + esc(label) + '"><g fill="' + skin + '">';
    FINGERS.forEach(function (f) {
      s += '<rect x="' + (f.x - f.w / 2) + '" y="' + (f.y - f.len) + '" width="' + f.w + '" height="' + (f.len + 26) +
        '" rx="' + (f.w / 2) + '" transform="rotate(' + f.ang + " " + f.x + " " + f.y + ')"/>';
    });
    s += '<rect x="85" y="190" width="130" height="135" rx="46"/></g>';
    shapes().forEach(function (sh, i) {
      var col = colours[i], isNew = col && newFrom !== undefined && i >= newFrom;
      var style = (col ? 'fill="' + col + '"' : 'fill="none" stroke="' + dash + '" stroke-width="1.500" stroke-dasharray="2 3"') +
        ' class="shape' + (isNew ? " new" : "") + '"' + (isNew ? ' style="--n:' + (i - newFrom) + '"' : "");
      if (sh.t === "petal") s += '<g transform="rotate(' + sh.rot + " " + sh.x.toFixed(1) + " " + sh.y.toFixed(1) + ')"><ellipse cx="' + sh.x.toFixed(1) + '" cy="' + sh.y.toFixed(1) + '" rx="9" ry="4.500" ' + style + "/></g>";
      else s += '<circle cx="' + sh.x.toFixed(1) + '" cy="' + sh.y.toFixed(1) + '" r="' + sh.r + '" ' + style + "/>";
    });
    return s + "</svg>";
  }
  function randomColours(n) {
    var out = []; for (var i = 0; i < n; i++) out.push(CATS[Math.floor(Math.random() * CATS.length)].colour); return out;
  }

  /* ---------- HOME ---------- */
  function initHome() {
    // The finder sentence
    var prof = { age: load("age", ""), time: "", area: load("area", ""), cat: "" };
    $("#fi-age").innerHTML = AGES.map(function (a) {
      return '<option value="' + a[0] + '"' + (a[0] === prof.age ? " selected" : "") + ">" + (a[0] ? a[1] : "any age") + "</option>";
    }).join("");
    $("#fi-time").innerHTML = TIMES.map(function (t) { return '<option value="' + t[0] + '">' + (t[0] ? t[1].toLowerCase() : "any amount of time") + "</option>"; }).join("");
    $("#fi-area").innerHTML = areaOptions(prof.area, "anywhere in Dubai");
    $("#fi-cat").innerHTML = '<option value="">anything</option>' + CATS.map(function (c) { return '<option value="' + c.id + '">' + esc((c.short || c.name).toLowerCase()) + "</option>"; }).join("");

    function refresh(bump) {
      var n = LISTINGS.filter(function (l) { return matches(l, prof); }).length;
      var el = $("#finder-count"); el.textContent = n;
      if (bump) { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }
      $("#finder-word").textContent = n === 1 ? "match" : "matches";
      var p = new URLSearchParams();
      ["age", "time", "cat"].forEach(function (k) { if (prof[k]) p.set(k, prof[k]); });
      var qs = p.toString();
      $("#finder-go").href = "browse.html" + (qs ? "?" + qs : "");
      $("#finder-swipe").href = "match.html" + (qs ? "?" + qs : "");
    }
    [["#fi-age", "age"], ["#fi-time", "time"], ["#fi-area", "area"], ["#fi-cat", "cat"]].forEach(function (pair) {
      $(pair[0]).addEventListener("change", function (e) {
        prof[pair[1]] = e.target.value;
        if (pair[1] === "age" || pair[1] === "area") save(pair[1], e.target.value);
        refresh(true);
      });
    });
    refresh(false);

    // Count up to the total
    var total = LISTINGS.length, t = $("#total");
    if (CALM) t.textContent = total;
    else { var n = 0, step = setInterval(function () { n = Math.min(total, n + 2); t.textContent = n; if (n >= total) clearInterval(step); }, 28); }

    // The hand that keeps changing colour, with four floating cause icons
    var art = $("#hero-hand");
    art.innerHTML = handSVG(randomColours(40), "An open hand filled with coloured shapes", 0);
    var picks = CATS.slice().sort(function () { return Math.random() - 0.5; }).slice(0, 4);
    $("#hero-art").insertAdjacentHTML("beforeend", picks.map(function (c) {
      return '<span class="float" style="--c:' + c.colour + '" aria-hidden="true">' + catIcon(c) + "</span>";
    }).join(""));
    if (!CALM) setInterval(function () {
      var all = $$(".shape", art), el = all[Math.floor(Math.random() * all.length)];
      el.setAttribute("fill", CATS[Math.floor(Math.random() * CATS.length)].colour);
      el.classList.remove("new"); void el.getBoundingClientRect(); el.style.setProperty("--n", 0); el.classList.add("new");
    }, 700);

    // Ticker of organisation names
    var orgs = [];
    LISTINGS.forEach(function (l) { var o = l.organisation.split(" (")[0]; if (orgs.indexOf(o) === -1) orgs.push(o); });
    $("#ticker").innerHTML = "<div>" + orgs.map(function (o) { return "<span>" + esc(o) + "</span>"; }).join("") + "</div>";

    // Cause tiles
    $("#tiles").innerHTML = CATS.map(function (c) {
      var count = LISTINGS.filter(function (l) { return l.categories.indexOf(c.id) > -1; }).length;
      return '<a class="tile" style="--c:' + c.colour + '" href="browse.html?cat=' + c.id + '">' +
        '<span class="blob">' + catIcon(c) + "</span><strong>" + esc(c.name) + "</strong>" +
        "<small>" + count + (count === 1 ? " opportunity" : " opportunities") + "</small></a>";
    }).join("");

    $("#mini-hand").innerHTML = handSVG(randomColours(21), "A hand part-filled with coloured shapes", undefined, true);
  }

  /* ---------- BROWSE ---------- */
  function initBrowse() {
    var params = new URLSearchParams(location.search);
    var f = {
      id: params.get("id") || "", q: params.get("q") || "", cat: params.get("cat") || "",
      age: params.get("age") || "", time: params.get("time") || "", freq: params.get("freq") || "", mode: params.get("mode") || "",
      area: load("area", ""), sort: "best", unsure: true
    };
    if (f.area) f.sort = "near";

    $("#f-q").value = f.q;
    $("#f-cat").innerHTML = chips("cat", [["", "All"]].concat(CATS.map(function (c) { return [c.id, c.short || c.name, c.colour, catIcon(c)]; })), f.cat, "cat");
    $("#f-age").innerHTML = chips("age", AGES, f.age);
    $("#f-time").innerHTML = chips("time", TIMES, f.time);
    $("#f-freq").innerHTML = chips("freq", FREQS, f.freq);
    $("#f-mode").innerHTML = chips("mode", MODES, f.mode);
    $("#f-area").innerHTML = areaOptions(f.area, "Choose your area");
    $("#f-sort").value = f.sort;
    if (window.innerWidth >= 860 || f.time || f.freq || f.mode) $("#more").open = true;
    var picked = $("#f-cat input:checked"); if (picked && picked.scrollIntoView && f.cat) picked.parentNode.scrollIntoView({ block: "nearest", inline: "center" });

    function nearRank(l) {
      if (l.mode === "home") return 10000;            // from home: after places with a known distance
      var d = distanceTo(l, f.area); return d === null ? 20000 : d;   // no fixed place: last
    }
    function render() {
      var list = LISTINGS.filter(function (l) { return matches(l, f); });
      if (f.sort === "near" && f.area) list.sort(function (a, b) { return nearRank(a) - nearRank(b); });
      else if (f.sort === "az") list.sort(function (a, b) { return a.title.localeCompare(b.title); });
      else list.sort(function (a, b) { return ageRank(a) - ageRank(b); });
      $("#count").textContent = list.length + (list.length === 1 ? " opportunity" : " opportunities");
      $("#results").innerHTML = list.length ? list.map(function (l, i) { return cardHTML(l, f.area, i); }).join("") :
        '<div class="empty sticker"><h3>Nothing matches all of that</h3><p class="muted">Try removing one filter, or tick the box to include listings with unconfirmed details.</p></div>';
      $("#near-hint").hidden = !(f.sort === "near" && !f.area);
      $("#one-note").hidden = !f.id;
      if (f.id && list.length) { var d = $("#results details"); if (d) d.open = true; }
    }
    $("#filters").addEventListener("change", function (e) {
      var t = e.target;
      if (t.type === "radio") { f[t.name] = t.value; if (t.name === "age") save("age", t.value); }
      else if (t.id === "f-unsure") f.unsure = t.checked;
      else if (t.id === "f-sort") f.sort = t.value;
      else if (t.id === "f-area") { f.area = t.value; save("area", f.area); if (f.area) { f.sort = "near"; $("#f-sort").value = "near"; } }
      f.id = ""; render();
    });
    $("#f-q").addEventListener("input", function (e) { f.q = e.target.value; f.id = ""; render(); });
    function reset() {
      f.id = f.q = f.cat = f.age = f.time = f.freq = f.mode = ""; f.unsure = true; f.sort = f.area ? "near" : "best";
      $("#f-q").value = ""; $("#f-unsure").checked = true; $("#f-sort").value = f.sort;
      ["cat", "age", "time", "freq", "mode"].forEach(function (n) { $('input[name="' + n + '"][value=""]').checked = true; });
      $("#f-cat").scrollLeft = 0;
      history.replaceState(null, "", "browse.html"); render();
    }
    $("#reset").addEventListener("click", reset);
    $("#show-all").addEventListener("click", reset);
    wireCards();
    render();
  }

  /* ---------- SAVED ---------- */
  function initSaved() {
    function render() {
      var ids = load("saved", []), area = load("area", "");
      var list = ids.map(listing).filter(Boolean);
      $("#results").innerHTML = list.length ? list.map(function (l, i) { return cardHTML(l, area, i); }).join("") :
        '<div class="empty sticker"><h3>Your shortlist is empty</h3><p class="muted">Tap the star on any opportunity, or swipe right in Quick Match, to keep it here.</p>' +
        '<p><a class="btn" href="match.html">' + ic("cards") + ' Try Quick Match</a></p><p><a href="browse.html">or browse everything</a></p></div>';
    }
    wireCards(render);
    render();
  }

  /* ---------- QUICK MATCH (swipe deck) ---------- */
  function initMatch() {
    var params = new URLSearchParams(location.search);
    var f = { age: params.get("age") || load("age", ""), time: params.get("time") || "", cat: params.get("cat") || "", unsure: true };
    var area = load("area", ""), deck = [], pos = 0, history = [], busy = false;
    var box = $("#deck");

    $("#m-age").innerHTML = chips("age", AGES, f.age);
    $("#m-area").innerHTML = areaOptions(area, "Anywhere in Dubai");

    function build() {
      var saved = load("saved", []);
      deck = LISTINGS.filter(function (l) { return matches(l, f) && saved.indexOf(l.id) === -1; })
        .map(function (l) { return { l: l, r: Math.random() }; })
        .sort(function (a, b) { return (ageRank(a.l) - ageRank(b.l)) || (a.r - b.r); })
        .map(function (o) { return o.l; });
      pos = 0; history = []; render();
    }
    function deckCard(l, top) {
      var main = cat(l.categories[0]);
      return '<article class="deck-card' + (top ? " top" : "") + '" style="--c:' + main.colour + '"' + (top ? "" : ' aria-hidden="true"') + ">" +
        '<span class="verdict yes">SAVE</span><span class="verdict no">SKIP</span>' +
        '<div class="card-head">' + headHTML(l) + "</div>" +
        '<div class="card-body"><div class="title-row"><div><h3>' + esc(l.title) + '</h3><p class="org">' + esc(l.organisation) + "</p></div>" + stamp(l) + "</div>" +
        '<p class="desc">' + esc(l.description) + "</p>" +
        '<ul class="facts"><li>' + ic("clock") + "<span>" + esc(l.sessionLength) + "</span></li>" +
        "<li>" + ic("pin") + "<span>" + whereHTML(l, area) + "</span></li>" +
        (top ? '<li><a href="browse.html?id=' + encodeURIComponent(l.id) + '">Full details and how to sign up</a></li>' : "") +
        "</ul></div></article>";
    }
    function render() {
      var left = deck.length - pos;
      $("#m-progress").textContent = deck.length ? (left > 0 ? (pos + 1) + " of " + deck.length : "All done") : "";
      $("#m-skip").disabled = $("#m-save").disabled = left <= 0;
      $("#m-undo").disabled = !history.length;
      if (left <= 0) {
        var n = load("saved", []).length;
        box.innerHTML = '<div class="deck-end sticker"><h2>' + (deck.length ? "That's all of them" : "Nothing new to show") + "</h2>" +
          '<p class="muted">' + (deck.length ? "You've seen every match." : "You have already saved everything that matches, or nothing fits that age yet.") +
          " Your shortlist has " + n + (n === 1 ? " opportunity." : " opportunities.") + "</p>" +
          '<p><a class="btn" href="saved.html">' + ic("star") + " See my shortlist</a></p>" +
          '<p><button class="linkish" type="button" id="m-again">Shuffle and go again</button></p></div>';
        return;
      }
      // Draw up to three cards; the last one in the page is the top of the pile.
      var html = "";
      for (var i = Math.min(pos + 2, deck.length - 1); i >= pos; i--) html += deckCard(deck[i], i === pos);
      box.innerHTML = html;
    }
    function decide(keep) {
      if (busy || pos >= deck.length) return;
      var el = $(".deck-card.top", box), l = deck[pos];
      function done() {
        if (keep) { var s = load("saved", []); if (s.indexOf(l.id) === -1) { s.push(l.id); save("saved", s); updateSavedCount(); } }
        history.push(keep); pos += 1; busy = false; render();
        $("#m-live").textContent = (keep ? "Saved " : "Skipped ") + l.title;
      }
      if (CALM || !el) return done();
      busy = true;
      el.style.transition = "transform .32s ease-in, opacity .32s";
      el.style.transform = "translateX(" + (keep ? 480 : -480) + "px) rotate(" + (keep ? 24 : -24) + "deg)";
      el.style.opacity = "0";
      $(keep ? ".verdict.yes" : ".verdict.no", el).style.opacity = 1;
      setTimeout(done, 300);
    }
    function undo() {
      if (busy || !history.length) return;
      var kept = history.pop(); pos -= 1;
      if (kept) { save("saved", load("saved", []).filter(function (id) { return id !== deck[pos].id; })); updateSavedCount(); }
      render();
    }
    $("#m-save").addEventListener("click", function () { decide(true); });
    $("#m-skip").addEventListener("click", function () { decide(false); });
    $("#m-undo").addEventListener("click", undo);
    document.addEventListener("keydown", function (e) {
      if (/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
      if (e.key === "ArrowRight") decide(true);
      if (e.key === "ArrowLeft") decide(false);
    });
    box.addEventListener("click", function (e) { if (e.target.id === "m-again") build(); });

    // Dragging the top card with a finger or mouse
    var startX = null, dx = 0, dragEl = null;
    box.addEventListener("pointerdown", function (e) {
      var el = e.target.closest(".deck-card.top"); if (!el || busy || e.target.closest("a")) return;
      dragEl = el; startX = e.clientX; dx = 0; el.style.transition = "none";
      try { el.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    });
    box.addEventListener("pointermove", function (e) {
      if (startX === null) return;
      dx = e.clientX - startX;
      dragEl.style.transform = "translateX(" + dx + "px) rotate(" + (dx / 18) + "deg)";
      $(".verdict.yes", dragEl).style.opacity = Math.max(0, Math.min(1, dx / 90));
      $(".verdict.no", dragEl).style.opacity = Math.max(0, Math.min(1, -dx / 90));
    });
    function release() {
      if (startX === null) return;
      startX = null;
      if (Math.abs(dx) > 90) decide(dx > 0);
      else { dragEl.style.transition = ""; dragEl.style.transform = ""; $$(".verdict", dragEl).forEach(function (v) { v.style.opacity = 0; }); }
    }
    box.addEventListener("pointerup", release);
    box.addEventListener("pointercancel", release);

    $("#m-setup").addEventListener("change", function (e) {
      if (e.target.type === "radio") { f.age = e.target.value; save("age", f.age); build(); }
      else { area = e.target.value; save("area", area); render(); }
    });
    build();
  }

  /* ---------- MY HAND (points) ---------- */
  var LEVELS = [[0, "Open Hand"], [60, "Helping Hand"], [180, "Steady Hand"], [360, "Guiding Hand"], [580, "Bright Hand"], [800, "Gold Yad"]];
  var POINTS_PER_SHAPE = 20;

  // Monday-based week number, used for the weekly streak.
  function weekOf(iso) { return Math.floor((Date.parse(iso + "T00:00:00Z") / 86400000 + 3) / 7); }

  function progress(log) {
    var sorted = log.slice().sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
    var points = 0, seen = {}, cats = [], lastWeek = null, streak = 0, hours = 0;
    sorted.forEach(function (s) {
      var p = Math.round(s.hours * 10);
      if (!seen[s.cat]) { seen[s.cat] = true; p += 15; }
      if (s.friends) p += 5;
      var w = weekOf(s.date);
      if (lastWeek === null || w > lastWeek + 1) streak = 1;
      else if (w === lastWeek + 1) { streak += 1; p += 10; }
      lastWeek = Math.max(lastWeek === null ? w : lastWeek, w);
      var before = Math.floor(points / POINTS_PER_SHAPE); points += p;
      var after = Math.floor(points / POINTS_PER_SHAPE);
      for (var i = before; i < after; i++) cats.push(s.cat);
      hours += s.hours;
    });
    return { points: points, cats: cats.slice(0, 40), streak: streak, hours: hours, tried: Object.keys(seen).length, sessions: log.length };
  }
  function levelFor(points) {
    var cur = LEVELS[0], next = null;
    LEVELS.forEach(function (l, i) { if (points >= l[0]) { cur = l; next = LEVELS[i + 1] || null; } });
    return { name: cur[1], from: cur[0], next: next };
  }
  function handPanel(points, catIds, title, newFrom) {
    var lv = levelFor(points), pct = lv.next ? Math.round((points - lv.from) / (lv.next[0] - lv.from) * 100) : 100;
    var colours = catIds.map(function (id) { return cat(id).colour; });
    return handSVG(colours, title + ": " + catIds.length + " of 40 shapes filled", newFrom, true) +
      '<p class="level">' + esc(lv.name) + '</p><p class="muted small" style="margin:0">' + points + " points</p>" +
      '<div class="bar" aria-hidden="true"><i style="width:' + pct + '%"></i></div>' +
      '<p class="small muted" style="margin:0">' + (lv.next ? (lv.next[0] - points) + " points to " + esc(lv.next[1]) : "Every shape is filled. You reached Gold Yad!") + "</p>";
  }
  function confetti(box) {
    if (CALM) return;
    for (var i = 0; i < 22; i++) {
      var d = document.createElement("i"), a = Math.random() * Math.PI * 2, r = 80 + Math.random() * 110;
      d.className = "confetti"; d.style.background = CATS[i % CATS.length].colour;
      d.style.setProperty("--x", Math.cos(a) * r + "px"); d.style.setProperty("--y", Math.sin(a) * r + "px");
      d.style.setProperty("--r", (Math.random() * 540 - 270) + "deg");
      box.appendChild(d); setTimeout(function (el) { el.remove(); }, 950, d);
    }
  }

  function initHand() {
    // A friend's shared link looks like  hand.html#hand=120.abacd  (points, then one letter per filled shape).
    window.addEventListener("hashchange", function () { location.reload(); });
    var m = /^#hand=(\d{1,5})\.([a-z]{0,40})$/.exec(location.hash);
    if (m) {
      var ids = m[2].split("").map(function (ch) { return (CATS[ch.charCodeAt(0) - 97] || CATS[0]).id; });
      var mine = progress(load("log", []));
      $("#friend").hidden = false;
      $("#friend-hand").innerHTML = handPanel(Number(m[1]), ids, "A friend's hand", 0);
      $("#friend-compare").textContent = "Your own hand has " + mine.points + " points. Volunteer together and you both earn the friends bonus.";
    }

    var sel = $("#log-what"), saved = load("saved", []).map(listing).filter(Boolean);
    function opts(list) { return list.map(function (l) { return '<option value="' + esc(l.id) + '">' + esc(l.title + " · " + l.organisation) + "</option>"; }).join(""); }
    sel.innerHTML = '<option value="">Choose what you did</option>' +
      (saved.length ? '<optgroup label="Your saved list">' + opts(saved) + "</optgroup>" : "") +
      '<optgroup label="All opportunities">' + opts(LISTINGS.slice().sort(function (a, b) { return a.title.localeCompare(b.title); })) + "</optgroup>" +
      '<option value="other">Something else</option>';
    $("#log-cat").innerHTML = CATS.map(function (c) { return '<option value="' + c.id + '">' + esc(c.name) + "</option>"; }).join("");
    $("#log-hours").innerHTML = chips("hours", [["0.5", "30 min"], ["1", "1 hr"], ["2", "2 hrs"], ["3", "3 hrs"], ["4", "4 hrs"], ["6", "6 hrs"], ["8", "8 hrs"]], "1");
    var today = new Date(); today = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    $("#log-date").value = today; $("#log-date").max = today;
    sel.addEventListener("change", function () { $("#other-cat").hidden = sel.value !== "other"; });

    var shown = null;   // how many shapes were filled last time we drew, so new ones can pop in
    function render() {
      var log = load("log", []), p = progress(log);
      var newFrom = shown === null ? 0 : Math.min(shown, p.cats.length);
      $("#my-hand").innerHTML = handPanel(p.points, p.cats, "Your hand", newFrom) +
        '<div class="stats"><div class="stat"><b>' + p.sessions + "</b><small>sessions</small></div>" +
        '<div class="stat"><b>' + p.hours + "</b><small>hours</small></div>" +
        '<div class="stat"><b>' + p.tried + "</b><small>causes</small></div>" +
        '<div class="stat"><b>' + p.streak + "</b><small>week streak</small></div></div>";
      shown = p.cats.length;
      var sorted = log.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
      $("#log-list").innerHTML = sorted.length ? sorted.map(function (s) {
        var c = cat(s.cat);
        return '<li><span class="blob sm" style="--c:' + c.colour + '">' + catIcon(c) + '</span><span style="flex:1"><strong>' + esc(s.title) + '</strong><br><span class="small muted">' + niceDate(s.date) + " · " + s.hours +
          (s.hours === 1 ? " hour" : " hours") + (s.friends ? " · with friends" : "") + "</span></span>" +
          '<button class="linkish" type="button" data-del="' + s.key + '">Remove</button></li>';
      }).join("") : '<li class="muted" style="border-style:dashed">Nothing logged yet. Your first session fills in the centre of your hand.</li>';
      $("#share").hidden = p.points === 0;
      $("#share").dataset.link = location.href.split("#")[0] + "#hand=" + p.points + "." +
        p.cats.map(function (id) { return String.fromCharCode(97 + Math.max(0, CATS.indexOf(cat(id)))); }).join("");
      return p;
    }
    $("#log-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var id = sel.value, l = listing(id);
      if (!id) { $("#log-msg").textContent = "Choose what you did first."; sel.focus(); return; }
      var log = load("log", []), before = levelFor(progress(log).points).name;
      log.push({
        key: Date.now() + "-" + log.length,
        title: l ? l.title : "Other volunteering",
        cat: l ? l.categories[0] : $("#log-cat").value,
        date: $("#log-date").value || today,
        hours: Number($('input[name="hours"]:checked').value),
        friends: $("#log-friends").checked
      });
      save("log", log); sel.value = ""; $("#other-cat").hidden = true; $("#log-friends").checked = false;
      var p = render(), after = levelFor(p.points).name;
      $("#log-msg").textContent = "Logged. You now have " + p.points + " points.";
      confetti($("#hand-box"));
      toast(after !== before ? "Level up: " + after + "!" : "Nice one. Your hand just grew.");
      if (window.innerWidth < 840) $("#hand-box").scrollIntoView({ behavior: CALM ? "auto" : "smooth", block: "start" });
    });
    $("#log-list").addEventListener("click", function (e) {
      var b = e.target.closest("[data-del]"); if (!b) return;
      save("log", load("log", []).filter(function (s) { return s.key !== b.dataset.del; })); render();
    });
    $("#share").addEventListener("click", function () {
      var link = $("#share").dataset.link;
      if (navigator.share) navigator.share({ title: "My OpenYad hand", url: link }).catch(function () {});
      else if (navigator.clipboard) navigator.clipboard.writeText(link).then(function () { toast("Link copied. Send it to a friend."); }, function () { toast(link); });
      else toast(link);
    });
    render();
  }

  /* ---------- SUGGEST ---------- */
  function initSuggest() {
    var body = "Organisation name:\nWhat volunteers do:\nMinimum age:\nWhere in Dubai (or from home):\nLink to the organisation's own page:\n";
    var href = "mailto:" + SITE.contactEmail + "?subject=" + encodeURIComponent("Suggestion for " + SITE.name) + "&body=" + encodeURIComponent(body);
    $("#suggest-link").href = href;
    $("#suggest-email").textContent = SITE.contactEmail;
  }

  /* ---------- start ---------- */
  layout();
  var page = document.body.dataset.page;
  if (page === "index") initHome();
  if (page === "browse") initBrowse();
  if (page === "saved") initSaved();
  if (page === "match") initMatch();
  if (page === "hand") initHand();
  if (page === "suggest") initSuggest();
})();
