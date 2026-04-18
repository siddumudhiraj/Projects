const input = document.getElementById('colorInput');
const button = document.getElementById('changeBtn');
const errorText = document.getElementById('error');

// Change background
function changeBackground() {
  const color = input.value.trim();

  if (!isValidColor(color)) {
    errorText.innerText = "Invalid color!";
    return;
  }

  document.body.style.backgroundColor = color;
  errorText.innerText = "";
}

// Validate color
function isValidColor(str) {
  const s = new Option().style;
  s.color = str;
  return s.color !== "";
}

// Events
button.addEventListener('click', changeBackground);

input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') changeBackground();
});