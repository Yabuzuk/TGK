document.addEventListener('DOMContentLoaded', function() {
  fetch('https://yabuzuk-tgk-ea4b.twc1.net/api/items')
    .then(response => response.json())
    .then(items => {
      const itemsContainer = document.getElementById('itemsContainer');
      items.forEach(item => {
        let message = document.createElement('div');
        message.classList.add('message');
        message.addEventListener('click', function() {
          this.classList.toggle('active');
        });

         let messagePreview = document.createElement('div');
              messagePreview.classList.add('message-preview');
              messagePreview.textContent = `${item.role} из ${item.from} в ${item.to}`;
              let messageContent = document.createElement('div');
              messageContent.classList.add('message-content');
              messageContent.innerHTML = `
                <p>Дата: <span>${new Date(item.date).toLocaleDateString()}</span></p>
                <p>Цена: <span>${item.price}</span> Вес: <span>${item.weight}</span></p>
                <p>Контакт: <span onclick="copyContact(this)">${item.contact}</span></p>
                <p>Сообщение: <span>${item.message}</span></p>
              `;
              message.appendChild(messagePreview);
              message.appendChild(messageContent);
              if (itemsContainer.firstChild) {
                itemsContainer.insertBefore(message, itemsContainer.firstChild);
              } else {
                itemsContainer.appendChild(message);
              }
              
            });
            const contactElements = document.querySelectorAll('.message-content span');
      contactElements.forEach(element => {
        element.classList.add('contact-highlight');
      });
          })
          
          .catch(error => console.error('Ошибка:', error));
        function filterMessages() {
          const searchFrom = document.getElementById('searchFrom').value.toLowerCase();
          const searchTo = document.getElementById('searchTo').value.toLowerCase();
          const messages = document.querySelectorAll('.message');
          messages.forEach(message => {
            const fromText = message.querySelector('.message-preview').textContent.toLowerCase();
            const toText = message.querySelector('.message-preview').textContent.toLowerCase();
            if (fromText.includes(searchFrom) && toText.includes(searchTo)) {
              message.style.display = '';
            } else {
              message.style.display = 'none';
            }
          });
        }
        document.getElementById('searchFrom').addEventListener('input', filterMessages);
        document.getElementById('searchTo').addEventListener('input', filterMessages);
      });
      var modal = document.getElementById('myModal');
      var btn = document.getElementById('myBtn');
      var span = document.getElementsByClassName('close')[0];
      btn.onclick = function() {
        modal.style.display = "block";
      }
      span.onclick = function() {
        modal.style.display = "none";
      }
      window.onclick = function(event) {
        if (event.target == modal) {
          modal.style.display = "none";
        }
      }
      function copyContact(element) {
      const contactText = element.textContent || element.innerText;
      copyToClipboard(contactText);
      alert('Контакт скопирован: ' + contactText);
      element.classList.add('contact-highlight'); // Добавление класса для выделения
    }
      function copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
  
      function setRole(role, element) {
        const roleInput = document.getElementById('roleInput');
        roleInput.value = role;
        const buttons = document.querySelectorAll('.role-button');
        buttons.forEach(button => {
          button.classList.remove('active');
        });
        element.classList.add('active');
      }
  
      // Обновленная функция для установки роли и изменения стиля кнопок
      function setRole(role, element) {
        const roleInput = document.getElementById('roleInput');
        roleInput.value = role;
        const buttons = document.querySelectorAll('.role-button');
        buttons.forEach(button => {
          button.classList.remove('active');
        });
        element.classList.add('active');
      }

function fetchUserProfile() {
  fetch('/api/current_user')
    .then(response => response.json())
    .then(data => {
      if (data.isAuthenticated) {
        document.getElementById('profileContainer').style.display = 'block';
        document.getElementById('userImage').src = data.user.image;
        document.getElementById('userName').textContent = data.user.displayName;
        document.getElementById('userEmail').textContent = data.user.email;
      }
    })
    .catch(error => console.error('Ошибка при получении данных пользователя:', error));
}

fetchUserProfile();


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
