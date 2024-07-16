function setRole(role, element) {
  document.getElementById('roleInput').value = role;
  const buttons = document.querySelectorAll('.role-button');
  buttons.forEach(button => {
    button.classList.remove('active');
  });
  element.classList.add('active');
}

document.addEventListener('DOMContentLoaded', function() {
  fetch('https://yabuzuk-tgk-ea4b.twc1.net/api/items')
    .then(response => response.json())
    .then(items => {
      const itemsContainer = document.getElementById('itemsContainer');
      items.forEach(item => {
        let container = document.createElement('div');
        container.classList.add('container');
        container.addEventListener('click', function() {
          this.nextElementSibling.classList.toggle('active');
          this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none';
        });

        let leftSection = document.createElement('div');
        leftSection.classList.add('left-section');
        let role = document.createElement('div');
        role.classList.add('role');
        role.textContent = item.role === 'Отправлю' ? '📦' : '✈️'; // Присваиваем смайлик в зависимости от роли
        leftSection.appendChild(role);

        let centerSection = document.createElement('div');
        centerSection.classList.add('center-section');
        let moscowBeijing = document.createElement('div');
        moscowBeijing.classList.add('MoscowBeijing', 'text-style');
        moscowBeijing.textContent = `${item.from} - ${item.to}`;
        let data = document.createElement('div');
        data.classList.add('data', 'text-style');
        data.textContent = new Date(item.date).toLocaleDateString();
        let message = document.createElement('div');
        message.classList.add('message', 'text-style');
        message.textContent = item.message;
        centerSection.appendChild(moscowBeijing);
        centerSection.appendChild(data);
        centerSection.appendChild(message);

        let rightSection = document.createElement('div');
        rightSection.classList.add('right-section');
        let price = document.createElement('div');
        price.classList.add('price', 'text-style');
        price.textContent = `${item.price} $`;
        let weight = document.createElement('div');
        weight.classList.add('weight', 'text-style');
        weight.textContent = `${item.weight} kg`;
        rightSection.appendChild(price);
        rightSection.appendChild(weight);

        container.appendChild(leftSection);
        container.appendChild(centerSection);
        container.appendChild(rightSection);

        let contactInfo = document.createElement('div');
        contactInfo.id = 'contactInfo';
        contactInfo.classList.add('contact-text');
        contactInfo.textContent = item.contact;
        contactInfo.style.display = 'none'; // Изначально скрыто
        contactInfo.addEventListener('click', function() {
          copyContact(this);
        });

        // Добавляем новые элементы в начало контейнера
        itemsContainer.insertBefore(container, itemsContainer.firstChild);
        itemsContainer.insertBefore(contactInfo, itemsContainer.firstChild);
      });
    })
    .catch(error => console.error('Ошибка:', error));

  function copyContact(element) {
    const contactText = element.textContent || element.innerText;
    copyToClipboard(contactText);
    alert('Контакт скопирован: ' + contactText);
    element.classList.add('contact-highlight');
  }

  function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }

  function filterMessages() {
    const searchFrom = document.getElementById('searchFrom').value.toLowerCase();
    const searchTo = document.getElementById('searchTo').value.toLowerCase();
    const messages = document.querySelectorAll('.container');
    messages.forEach(message => {
      const fromText = message.querySelector('.MoscowBeijing').textContent.toLowerCase();
      const toText = message.querySelector('.MoscowBeijing').textContent.toLowerCase();
      if (fromText.includes(searchFrom) && toText.includes(searchTo)) {
        message.style.display = '';
      } else {
        message.style.display = 'none';
      }
    });
  }

  // Получаем элементы
  var modal = document.getElementById("myModal");
  var btn = document.getElementById("myBtn");
  var span = document.getElementsByClassName("close")[0];

  // Когда пользователь нажимает на кнопку, открываем модальное окно
  btn.onclick = function() {
    modal.style.display = "block";
  }

  // Когда пользователь нажимает на <span> (x), закрываем модальное окно
  span.onclick = function() {
    modal.style.display = "none";
  }

  // Когда пользователь нажимает в любом месте за пределами модального окна, закрываем его
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }

  document.getElementById('searchFrom').addEventListener('input', filterMessages);
  document.getElementById('searchTo').addEventListener('input', filterMessages);
});

 // Функция для создания карусели изображений
function createImageCarousel(images) {
  const carouselContainer = document.getElementById('carouselContainer');
  images.forEach((image, index) => {
    let imgElement = document.createElement('img');
    imgElement.src = `images/${image}`;
    imgElement.classList.add('carousel-image');
    if (index === 0) imgElement.classList.add('active');
    carouselContainer.appendChild(imgElement);
  });

  let currentIndex = 0;
  const totalImages = images.length;
  setInterval(() => {
    const images = document.querySelectorAll('.carousel-image');
    images[currentIndex].classList.remove('active');
    currentIndex = (currentIndex + 1) % totalImages;
    images[currentIndex].classList.add('active');
  }, 3000); // Изменение каждые 3 секунды
}

// Запрос к серверу для получения списка изображений
fetch('/images')
  .then(response => response.json())
  .then(images => createImageCarousel(images))
  .catch(error => console.error('Ошибка:', error));


const toggle = document.getElementById("toggle");
const nav = document.getElementById("nav");

toggle.addEventListener("click", () => nav.classList.toggle("active"));

async function searchLocation(inputId, suggestionsId) {
  const query = document.getElementById(inputId).value;
  if (query.length < 3) {
    document.getElementById(suggestionsId).innerHTML = '';
    return;
  }

  const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&addressdetails=1`);
  const data = await response.json();

  const cityNames = data
    .filter(item => item.address && item.address.city)
    .map(item => item.address.city)
    .filter((value, index, self) => self.indexOf(value) === index); // Удаление дубликатов

  const suggestions = cityNames.map(city => `<div onclick="selectSuggestion('${inputId}', '${city}')">${city}</div>`).join('');
  document.getElementById(suggestionsId).innerHTML = suggestions;
}

function selectSuggestion(inputId, value) {
  document.getElementById(inputId).value = value;
  document.getElementById(inputId + 'Suggestions').innerHTML = '';
}
