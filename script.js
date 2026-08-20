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
    return { name: name, sets: sets || "", video: "assets/exercises/" + slug + ".mp4" };
  }

  var GLUTEO_BASE = [
    ex("Elevação pélvica", "4 × 8–12", "elevacao-pelvica"),
    ex("RDL", "3 × 12", "rdl"),
    ex("Cadeira abdutora", "3 × 15–20", "cadeira-abdutora"),
    ex("Abdução na polia", "3 × 12", "abducao-polia"),
    ex("Cadeira flexora", "3 × 15", "cadeira-flexora"),
  ];

  var WEEK = [
    {
      key: "seg", short: "SEG", full: "Segunda-feira", emoji: "🍑",
      title: "Glúteo Day", accent: "pink", type: "workout",
      groups: [
        { name: null, exercises: GLUTEO_BASE.concat([ex("Panturrilha", "3 × 15 + 20", "panturrilha")]) }
      ]
    },
    {
      key: "ter", short: "TER", full: "Terça-feira", emoji: "💪",
      title: "Costas + Ombros + Tríceps", accent: "lilac", type: "workout",
      groups: [
        { name: "Costas", exercises: [
          ex("Puxada alta aberta", "3 × 8–12", "puxada-alta-aberta"),
          ex("Remada baixa fechada", "3 × 8–12", "remada-baixa-fechada"),
          ex("Pulldown", "3 × 10–15", "pulldown"),
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
          ex("Pulldown", "2–3 × 10–15", "pulldown"),
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
        { name: null, exercises: GLUTEO_BASE.concat([ex("Agachamento tarsa", "", "agachamento-tarsa")]) }
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

  /* ------------------------------------------------------------------ */
  /* 4. REFERÊNCIAS DO DOM                                               */
  /* ------------------------------------------------------------------ */

  var viewHome = document.getElementById("view-home");
  var viewWorkout = document.getElementById("view-workout");
  var weekList = document.getElementById("week-list");
  var todaySpotlight = document.getElementById("today-spotlight");
  var overviewList = document.getElementById("overview-list");

  var btnHome = document.getElementById("btn-home");
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
<<<<<<< HEAD
        '<div class="exercise-loading">' +
          '<img src="assets/images/manu.png" alt="" aria-hidden="true" class="exercise-loading-image" />' +
          '<p class="exercise-loading-text">Carregando exercício...</p>' +
        '</div>' +
        '<div class="exercise-error is-hidden" role="status">' +
          '<svg width="34" height="34" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="7" width="18" height="10" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="8.5" cy="12" r="1.4" fill="currentColor"/><circle cx="15.5" cy="12" r="1.4" fill="currentColor"/></svg>' +
          '<span>Não foi possível carregar a demonstração.</span>' +
        '</div>' +
        '<video ' +
          'src="' + exercise.media + '" ' +
          'class="exercise-video" ' +
          'autoplay loop muted playsinline preload="metadata" ' +
          'aria-label="' + exercise.alt + '" ' +
          'title="' + exercise.alt + '"></video>' +
      '</div>';

    var video = card.querySelector("video");
    var loadingOverlay = card.querySelector(".exercise-loading");
    var errorOverlay = card.querySelector(".exercise-error");
    var manuImg = card.querySelector(".exercise-loading-image");
    var settled = false;

    // Se a imagem da Manu ainda não estiver no projeto, some com ela em vez
    // de mostrar o ícone de imagem quebrada — o texto continua aparecendo.
    manuImg.addEventListener("error", function () {
      manuImg.classList.add("is-missing");
    }, { once: true });

    function showVideo() {
      if (settled) return;
      settled = true;
      loadingOverlay.classList.add("is-hidden");
    }

    function showError() {
      if (settled) return;
      settled = true;
      // Estados independentes: apenas alterna a visibilidade, sem recriar
      // o container de mídia nem destruir o componente de carregamento.
      loadingOverlay.classList.add("is-hidden");
      errorOverlay.classList.remove("is-hidden");
    }

    video.addEventListener("canplay", showVideo);
    video.addEventListener("loadeddata", showVideo);
    video.addEventListener("error", showError);

    // Caso o vídeo já esteja pronto (cache/service worker) antes dos
    // listeners serem registrados.
    if (video.error) {
      showError();
    } else if (video.readyState >= 2) {
      showVideo();
    }

=======
        '<video class="exercise-video is-loading" muted loop playsinline preload="metadata" aria-label="Demonstração do exercício ' + exercise.name + '">' +
          '<source src="' + exercise.video + '" type="video/mp4">' +
        '</video>' +
        '<div class="exercise-loading" aria-live="polite">' +
          '<img class="exercise-loading-image" src="assets/images/manu.png" alt="" aria-hidden="true">' +
          '<p class="exercise-loading-text">Carregando exercício...</p>' +
        '</div>' +
      '</div>';

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

    video.addEventListener("canplay", showVideo, { once: true });
    video.addEventListener("error", showVideoError, { once: true });

    // `canplay` pode já ter ocorrido antes da ligação dos listeners quando o
    // vídeo vier do cache; nesse caso, preservamos a mesma transição.
    if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) showVideo();
>>>>>>> c8a6129 (Adiciona suporte a notificações via OneSignal)

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

  function openWorkout(dayKey) {
    var day = WEEK.find(function (d) { return d.key === dayKey; });
    if (!day) return;
    currentDayKey = dayKey;
    renderWorkout(day);
    viewHome.classList.add("is-hidden");
    viewWorkout.classList.remove("is-hidden");
    viewWorkout.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
    history.replaceState({ view: "workout", day: dayKey }, "", "#" + dayKey);
  }

  function goHome() {
    currentDayKey = null;
    renderWeekStrip();
    renderSpotlight();
    renderOverview();
    viewWorkout.classList.add("is-hidden");
    viewHome.classList.remove("is-hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
    history.replaceState({ view: "home" }, "", "#inicio");
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
  btnBack.addEventListener("click", goHome);

  completeBtn.addEventListener("click", function () {
    if (!currentDayKey) return;
    var dayIndex = WEEK.findIndex(function (d) { return d.key === currentDayKey; });
    var iso = toISODate(WEEK_DATES[dayIndex]);
    var nowDone = toggleDayDone(iso);
    updateCompleteButton(currentDayKey);
    showToast(nowDone ? "Treino concluído! Manda ver amanhã 💪" : "Ok, desmarcado. Bora quando estiver pronta(o) 💜");
  });

  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !viewWorkout.classList.contains("is-hidden")) {
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
