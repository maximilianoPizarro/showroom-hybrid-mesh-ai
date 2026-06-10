(function () {
  function queryUser() {
    var p = new URLSearchParams(window.location.search);
    return p.get('USER_NAME') || p.get('user_name') || '';
  }

  function hubDomainFromMeta() {
    var hub = document.querySelector('meta[name="workshop-hub-domain"]');
    if (hub && hub.content && hub.content.indexOf('YOUR_HUB') === -1 && hub.content.indexOf('{hub_domain}') === -1) {
      return hub.content.replace(/^\./, '');
    }
    var host = window.location.hostname || '';
    var idx = host.indexOf('.apps.');
    if (idx !== -1) {
      return host.slice(idx + 1);
    }
    return '';
  }

  function registrationUrl(domain) {
    var m = document.querySelector('meta[name="workshop-registration-url"]');
    if (m && m.content && m.content.indexOf('YOUR_HUB') === -1 && m.content.indexOf('{hub_domain}') === -1) {
      return m.content.replace(/\/$/, '');
    }
    return domain ? 'https://workshop-registration.' + domain : '';
  }

  function replaceInText(text, domain, user) {
    if (!text) return text;
    if (domain) {
      text = text.replace(/YOUR_HUB_DOMAIN/g, domain);
      text = text.replace(/\{hub_domain\}/g, domain);
    }
    var displayUser = user || 'guest (register first)';
    text = text.replace(/\{user_name\}/g, displayUser);
    text = text.replace(/%USER_NAME%/g, displayUser);
    text = text.replace(/pass:\[%USER_NAME%\]/g, displayUser);
    return text;
  }

  function replacePlaceholders(domain, user) {
    if (domain) {
      document.querySelectorAll('a[href]').forEach(function (a) {
        a.href = replaceInText(a.href, domain, user);
      });
    }
    document.querySelectorAll('code').forEach(function (el) {
      el.textContent = replaceInText(el.textContent, domain, user);
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
      if (
        n.textContent.indexOf('YOUR_HUB') !== -1 ||
        n.textContent.indexOf('{hub_domain}') !== -1 ||
        n.textContent.indexOf('{user_name}') !== -1 ||
        n.textContent.indexOf('%USER_NAME%') !== -1
      ) {
        nodes.push(n);
      }
    }
    nodes.forEach(function (n) {
      n.textContent = replaceInText(n.textContent, domain, user);
    });
  }

  function applyUser() {
    var user = queryUser();
    var domain = hubDomainFromMeta();
    replacePlaceholders(domain, user);
    document.querySelectorAll('.workshop-user-name').forEach(function (el) {
      el.textContent = user || 'guest (register first)';
    });
    if (user) {
      document.querySelectorAll('.workshop-user-badge').forEach(function (el) {
        el.classList.add('workshop-user-badge--active');
      });
    }
    var reg = document.getElementById('workshop-register-link');
    if (reg) {
      var base = registrationUrl(domain);
      reg.href = base ? base + (user ? '?USER_NAME=' + encodeURIComponent(user) : '') : '#';
      reg.onclick = base
        ? null
        : function (e) {
            e.preventDefault();
            alert('Open OpenShift Console → Hybrid Mesh AI Workshop to register.');
          };
    }
    var regMeta = document.querySelector('meta[name="workshop-registration-url"]');
    if (regMeta && domain && (regMeta.content.indexOf('YOUR_HUB') !== -1 || regMeta.content.indexOf('{hub_domain}') !== -1)) {
      regMeta.content = 'https://workshop-registration.' + domain;
    }
    var hubMeta = document.querySelector('meta[name="workshop-hub-domain"]');
    if (hubMeta && domain && (hubMeta.content.indexOf('YOUR_HUB') !== -1 || hubMeta.content.indexOf('{hub_domain}') !== -1)) {
      hubMeta.content = domain;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyUser);
  } else {
    applyUser();
  }
})();
