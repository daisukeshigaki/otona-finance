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

// 第1章は、動画で説明しやすい「到達点 → 導入 → 本編 → 演習」の順にそろえる。
(() => {
  const matched = location.pathname.match(/^\/fp3\/01\/0([1-8])\/$/);
  if (!matched) return;
  const lessons = {
    1: {
      lead: '第1章は、保険や投資の商品を選ぶ前に、人生でいつお金が必要になるか、毎年の家計は黒字か、今の資産と借入はいくらかを3枚のシートで見える化するところから始めます。',
      points: ['ライフイベント表・キャッシュフロー表・個人のバランスシートの役割を区別する', 'お金の計画は、商品選びより先に「いつ・何に・いくら必要か」を決める', 'FPができる一般的な説明と、専門資格・登録が必要な業務を分ける'],
      intro: '<p>第1章では、保険や投資の商品から始めません。まずは、人生でいつお金が必要になるか、毎年の家計は黒字か、今の資産と借入はいくらかを、3枚のシートで見える化します。</p><figure class="fp-learning-visual"><img src="/assets/images/fp3/01/planning-sheets-overview.png" alt="ライフイベント表、キャッシュフロー表、個人のバランスシートを並べた学習用イメージ"><figcaption><strong>左：ライフイベント表</strong>は「いつ・何にお金が必要か」。<strong>中央：キャッシュフロー表</strong>は「毎年の収入・支出・貯蓄の変化」。<strong>右：個人のバランスシート</strong>は「今ある資産・負債・純資産」を見る資料です。</figcaption></figure><p>たとえば「10年後に子どもの進学費用を用意したい」と決めたら、イベント表で時期と目標額を置きます。次にキャッシュフロー表で、毎年いくら貯められるかを確認します。最後に個人のバランスシートで、預貯金や住宅ローンを含めた今の立ち位置を確かめます。<strong>この順番が分かってから、FPの役割と関連法規へ進みます。</strong></p>'
    },
    2: {
      points: ['家計の年間収支と、ある時点の純資産を別の数字として読む', 'ライフイベント表・キャッシュフロー表・個人BSをつなげて使う', '6つの係数を「今のお金・毎年のお金・将来のお金」の向きから選ぶ'],
      intro: '<p>前回の3枚のシートを、実際に数字で埋める回です。年収が高くても毎年の支出が多ければ貯蓄は増えません。一方、家を持っていて資産が大きく見えても、住宅ローンが残っていれば純資産は別の数字になります。</p><p>架空の佐藤家を例に、まず1年の収入と支出から黒字額を出し、次に預貯金・住宅・ローンから純資産を出します。そのうえで「10年後に必要な教育費」を準備するために、どの係数を使うかを考えます。</p>'
    },
    3: {
      points: ['病院代、休業中の生活費、介護サービスを支える制度を分ける', '健康保険・国民健康保険・介護保険で、誰が対象かを確認する', '高額療養費と傷病手当金を、問題で与えられた条件から計算する'],
      intro: '<p>病気やけがをしたときに「保険でカバーされる」とひとまとめにすると、試験でも実生活でも混乱します。病院で払う医療費を抑える制度と、働けない間の収入を補う制度は別です。</p><p>ここでは、会社員の田中さんが業務外の病気で入院し、医療費と休業の両方が発生した場面を考えます。何を先に確認し、どの制度へつなぐかを順番に見ていきます。</p>'
    },
    4: {
      points: ['退職・病気・仕事中の事故で、最初に見る制度を選ぶ', '基本手当の前提、待期、給付制限、受給期間を混同しない', '労災の休業給付を60％と20％に分けて計算する'],
      intro: '<p>「仕事を辞めた」「働けなくなった」だけでは、使う制度を決められません。働く意思と能力があるのか、原因は仕事や通勤なのか、いつから働けないのかで、確認する制度が変わります。</p><p>この回では、退職して求職するケースと、仕事中のけがで休むケースを並べます。似た言葉や数字に引っ張られず、まず状況を読み分ける練習をします。</p>'
    },
    5: {
      points: ['国民年金と厚生年金の2階建てを説明する', '受給資格の10年と、満額計算の480月を区別する', '納付月数と繰上げ・繰下げの条件付き計算を行う'],
      intro: '<p>年金は「老後にいくらもらえるか」だけを覚える科目ではありません。まず、全員の土台になる基礎年金と、会社員などに上乗せされる厚生年金の関係をつかみます。</p><p>会社員だった期間と自営業だった期間がある人を例に、どの年金の土台があるのか、10年と40年の数字が何を意味するのかを順に整理します。</p>'
    },
    6: {
      points: ['公的年金が老齢・障害・死亡の3つに備えることを理解する', '障害年金では初診日、遺族年金では家族の条件を入口にする', 'DB・DC・iDeCoで、何が確定し何が運用で変わるかを区別する'],
      intro: '<p>年金は老後だけの制度ではありません。病気やけがで障害が残ったとき、家計を支える人が亡くなったときにも、年金の仕組みが関わります。</p><p>この回では、まず「何が起きたか」を起点に公的年金の給付を選びます。そのあとで、老後資金を上乗せする私的年金を比べ、iDeCoの特徴を位置づけます。</p>'
    },
    7: {
      points: ['教育・住宅・老後の3大資金を、必要な時期で分ける', '住宅ローンの返済方法と金利タイプを、返済額だけで判断しない', '公的支援と自助努力のお金を重複なく計画する'],
      intro: '<p>教育、住宅、老後は、どれも大きな金額になりやすい一方で、必要になる時期が違います。同じ預貯金を3回数えてしまうと、計画は実際より余裕があるように見えてしまいます。</p><p>30代の夫婦が住宅購入と子どもの進学、老後資金を並行して考える場面を例に、時期・優先順位・使ってよいお金を分けます。</p>'
    },
    8: {
      points: ['第1章の資料を、設問の条件に合わせて読み取る', '年間収支・純資産・積立額を混同せずに計算する', '制度、人物、時点、金額の単位をそろえて判断する'],
      intro: '<p>総復習では、新しい制度を増やしません。ここまでに使った「家計の資料」「制度の対象者と条件」「将来のお金の計算」を、一つのケースでつなげます。</p><p>問題文を見たら、いきなり式に入れず、誰の話か、いつの制度か、年・月や円・万円がそろっているかを確認します。その順番を練習問題でもそのまま使います。</p>'
    }
  };
  const lesson = lessons[Number(matched[1])];
  const heroNote = document.querySelector('.fp-hero .fp-note');
  const lead = document.querySelector('.fp-hero .lead');
  const video = document.querySelector('.fp-video');
  const toc = document.querySelector('.fp-toc ol');
  if (!lesson || !heroNote || !video || document.querySelector('.fp-chapter-intro')) return;
  heroNote.innerHTML = '<strong>この講義で学ぶこと</strong><ul class="fp-learning-points">' + lesson.points.map(point => '<li>' + point + '</li>').join('') + '</ul>';
  if (lesson.lead && lead) lead.textContent = lesson.lead;
  video.insertAdjacentHTML('afterend', '<section class="fp-section fp-chapter-intro" id="introduction"><h2>はじめに：この回で扱う場面</h2>' + lesson.intro + '</section>');
  if (toc) toc.insertAdjacentHTML('afterbegin', '<li><a href="#introduction">はじめに</a></li>');
})();
