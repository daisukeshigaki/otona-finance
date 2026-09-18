(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  async function api(path, data) {
    const res = await fetch(path, data ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) } : {});
    const result = await res.json();
    if (!res.ok) throw Object.assign(new Error(result.error || '現在処理できません。'), { status: res.status });
    return result;
  }
  function status(form, message, error = false) {
    const node = $('[data-status]', form); node.textContent = message; node.classList.toggle('is-error', error);
  }
  async function setupForm(form, action, endpoint, extra = {}) {
    const button = $('button[type="submit"]', form); button.disabled = true;
    let widget;
    try {
      const { siteKey } = await api('/api/community/config');
      if (!siteKey) throw new Error('現在受付を一時停止しています。');
      await new Promise((resolve, reject) => {
        if (window.turnstile) { resolve(); return; }
        let script = $('#turnstile-script');
        if (!script) { script = document.createElement('script'); script.id = 'turnstile-script'; script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'; script.async = true; document.head.append(script); }
        script.addEventListener('load', resolve, { once: true }); script.addEventListener('error', () => reject(new Error('確認チェックを読み込めませんでした。ページを再読み込みしてください。')), { once: true });
      });
      widget = window.turnstile.render($('[data-challenge]', form), { sitekey: siteKey, action, size: 'flexible', callback: () => { button.disabled = false; }, 'expired-callback': () => { button.disabled = true; }, 'error-callback': () => { button.disabled = true; status(form, '確認チェックを再読み込みしてください。', true); } });
    } catch (error) { status(form, error.message, true); return; }
    form.addEventListener('submit', async event => {
      event.preventDefault(); if (!form.reportValidity()) return;
      button.disabled = true; status(form, '送信中…');
      const values = Object.fromEntries(new FormData(form));
      try {
        const result = await api(endpoint, { ...values, ...extra, consent: values.consent === 'on', token: window.turnstile.getResponse(widget) });
        if (action === 'admin') { form.dispatchEvent(new CustomEvent('login-sent', { detail: result })); }
        else { form.reset(); }
        status(form, result.message);
      } catch (error) { status(form, error.message, true); }
      finally { window.turnstile.reset(widget); }
    });
  }
  function commentNode(comment, recent) {
    const li = document.createElement('li'); li.className = 'comment-item'; li.id = 'comment-' + comment.id;
    if (recent) { const a = document.createElement('a'); a.href = comment.lesson_path + '#comment-' + comment.id; a.textContent = comment.lesson_title; li.append(a); }
    const meta = document.createElement('div'); meta.className = 'comment-meta';
    const name = document.createElement('strong'); name.textContent = comment.name;
    const time = document.createElement('time'); time.dateTime = comment.created_at; time.textContent = new Date(comment.created_at).toLocaleDateString('ja-JP'); meta.append(name, time); li.append(meta);
    const p = document.createElement('p'); p.className = 'comment-body'; p.textContent = recent && comment.body.length > 140 ? comment.body.slice(0, 140) + '…' : comment.body; li.append(p);
    if (!recent && comment.reply) { const reply = document.createElement('div'); reply.className = 'comment-reply'; const title = document.createElement('strong'); title.textContent = 'おとなのファイナンスからの返信'; const text = document.createElement('p'); text.textContent = comment.reply; reply.append(title, text); li.append(reply); }
    return li;
  }
  async function loadComments(mount, lesson) {
    try {
      const result = await api('/api/comments' + (lesson ? '?lesson=' + encodeURIComponent(lesson) : ''));
      const list = document.createElement('ul'); list.className = 'comment-list';
      result.comments.forEach(c => list.append(commentNode(c, !lesson)));
      mount.replaceChildren(list);
      if (!result.comments.length) mount.textContent = lesson ? 'まだコメントはありません。疑問や気づきをお寄せください。' : 'コメントは承認後、ここに掲載します。';
      if (lesson && location.hash.startsWith('#comment-')) document.getElementById(location.hash.slice(1))?.scrollIntoView();
    } catch { mount.textContent = 'コメントを読み込めませんでした。時間をおいて再読み込みしてください。'; }
  }
  const comments = $('[data-lesson-comments]');
  if (comments) {
    const form = $('form', comments);
    loadComments($('[data-comment-list]', comments), location.pathname);
    setupForm(form, 'comment', '/api/comments', { lesson: location.pathname });
  }
  const recent = $('[data-recent-comments]'); if (recent) loadComments(recent);
  const contact = $('#contact-form');
  if (contact) {
    const category = new URLSearchParams(location.search).get('category');
    if (['training', 'general', 'question'].includes(category)) $('[name="category"]', contact).value = category;
    setupForm(contact, 'contact', '/api/contact');
  }
  if ($('#admin-login')) initAdmin();
  async function initAdmin() {
    const login = $('#admin-login'), verify = $('#admin-verify'), panel = $('#admin-panel'); let loginId;
    setupForm(login, 'admin', '/api/admin/login-request');
    login.addEventListener('login-sent', event => { loginId = event.detail.id; verify.hidden = false; $('[name="code"]', verify).focus(); });
    verify.addEventListener('submit', async event => {
      event.preventDefault(); if (!verify.reportValidity()) return;
      try { await api('/api/admin/login-verify', { id: loginId, code: $('[name="code"]', verify).value }); await refresh(); }
      catch (error) { status(verify, error.message, true); }
    });
    $('#admin-logout').addEventListener('click', async () => { try { await api('/api/admin/logout', {}); location.reload(); } catch { $('#admin-notice').textContent = 'ログアウトできませんでした。'; } });
    async function refresh() {
      let data;
      try { data = await api('/api/admin/data'); }
      catch (error) { if (error.status === 401) { login.hidden = false; panel.hidden = true; return; } throw error; }
      login.hidden = true; verify.hidden = true; panel.hidden = false;
      const container = $('#admin-comments'); container.replaceChildren();
      for (const c of data.comments) {
        const card = document.createElement('article'); card.className = 'admin-card';
        const title = document.createElement('h3'); title.textContent = c.lesson_title;
        const meta = document.createElement('p'); meta.textContent = `${c.name} · ${{ pending: '承認待ち', approved: '公開中', rejected: '非公開' }[c.status]} · ${new Date(c.created_at).toLocaleString('ja-JP')}`;
        const text = document.createElement('pre'); text.textContent = c.body;
        const form = document.createElement('form'); form.className = 'community-form';
        const label = document.createElement('label'); label.textContent = '公開する返信'; const textarea = document.createElement('textarea'); textarea.value = c.reply; textarea.maxLength = 3000; label.append(textarea);
        const actions = document.createElement('div'); actions.className = 'admin-actions';
        for (const [value, title] of [['approved', '承認・返信を保存'], ['rejected', '非公開にする'], ['pending', '承認待ちに戻す']]) {
          const button = document.createElement('button'); button.type = 'button'; button.textContent = title;
          button.addEventListener('click', async () => { button.disabled = true; try { await api('/api/admin/moderate', { id: c.id, status: value, reply: textarea.value }); await refresh(); } catch (e) { $('#admin-notice').textContent = e.message; button.disabled = false; } }); actions.append(button);
        }
        form.append(label, actions); card.append(title, meta, text, form); container.append(card);
      }
      if (!data.comments.length) container.textContent = 'コメントはまだありません。';
      const inbox = $('#admin-inquiries'); inbox.replaceChildren();
      for (const q of data.inquiries) {
        const card = document.createElement('article'); card.className = 'admin-card';
        const title = document.createElement('h3'); title.textContent = `${{ question: '講義への質問', general: '一般問い合わせ', training: '研修依頼' }[q.category]} · ${q.name}`;
        const meta = document.createElement('p'); meta.textContent = `${q.organization} · ${new Date(q.created_at).toLocaleString('ja-JP')} · ${q.status === 'done' ? '対応済み' : '未対応'}`;
        const link = document.createElement('a'); link.href = 'mailto:' + encodeURIComponent(q.email); link.textContent = q.email; link.style.textDecoration = 'underline';
        const content = document.createElement('pre'); content.textContent = q.body;
        const button = document.createElement('button'); button.type = 'button'; button.textContent = q.status === 'done' ? '未対応に戻す' : '対応済みにする';
        button.addEventListener('click', async () => { button.disabled = true; try { await api('/api/admin/inquiry', { id: q.id, status: q.status === 'done' ? 'new' : 'done' }); await refresh(); } catch (e) { $('#admin-notice').textContent = e.message; button.disabled = false; } });
        card.append(title, meta, link, content, button); inbox.append(card);
      }
      if (!data.inquiries.length) inbox.textContent = 'お問い合わせはまだありません。';
    }
    try { await refresh(); } catch { $('#admin-notice').textContent = '管理データを読み込めませんでした。'; }
  }
})();
