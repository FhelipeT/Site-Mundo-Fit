/* ==========================================================================
   MUNDO FIT DA MANU — script.js
   Vanilla JS. Sem frameworks, sem build step.
   ========================================================================== */
(function () {
  "use strict";

  /* ------------------------------------------------------------------ */
  /* 1. DADOS DOS TREINOS — não alterar séries/repetições/exercícios.    */
  /* ------------------------------------------------------------------ */

  function ex(name, sets, slug) {
    return { name: name, sets: sets || "", slug: slug, video: "assets/exercises/" + slug + ".mp4" };
  }

  var GLUTEO_BASE = [
    ex("Elevação pélvica", "4 × 8–12", "elevacao-pelvica"),
    ex("RDL", "3 × 12", "rdl"),
    ex("Abdução na polia", "3 × 12", "abducao-polia"),
    ex("Cadeira flexora", "3 × 12", "cadeira-flexora"),
  ];

  var WEEK = [
    {
      key: "seg", short: "SEG", full: "Segunda-feira", emoji: "🍑",
      title: "Glúteo Day", accent: "pink", type: "workout",
      groups: [
        { name: null, exercises: GLUTEO_BASE.concat([
          ex("Cadeira abdutora", "3 × 10–12", "cadeira-abdutora"),
          ex("Panturrilha", "3 × 15 + 20", "panturrilha")]) }
      ]
    },
    {
      key: "ter", short: "TER", full: "Terça-feira", emoji: "💪",
      title: "Costas + Ombros + Tríceps", accent: "lilac", type: "workout",
      groups: [
        { name: "Costas", exercises: [
          ex("Puxada alta aberta", "3 × 8–12", "puxada-alta-aberta"),
          ex("Remada baixa fechada", "3 × 8–12", "remada-baixa-fechada"),
          ex("Pulldown", "3 × 8–12", "pulldown"),
        ]},
        { name: "Ombros", exercises: [
          ex("Desenvolvimento com halteres/máquina", "2 × 8–12", "desenvolvimento-ombros"),
          ex("Elevação lateral", "3 × 12–15", "elevacao-lateral"),
        ]},
        { name: "Tríceps", exercises: [
          ex("Tríceps corda", "3 × 8–12", "triceps-corda"),
          ex("Tríceps testa", "3 × 8–12", "triceps-testa"),
          ex("Tríceps martelo", "3 × 8–12", "triceps-martelo"),
        ]},
      ]
    },
    {
      key: "qua", short: "QUA", full: "Quarta-feira", emoji: "😴",
      title: "Descanso", accent: "rest", type: "rest"
    },
    {
      key: "qui", short: "QUI", full: "Quinta-feira", emoji: "💪",
      title: "Costas + Bíceps + Tríceps", accent: "mint", type: "workout",
      groups: [
        { name: "Costas", exercises: [
          ex("Puxada alta neutra/fechada", "3 × 8–12", "puxada-alta-neutra"),
          ex("Remada articulada/máquina", "3 × 8–12", "remada-articulada"),
          ex("Pulldown", "2–3 × 8–12", "pulldown"),
        ]},
        { name: "Bíceps", exercises: [
          ex("Rosca direta", "3 × 8–12", "rosca-direta"),
          ex("Rosca martelo", "2 × 10–12", "rosca-martelo"),
        ]},
        { name: "Tríceps", exercises: [
          ex("Tríceps corda", "3 × 8–12", "triceps-corda"),
          ex("Tríceps testa", "3 × 8–12", "triceps-testa"),
          ex("Tríceps martelo", "3 × 8–12", "triceps-martelo"),
        ]},
      ]
    },
    {
      key: "sex", short: "SEX", full: "Sexta-feira", emoji: "🦵",
      title: "Glúteo + Quadríceps", accent: "peach", type: "workout",
      groups: [
        { name: null, exercises: GLUTEO_BASE.concat([
          ex("Cadeira adutora", "3 × 10–12", "cadeira-adutora"),
          ex("Agachamento taça", "3 × 8–12", "agachamento-taça")]) }
      ]
    },
    {
      key: "sab", short: "SÁB", full: "Sábado", emoji: "🌿",
      title: "Dia livre", accent: "rest", type: "free"
    },
    {
      key: "dom", short: "DOM", full: "Domingo", emoji: "🌿",
      title: "Dia livre", accent: "rest", type: "free"
    },
  ];

  /* ------------------------------------------------------------------ */
  /* 2. UTILITÁRIOS DE DATA                                              */
  /* ------------------------------------------------------------------ */

  var STORAGE_KEY = "mundofit_treinos_concluidos";
  var EXERCISE_WEIGHTS_KEY = "mundofit_exercise_weights";
  var PROFILE_WEIGHT_KEY = "mundofit_profile_weight";
  var DEFAULT_PROFILE_WEIGHT = 77.3;

  function todayIndexMonFirst() {
    // JS: 0 = domingo ... 6 = sábado  →  convertendo para 0 = segunda ... 6 = domingo
    var jsDay = new Date().getDay();
    return (jsDay + 6) % 7;
  }

  function getWeekDates() {
    // Retorna array de objetos Date para a semana atual (segunda a domingo)
    var now = new Date();
    var idx = todayIndexMonFirst();
    var monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - idx);
    var dates = [];
    for (var i = 0; i < 7; i++) {
      dates.push(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i));
    }
    return dates;
  }

  function toISODate(d) {
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + day;
  }

  function formatDayNumber(d) {
    return String(d.getDate()).padStart(2, "0");
  }

  var WEEK_DATES = getWeekDates();
  var TODAY_INDEX = todayIndexMonFirst();

  /* ------------------------------------------------------------------ */
  /* 3. PERSISTÊNCIA (localStorage)                                      */
  /* ------------------------------------------------------------------ */

  function readCompleted() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function isDayDone(isoDate) {
    var data = readCompleted();
    return !!data[isoDate];
  }

  function toggleDayDone(isoDate) {
    var data = readCompleted();
    var next = !data[isoDate];
    if (next) {
      data[isoDate] = true;
    } else {
      delete data[isoDate];
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) { /* localStorage indisponível — segue sem persistir */ }
    return next;
  }

  function readLocalJSON(key) {
    try { return JSON.parse(window.localStorage.getItem(key) || "{}"); }
    catch (e) { return {}; }
  }

  function readExerciseWeights() { return readLocalJSON(EXERCISE_WEIGHTS_KEY); }

  function formatWeight(value) {
    return String(value).replace(".", ",") + " kg";
  }

  function getProfileWeight() {
    try {
      var saved = parseFloat(window.localStorage.getItem(PROFILE_WEIGHT_KEY));
      return isFinite(saved) && saved > 0 ? saved : DEFAULT_PROFILE_WEIGHT;
    } catch (e) { return DEFAULT_PROFILE_WEIGHT; }
  }

  /* ------------------------------------------------------------------ */
  /* 4. REFERÊNCIAS DO DOM                                               */
  /* ------------------------------------------------------------------ */

  var viewHome = document.getElementById("view-home");
  var viewWorkout = document.getElementById("view-workout");
  var viewDiet = document.getElementById("view-diet");
  var viewProfile = document.getElementById("view-profile");
  var weekList = document.getElementById("week-list");
  var todaySpotlight = document.getElementById("today-spotlight");
  var overviewList = document.getElementById("overview-list");

  var btnHome = document.getElementById("btn-home");
  var btnToday = document.getElementById("btn-today");
  var btnBack = document.getElementById("btn-back");

  var workoutDayEl = document.getElementById("workout-day");
  var workoutHeadingEl = document.getElementById("workout-heading");
  var workoutChipsEl = document.getElementById("workout-chips");
  var restStateEl = document.getElementById("rest-state");
  var exerciseGroupsEl = document.getElementById("exercise-groups");
  var completeWrapEl = document.getElementById("complete-wrap");
  var completeBtn = document.getElementById("btn-complete");
  var completeLabel = document.getElementById("complete-label");
  var toastEl = document.getElementById("toast");
  var navLinks = document.querySelectorAll(".main-nav-link");
  var profileAgeEl = document.getElementById("profile-age");
  var profileWeightValueEl = document.getElementById("profile-weight-value");
  var profileWeightInput = document.getElementById("profile-weight-input");
  var profileWeightForm = document.getElementById("profile-weight-form");
  var profileBmiValueEl = document.getElementById("profile-bmi-value");
  var profileBmiClassificationEl = document.getElementById("profile-bmi-classification");

  var currentDayKey = null;
  var toastTimer = null;

  /* ------------------------------------------------------------------ */
  /* 5. RENDER — TIRA DA SEMANA                                          */
  /* ------------------------------------------------------------------ */

  function emojiForOverview(day) {
    return day.emoji;
  }

  function renderWeekStrip() {
    weekList.innerHTML = "";
    WEEK.forEach(function (day, i) {
      var li = document.createElement("li");

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "day-pill";
      btn.setAttribute("data-accent", day.accent);
      btn.setAttribute("data-day", day.key);

      var isToday = i === TODAY_INDEX;
      if (isToday) {
        btn.classList.add("is-today");
        btn.setAttribute("aria-current", "date");
      }

      var iso = toISODate(WEEK_DATES[i]);
      if (day.type === "workout" && isDayDone(iso)) {
        btn.classList.add("is-done");
      }

      btn.innerHTML =
        '<span class="day-name">' + day.short + '</span>' +
        '<span class="day-date">' + formatDayNumber(WEEK_DATES[i]) + '</span>' +
        '<span class="day-emoji" aria-hidden="true">' + day.emoji + '</span>';

      btn.setAttribute(
        "aria-label",
        day.full + (isToday ? " (hoje)" : "") + ": " + day.title
      );

      btn.addEventListener("click", function () {
        openWorkout(day.key);
      });

      li.appendChild(btn);
      weekList.appendChild(li);
    });
  }

  /* ------------------------------------------------------------------ */
  /* 6. RENDER — DESTAQUE DE HOJE                                        */
  /* ------------------------------------------------------------------ */

  function renderSpotlight() {
    var day = WEEK[TODAY_INDEX];
    var iso = toISODate(WEEK_DATES[TODAY_INDEX]);
    var done = day.type === "workout" && isDayDone(iso);

    var isRest = day.type !== "workout";

    var card = document.createElement("button");
    card.type = "button";
    card.className = "spotlight-card" + (isRest ? " is-rest" : "");
    card.setAttribute("data-accent", day.accent);
    card.addEventListener("click", function () {
      openWorkout(day.key);
    });

    var kickerText = isRest
      ? (day.type === "rest" ? "Hoje é descanso" : "Hoje é dia livre")
      : "Treino de hoje";

    card.innerHTML =
      '<span class="spotlight-kicker">' + kickerText + '</span>' +
      (done ? '<span class="spotlight-done-badge">✓ Concluído</span>' : '') +
      '<p class="spotlight-title">' +
        '<span aria-hidden="true">' + day.emoji + '</span> ' + day.title +
      '</p>' +
      '<p class="spotlight-sub">' + day.full + '</p>' +
      '<span class="spotlight-cta">' +
        (isRest ? "Ver dica do dia" : (done ? "Ver treino de novo" : "Ver treino completo")) +
        ' <svg width="16" height="16" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '</span>';

    todaySpotlight.innerHTML = "";
    todaySpotlight.appendChild(card);
  }

  /* ------------------------------------------------------------------ */
  /* 7. RENDER — LISTA RESUMO DA SEMANA                                  */
  /* ------------------------------------------------------------------ */

  function renderOverview() {
    overviewList.innerHTML = "";
    WEEK.forEach(function (day, i) {
      var iso = toISODate(WEEK_DATES[i]);
      var done = day.type === "workout" && isDayDone(iso);

      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "overview-item" + (done ? " is-done" : "");
      btn.setAttribute("data-accent", day.accent);
      btn.addEventListener("click", function () {
        openWorkout(day.key);
      });

      btn.innerHTML =
        '<span class="overview-emoji" aria-hidden="true">' + emojiForOverview(day) + '</span>' +
        '<span class="overview-text">' +
          '<span class="overview-day">' + day.short + (i === TODAY_INDEX ? " · hoje" : "") + '</span>' +
          '<span class="overview-title">' + day.title + '</span>' +
        '</span>' +
        '<span class="overview-check" aria-hidden="true">' +
          '<svg width="14" height="14" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '</span>';

      li.appendChild(btn);
      overviewList.appendChild(li);
    });
  }

  /* ------------------------------------------------------------------ */
  /* 8. RENDER — TELA DE TREINO                                          */
  /* ------------------------------------------------------------------ */

  // Variações de nome de arquivo aceitas em assets/exercises. Alguns arquivos
  // foram salvos com extensão maiúscula ou com sufixo diferente; tentamos cada
  // uma antes de considerar o vídeo indisponível.
  var VIDEO_EXTENSIONS = [".mp4", ".MP4", ".mov", ".MOV", ".webm"];

  function videoCandidates(slug) {
    var list = [];
    VIDEO_EXTENSIONS.forEach(function (extension) {
      list.push("assets/exercises/" + encodeURIComponent(slug) + extension);
    });
    return list;
  }

  function buildExerciseCard(exercise, accent) {
    var card = document.createElement("article");
    card.className = "exercise-card";
    card.setAttribute("data-accent", accent);

    var setsBadge = exercise.sets
      ? '<span class="exercise-sets">' + exercise.sets + '</span>'
      : "";

    card.innerHTML =
      '<div class="exercise-card-top">' +
        '<h4 class="exercise-name">' + exercise.name + '</h4>' +
        setsBadge +
      '</div>' +
      '<div class="exercise-media">' +
        '<video class="exercise-video is-loading" muted loop playsinline autoplay preload="auto" aria-label="Demonstração do exercício ' + exercise.name + '"></video>' +
        '<div class="exercise-loading" aria-live="polite">' +
          '<img class="exercise-loading-image" src="assets/images/manu.png" alt="" aria-hidden="true">' +
          '<p class="exercise-loading-text">Carregando exercício...</p>' +
        '</div>' +
      '</div>' +
      '<div class="exercise-weight">' +
        '<div class="exercise-weight-summary"><span>Último peso: <strong data-last-weight>—</strong></span><span>Melhor: <strong data-best-weight>—</strong></span></div>' +
        '<form class="exercise-weight-form"><label class="visually-hidden">Atualizar peso para ' + exercise.name + '</label><input type="number" inputmode="decimal" min="0" step="0.1" placeholder="Peso em kg" aria-label="Atualizar peso para ' + exercise.name + '"><button type="submit">Salvar</button></form>' +
      '</div>';

    var lastWeightEl = card.querySelector("[data-last-weight]");
    var bestWeightEl = card.querySelector("[data-best-weight]");
    var weightForm = card.querySelector(".exercise-weight-form");
    var weightInput = weightForm.querySelector("input");

    function renderWeight() {
      var record = readExerciseWeights()[exercise.slug] || {};
      lastWeightEl.textContent = record.last != null ? formatWeight(record.last) : "Ainda não registrado";
      bestWeightEl.textContent = record.best != null ? formatWeight(record.best) : "—";
    }
    renderWeight();
    weightForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var nextWeight = parseFloat(String(weightInput.value).replace(",", "."));
      if (!isFinite(nextWeight) || nextWeight < 0) { showToast("Digite um peso válido em kg."); return; }
      var records = readExerciseWeights();
      var previous = records[exercise.slug] || {};
      records[exercise.slug] = { last: nextWeight, best: Math.max(previous.best || 0, nextWeight) };
      try { window.localStorage.setItem(EXERCISE_WEIGHTS_KEY, JSON.stringify(records)); }
      catch (e) { showToast("Não foi possível salvar o peso neste aparelho."); return; }
      weightInput.value = "";
      renderWeight();
      showToast("Peso atualizado para " + formatWeight(nextWeight) + " 💪");
    });

    var media = card.querySelector(".exercise-media");
    var video = media.querySelector(".exercise-video");
    var loading = media.querySelector(".exercise-loading");
    var loadingImage = media.querySelector(".exercise-loading-image");
    var videoFailed = false;

    // O loading já existe no primeiro render do card; apenas o vídeo decide
    // quando ele pode desaparecer. Não há temporizador artificial aqui.
    function showVideo() {
      if (videoFailed || !loading || !video) return;
      loading.classList.add("is-hidden");
      video.classList.remove("is-loading");
      loading.addEventListener("transitionend", function () {
        if (loading && loading.parentNode) loading.parentNode.removeChild(loading);
      }, { once: true });
    }

    function showVideoError() {
      if (!media || media.querySelector(".exercise-error")) return;
      videoFailed = true;
      video.classList.add("is-loading");

      var error = document.createElement("div");
      error.className = "exercise-error";
      error.setAttribute("role", "status");
      error.textContent = "Não foi possível carregar a demonstração.";
      error.title = "Arquivo esperado: assets/exercises/" + exercise.slug + ".mp4";
      media.appendChild(error);

      if (loading && loading.parentNode) {
        loading.classList.add("is-hidden");
        loading.addEventListener("transitionend", function () {
          if (loading && loading.parentNode) loading.parentNode.removeChild(loading);
        }, { once: true });
      }
    }

    // Caso a ilustração não esteja disponível, o texto de loading continua
    // presente e o card não expõe informações técnicas ao usuário.
    loadingImage.addEventListener("error", function () {
      loadingImage.classList.add("is-missing");
    }, { once: true });

    // Fonte definida por JS (sem <source>): o evento `error` do <video> só
    // dispara quando a src está no próprio elemento. Com <source>, a falha
    // ficava silenciosa e o card ficava eternamente em "Carregando...".
    var candidates = videoCandidates(exercise.slug);
    var candidateIndex = 0;

    function loadCandidate() {
      if (candidateIndex >= candidates.length) { showVideoError(); return; }
      video.src = candidates[candidateIndex++];
      video.load();
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") attempt.catch(function () {});
    }

    video.addEventListener("loadeddata", showVideo);
    video.addEventListener("canplay", showVideo);
    video.addEventListener("error", function () { loadCandidate(); });

    loadCandidate();

    // `canplay` pode já ter ocorrido antes da ligação dos listeners quando o
    // vídeo vier do cache; nesse caso, preservamos a mesma transição.
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) showVideo();

    return card;
  }

  function renderWorkout(day) {
    workoutDayEl.textContent = day.full;
    workoutHeadingEl.innerHTML = '<span aria-hidden="true">' + day.emoji + '</span> ' + day.title;
    viewWorkout.setAttribute("data-accent", day.accent);

    // chips
    workoutChipsEl.innerHTML = "";
    if (day.type === "workout") {
      day.groups.forEach(function (g) {
        if (g.name) {
          var chip = document.createElement("span");
          chip.className = "chip";
          chip.textContent = g.name;
          chip.setAttribute("role", "listitem");
          workoutChipsEl.appendChild(chip);
        }
      });
      if (day.groups.length === 1 && !day.groups[0].name) {
        var chip2 = document.createElement("span");
        chip2.className = "chip";
        chip2.textContent = day.title;
        workoutChipsEl.appendChild(chip2);
      }
    }

    if (day.type === "rest") {
      restStateEl.classList.remove("is-hidden");
      restStateEl.querySelector(".rest-title").textContent = "Hoje é dia de descansar 😴";
      restStateEl.querySelector(".rest-message").textContent =
        "Seu corpo recupera e cresce nos dias de descanso. Aproveite pra hidratar bem, dormir bem e voltar ainda mais forte no próximo treino.";
      exerciseGroupsEl.innerHTML = "";
      completeWrapEl.classList.add("is-hidden");
      return;
    }

    if (day.type === "free") {
      restStateEl.classList.remove("is-hidden");
      restStateEl.querySelector(".rest-title").textContent = "Dia livre 🌿";
      restStateEl.querySelector(".rest-message").textContent =
        "Sem treino marcado pra hoje. Aproveite pra descansar, caminhar ao ar livre ou fazer alguma atividade leve que você goste.";
      exerciseGroupsEl.innerHTML = "";
      completeWrapEl.classList.add("is-hidden");
      return;
    }

    restStateEl.classList.add("is-hidden");
    exerciseGroupsEl.innerHTML = "";

    day.groups.forEach(function (group) {
      var groupWrap = document.createElement("section");
      groupWrap.className = "exercise-group";
      groupWrap.style.setProperty("--group-color", "var(--" + (day.accent === "rest" ? "lilac" : day.accent) + ")");

      if (group.name) {
        var h3 = document.createElement("h3");
        h3.className = "exercise-group-title";
        h3.textContent = group.name;
        groupWrap.appendChild(h3);
      }

      var list = document.createElement("div");
      list.className = "exercise-list";
      group.exercises.forEach(function (exercise) {
        list.appendChild(buildExerciseCard(exercise, day.accent));
      });
      groupWrap.appendChild(list);

      exerciseGroupsEl.appendChild(groupWrap);
    });

    completeWrapEl.classList.remove("is-hidden");
    updateCompleteButton(day.key);
  }

  function updateCompleteButton(dayKey) {
    var dayIndex = WEEK.findIndex(function (d) { return d.key === dayKey; });
    var iso = toISODate(WEEK_DATES[dayIndex]);
    var done = isDayDone(iso);
    completeBtn.classList.toggle("is-done", done);
    completeLabel.textContent = done ? "Treino concluído ✓" : "Marcar treino como concluído";
    completeBtn.setAttribute("aria-pressed", done ? "true" : "false");
  }

  /* ------------------------------------------------------------------ */
  /* 9. NAVEGAÇÃO ENTRE TELAS                                            */
  /* ------------------------------------------------------------------ */

  function setActiveNav(viewName) {
    navLinks.forEach(function (link) {
      var active = link.getAttribute("data-view") === viewName;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "page"); else link.removeAttribute("aria-current");
    });
  }

  function hideAllViews() {
    viewHome.classList.add("is-hidden");
    viewWorkout.classList.add("is-hidden");
    viewDiet.classList.add("is-hidden");
    viewProfile.classList.add("is-hidden");
  }

  function openWorkout(dayKey) {
    var day = WEEK.find(function (d) { return d.key === dayKey; });
    if (!day) return;
    currentDayKey = dayKey;
    renderWorkout(day);
    hideAllViews();
    viewWorkout.classList.remove("is-hidden");
    setActiveNav("");
    viewWorkout.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
    history.replaceState({ view: "workout", day: dayKey }, "", "#" + dayKey);
  }

  function goHome() {
    currentDayKey = null;
    renderWeekStrip();
    renderSpotlight();
    renderOverview();
    hideAllViews();
    viewHome.classList.remove("is-hidden");
    setActiveNav("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
    history.replaceState({ view: "home" }, "", "#inicio");
  }

  function calculateAge() {
    var birth = new Date(2004, 4, 14);
    var now = new Date();
    var age = now.getFullYear() - birth.getFullYear();
    var beforeBirthday = now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate());
    return age - (beforeBirthday ? 1 : 0);
  }

  function bmiClassification(bmi) {
    if (bmi < 18.5) return "Magreza (abaixo do peso)";
    if (bmi < 25) return "Peso normal (eutrofia)";
    if (bmi < 30) return "Sobrepeso";
    if (bmi < 35) return "Obesidade Grau I";
    if (bmi < 40) return "Obesidade Grau II";
    return "Obesidade Grau III (grave)";
  }

  function renderProfile() {
    var weight = getProfileWeight();
    var bmi = weight / (1.57 * 1.57);
    profileAgeEl.textContent = calculateAge();
    profileWeightValueEl.textContent = formatWeight(weight);
    profileWeightInput.value = weight;
    profileBmiValueEl.textContent = bmi.toFixed(1).replace(".", ",");
    profileBmiClassificationEl.textContent = bmiClassification(bmi);
  }

  function openInformationView(name) {
    hideAllViews();
    if (name === "profile") { renderProfile(); viewProfile.classList.remove("is-hidden"); viewProfile.focus({ preventScroll: true }); }
    else { viewDiet.classList.remove("is-hidden"); viewDiet.focus({ preventScroll: true }); }
    setActiveNav(name);
    window.scrollTo({ top: 0, behavior: "smooth" });
    history.replaceState({ view: name }, "", "#" + (name === "diet" ? "dieta" : "perfil"));
  }

  /* ------------------------------------------------------------------ */
  /* 10. TOAST                                                           */
  /* ------------------------------------------------------------------ */

  function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2400);
  }

  /* ------------------------------------------------------------------ */
  /* 11. EVENTOS                                                         */
  /* ------------------------------------------------------------------ */

  btnHome.addEventListener("click", goHome);
  btnToday.addEventListener("click", function () { openWorkout(WEEK[TODAY_INDEX].key); });
  btnBack.addEventListener("click", goHome);
  navLinks.forEach(function (link) {
    link.addEventListener("click", function () { goHome(); if (link.getAttribute("data-view") !== "home") openInformationView(link.getAttribute("data-view")); });
  });

  profileWeightForm.addEventListener("submit", function (event) {
    event.preventDefault();
    var nextWeight = parseFloat(String(profileWeightInput.value).replace(",", "."));
    if (!isFinite(nextWeight) || nextWeight <= 0 || nextWeight > 500) { showToast("Digite um peso válido em kg."); return; }
    try { window.localStorage.setItem(PROFILE_WEIGHT_KEY, String(nextWeight)); }
    catch (e) { showToast("Não foi possível salvar o peso neste aparelho."); return; }
    renderProfile();
    showToast("Peso atualizado! O IMC foi recalculado.");
  });

  completeBtn.addEventListener("click", function () {
    if (!currentDayKey) return;
    var dayIndex = WEEK.findIndex(function (d) { return d.key === currentDayKey; });
    var iso = toISODate(WEEK_DATES[dayIndex]);
    var nowDone = toggleDayDone(iso);
    updateCompleteButton(currentDayKey);
    showToast(nowDone ? "Treino concluído! Manda ver amanhã 💪" : "Ok, desmarcado. Bora quando estiver pronta(o) 💜");
  });

  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && (!viewWorkout.classList.contains("is-hidden") || !viewDiet.classList.contains("is-hidden") || !viewProfile.classList.contains("is-hidden"))) {
      goHome();
    }
  });

  /* ------------------------------------------------------------------ */
  /* 12. INICIALIZAÇÃO                                                   */
  /* ------------------------------------------------------------------ */

  function init() {
    renderWeekStrip();
    renderSpotlight();
    renderOverview();

    var hash = window.location.hash.replace("#", "");
    var validDay = WEEK.some(function (d) { return d.key === hash; });
    if (validDay) {
      openWorkout(hash);
    } else if (hash === "dieta") {
      openInformationView("diet");
    } else if (hash === "perfil") {
      openInformationView("profile");
    }
  }

  init();

  /* ------------------------------------------------------------------ */
  /* 13. PWA — registro do service worker                                */
  /* ------------------------------------------------------------------ */

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("service-worker.js").catch(function () {
        /* app continua funcionando normalmente sem o service worker */
      });
    });
  }
})();
