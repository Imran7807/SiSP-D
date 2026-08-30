document.addEventListener('DOMContentLoaded', function () {
  // Mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.querySelector('.nav-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  // Signup: reveal the free-text area field when "None of these" is selected
  var locationSelect = document.getElementById('location');
  var customAreaField = document.getElementById('customAreaField');
  if (locationSelect && customAreaField) {
    var toggleCustomArea = function () {
      var isOther = locationSelect.value === locationSelect.dataset.otherValue;
      customAreaField.style.display = isOther ? 'block' : 'none';
      var input = customAreaField.querySelector('input');
      if (input) input.required = isOther;
    };
    locationSelect.addEventListener('change', toggleCustomArea);
    toggleCustomArea();
  }

  // Generic file input -> image preview
  document.querySelectorAll('.upload-box').forEach(function (box) {
    var input = box.querySelector('input[type="file"]');
    var preview = box.querySelector('img.preview');
    var label = box.querySelector('.upload-label');
    if (!input || !preview) return;
    input.addEventListener('change', function () {
      var file = input.files && input.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function (e) {
        preview.src = e.target.result;
        preview.style.display = 'block';
        if (label) label.textContent = file.name;
      };
      reader.readAsDataURL(file);
    });
  });
});
