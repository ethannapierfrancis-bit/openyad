/* OpenYad: all the site's behaviour lives in this one file.
   It reads the data files (data/site.js, data/areas.js, data/listings.js)
   and builds each page. Nothing is sent to any server. */
(function () {
  "use strict";

  var SITE = window.SITE, CATS = window.CATEGORIES, AREAS = window.AREAS;
  var CHECK = "Check with organiser";
  // Only show listings for the site's city, plus online ones.
  var LISTINGS = window.LISTINGS.filter(function (l) {
    return l.city === SITE.city || l.city === "Online";
  });

  /* ---------- small helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
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

  /* ---------- header and footer (same on every page) ---------- */
  var LOGO = '<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="16" fill="#0F766E"/>' +
    '<g fill="#fff"><rect x="9" y="9" width="3.2" height="11" rx="1.6"/><rect x="13" y="6.5" width="3.2" height="13" rx="1.6"/>' +
    '<rect x="17" y="7.5" width="3.2" height="12" rx="1.6"/><rect x="21" y="10.5" width="3" height="9.5" rx="1.5"/>' +
    '<rect x="9" y="16" width="15" height="10" rx="5"/><rect x="4.5" y="16" width="3.2" height="8" rx="1.6" transform="rotate(-35 6 20)"/></g></svg>';

  function layout() {
    var page = document.body.dataset.page;
    var links = [
      ["index", "index.html", "Home"], ["browse", "browse.html", "Browse"],
      ["saved", "saved.html", "Saved"], ["hand", "hand.html", "My Hand"],
      ["suggest", "suggest.html", "Suggest"], ["about", "about.html", "About"]
    ];
    var nav = links.map(function (l) {
      var extra = l[0] === "saved" ? ' <span class="count-pill" id="saved-count"></span>' : "";
      return '<a href="' + l[1] + '"' + (l[0] === page ? ' aria-current="page"' : "") + ">" + l[2] + extra + "</a>";
    }).join("");
    $("#site-header").innerHTML = '<div class="wrap"><a class="brand" href="index.html">' + LOGO +
      "<span>Open<span>Yad</span></span></a><nav class=\"nav\" aria-label=\"Main\">" + nav + "</nav></div>";
    $("#site-footer").innerHTML = '<div class="wrap"><nav aria-label="Footer">' +
      '<a href="browse.html">Browse</a><a href="saved.html">Saved</a><a href="hand.html">My Hand</a>' +
      '<a href="suggest.html">Suggest an opportunity</a><a href="about.html">About</a></nav>' +
      "<p>" + esc(SITE.name) + " is a directory. It only links to each organisation's own website or public contact details, " +
      "and never registers volunteers itself. Always confirm details with the organiser, and ask a parent or guardian before you sign up.</p>" +
      "<p>No accounts, no tracking, no adverts, no donations. Your saved list and points stay in your own browser.</p></div>";
    updateSavedCount();
  }
  function updateSavedCount() {
    var el = $("#saved-count"); if (!el) return;
    var n = load("saved", []).length;
    el.textContent = n ? n : ""; el.style.display = n ? "" : "none";
  }

  /* ---------- labels ---------- */
  function ageLabel(l) {
    if (l.minAge === null || l.minAge === undefined) return CHECK;
    if (l.minAge === 0) return "No minimum age";
    return l.minAge + "+";
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

  /* ---------- one listing card ---------- */
  function cardHTML(l, fromArea) {
    var main = cat(l.categories[0]);
    var saved = load("saved", []).indexOf(l.id) > -1;
    var tags = l.categories.map(function (id) {
      var c = cat(id);
      return '<span class="tag" style="--c:' + c.colour + '">' + c.icon + " " + esc(c.name) + "</span>";
    }).join("");
    var where = l.mode === "home" ? "From home" : esc(l.locationText);
    var d = fromArea && l.mode !== "home" ? distanceTo(l, fromArea) : null;
    if (d !== null) where += ' <span class="badge">about ' + (d < 1 ? "under 1" : Math.round(d)) + " km away</span>";
    var ageBadge = l.minAge !== null && l.minAge >= 18 ? ' <span class="badge warn">Adults only</span>' : "";
    var dofeBadge = l.dofe === "yes" ? ' <span class="badge gold">Award-friendly</span>' : "";
    var btn = l.button === "signup" ? "Sign up on their website" : "Contact them";

    return '<article class="card" style="--c:' + main.colour + '" data-id="' + esc(l.id) + '">' +
      '<div class="card-top"><div class="tags">' + tags + "</div>" +
      '<button class="save" type="button" aria-pressed="' + saved + '" data-save="' + esc(l.id) + '">' +
      (saved ? "★ Saved" : "☆ Save") + "</button></div>" +
      "<h3>" + esc(l.title) + '</h3><p class="org">' + esc(l.organisation) + "</p>" +
      "<p>" + esc(l.description) + "</p>" +
      '<ul class="facts">' +
      '<li><span class="k">Age</span><span>' + esc(ageLabel(l)) + ageBadge + "</span></li>" +
      '<li><span class="k">Time</span><span>' + esc(l.sessionLength) + "</span></li>" +
      '<li><span class="k">How often</span><span>' + esc(freqLabel(l)) + dofeBadge + "</span></li>" +
      '<li><span class="k">Where</span><span>' + where + "</span></li></ul>" +
      "<details><summary>Full details and what happens next</summary><dl>" +
      "<div><dt>Minimum age</dt><dd>" + esc(ageLabel(l)) + (l.ageNote ? ". " + esc(l.ageNote) : "") + "</dd></div>" +
      "<div><dt>Parent or guardian</dt><dd>" + esc(l.parent) + "</dd></div>" +
      "<div><dt>Nearest Metro</dt><dd>" + esc(l.metro) + "</dd></div>" +
      "<div><dt>Duke of Edinburgh or school service hours</dt><dd>" + esc(DOFE[l.dofe]) + ". " + esc(l.dofeNote) + "</dd></div>" +
      "<div><dt>What happens next</dt><dd><ol>" + l.nextSteps.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ol></dd></div>" +
      "<div><dt>Public contact details</dt><dd>" + esc(l.contact) + "</dd></div>" +
      '<div><dt>Listing last checked</dt><dd>' + niceDate(l.lastChecked) + ' · <a href="' + esc(l.source) +
      '" target="_blank" rel="noopener noreferrer">source page</a></dd></div>' +
      "</dl></details>" +
      '<a class="btn block" href="' + esc(l.link) + '" target="_blank" rel="noopener noreferrer">' + btn + " ↗</a>" +
      "</article>";
  }

  // One click handler for every Save button on the page.
  function wireSaves(onChange) {
    document.addEventListener("click", function (e) {
      var b = e.target.closest("[data-save]"); if (!b) return;
      var id = b.dataset.save, saved = load("saved", []), i = saved.indexOf(id);
      if (i > -1) saved.splice(i, 1); else saved.push(id);
      save("saved", saved);
      b.setAttribute("aria-pressed", i === -1);
      b.textContent = i === -1 ? "★ Saved" : "☆ Save";
      updateSavedCount();
      if (onChange) onChange();
    });
  }

  function areaOptions(selected) {
    return '<option value="">Choose your area</option>' + AREAS.map(function (a) {
      return "<option" + (a.name === selected ? " selected" : "") + ">" + esc(a.name) + "</option>";
    }).join("");
  }

  /* ---------- HOME ---------- */
  function initHome() {
    $("#cat-grid").innerHTML = CATS.map(function (c) {
      var n = LISTINGS.filter(function (l) { return l.categories.indexOf(c.id) > -1; }).length;
      return '<a class="cat-card" style="--c:' + c.colour + '" href="browse.html?cat=' + c.id + '">' +
        '<span class="icon" aria-hidden="true">' + c.icon + "</span><strong>" + esc(c.name) + "</strong>" +
        "<small>" + n + (n === 1 ? " opportunity" : " opportunities") + "</small></a>";
    }).join("");
    $("#total").textContent = LISTINGS.length;
  }

  /* ---------- BROWSE ---------- */
  function initBrowse() {
    var params = new URLSearchParams(location.search);
    var f = {
      q: params.get("q") || "", cat: params.get("cat") || "", age: "", time: "", freq: "", mode: "",
      area: load("area", ""), sort: "best", unsure: true
    };
    if (f.area) f.sort = "near";

    $("#f-cat").innerHTML = '<option value="">All categories</option>' + CATS.map(function (c) {
      return '<option value="' + c.id + '">' + c.icon + " " + esc(c.name) + "</option>";
    }).join("");
    $("#f-area").innerHTML = areaOptions(f.area);
    $("#f-q").value = f.q; $("#f-cat").value = f.cat; $("#f-sort").value = f.sort;

    function matches(l) {
      if (f.cat && l.categories.indexOf(f.cat) === -1) return false;
      if (f.mode && l.mode !== f.mode) return false;
      if (f.age) {
        if (l.minAge === null) { if (!f.unsure) return false; }
        else if (l.minAge > Number(f.age)) return false;
      }
      if (f.time) {
        if (!l.duration.length) { if (!f.unsure) return false; }
        else if (l.duration.indexOf(f.time) === -1) return false;
      }
      if (f.freq) {
        if (!l.frequency.length) { if (!f.unsure) return false; }
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
    function nearRank(l) {
      if (l.mode === "home") return 10000;            // from home: after places with a known distance
      var d = distanceTo(l, f.area); return d === null ? 20000 : d;   // no fixed place: last
    }
    function render() {
      var list = LISTINGS.filter(matches);
      if (f.sort === "near" && f.area) list.sort(function (a, b) { return nearRank(a) - nearRank(b); });
      else if (f.sort === "az") list.sort(function (a, b) { return a.title.localeCompare(b.title); });
      else list.sort(function (a, b) { return ageRank(a) - ageRank(b); });
      $("#count").textContent = list.length + (list.length === 1 ? " opportunity" : " opportunities");
      $("#results").innerHTML = list.length ? list.map(function (l) { return cardHTML(l, f.area); }).join("") :
        '<div class="empty"><h3>Nothing matches all of those filters</h3><p class="muted">Try removing one filter, or tick the box to include listings with unconfirmed details.</p></div>';
      $("#near-hint").hidden = !(f.sort === "near" && !f.area);
    }
    function bind(id, key, isCheck) {
      $(id).addEventListener(isCheck ? "change" : "input", function (e) {
        f[key] = isCheck ? e.target.checked : e.target.value;
        if (key === "area") { save("area", f.area); if (f.area) { f.sort = "near"; $("#f-sort").value = "near"; } }
        render();
      });
    }
    bind("#f-q", "q"); bind("#f-cat", "cat"); bind("#f-age", "age"); bind("#f-time", "time");
    bind("#f-freq", "freq"); bind("#f-mode", "mode"); bind("#f-area", "area"); bind("#f-sort", "sort");
    bind("#f-unsure", "unsure", true);
    $("#reset").addEventListener("click", function () {
      f.q = f.cat = f.age = f.time = f.freq = f.mode = ""; f.unsure = true; f.sort = f.area ? "near" : "best";
      ["#f-q", "#f-cat", "#f-age", "#f-time", "#f-freq", "#f-mode"].forEach(function (s) { $(s).value = ""; });
      $("#f-unsure").checked = true; $("#f-sort").value = f.sort; render();
    });
    wireSaves();
    render();
  }

  /* ---------- SAVED ---------- */
  function initSaved() {
    function render() {
      var ids = load("saved", []), area = load("area", "");
      var list = ids.map(listing).filter(Boolean);
      $("#results").innerHTML = list.length ? list.map(function (l) { return cardHTML(l, area); }).join("") :
        '<div class="empty"><h3>Your shortlist is empty</h3><p class="muted">Press “☆ Save” on any opportunity to keep it here.</p>' +
        '<a class="btn" href="browse.html">Browse opportunities</a></div>';
    }
    wireSaves(render);
    render();
  }

  /* ---------- MY HAND (points) ---------- */
  var LEVELS = [[0, "Open Hand"], [60, "Helping Hand"], [180, "Steady Hand"], [360, "Guiding Hand"], [580, "Bright Hand"], [800, "Gold Yad"]];
  var POINTS_PER_SHAPE = 20;

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
  var FINGERS = [
    { x: 108, y: 208, len: 118, w: 28, ang: -8, dots: [0.3, 0.57, 0.84] },
    { x: 138, y: 204, len: 134, w: 28, ang: -2, dots: [0.3, 0.57, 0.84] },
    { x: 168, y: 206, len: 122, w: 28, ang: 5, dots: [0.3, 0.57, 0.84] },
    { x: 196, y: 216, len: 94, w: 24, ang: 14, dots: [0.3, 0.57, 0.84] },
    { x: 95, y: 268, len: 80, w: 30, ang: -55, dots: [0.45, 0.8] }
  ];
  function handSVG(colours, label) {
    var s = '<svg viewBox="0 0 300 350" role="img" aria-label="' + esc(label) + '"><g fill="#EFE9DD">';
    FINGERS.forEach(function (f) {
      s += '<rect x="' + (f.x - f.w / 2) + '" y="' + (f.y - f.len) + '" width="' + f.w + '" height="' + (f.len + 26) +
        '" rx="' + (f.w / 2) + '" transform="rotate(' + f.ang + " " + f.x + " " + f.y + ')"/>';
    });
    s += '<rect x="85" y="190" width="130" height="135" rx="46"/></g>';
    shapes().forEach(function (sh, i) {
      var col = colours[i], style = col ? 'fill="' + col + '"' : 'fill="none" stroke="#CFC6B4" stroke-width="1.5" stroke-dasharray="2 3"';
      if (sh.t === "petal") s += '<ellipse cx="' + sh.x.toFixed(1) + '" cy="' + sh.y.toFixed(1) + '" rx="9" ry="4.5" transform="rotate(' + sh.rot + " " + sh.x.toFixed(1) + " " + sh.y.toFixed(1) + ')" ' + style + "/>";
      else s += '<circle cx="' + sh.x.toFixed(1) + '" cy="' + sh.y.toFixed(1) + '" r="' + sh.r + '" ' + style + "/>";
    });
    return s + "</svg>";
  }

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
  function handPanel(points, catIds, title) {
    var lv = levelFor(points), pct = lv.next ? Math.round((points - lv.from) / (lv.next[0] - lv.from) * 100) : 100;
    var colours = catIds.map(function (id) { return cat(id).colour; });
    return handSVG(colours, title + ": " + catIds.length + " of 40 shapes filled") +
      '<p class="level">' + esc(lv.name) + '</p><p class="muted small">' + points + " points</p>" +
      '<div class="bar" aria-hidden="true"><i style="width:' + pct + '%"></i></div>' +
      '<p class="small muted">' + (lv.next ? (lv.next[0] - points) + " points to " + esc(lv.next[1]) : "Every shape is filled. You reached Gold Yad!") + "</p>";
  }

  function initHand() {
    // A friend's shared link looks like  hand.html#hand=120.abacd  (points, then one letter per filled shape).
    var m = /^#hand=(\d{1,5})\.([a-z]{0,40})$/.exec(location.hash);
    if (m) {
      var ids = m[2].split("").map(function (ch) { return (CATS[ch.charCodeAt(0) - 97] || CATS[0]).id; });
      var mine = progress(load("log", []));
      $("#friend").hidden = false;
      $("#friend-hand").innerHTML = handPanel(Number(m[1]), ids, "A friend's hand");
      $("#friend-compare").textContent = "Your own hand has " + mine.points + " points. Volunteer together and you both earn the friends bonus.";
    }

    var sel = $("#log-what"), saved = load("saved", []).map(listing).filter(Boolean);
    function opts(list) { return list.map(function (l) { return '<option value="' + esc(l.id) + '">' + esc(l.title + " · " + l.organisation) + "</option>"; }).join(""); }
    sel.innerHTML = '<option value="">Choose what you did</option>' +
      (saved.length ? '<optgroup label="Your saved list">' + opts(saved) + "</optgroup>" : "") +
      '<optgroup label="All opportunities">' + opts(LISTINGS.slice().sort(function (a, b) { return a.title.localeCompare(b.title); })) + "</optgroup>" +
      '<option value="other">Something else</option>';
    $("#log-cat").innerHTML = CATS.map(function (c) { return '<option value="' + c.id + '">' + c.icon + " " + esc(c.name) + "</option>"; }).join("");
    var today = new Date(); today = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    $("#log-date").value = today; $("#log-date").max = today;
    sel.addEventListener("change", function () { $("#other-cat").hidden = sel.value !== "other"; });

    function render() {
      var log = load("log", []), p = progress(log);
      $("#my-hand").innerHTML = handPanel(p.points, p.cats, "Your hand") +
        '<div class="stats"><div class="stat"><b>' + p.sessions + "</b><small>sessions</small></div>" +
        '<div class="stat"><b>' + p.hours + "</b><small>hours</small></div>" +
        '<div class="stat"><b>' + p.tried + "</b><small>categories tried</small></div>" +
        '<div class="stat"><b>' + p.streak + "</b><small>week streak</small></div></div>";
      var sorted = log.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
      $("#log-list").innerHTML = sorted.length ? sorted.map(function (s) {
        return "<li><span><strong>" + esc(s.title) + '</strong><br><span class="small muted">' + niceDate(s.date) + " · " + s.hours +
          (s.hours === 1 ? " hour" : " hours") + (s.friends ? " · with friends" : "") + " · " + cat(s.cat).icon + "</span></span>" +
          '<button class="linkish" type="button" data-del="' + s.key + '">Remove</button></li>';
      }).join("") : '<li class="muted">Nothing logged yet. Your first session fills in the centre of your hand.</li>';
      $("#share").hidden = p.points === 0;
      $("#share").dataset.link = location.href.split("#")[0] + "#hand=" + p.points + "." +
        p.cats.map(function (id) { return String.fromCharCode(97 + Math.max(0, CATS.indexOf(cat(id)))); }).join("");
    }
    $("#log-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var id = sel.value, l = listing(id);
      if (!id) { $("#log-msg").textContent = "Choose what you did first."; return; }
      var log = load("log", []);
      log.push({
        key: Date.now() + "-" + log.length,
        title: l ? l.title : "Other volunteering",
        cat: l ? l.categories[0] : $("#log-cat").value,
        date: $("#log-date").value || today,
        hours: Number($("#log-hours").value),
        friends: $("#log-friends").checked
      });
      save("log", log); sel.value = ""; $("#other-cat").hidden = true; $("#log-friends").checked = false;
      $("#log-msg").textContent = "Logged. Look at your hand grow!";
      render();
    });
    $("#log-list").addEventListener("click", function (e) {
      var b = e.target.closest("[data-del]"); if (!b) return;
      save("log", load("log", []).filter(function (s) { return s.key !== b.dataset.del; })); render();
    });
    $("#share").addEventListener("click", function () {
      var link = $("#share").dataset.link, done = function () { $("#share-msg").textContent = "Link copied. Send it to a friend."; };
      if (navigator.share) navigator.share({ title: "My OpenYad hand", url: link }).catch(function () {});
      else if (navigator.clipboard) navigator.clipboard.writeText(link).then(done, function () { $("#share-msg").textContent = link; });
      else $("#share-msg").textContent = link;
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
  if (page === "hand") initHand();
  if (page === "suggest") initSuggest();
})();
