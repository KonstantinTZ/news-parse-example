async function loadCardsArrFromServer() {
  const response = await fetch('https://conf.ontico.ru/api/conferences/forCalendar.json');
  if (response.ok) document.querySelector('.lds-dual-ring').classList.add('preloader-hidden')
  return await response.json();
}

// получаем данные с сервера
let data = await loadCardsArrFromServer()
let cardsData = data.result


function createCard(date_range, logo, name, brief, location, uri) {
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
        <button class="btn-reset card__main-btn" >Купить билет</button>
        <button class="btn-reset card__second-btn" onclick="window.location.href='${uri}'">Подробнее</button>
      </div>
    </div>`
  card.className = "card card__item";

  // card.classList.add('card card__item')
  cardList.appendChild(card)

}


for (const item of cardsData) {
  createCard(item.date_range, item.logo, item.name, item.brief, item.location, item.uri)
}
