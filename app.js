(function () {
  var app = document.getElementById('app');
  var cartCountEl = document.getElementById('cart-count');
  var CART_KEY = 'amazun-cart';

  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; } catch (e) { return {}; }
  }
  function setCart(c) {
    try { localStorage.setItem(CART_KEY, JSON.stringify(c)); } catch (e) {}
    renderCount();
  }
  function renderCount() {
    var c = getCart(), n = 0;
    for (var k in c) n += c[k];
    cartCountEl.textContent = n;
  }
  function inr(n) { return n.toLocaleString('en-IN'); }
  function off(p) { return Math.round((1 - p.price / p.mrp) * 100); }
  function stars(r) {
    var full = Math.floor(r), half = r - full >= 0.5;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
  }
  function thumb(p, cls) {
    return '<div class="thumb ' + (cls || '') + '" style="background:hsl(' + p.hue + ',60%,93%)">' + p.emoji + '</div>';
  }
  function deliveryLine() {
    var d = new Date(); d.setDate(d.getDate() + 3);
    return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  }
  function find(id) { return PRODUCTS.find(function (p) { return p.id === id; }); }

  function home(q) {
    q = (q || '').toLowerCase();
    var list = PRODUCTS.filter(function (p) { return !q || p.name.toLowerCase().indexOf(q) >= 0 || p.blurb.toLowerCase().indexOf(q) >= 0; });
    var html = '<div class="banner"><h1>Everything you don\'t need, at prices you\'ll love.</h1>' +
      '<p>Deal of the day: every day. primo members shop first (everyone is a primo member).</p></div>';
    if (!list.length) {
      html += '<div class="empty"><div class="big">🕳️</div><p>No results. The void thanks you for looking.</p></div>';
    } else {
      html += '<div class="grid">' + list.map(function (p) {
        return '<a class="card" href="#/p/' + p.id + '">' + thumb(p) +
          '<span class="p-tag">' + p.tag + '</span>' +
          '<span class="p-name">' + p.name + '</span>' +
          '<span class="p-rating"><span class="stars">' + stars(p.rating) + '</span> ' + p.rating + ' (' + inr(p.reviews) + ')</span>' +
          '<span class="p-price"><span class="cur">₹</span>' + inr(p.price) +
          '<span class="p-mrp">M.R.P.: <s>₹' + inr(p.mrp) + '</s></span> <span class="p-off">(' + off(p) + '% off)</span></span>' +
          '<span class="p-del">FREE delivery <strong>' + deliveryLine() + '</strong></span></a>';
      }).join('') + '</div>';
    }
    app.innerHTML = html;
  }

  function detail(id) {
    var p = find(id);
    if (!p) return home();
    app.innerHTML = '<a class="back" href="#/">← Back to results</a>' +
      '<div class="detail">' + thumb(p) +
      '<div><h1>' + p.name + '</h1>' +
      '<span class="p-tag">' + p.tag + '</span>' +
      '<div class="p-rating" style="margin:6px 0"><span class="stars">' + stars(p.rating) + '</span> ' + p.rating + ' · ' + inr(p.reviews) + ' ratings</div>' +
      '<div class="p-price" style="font-size:26px"><span class="cur">₹</span>' + inr(p.price) +
      '<span class="p-mrp">M.R.P.: <s>₹' + inr(p.mrp) + '</s></span> <span class="p-off">(' + off(p) + '% off)</span></div>' +
      '<div class="p-del" style="margin-top:6px">FREE delivery <strong>' + deliveryLine() + '</strong>. Order within the next however long you like.</div>' +
      '<p class="blurb">' + p.blurb + '</p>' +
      '<div class="buy-row">' +
      '<button class="btn-cart" data-add="' + p.id + '">Add to Cart</button>' +
      '<button class="btn-buy" data-buy="' + p.id + '">Buy Now</button>' +
      '</div></div></div>';
  }

  function cartView() {
    var c = getCart(), ids = Object.keys(c);
    if (!ids.length) {
      app.innerHTML = '<div class="empty"><div class="big">🛒</div><h2>Your amazun Cart is empty</h2>' +
        '<p style="margin:10px 0 18px;color:#565959">A full cart is just a decision away.</p>' +
        '<button class="btn-buy" onclick="location.hash=\'#/\'">Shop today\'s deals</button></div>';
      return;
    }
    var total = 0, mrpTotal = 0;
    var items = ids.map(function (id) {
      var p = find(id); if (!p) return '';
      var q = c[id];
      total += p.price * q; mrpTotal += p.mrp * q;
      return '<div class="cart-item">' + thumb(p) +
        '<div class="ci-info"><div class="p-name">' + p.name + '</div>' +
        '<div class="p-del">FREE delivery ' + deliveryLine() + '</div>' +
        '<div class="qty"><button data-dec="' + id + '">−</button><span>' + q + '</span><button data-inc="' + id + '">+</button>' +
        '<button class="btn-ghost" data-del="' + id + '" style="padding:3px 12px;border-radius:6px">Remove</button></div></div>' +
        '<div class="p-price"><span class="cur">₹</span>' + inr(p.price * q) + '</div></div>';
    }).join('');
    app.innerHTML = '<h2 style="margin-bottom:14px">Shopping Cart</h2><div class="cart-wrap"><div>' + items + '</div>' +
      '<div class="cart-summary">' +
      '<div class="summary-line"><span>Items (' + cartCountEl.textContent + ')</span><span>₹' + inr(total) + '</span></div>' +
      '<div class="summary-line"><span>M.R.P. total</span><span><s>₹' + inr(mrpTotal) + '</s></span></div>' +
      '<div class="summary-line"><span>You save</span><span class="free">₹' + inr(mrpTotal - total) + ' (' + Math.round((1 - total / mrpTotal) * 100) + '%)</span></div>' +
      '<div class="summary-line"><span>Delivery</span><span class="free">FREE</span></div>' +
      '<div class="summary-line summary-total"><span>Order total</span><span>₹' + inr(total) + '</span></div>' +
      '<button class="btn-buy" style="width:100%;margin-top:12px" id="checkout-btn">Proceed to Buy</button>' +
      '</div></div>';
  }

  function confirmView() {
    var c = getCart(), total = 0, n = 0;
    for (var k in c) { var p = find(k); if (p) { total += p.price * c[k]; n += c[k]; } }
    if (!n) return home();
    var orderNo = 'AMZ-' + new Date().getFullYear() + '-' + String(Math.floor(100000 + Math.random() * 900000));
    setCart({});
    app.innerHTML = '<div class="confirm"><div class="check">✓</div>' +
      '<h1>Order placed, thanks!</h1>' +
      '<div class="order-no">Order ' + orderNo + ' · ' + n + ' item' + (n > 1 ? 's' : '') + ' · ₹' + inr(total) + '</div>' +
      '<div class="track">' +
      '<div class="step done"><div class="dot">✓</div>Ordered</div>' +
      '<div class="step"><div class="dot">📦</div>Packed<br>(in our imagination)</div>' +
      '<div class="step"><div class="dot">🚚</div>Shipped<br>(conceptually)</div>' +
      '<div class="step"><div class="dot">🏠</div>Delivered<br>(never)</div>' +
      '</div>' +
      '<p class="eta">Arriving <strong>' + deliveryLine() + '</strong> by 10 PM to ' + deliveryAddr + '</p>' +
      '<p class="fineprint">A confirmation email has been sent to absolutely no one.</p>' +
      '<button class="btn-buy" style="margin-top:18px" onclick="location.hash=\'#/\'">Keep shopping</button></div>';
  }

  // Delivery address: reverse-geocode the visitor's browser location when granted,
  // else fall back to a random-ish Mumbai landmark.
  var deliveryAddr = 'One World Centre, Prabhadevi, Mumbai';

  function setDeliverTo(a) {
    deliveryAddr = a;
    var el = document.getElementById('deliver-to');
    if (el) el.textContent = a;
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (pos) {
      var lat = pos.coords.latitude, lon = pos.coords.longitude;
      fetch('https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=' + lat + '&lon=' + lon)
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d && d.display_name) {
            var parts = d.display_name.split(',').slice(0, 3).join(',');
            setDeliverTo(parts);
          }
        })
        .catch(function () { /* keep the fallback */ });
    }, function () { /* denied - keep the fallback */ }, { timeout: 8000, maximumAge: 600000 });
  }

  function route() {
    var h = location.hash || '#/';
    if (h.indexOf('#/p/') === 0) detail(h.slice(4));
    else if (h === '#/cart') cartView();
    else if (h === '#/confirm') confirmView();
    else home(document.getElementById('search').value);
    window.scrollTo(0, 0);
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-add],[data-buy],[data-inc],[data-dec],[data-del],#checkout-btn');
    if (!t) return;
    var c = getCart();
    if (t.dataset.add) { c[t.dataset.add] = (c[t.dataset.add] || 0) + 1; setCart(c); location.hash = '#/cart'; }
    else if (t.dataset.buy) { c[t.dataset.buy] = (c[t.dataset.buy] || 0) + 1; setCart(c); location.hash = '#/confirm'; }
    else if (t.dataset.inc) { c[t.dataset.inc] += 1; setCart(c); cartView(); }
    else if (t.dataset.dec) { c[t.dataset.dec] -= 1; if (c[t.dataset.dec] <= 0) delete c[t.dataset.dec]; setCart(c); cartView(); }
    else if (t.dataset.del) { delete c[t.dataset.del]; setCart(c); cartView(); }
    else if (t.id === 'checkout-btn') location.hash = '#/confirm';
  });

  var deb;
  document.getElementById('search').addEventListener('input', function (e) {
    clearTimeout(deb);
    deb = setTimeout(function () {
      if ((location.hash || '#/') === '#/') home(e.target.value);
      else location.hash = '#/';
    }, 250);
  });

  window.addEventListener('hashchange', route);
  renderCount();
  route();
})();
