(function () {
  function queryUser() {
    var p = new URLSearchParams(window.location.search);
    return p.get('USER_NAME') || p.get('user_name') || '';
  }
  function hubDomainFromMeta() {
    var hub = document.querySelector('meta[name="workshop-hub-domain"]');
    if (hub && hub.content && hub.content.indexOf('YOUR_HUB') === -1) {
      return hub.content.replace(/^\./, '');
    }
    var host = window.location.hostname || '';
    var idx = host.indexOf('.apps.');
    if (idx !== -1) {
      return host.slice(idx + 1);
    }
    return '';
  }
  function registrationUrl() {
    var m = document.querySelector('meta[name="workshop-registration-url"]');
    if (m && m.content && m.content.indexOf('YOUR_HUB') === -1) {
      return m.content.replace(/\/$/, '');
    }
    var domain = hubDomainFromMeta();
    return domain ? 'https://workshop-registration.' + domain : '';
  }
  function replaceHubPlaceholders(domain) {
    if (!domain) return;
    document.querySelectorAll('a[href*="YOUR_HUB_DOMAIN"]').forEach(function (a) {
      a.href = a.href.replace(/YOUR_HUB_DOMAIN/g, domain);
    });
    document.body.innerHTML = document.body.innerHTML.replace(/YOUR_HUB_DOMAIN/g, domain);
  }
  function applyUser() {
    var user = queryUser();
    var domain = hubDomainFromMeta();
    replaceHubPlaceholders(domain);
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
      var base = registrationUrl();
      reg.href = base || '#';
      reg.onclick = base
        ? null
        : function (e) {
            e.preventDefault();
            alert('Open OpenShift Console → Hybrid Mesh AI Workshop to register.');
          };
    }
    var regMeta = document.querySelector('meta[name="workshop-registration-url"]');
    if (regMeta && domain && regMeta.content.indexOf('YOUR_HUB') !== -1) {
      regMeta.content = 'https://workshop-registration.' + domain;
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyUser);
  } else {
    applyUser();
  }
})();
