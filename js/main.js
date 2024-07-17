// получаем данные с сервера
async function loadCardsArrFromServer() {
  const response = await fetch('https://conf.ontico.ru/api/conferences/forCalendar.json');
  if (response.ok) document.querySelector('.lds-dual-ring').classList.add('preloader-hidden')
  return await response.json();
}

// получаем данные с сервера
let data = await loadCardsArrFromServer()

let cardsData = data.result

// подмешиваем ID
function idMixin(array) {
  array.forEach((item) => {
    item.id = crypto.randomUUID();
  })
  return array
}

idMixin(cardsData)

//  Создаём карточку и сразу же инъектируем туда данные
function createCard(date_range, logo, name, brief, location, uri, incomId) {
  let cardList = document.getElementById('card-list')
  let card = document.createElement('li')
  card.innerHTML = `
    <div class="card__item-body">

      <div class="card__date">${date_range}</div>

      <img class="card__img" src="${logo}" alt="логотип мероприятия">

      <div class="card__item-body-text">

        <h3 class="card__subtitle">${name}</h3>

        <p class="card__text">
          ${brief}
        </p>

        <div class="card__place">
          ${location}
        </div>

        <a href="${uri}" class="card__info">
          ${uri.replace('https://', '')}
        </a>

      </div>

      <div class="card__button-wrapper">
      
        <button class="btn-reset card__main-btn" data-id="${incomId}">Купить билет</button>

        <button class="btn-reset card__second-btn" onclick="window.location.href='${uri}'">Подробнее</button>

      </div>

    </div>`

  // !!! ВАЖНО !!! В ДАТА атрибут кнопки инъектруем ID оъекта
  card.className = "card card__item";

  // card.classList.add('card card__item')
  // закидываем карточку в родителя
  cardList.appendChild(card)
}

// парсим карточки из массива
for (const item of cardsData) {
  createCard(item.date_range, item.logo, item.name, item.brief, item.location, item.uri, item.id)
}

// определяем модалку
let modalWindow = document.getElementById("my-modal")

// Закрыть модальное окно при клике вне его
document.querySelector("#my-modal .modal__box").addEventListener('click', event => {
  event._isClickWithInModal = true;

});

document.getElementById("my-modal").addEventListener('click', event => {
  if (event._isClickWithInModal) return;
  event.currentTarget.classList.remove('open');
});

// Закрыть модальное окно по кнопке
document.getElementById("close-my-modal-btn").addEventListener("click", function () {
  document.getElementById("my-modal").classList.remove("open")

})

// собираем все кнопки открывающие модалку, для того что бы модалке передать ID из data атрибута
let mainbuttonArr = document.querySelectorAll('.card__main-btn')

// находим у кажной кнопки ID, что бы передатб его в модалку
for (const button of mainbuttonArr) {
  button.addEventListener('click', () => {
    let btnId = button.getAttribute('data-id')
    fillModalWindow(btnId)
  })
}

// активируем свайпер в модалке, иначе не активируется
// не знаю правильно ли, но работает
function swiperActivator() {
  const modalSwiper = new Swiper('.swiper', {
    // Optional parameters
    direction: 'horizontal',
    loop: true,

    // If we need pagination
    pagination: {
      el: '.swiper-pagination',
    },

    // Navigation arrows
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },

  });

  return modalSwiper
}

// заполняем модалку инфой
function fillModalWindow(IncomeId) {

  // открываем модалку
  modalWindow.classList.add("open")

  // находим в ней куда будем инъектировать
  let modalBox = document.querySelector(".modal__box")

  // фильтруем наш БОЛЬШОЙ массив по ID,который передали из кнопки
  // получаем один оъект, данные из которого инъектируем в верстку
  let moadalObj = cardsData.find((item) => item.id === IncomeId);

  // здесь же создаем свайпер
  let modalContent = document.querySelector(".modal-content")

  // чистим перед открытием (если еще не создан - создаем) : (а если создан, убираем и дальше по коду создаем)
  modalContent === null ? modalContent = document.createElement('div') : modalContent.remove()

  // собственно создаем котент, и инъектируем туда наш отфильтрованные объект
  modalContent.innerHTML = `
  <div class="swiper">
  <!-- Additional required wrapper -->
    <div class="swiper-wrapper">
      <!-- Slides -->
      <div class="swiper-slide"><img src="${moadalObj.logo}" alt="логотип"/></div>
      <div class="swiper-slide">Slide 2</div>
      <div class="swiper-slide"><img src="${moadalObj.logo}" alt="логотип"/></div>
    </div>
    <!-- If we need pagination -->
    <div class="swiper-pagination"></div>

    <!-- If we need navigation buttons -->
    <div class="swiper-button-prev"></div>
    <div class="swiper-button-next"></div>

  </div>
    <h2>${moadalObj.name}</h2>

    <p>${moadalObj.location}</p>
    <small>${moadalObj.date_range}</small>
    <p>${moadalObj.brief}</p>
    <a href="${moadalObj.uri}">${moadalObj.uri}</a>
  `
  modalContent.classList.add("modal-content");

  // закидываем вёрстку в модальное окно
  modalBox.appendChild(modalContent)

  // активируем свайпер
  swiperActivator()
}
