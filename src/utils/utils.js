// configuration for autonumeric library (currency)
export const amountConfig = {
  decimalPlaces: 0,
  decimalPlacesRawValue: 0,
  minimumValue: "0",
  maximumValue: "1000000000000000",
  modifyValueOnWheel: false
};
// add thousand separators to numbers
export const numberWithCommas = (x) => {
  x = x.toString();
  const pattern = /(-?\d+)(\d{3})/;
  while (pattern.test(x))
      x = x.replace(pattern, "$1,$2");
  return x;
}
// Limit input to accept only Integer value
export const validateInteger = (e) => {
  const i = e.value;
  e.value = parseInt(i, 10);
}
// Limit input to accept only upto 2 decimal places
export const validateFloating = (e) => {
  const t = e.target.value;
  e.target.value = (t.indexOf(".") >= 0) ? (t.substr(0, t.indexOf(".")) + t.substr(t.indexOf("."), 3)) : t;
}
// Add HTML element to show error message
export const insertErrorMessage = (e, message) => {
  if (e.target.style.borderColor !== 'red') {
    e.target.style.borderColor = "red";
    const errorMessage = document.createElement('div');
    errorMessage.classList.add('error-label');
    errorMessage.innerText = message;
    e.target.parentNode.appendChild(errorMessage);
  }
}
// Remove HTML element which shows error message
export const removeErrorMessage = (e) => {
  if (e.target.style.borderColor === 'red') {
    e.target.style.borderColor = "";
    const errorMessage = e.target.parentNode.querySelector('.error-label');
    if (errorMessage) {
      e.target.parentNode.removeChild(errorMessage);
    }
  }
}
// Limit percentage input to accept in range 0-100
export const validatePercentage = (e) => {
  const val = e.target.value;
  if (val < 0 || val > 100) {
    e.target.value = 100;
    insertErrorMessage(e, 'Please select a value between 0 and 100.');
  } else {
    removeErrorMessage(e);
  }
}
// Make sure amount value does not exceed 100,000,000,000,000
export const validateAmount = (e) => {
  let val = e.target.value;
  if (parseInt(val.replace(/,/g, ""), 10) > 100000000000000) {
    e.target.value = '100,000,000,000,000';
    insertErrorMessage(e, 'Please select a value less than 100,000,000,000,000.');
  } else {
    removeErrorMessage(e);
  }
}

document.querySelectorAll('.validate-amount').forEach(element => element.addEventListener('input', validateAmount, false));
// Add event listner to all input fields to accept upto 2 decimal places
document.querySelectorAll('.float-field').forEach(element => element.addEventListener('input', validateFloating, false));
// Add event listner to validate percent value to keep between between 0 and 100
document.querySelectorAll('.validate-percent').forEach(element => element.addEventListener('input', validatePercentage, false));