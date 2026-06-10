(function () {
  function queryUser() {
    var p = new URLSearchParams(window.location.search);
    return p.get('USER_NAME') || p.get('user_name') || '';
  }
  function registrationUrl() {
    var m = document.querySelector('meta[name="workshop-registration-url"]');
    if (m && m.content && m.content.indexOf('YOUR_HUB') === -1) {
      return m.content.replace(/\/$/, '');
    }
    var hub = document.querySelector('meta[name="workshop-hub-domain"]');
    if (hub && hub.content && hub.content.indexOf('YOUR_HUB') === -1) {
      return 'https://workshop-registration.' + hub.content.replace(/^\./, '');
    }
    return '';
  }
  function applyUser() {
    var user = queryUser();
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
            alert('Registration URL not configured. Open OpenShift Console → Hybrid Mesh AI Workshop.');
          };
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyUser);
  } else {
    applyUser();
  }
})();
