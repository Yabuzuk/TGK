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
      document.querySelectorAll('.message-content span').forEach(element => {
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
      const toText = message.querySelector('.message-content').textContent.toLowerCase();
      if (fromText.includes(searchFrom) && toText.includes(searchTo)) {
        message.style.display = '';
      } else {
        message.style.display = 'none';
      }
    });
  }
  document.getElementById('searchFrom').addEventListener('input', filterMessages);
  document.getElementById('searchTo').addEventListener('input', filterMessages);

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
  if (!navigator.clipboard) {
    // Fallback для браузеров без поддержки navigator.clipboard
    const textarea = document.createElement('textarea');
    textarea.value = contactText;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alert('Контакт скопирован: ' + contactText);
  } else {
    navigator.clipboard.writeText(contactText)
      .then(() => {
        alert('Контакт скопирован: ' + contactText);
      })
      .catch(err => {
        console.error('Ошибка при копировании:', err);
      });
  }
  element.classList.add('contact-highlight');
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

  let currentIndex = 0;
  const images = document.querySelectorAll('.carousel-image');
  const totalImages = images.length;

  setInterval(() => {
    images[currentIndex].classList.remove('active');
    currentIndex = (currentIndex + 1) % totalImages;
    images[currentIndex].classList.add('active');
  }, 3000); // Изменение каждые 3 секунды
});
