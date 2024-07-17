// получаем данные с сервера
async function loadCardsArrFromServer() {
  const response = await fetch('https://conf.ontico.ru/api/conferences/forCalendar.json');
  if (response.ok) document.querySelector('.lds-dual-ring').classList.add('preloader-hidden')
  return await response.json();
}

// получаем данные с сервера
let data = await loadCardsArrFromServer()

let dataFromServer = data.result

// подмешиваем ID
function idMixin(array) {
  array.forEach((item) => {
    item.id = crypto.randomUUID();
  })
  return array
}

let cardsData = idMixin(dataFromServer)

//  Создаём карточку и сразу же инъектируем туда данные
function createCard(date_range, logo, name, brief, location, uri, incomId) {
  // let cardList = document.getElementById('card-list')
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

  return card
}

// pagination

let cardsPerPage = 4
let currentPage = 1

const breakpoint1 = window.matchMedia("(min-width: 1726px)");

const breakpoint2 = window.matchMedia("(min-width: 1294px)");

const breakpoint3 = window.matchMedia("(min-width: 861px)");





window.addEventListener("resize", () => {
  let windowWith = document.documentElement.clientWidth;
  if (windowWith < 1726) cardsPerPage = 6
  console.log(cardsPerPage)
});




// активируем при запуске и нажатии кнопки пагинации
function displayList(arrData, elPerList, page) {
  let cardList = document.getElementById('card-list');
  cardList.innerHTML = '';
  page--;

  const start = elPerList * page;
  const end = start + elPerList
  const paginatedArr = arrData.slice(start, end)

  for (const item of paginatedArr) {
    let paginatedCard = createCard(item.date_range, item.logo, item.name, item.brief, item.location, item.uri, item.id)
    cardList.appendChild(paginatedCard)
  }

}



function displayPagination(arrData, elPerList) {
  const paginationContainer = document.querySelector('.pagination-container');
  const pagesCount = Math.ceil(arrData.length / elPerList);
  for (let i = 0; i < pagesCount; i++) {
    const paginationBtn = displayPaginationBtn(i + 1);
    paginationContainer.appendChild(paginationBtn)
  }
}

function displayPaginationBtn(pageNum) {
  const btn = document.createElement('button');
  btn.classList.add('pagination-btn', 'btn-reset');
  btn.innerHTML = pageNum

  // для первого запуска
  if (currentPage == pageNum) btn.classList.add('pagination-active');

  btn.addEventListener('click', () => {
    currentPage = pageNum;
    displayList(cardsData, cardsPerPage, currentPage)
    // обновляем кнопки на карточках
    updateMainButtonState()
    transferIdToModal()

    let paginationBtnArr = document.querySelectorAll('.pagination-btn')
    paginationBtnArr.forEach((item, index) => {
      if (index + 1 === currentPage) {
        item.classList.add('pagination-active');
      } else {
        item.classList.remove('pagination-active');
      }
    })
  })

  return btn
}

displayList(cardsData, cardsPerPage, currentPage)
displayPagination(cardsData, cardsPerPage)

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
function updateMainButtonState() {
  let mainButtonArr = document.querySelectorAll('.card__main-btn')
  console.log('кнопки обновились')
  console.log(mainButtonArr)
  return mainButtonArr
}

// находим у кажной кнопки ID, что бы передатб его в модалку
function transferIdToModal() {
  for (const button of updateMainButtonState()) {
    button.addEventListener('click', () => {
      console.log('card btn clicked')
      let btnId = button.getAttribute('data-id')
      fillModalWindow(btnId)
    })
  }
}

transferIdToModal()

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

