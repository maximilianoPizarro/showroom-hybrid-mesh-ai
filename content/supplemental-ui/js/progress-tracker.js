(function () {
  function registrationBase() {
    var u = document.querySelector('meta[name="workshop-registration-url"]');
    return u ? u.content.replace(/\/$/, '') : '';
  }
  function currentUser() {
    var p = new URLSearchParams(window.location.search);
    return p.get('USER_NAME') || p.get('user_name') || '';
  }
  window.saveWorkshopProgress = function (moduleId) {
    var root = document.querySelector('.workshop-progress[data-module="' + moduleId + '"]');
    if (!root) return;
    var username = currentUser();
    if (!username) {
      alert('Register first at workshop-registration to get userN');
      return;
    }
    var completed = root.querySelector('[data-completed]').checked;
    var interested = root.querySelector('[data-interest]').checked;
    fetch(registrationBase() + '/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username,
        module_id: moduleId,
        completed: completed,
        interested_more: interested,
        completed_via: 'showroom',
      }),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function () {
        root.style.borderColor = '#3e8635';
      })
      .catch(function () {
        alert('Could not save progress');
      });
  };
})();
