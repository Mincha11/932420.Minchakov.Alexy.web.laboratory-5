
"use strict";

const KEYS = {games:"gamerLab4Games", theme:"gamerLab4Theme", hidden:"gamerLab4GamesHidden", title:"gamerLab4TitleChanged"};
function byId(id) {
    const el = document.getElementById(id);
    if (!el) console.error(`Ошибка: элемент с id="${id}" не найден.`);
    return el;
}
function message(text) {
    const el = byId("games-message");
    if (el) el.textContent = text;
}
function loadGames() {
    try {
        const data = JSON.parse(localStorage.getItem(KEYS.games) || "[]");
        if (!Array.isArray(data)) throw new Error("Список игр имеет неверный формат.");
        return data.filter(g => g && typeof g.name === "string" && typeof g.genre === "string" && Number.isInteger(g.rating) && g.rating >= 1 && g.rating <= 5);
    } catch (e) {
        console.error("Не удалось загрузить игры:", e);
        return [];
    }
}
let games = loadGames();
function saveGames() {
    try { localStorage.setItem(KEYS.games, JSON.stringify(games)); }
    catch (e) { console.error("Не удалось сохранить игры:", e); message("Не удалось сохранить список в localStorage."); }
}
function createCard(game, index) {
    const card = document.createElement("article");
    card.className = "game-card";
    card.dataset.index = String(index);
    const title = document.createElement("h3");
    title.textContent = game.name;
    const genre = document.createElement("p");
    genre.textContent = "Жанр: " + game.genre;
    const rating = document.createElement("p");
    rating.className = "game-rating";
    rating.textContent = `Рейтинг: ${game.rating}/5`;
    const stars = document.createElement("p");
    stars.textContent = "★".repeat(game.rating) + "☆".repeat(5 - game.rating);
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "delete-game";
    remove.textContent = "Удалить";
    remove.addEventListener("click", () => {
        const i = Number(card.dataset.index);
        if (!Number.isInteger(i) || !games[i]) {
            message("Ошибка: карточка игры не найдена.");
            console.error("Не найден элемент списка для удаления.");
            return;
        }
        const removed = games.splice(i, 1)[0];
        saveGames(); renderGames(); message(`Игра «${removed.name}» удалена.`);
    });
    card.append(title, genre, rating, stars, remove);
    return card;
}
function renderGames() {
    const list = byId("games-list");
    if (!list) return;
    // querySelectorAll находит карточки, которые уже находятся в DOM.
    list.querySelectorAll(".game-card, .empty-message").forEach(el => el.remove());
    if (!games.length) {
        const empty = document.createElement("p");
        empty.className = "empty-message";
        empty.textContent = "Список пока пуст. Нажми «Добавить игру».";
        list.appendChild(empty);
        return;
    }
    games.forEach((game, index) => list.appendChild(createCard(game, index)));
}
function addGame() {
    const rawName = prompt("Введите название игры:");
    if (rawName === null) return message("Добавление отменено.");
    const name = rawName.trim();
    if (!name) return message("Название игры не может быть пустым.");
    const rawGenre = prompt("Введите жанр игры:");
    if (rawGenre === null) return message("Добавление отменено.");
    const genre = rawGenre.trim();
    if (!genre) return message("Жанр игры не может быть пустым.");
    const rawRating = prompt("Введите рейтинг от 1 до 5:");
    if (rawRating === null) return message("Добавление отменено.");
    const rating = Number(rawRating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5)
        return message("Ошибка: рейтинг должен быть целым числом от 1 до 5.");
    games.push({name, genre, rating});
    saveGames(); renderGames(); message(`Игра «${name}» добавлена.`);
}
function deleteLastGame() {
    if (!games.length) return message("Нечего удалять: список пуст.");
    const removed = games.pop();
    saveGames(); renderGames(); message(`Последняя игра «${removed.name}» удалена.`);
}
function setTheme(theme) {
    // querySelector используется для поиска body.
    const body = document.querySelector("body");
    if (!body) return console.error("Ошибка: элемент body не найден.");
    body.classList.toggle("light-theme", theme === "light");
    const button = byId("theme-toggle");
    if (button) button.textContent = theme === "light" ? "Включить тёмную тему" : "Включить светлую тему";
    try { localStorage.setItem(KEYS.theme, theme); }
    catch (e) { console.error("Не удалось сохранить тему:", e); }
}
function toggleTheme() {
    const body = document.querySelector("body");
    if (!body) return console.error("Не удалось переключить тему: body отсутствует.");
    setTheme(body.classList.contains("light-theme") ? "dark" : "light");
}
function setGamesHidden(hidden) {
    const list = byId("games-list"), button = byId("toggle-games");
    const intro = document.querySelector("#favorite-games h2 + p");
    if (!list || !button || !intro) {
        console.error("Ошибка: не найдены элементы для скрытия списка игр.");
        return;
    }
    list.classList.toggle("is-hidden", hidden);
    intro.classList.toggle("is-hidden", hidden);
    button.textContent = hidden ? "Показать список" : "Скрыть список";
    try { localStorage.setItem(KEYS.hidden, String(hidden)); }
    catch (e) { console.error("Не удалось сохранить видимость списка:", e); }
}
function toggleGames() {
    const list = byId("games-list");
    if (list) setGamesHidden(!list.classList.contains("is-hidden"));
}
function toggleTitle() {
    const title = byId("page-title");
    if (!title) return;
    const changed = title.dataset.changed !== "true";
    title.textContent = changed ? "Геймер и разработчик игр" : "Алексей Минчаков";
    title.dataset.changed = String(changed);
    try { localStorage.setItem(KEYS.title, String(changed)); }
    catch (e) { console.error("Не удалось сохранить заголовок:", e); }
}
document.addEventListener("DOMContentLoaded", () => {
    let theme = "dark", hidden = false, changedTitle = false;
    try {
        theme = localStorage.getItem(KEYS.theme) || "dark";
        hidden = localStorage.getItem(KEYS.hidden) === "true";
        changedTitle = localStorage.getItem(KEYS.title) === "true";
    } catch (e) { console.error("Не удалось прочитать localStorage:", e); }
    setTheme(theme); renderGames(); setGamesHidden(hidden);
    const title = byId("page-title");
    if (title && changedTitle) { title.textContent = "Геймер и разработчик игр"; title.dataset.changed = "true"; }

    const add = byId("add-game"); if (add) add.addEventListener("click", addGame);
    const del = byId("delete-last-game"); if (del) del.addEventListener("click", deleteLastGame);
    const themeButton = byId("theme-toggle"); if (themeButton) themeButton.addEventListener("click", toggleTheme);
    const visibility = byId("toggle-games"); if (visibility) visibility.addEventListener("click", toggleGames);
    const titleButton = byId("title-toggle"); if (titleButton) titleButton.addEventListener("click", toggleTitle);

    // querySelectorAll получает все ссылки меню.
    document.querySelectorAll("nav a").forEach(link => link.addEventListener("click", () => {
        console.log("Переход к разделу:", link.getAttribute("href"));
    }));

    const form = byId("feedback-form");
    if (form) form.addEventListener("submit", event => {
        event.preventDefault();
        message("Форма демонстрационная: данные не отправляются на сервер.");
    });
});
