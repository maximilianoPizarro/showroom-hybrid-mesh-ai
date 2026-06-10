(function () {
  function queryUser() {
    var p = new URLSearchParams(window.location.search);
    return p.get('USER_NAME') || p.get('user_name') || '';
  }

  function metaContent(name) {
    var el = document.querySelector('meta[name="' + name + '"]');
    return el && el.content ? el.content.trim() : '';
  }

  function isPlaceholder(val) {
    if (!val) return true;
    return (
      val.indexOf('YOUR_HUB') !== -1 ||
      val.indexOf('YOUR_EAST') !== -1 ||
      val.indexOf('YOUR_WEST') !== -1 ||
      val.indexOf('%HUB_DOMAIN%') !== -1 ||
      val.indexOf('{hub_domain}') !== -1
    );
  }

  function hubDomainFromMeta() {
    var hub = metaContent('workshop-hub-domain');
    if (hub && !isPlaceholder(hub)) {
      return hub.replace(/^\./, '');
    }
    var host = window.location.hostname || '';
    var idx = host.indexOf('.apps.');
    if (idx !== -1) {
      return host.slice(idx + 1);
    }
    return '';
  }

  function eastDomainFromMeta(hubDomain) {
    var east = metaContent('workshop-east-domain');
    if (east && !isPlaceholder(east)) {
      return east;
    }
    var qp = new URLSearchParams(window.location.search).get('EAST_DOMAIN');
    if (qp) return qp;
    return hubDomain;
  }

  function westDomainFromMeta(hubDomain) {
    var west = metaContent('workshop-west-domain');
    if (west && !isPlaceholder(west)) {
      return west;
    }
    var qp = new URLSearchParams(window.location.search).get('WEST_DOMAIN');
    if (qp) return qp;
    return hubDomain;
  }

  function registrationUrl(hubDomain) {
    var m = metaContent('workshop-registration-url');
    if (m && !isPlaceholder(m)) {
      return m.replace(/\/$/, '');
    }
    return hubDomain ? 'https://workshop-registration.' + hubDomain : '';
  }

  function replaceInText(text, hubDomain, eastDomain, westDomain, user) {
    if (!text) return text;
    if (hubDomain) {
      text = text.replace(/YOUR_HUB_DOMAIN/g, hubDomain);
      text = text.replace(/%HUB_DOMAIN%/g, hubDomain);
      text = text.replace(/\{hub_domain\}/g, hubDomain);
    }
    if (eastDomain) {
      text = text.replace(/YOUR_EAST_DOMAIN/g, eastDomain);
      text = text.replace(/%EAST_DOMAIN%/g, eastDomain);
      text = text.replace(/\{east_domain\}/g, eastDomain);
    }
    if (westDomain) {
      text = text.replace(/YOUR_WEST_DOMAIN/g, westDomain);
      text = text.replace(/%WEST_DOMAIN%/g, westDomain);
      text = text.replace(/\{west_domain\}/g, westDomain);
    }
    var displayUser = user || 'guest (register first)';
    text = text.replace(/\{user_name\}/g, displayUser);
    text = text.replace(/%USER_NAME%/g, displayUser);
    text = text.replace(/pass:\[%USER_NAME%\]/g, displayUser);
    if (user) {
      text = text.replace(/\bguest \(register first\)/g, user);
      text = text.replace(/\bguest\b/g, user);
    }
    return text;
  }

  function replacePlaceholders(hubDomain, eastDomain, westDomain, user) {
    document.querySelectorAll('a[href]').forEach(function (a) {
      a.href = replaceInText(a.href, hubDomain, eastDomain, westDomain, user);
    });
    document.querySelectorAll('code').forEach(function (el) {
      el.textContent = replaceInText(el.textContent, hubDomain, eastDomain, westDomain, user);
    });
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    while (walker.nextNode()) {
      var n = walker.currentNode;
      if (
        n.parentElement &&
        (n.parentElement.tagName === 'SCRIPT' || n.parentElement.tagName === 'STYLE')
      ) {
        continue;
      }
      var t = n.textContent;
      if (
        t.indexOf('YOUR_HUB') !== -1 ||
        t.indexOf('YOUR_EAST') !== -1 ||
        t.indexOf('%HUB_DOMAIN%') !== -1 ||
        t.indexOf('%EAST_DOMAIN%') !== -1 ||
        t.indexOf('{hub_domain}') !== -1 ||
        t.indexOf('{user_name}') !== -1 ||
        t.indexOf('%USER_NAME%') !== -1 ||
        (user && t.indexOf('guest') !== -1)
      ) {
        nodes.push(n);
      }
    }
    nodes.forEach(function (n) {
      n.textContent = replaceInText(n.textContent, hubDomain, eastDomain, westDomain, user);
    });
  }

  function wireRegistrationLinks(hubDomain, user) {
    var base = registrationUrl(hubDomain);
    var href = base ? base + (user ? '?USER_NAME=' + encodeURIComponent(user) : '') : '#';
    ['workshop-register-link', 'workshop-register-cta-main'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      if (base) {
        el.href = href;
        el.onclick = null;
      } else {
        el.href = '#';
        el.onclick = function (e) {
          e.preventDefault();
          alert('Open OpenShift Console → Hybrid Mesh AI Workshop to register.');
        };
      }
    });
  }

  function applyUser() {
    var user = queryUser();
    var hubDomain = hubDomainFromMeta();
    var eastDomain = eastDomainFromMeta(hubDomain);
    var westDomain = westDomainFromMeta(hubDomain);
    replacePlaceholders(hubDomain, eastDomain, westDomain, user);
    document.querySelectorAll('.workshop-user-name').forEach(function (el) {
      el.textContent = user || 'guest (register first)';
    });
    if (user) {
      document.querySelectorAll('.workshop-user-badge').forEach(function (el) {
        el.classList.add('workshop-user-badge--active');
      });
    }
    wireRegistrationLinks(hubDomain, user);
    if (hubDomain) {
      var regMeta = document.querySelector('meta[name="workshop-registration-url"]');
      if (regMeta && isPlaceholder(regMeta.content)) {
        regMeta.content = 'https://workshop-registration.' + hubDomain;
      }
      var hubMeta = document.querySelector('meta[name="workshop-hub-domain"]');
      if (hubMeta && isPlaceholder(hubMeta.content)) {
        hubMeta.content = hubDomain;
      }
      var eastMeta = document.querySelector('meta[name="workshop-east-domain"]');
      if (eastMeta && isPlaceholder(eastMeta.content)) {
        eastMeta.content = eastDomain;
      }
      var westMeta = document.querySelector('meta[name="workshop-west-domain"]');
      if (westMeta && isPlaceholder(westMeta.content)) {
        westMeta.content = westDomain;
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyUser);
  } else {
    applyUser();
  }
})();
