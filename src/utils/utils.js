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

const InternalPV = (values, guess) => {
  guess = typeof guess === "undefined" ? 0.1 : guess;

  let lowerBound = 0;
  let upperBound = values.length - 1;

  let tempTotal = 0
  let divRate = 1 + guess;

  while (lowerBound <= upperBound && values[lowerBound] === 0) {
    lowerBound++;
  }

  let i = upperBound;
  let step = -1

  while (i >= lowerBound) {
    tempTotal = tempTotal / divRate;
    tempTotal = tempTotal + values[i];
    i = i + step;
  }
  return tempTotal;
}

export const IRR = (values, guess) => {
  guess = typeof guess === "undefined" ? 0.1 : guess;

  let epslMax = 0.0000001;
  let step = 0.00001;
  let iterMax = 39;

  //Check for valid inputs
  if (guess <= -1) {
    return "Error - invalid guess";
  }

  if (values.length < 1) {
    return null;
  }

  //Scale up the Epsilon Max based on cash flow values
  let tempVar = values[0] > 0 ? values[0] : values[0] * -1;
  let i = 0;

  while (i < values.length) {
    if (Math.abs(values[i]) > tempVar) {
      tempVar = Math.abs(values[i]);
    }
    i++;
  }

  let tempNpvEpsl = tempVar * epslMax * 0.01

  let tempRate0 = guess;
  let tempNpv0 = InternalPV(values, tempRate0);

  let tempRate1 = tempNpv0 > 0 ? tempRate0 + step : tempRate0 - step;

  if (tempRate1 <= -1) {
    return "Error - invalid values";
  }

  let tempNpv1 = InternalPV(values, tempRate1);

  i = 0;

  while (i <= iterMax) {
    if (tempNpv1 === tempNpv0) {
      tempRate0 = tempRate1 > tempRate0 ? tempRate0 - step : tempRate0 + step;

      tempNpv0 = InternalPV(values, tempRate0);

      if (tempNpv1 === tempNpv0) {
        return "Error - invalid values";
      }
    }
    
    tempRate0 = tempRate1 - (tempRate1 - tempRate0) * tempNpv1 / (tempNpv1 - tempNpv0);

    //Secant method
    if (tempRate0 <= -1) {
      tempRate0 = (tempRate1 - 1) * 0.5;
    }

    //Give the algorithm a second chance...
    tempNpv0 = InternalPV(values, tempRate0);
    tempVar = tempRate0 > tempRate1 ? tempRate0 - tempRate1 : tempRate1 - tempRate0;
    
    let tempVar2 = tempNpv0 > 0 ? tempNpv0 : tempNpv0 * -1;

    //Test for npv = 0 and rate convergence
    if (tempVar2 < tempNpvEpsl && tempVar < epslMax) {
      return tempRate0;
    }
    //Transfer values and try again...
    tempVar = tempNpv0;
    tempNpv0 = tempNpv1;
    tempNpv1 = tempVar;
    tempVar = tempRate0;
    tempRate0 = tempRate1;
    tempRate1 = tempVar;

    i++;

  }
  return "Error - iterMax exceeded"
}

const EVALNPV = (rate, values, npvType, lowerBound, upperBound) => {
  let tempVar = 1;
  let tempTotal = 0;
  let i = lowerBound;

  while (i <= upperBound) {
    let tempVar2 = values[i];
    tempVar = tempVar + tempVar * rate;

    if (! (npvType > 0 &&  tempVar2 > 0) || ! (npvType < 0 && tempVar2 < 0)) {
      tempTotal = tempTotal + tempVar2 / tempVar;
    }
    i++
  }
  return tempTotal
}

export const NPV = (values, rate) => {
  values = values.slice(1);
  let lowerBound = 0;
  let upperBound = values.length -1;
  let tempVar = upperBound - lowerBound + 1;

  if (tempVar < 1) {
    return "Error - Invalid Values"
  }

  if (rate === -1) {
    return "Error - Invalid Rate"
  }

  return EVALNPV(rate, values, 0, lowerBound, upperBound);
}