/**
 * Language Switcher - Toggle functionality
 */

document.addEventListener('DOMContentLoaded', function () {
  const languageSwitcher = document.getElementById('language-switcher');
  if (!languageSwitcher) return;

  const button = languageSwitcher.querySelector('.lang-button');
  const menu = languageSwitcher.querySelector('.lang-menu');

  if (!button || !menu) return;

  let hoverTimeout;

  // Toggle menu on button click
  button.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', !isExpanded);

    if (isExpanded) {
      menu.classList.remove('show');
    } else {
      menu.classList.add('show');
    }
  });

  // Close menu when clicking outside
  document.addEventListener('click', function (e) {
    if (!languageSwitcher.contains(e.target)) {
      button.setAttribute('aria-expanded', 'false');
      menu.classList.remove('show');
    }
  });

  // Close menu when clicking on a language option
  const langItems = menu.querySelectorAll('.lang-item');
  langItems.forEach(function (item) {
    item.addEventListener('click', function () {
      menu.classList.remove('show');
      button.setAttribute('aria-expanded', 'false');
    });
  });

  // Hover support for desktop
  languageSwitcher.addEventListener('mouseenter', function () {
    clearTimeout(hoverTimeout);
    button.setAttribute('aria-expanded', 'true');
    menu.classList.add('show');
  });

  languageSwitcher.addEventListener('mouseleave', function () {
    hoverTimeout = setTimeout(function () {
      button.setAttribute('aria-expanded', 'false');
      menu.classList.remove('show');
    }, 200);
  });

  // Initialize aria-expanded
  button.setAttribute('aria-expanded', 'false');
});
