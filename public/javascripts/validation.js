

  var nameError = document.getElementById('name-error');
  var nameOk = document.getElementById("done");
  var emailError = document.getElementById('email-error');
  var passwordError = document.getElementById('password-error');
  var submitError = document.getElementById('submit-error');
  var numberError = document.getElementById('number-error')
  var surNameError = document.getElementById('surname-error')
  var confirmPassword = document.getElementById('confirmpassword-error')

  function validateName() {
    var name = document.getElementById('name').value;

    if (name.length == 0) {
      nameError.innerHTML = '*';
      return false;
    }
    if (!name.match(/^[A-Za-z]{3,12}$/)) {
      nameError.innerHTML = '*';
      return false;
    }


    nameError.innerHTML = '<i class="fa-solid fa-circle-check text-success"></i>';
    return true;
  }
    function validateSurName() {
    var name = document.getElementById('surname').value;

    if (!name.match(/^[A-Za-z]{1,12}$/)) {
      surNameError.innerHTML = '*';
      return false;
    }
    surNameError.innerHTML = '<i class="fa-solid fa-circle-check text-success"></i>';
    return true;
  }

  function validateEmail() {
    var email = document.getElementById('email').value;

    if (email.length == 0) {
      emailError.innerHTML = '*'
      return false;
    }
    if (!email.match(/^[A-Za-z\._\-[0-9]*[@][A-Za-z]*[\.][com]{3}$/)) {
      emailError.innerHTML = '*'
      return false;
    }
    emailError.innerHTML = '<i class="fa-solid fa-circle-check text-success"></i>';
    return true;
  }

  function validatePassword() {
    var password = document.getElementById('password').value;
    if(password.length ==0){
        return false;
    }

    if (!password.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)) {
      passwordError.innerHTML = 'Minimum eight characters, at least one letter and one number';
      return false;
    }

    passwordError.innerHTML = '<i class="fa-solid fa-circle-check text-success"></i>';
    return true;
  }
  function validateConfirmPassword() {
    var password = document.getElementById('password').value;
    var confirmPassword = document.getElementById('confirmpassword').value
    if(password.value == confirmPassword.value){
      confirmPassword.innerHTML = '<i class="fa-solid fa-circle-check text-success"></i>';
      return true
    }else{
      confirmPassword.innerHTML='*'
      return false;
    }

  }
  
  function validateNumber() {
    var number = document.getElementById('number').value;
    if (!number.match(/^(\+\d{1,3}[- ]?)?\d{10}$/)) {
      numberError.innerHTML = 'Invalid Number'
      return false;
    }
    numberError.innerHTML = '<i class="fa-solid fa-circle-check text-success"></i>';
    return true;
  }
  function validateProfile() {
    if (!validateName() || !validateEmail() || !validateNumber()) {

      return false;
    }
    return true;

  }

  function changePassword(){
      if(!validatePassword()){
          passwordError.innerHTML = '*';
          setTimeout(function () { passwordError.innerHTML = ''; }, 2000);
          return false;
      }
      return true;
  }

  function validateBannerName() {
    var name = document.getElementById('bannerName').value;

    if (name.length <= 5) {
      nameError.innerHTML = '*';
      return false;
    }
    if (name.length >= 50) {
      nameError.innerHTML = '*';
      return false;
    }


    nameError.innerHTML = '<i class="fa-solid fa-circle-check text-success"></i>';
    return true;
  }

  function validateBanner() {
    if (!validateBannerName()) {
      return false;
    }
    return true;

  }