/* Root ASAP — shared notification bell component
   Storage: localStorage key "rootasap_notifications" = array of
   {id, type, title, message, time, read} newest first, capped at 25.
   Public API: window.RootASAPNotify.push({type,title,message}) */
(function(){
  var STORE_KEY = 'rootasap_notifications';
  var MAX_ITEMS = 25;

  var ICONS = {
    intro: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 8l4 4-4 4M3 12h18" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    message: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.4 8.4 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.4 8.4 0 01-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.4 8.4 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    match: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.1 6.6.7-4.9 4.6 1.3 6.5L12 16.9l-5.9 3 1.3-6.5-4.9-4.6 6.6-.7z"/></svg>',
    interest: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0112 6.5 5.5 5.5 0 0121.5 12c-2.5 4.5-9.5 9-9.5 9z" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    system: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  function readAll(){
    try {
      var raw = JSON.parse(localStorage.getItem(STORE_KEY));
      return Array.isArray(raw) ? raw : [];
    } catch(e){ return []; }
  }
  function writeAll(list){
    try { localStorage.setItem(STORE_KEY, JSON.stringify(list.slice(0, MAX_ITEMS))); } catch(e){}
  }
  function uid(){ return 'n' + Date.now() + Math.random().toString(16).slice(2,6); }

  function timeAgo(ts){
    var diff = Math.max(0, Date.now() - ts);
    var m = Math.floor(diff / 60000);
    if(m < 1) return 'Just now';
    if(m < 60) return m + 'm ago';
    var h = Math.floor(m / 60);
    if(h < 24) return h + 'h ago';
    var d = Math.floor(h / 24);
    if(d < 7) return d + 'd ago';
    return Math.floor(d / 7) + 'w ago';
  }

  function push(notif){
    var list = readAll();
    list.unshift({
      id: uid(),
      type: notif.type || 'system',
      title: notif.title || 'Notification',
      message: notif.message || '',
      time: Date.now(),
      read: false
    });
    writeAll(list);
    render();
  }

  function markAllRead(){
    var list = readAll();
    list.forEach(function(n){ n.read = true; });
    writeAll(list);
    render();
  }

  function seedForRole(role){
    var flagKey = 'rootasap_notif_seeded_' + role;
    if(localStorage.getItem(flagKey)) return;
    localStorage.setItem(flagKey, '1');
    var now = Date.now();
    var seeds = [];
    if(role === 'business'){
      seeds = [
        {type:'interest', title:'New interest expressed', message:'Adaeze O. expressed £500 indicative interest in Lagos Foods Co. — Trade finance.', time: now - 2*3600000, read:false},
        {type:'message', title:'New question on your deal', message:'A prospective investor asked a question on Lagos Foods Co. — Trade finance. Reply in the Q&A tab.', time: now - 6*3600000, read:false},
        {type:'intro', title:'Introduction requested', message:'You requested an introduction to Kwame D. for Accra Homes.', time: now - 26*3600000, read:true},
        {type:'system', title:'Welcome to Root ASAP', message:'Set up your first deal and run AI matching to find diaspora investors near you.', time: now - 5*86400000, read:true}
      ];
    } else if(role === 'broker'){
      seeds = [
        {type:'message', title:'New message from Kwame D.', message:'"Thanks for sending over the pack — I have a couple of questions on Accra Homes."', time: now - 40*60000, read:false},
        {type:'interest', title:'New buyer interest', message:'A buyer registered interest in Accra Homes via the marketplace.', time: now - 5*3600000, read:false},
        {type:'intro', title:'Introduction requested', message:'You requested an introduction to Sade B. for Kumasi Textiles.', time: now - 22*3600000, read:true},
        {type:'system', title:'Welcome to Root ASAP', message:'List a deal and run AI matching to find investors or buyers by location.', time: now - 6*86400000, read:true}
      ];
    } else {
      seeds = [
        {type:'match', title:'3 new deals matched your profile', message:'Kampala Coffee Collective, Abidjan Cocoa Exports and 1 more now match your investor profile.', time: now - 5*3600000, read:false},
        {type:'intro', title:'Introduced to Accra Homes', message:"You've been introduced to the deal owner — check your messages to continue the conversation.", time: now - 20*3600000, read:false},
        {type:'interest', title:'Interest sent to Lagos Foods Co.', message:'Your £500 indicative interest was received. The business owner will respond within 3 business days.', time: now - 2*86400000, read:true},
        {type:'system', title:'Welcome to Root ASAP', message:'Complete your matching questionnaire to sharpen your recommended deals.', time: now - 6*86400000, read:true}
      ];
    }
    var list = readAll();
    seeds.forEach(function(s){ list.push({id: uid(), type:s.type, title:s.title, message:s.message, time:s.time, read:s.read}); });
    list.sort(function(a,b){ return b.time - a.time; });
    writeAll(list);
  }

  function buildMarkup(){
    var wrap = document.getElementById('notifBellWrap');
    if(!wrap) return null;
    wrap.innerHTML =
      '<button class="notif-bell-btn" id="notifBellBtn" aria-label="Notifications" type="button">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.73 21a2 2 0 01-3.46 0" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '<span class="notif-badge" id="notifBadge">0</span>' +
        'Alerts' +
      '</button>' +
      '<div class="notif-panel" id="notifPanel">' +
        '<div class="notif-panel-head"><h4>Notifications</h4><button class="notif-mark-all" id="notifMarkAll" type="button">Mark all read</button></div>' +
        '<div class="notif-list" id="notifList"></div>' +
      '</div>';
    return wrap;
  }

  function render(){
    var wrap = document.getElementById('notifBellWrap');
    if(!wrap) return;
    var list = readAll();
    var badge = document.getElementById('notifBadge');
    var listEl = document.getElementById('notifList');
    var unread = list.filter(function(n){ return !n.read; }).length;
    if(badge){
      badge.textContent = unread > 9 ? '9+' : String(unread);
      badge.classList.toggle('show', unread > 0);
    }
    if(!listEl) return;
    if(list.length === 0){
      listEl.innerHTML = '<div class="notif-empty">No notifications yet — activity on your deals will show up here.</div>';
      return;
    }
    listEl.innerHTML = list.map(function(n){
      var icon = ICONS[n.type] || ICONS.system;
      return '<div class="notif-item' + (n.read ? '' : ' unread') + '">' +
        '<div class="notif-icon icon-' + n.type + '">' + icon + '</div>' +
        '<div class="notif-body">' +
          '<div class="notif-title">' + n.title + '</div>' +
          '<div class="notif-msg">' + n.message + '</div>' +
          '<div class="notif-time">' + timeAgo(n.time) + '</div>' +
        '</div>' +
        (n.read ? '' : '<div class="notif-dot"></div>') +
      '</div>';
    }).join('');
  }

  function init(){
    var session = null;
    try { session = JSON.parse(localStorage.getItem('rootasap_session')); } catch(e){}
    var wrap = buildMarkup();
    if(!wrap) return;
    if(!session || !session.name){
      wrap.style.display = 'none';
      return;
    }
    wrap.style.display = 'flex';
    seedForRole(session.role || 'investor');
    render();

    var btn = document.getElementById('notifBellBtn');
    var panel = document.getElementById('notifPanel');
    var markAllBtn = document.getElementById('notifMarkAll');
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      panel.classList.toggle('open');
    });
    markAllBtn.addEventListener('click', function(e){
      e.stopPropagation();
      markAllRead();
    });
    panel.addEventListener('click', function(e){ e.stopPropagation(); });
    document.addEventListener('click', function(){
      panel.classList.remove('open');
    });
  }

  function initMobileNav(){
    var btn = document.getElementById('navHamburger');
    var links = document.querySelector('.nav-links');
    if(!btn || !links) return;
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      links.classList.toggle('open');
    });
    links.addEventListener('click', function(e){ e.stopPropagation(); });
    document.addEventListener('click', function(){ links.classList.remove('open'); });
  }

  // Generic modal open/close — any element with [data-modal-open="modalId"] opens
  // #modalId; any .modal-close inside a .modal-overlay closes it; click on the
  // dimmed backdrop or Escape closes whichever modal(s) are open.
  function openModal(id){
    var modal = document.getElementById(id);
    if(modal) modal.classList.add('open');
  }
  function closeModal(modal){
    modal.classList.remove('open');
  }
  function initModals(){
    document.querySelectorAll('[data-modal-open]').forEach(function(trigger){
      trigger.addEventListener('click', function(e){
        e.preventDefault();
        openModal(trigger.getAttribute('data-modal-open'));
      });
    });
    document.querySelectorAll('.modal-overlay').forEach(function(modal){
      modal.addEventListener('click', function(e){
        if(e.target === modal) closeModal(modal);
      });
      modal.querySelectorAll('.modal-close, [data-modal-close]').forEach(function(btn){
        btn.addEventListener('click', function(){ closeModal(modal); });
      });
    });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape'){
        document.querySelectorAll('.modal-overlay.open').forEach(closeModal);
      }
    });
  }

  window.RootASAPNotify = { push: push, markAllRead: markAllRead, render: render };
  window.RootASAPModal = { open: openModal };

  function boot(){
    init();
    initMobileNav();
    initModals();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
