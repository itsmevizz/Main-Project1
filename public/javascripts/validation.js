

  let nameError = document.getElementById('name-error');
  let nameOk = document.getElementById("done");
  let emailError = document.getElementById('email-error');
  let passwordError = document.getElementById('password-error');
  let submitError = document.getElementById('submit-error');
  let numberError = document.getElementById('number-error')
  let surNameError = document.getElementById('surname-error')
  let confirmPasswordError = document.getElementById('confirmpassword-error')
  let couponError = document.getElementById('coupon-error')
  let descriptionError = document.getElementById('description')

  function validateName() {
    let name = document.getElementById('name').value;

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
    let name = document.getElementById('surname').value;

    if (!name.match(/^[A-Za-z]{1,12}$/)) {
      surNameError.innerHTML = '*';
      return false;
    }
    surNameError.innerHTML = '<i class="fa-solid fa-circle-check text-success"></i>';
    return true;
  }

  function validateEmail() {
    let email = document.getElementById('email').value;

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
    let password = document.getElementById('password').value;
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
    let password = document.getElementById('password').value;
    let confirmPassword = document.getElementById('confirmpassword').value
    if(confirmPassword.length == 0){
      confirmPasswordError.innerHTML='*'
      return false;
    }
    else if(confirmPassword === password){
      confirmPasswordError.innerHTML = '<i class="fa-solid fa-circle-check text-success"></i>';
      return true
    }

  }
  
  function validateNumber() {
    let number = document.getElementById('number').value;
    if (!number.match(/^(\+\d{1,3}[- ]?)?\d{10}$/)) {
      numberError.innerHTML = 'Invalid Number'
      return false;
    }
    numberError.innerHTML = '<i class="fa-solid fa-circle-check text-success"></i>';
    return true;
  }
  function validateProfile() {
    if (!validateName() || !validateEmail() || !validateNumber())  {

      return false;
    }
    return true;

  }

  function changePassword(){
      if(!validatePassword()||!validateConfirmPassword()){
          passwordError.innerHTML = '*';
          setTimeout(function () { passwordError.innerHTML = ''; }, 2000);
          return false;
      }
      return true;
  }

  function validateBannerName() {
    let name = document.getElementById('bannerName').value;

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
  function validateCouponCode() {
    let code = document.getElementById("couponCode").value
    if(code.length <=5 && code.length >=15){
      couponError.innerHTML='*'
      return false
    }else if(code.length <=0){
      couponError.innerHTML ='*'
      return false
    }
    else{
      couponError.innerHTML = '<i class="fa-solid fa-circle-check text-success"></i>';
      return true
    }
    
  }

  function validateCoupon() {
    if(!validateCouponCode()){
      couponError.innerHTML='*'
      return false
    }return true
    
  }

  function validateProductName(){
    const name = document.getElementById('name').value
    if (name ==0) {
      nameError.innerHTML='*'
      return false
    }
    // else if(!name.match(/^[A-Za-z]{1,50}$/)){
    //   nameError.innerHTML='*'
    //   return false
    // }
      else if (name.length >=50) {
        nameError.innerHTML='*'
      return false
    }else{
      nameError.innerHTML = '<i class="fa-solid fa-circle-check text-success"></i>'
      return true
    }
    
  }

  function validateDescription(){
    const description = document.getElementById('Description').value
    if (description ==0) {
      descriptionError.innerHTML='*'
      return false
    }
    // else if(!name.match(/^[A-Za-z]{1,50}$/)){
    //   nameError.innerHTML='*'
    //   return false
    // }
      else if (description.length >=100) {
        descriptionError.innerHTML='*'
      return false
    }else{
      descriptionError.innerHTML = '<i class="fa-solid fa-circle-check text-success"></i>'
      return true
    }
    
  }

  function submit(){
    if(!validateDescription() || !validateProductName()){
      return false
    }else{
      return true
    } 
  }

  function categoryName(){
    const name = document.getElementById('name').value
    if (name ==0) {
      nameError.innerHTML='*'
      return false
    }
    // else if(!name.match(/^[A-Za-z]{1,50}$/)){
    //   nameError.innerHTML='*'
    //   return false
    // }
      else if (name.length >=20) {
        nameError.innerHTML='*'
      return false
    }else{
      nameError.innerHTML = '<i class="fa-solid fa-circle-check text-success"></i>'
      return true
    }

  }

  function submit(){
    if(!validateDescription() || !categoryName()){
      return false
    }else{
      return true
    } 
  }
