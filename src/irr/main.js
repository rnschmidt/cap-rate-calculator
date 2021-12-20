// Dynamic IRR Calculator

import { IRR, NPV, insertErrorMessage, removeErrorMessage, numberWithCommas } from "../utils/utils.js";

// const interestRate = document.getElementById('interest-rate');
const numberOfPeriods = document.getElementById('number-of-periods');

const cashFlowContainer = document.querySelector('.cash-flow-container');
const resultantCashFlowContainer = document.querySelector('.resultant-cash-flow-container');

const resultantInterestRate = document.getElementById('resultant-interest-rate');
const resultantNumberOfPeriods = document.getElementById('resultant-number-of-periods');
// const resultantPV = document.getElementById('resultant-pv');
// const resultantNPV = document.getElementById('resultant-npv');
const resultantIRR = document.getElementById('irr');

let cashFlows = new Array(21).fill(0);

const validateNumberOfPeriods = (e) => { 
  const numberOfPeriodsValue = parseInt(numberOfPeriods.value);

  if (numberOfPeriodsValue < 1) { 
    numberOfPeriods.value = 1;
    insertErrorMessage(e, 'Number of periods must be greater than 0');
  }

  if (numberOfPeriodsValue > 20) {
    numberOfPeriods.value = 20;
    insertErrorMessage(e, 'Number of periods cannot be greater than 20');
  }

  if (numberOfPeriodsValue >= 1 && numberOfPeriodsValue <= 20) { 
    removeErrorMessage(e);
  }
}

const getSuperScript = (number) => { 
  switch (number) { 
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

const updateCashFlow = (id, value) => cashFlows[id] = value;

const clearCashFlows = () => {
  const numberOfPeriodsValue = parseInt(numberOfPeriods.value);
  for (let i = numberOfPeriodsValue; i < cashFlows.length; i++) {
    cashFlows[i] = 0;
  }
}

const updateResultantCashFlow = (number, value) => {
  const id = `resultant-${number}${getSuperScript(number)}-year`;
  const amount = document.getElementById(id);
  amount.innerText = cashFlows[number] >= 0 ? '$' + value : '-$' + value.replace('-', '');
}

const getCashFlowInput = (number, value) => { 
  const inputContainer = document.createElement('div');
  inputContainer.classList.add('input-container');
  inputContainer.classList.add('dollar');
  const inputLabel = document.createElement('div');
  inputLabel.classList.add('input-label');
  const label = document.createElement('label');
  const year = document.createElement('span');
  year.innerText = 'Year ';
  label.appendChild(year);
  const numberText = document.createElement('span');
  numberText.innerText = number;
  label.appendChild(numberText);
  // const superscript = document.createElement('sup');
  // superscript.classList.add('superscript');
  // superscript.innerText = getSuperScript(number);
  // label.appendChild(superscript);
  inputLabel.appendChild(label);
  const input = document.createElement('input');
  input.id = `${number}${getSuperScript(number)}-year`;
  input.type = 'text';
  input.name = input.id;
  input.value = value;
  let autoInput = new AutoNumeric(input, {
    decimalPlaces: 0,
    decimalPlacesRawValue: 0,
    minimumValue: "-100000000000000",
    maximumValue: "100000000000000",
    modifyValueOnWheel: false
  });
  input.addEventListener('input', () => {
    updateCashFlow(number, parseInt(autoInput.rawValue));
    updateResultantCashFlow(number, autoInput.domElement.value);
    calculateIRR();
    // calculateNPV();
  });
  inputContainer.appendChild(inputLabel);
  inputContainer.appendChild(input);
  return inputContainer;
}

const getCashFlowOutput = (number, value) => { 
  const row = document.createElement('div');
  row.classList.add('row');
  const yearText = document.createElement('h4');
  yearText.innerText = number;
  const amountText = document.createElement('h4');
  amountText.innerText = value >= 0 ? '$' + numberWithCommas(value) : '-$' + numberWithCommas(Math.abs(value));
  amountText.id = `resultant-${number}${getSuperScript(number)}-year`;
  row.appendChild(yearText);
  row.appendChild(amountText);
  return row;
}

const removeAllChildNodes = (parent) => {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

const updateCashFlowContainer = () => { 
  const numberOfPeriodsValue = parseInt(numberOfPeriods.value);

  removeAllChildNodes(cashFlowContainer);
  removeAllChildNodes(resultantCashFlowContainer);
  clearCashFlows();

  for (let i = 0; i <= numberOfPeriodsValue; i++) {
    cashFlowContainer.appendChild(getCashFlowInput(i, cashFlows[i]));
    resultantCashFlowContainer.appendChild(getCashFlowOutput(i, cashFlows[i]));
  }

  calculateIRR();
  // calculateNPV();
}

const calculateIRR = () => {
  let n = parseInt(numberOfPeriods.value) + 1;
  let irr = IRR(cashFlows.slice(0, n));
  irr = (irr * 100).toFixed(2);

  if (irr !== 'NaN') {
    resultantIRR.innerText = irr + '%';
  } else {
    resultantIRR.innerText = '0.0%';
  }
}

const calculateNPV = () => { 
  const numberOfPeriodsValue = parseInt(numberOfPeriods.value);
  const interestRateValue = parseFloat(interestRate.value);
  
  if (numberOfPeriodsValue) {
    resultantNumberOfPeriods.innerText = numberOfPeriodsValue;
  } else {
    resultantNumberOfPeriods.innerText = 1;
  }

  if (interestRateValue) { 
    resultantInterestRate.innerText = interestRateValue + '%';
  } else {
    resultantInterestRate.innerText = '0.0%';
  }

  let pv = NPV(cashFlows.slice(0, numberOfPeriodsValue + 1), interestRateValue / 100);
  pv = Math.round(pv);
  
  if (pv) {
    let npv = cashFlows[0] + pv;
    resultantPV.innerText = pv >= 0 ? '$' + numberWithCommas(pv) : '-$' + numberWithCommas(Math.abs(pv));
    resultantNPV.innerText = npv >= 0 ? '$' + numberWithCommas(npv) : '-$' + numberWithCommas(Math.abs(npv));
  } else {
    resultantPV.innerText = '$0';
    resultantNPV.innerText = '$0';
  }
}

// interestRate.addEventListener('input', calculateNPV);
numberOfPeriods.addEventListener('input', (e) => {
  validateNumberOfPeriods(e);
  updateCashFlowContainer();
});

updateCashFlowContainer();
