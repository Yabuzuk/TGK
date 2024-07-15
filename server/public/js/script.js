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
        price.textContent = `$${item.price}`;
        let weight = document.createElement('div');
        weight.classList.add('weight', 'text-style');
        weight.textContent = `${item.weight} Kg`;
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

        itemsContainer.appendChild(container);
        itemsContainer.appendChild(contactInfo);
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

  document.getElementById('searchFrom').addEventListener('input', filterMessages);
  document.getElementById('searchTo').addEventListener('input', filterMessages);
});
