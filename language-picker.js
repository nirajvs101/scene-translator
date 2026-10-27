// A searchable language menu: a button showing the chosen language that opens
// a panel with a search box and a filtered list. Built by hand instead of a
// <select> so it can search, and so it behaves the same in every browser.

let pickerCount = 0;

// Lowercase without accents, so "espanol" finds "Español".
function simplifyForSearch(text) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// Languages matching the search, those whose name starts with it first.
function matchingLanguages(query) {
  const search = simplifyForSearch(query.trim());
  const entries = Object.entries(LANGUAGES).sort(([, a], [, b]) => a.name.localeCompare(b.name));
  if (search === "") {
    return entries.map(([code]) => code);
  }
  const startsWith = [];
  const contains = [];
  for (const [code, language] of entries) {
    const names = [language.name, language.nativeName].map(simplifyForSearch);
    if (names.some((name) => name.startsWith(search))) {
      startsWith.push(code);
    } else if (names.some((name) => name.includes(search))) {
      contains.push(code);
    }
  }
  return [...startsWith, ...contains];
}

function languageLabel(code) {
  const { name, nativeName } = LANGUAGES[code];
  return name === nativeName ? name : `${name} · ${nativeName}`;
}

// Fills `container` with a picker labeled `labelText`. Calls `onPick(code)`
// when someone chooses a language; call `setValue(code)` to show a choice.
function createLanguagePicker(container, labelText, onPick) {
  pickerCount += 1;
  const id = `language-picker-${pickerCount}`;
  let value = null;
  let visibleCodes = [];
  let highlighted = 0;

  container.classList.add("picker");
  container.innerHTML = `
    <span class="picker-label" id="${id}-label">${labelText}</span>
    <button type="button" class="picker-button" id="${id}-button"
      aria-haspopup="listbox" aria-expanded="false" aria-labelledby="${id}-label ${id}-button"></button>
    <div class="picker-panel" hidden>
      <input type="search" class="picker-search" placeholder="Search languages…" autocomplete="off"
        role="combobox" aria-expanded="true" aria-autocomplete="list" aria-controls="${id}-list"
        aria-label="Search ${labelText.toLowerCase()} languages" />
      <ul class="picker-list" id="${id}-list" role="listbox" aria-labelledby="${id}-label"></ul>
      <p class="picker-empty" hidden></p>
    </div>`;
  const button = container.querySelector(".picker-button");
  const panel = container.querySelector(".picker-panel");
  const search = container.querySelector(".picker-search");
  const list = container.querySelector(".picker-list");
  const emptyMessage = container.querySelector(".picker-empty");

  function renderList() {
    visibleCodes = matchingLanguages(search.value);
    highlighted = Math.min(highlighted, Math.max(visibleCodes.length - 1, 0));
    list.innerHTML = "";
    visibleCodes.forEach((code, index) => {
      const option = document.createElement("li");
      option.id = `${id}-option-${code}`;
      option.setAttribute("role", "option");
      option.className = "picker-option";
      option.textContent = languageLabel(code);
      option.setAttribute("aria-selected", String(code === value));
      option.classList.toggle("highlighted", index === highlighted);
      option.addEventListener("click", () => choose(code));
      list.appendChild(option);
    });
    emptyMessage.hidden = visibleCodes.length > 0;
    emptyMessage.textContent = `No language matches “${search.value.trim()}”.`;
    const active = list.children[highlighted];
    if (active) {
      search.setAttribute("aria-activedescendant", active.id);
      active.scrollIntoView({ block: "nearest" });
    } else {
      search.removeAttribute("aria-activedescendant");
    }
  }

  function open() {
    search.value = "";
    highlighted = Math.max(matchingLanguages("").indexOf(value), 0);
    panel.hidden = false;
    button.setAttribute("aria-expanded", "true");
    renderList();
    search.focus();
  }

  function close({ returnFocus = true } = {}) {
    if (panel.hidden) {
      return;
    }
    panel.hidden = true;
    button.setAttribute("aria-expanded", "false");
    if (returnFocus) {
      button.focus();
    }
  }

  function choose(code) {
    close();
    onPick(code);
  }

  // Keep focus in the search box while clicking options or the scrollbar,
  // so the panel doesn't close before the click lands.
  panel.addEventListener("mousedown", (event) => {
    if (event.target !== search) {
      event.preventDefault();
    }
  });
  button.addEventListener("click", () => (panel.hidden ? open() : close()));
  search.addEventListener("input", () => {
    highlighted = 0;
    renderList();
  });
  search.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      highlighted = (highlighted + step + visibleCodes.length) % Math.max(visibleCodes.length, 1);
      renderList();
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (visibleCodes.length > 0) {
        choose(visibleCodes[highlighted]);
      }
    } else if (event.key === "Escape") {
      close();
    }
  });
  // Close when focus or a click goes anywhere outside this picker.
  document.addEventListener("mousedown", (event) => {
    if (!container.contains(event.target)) {
      close({ returnFocus: false });
    }
  });
  container.addEventListener("focusout", (event) => {
    if (!container.contains(event.relatedTarget)) {
      close({ returnFocus: false });
    }
  });

  return {
    setValue(code) {
      value = code;
      button.textContent = languageLabel(code);
    },
  };
}
