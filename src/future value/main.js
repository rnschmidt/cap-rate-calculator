import { amountConfig, FV, numberWithCommas, PV } from "../utils/utils.js";

// inputs
const numberOfPeriods = document.getElementById('number-of-periods');
const startingAmount = new AutoNumeric('#starting-amount', amountConfig);
const interestRate = document.getElementById('interest-rate');
const periodicDeposit = new AutoNumeric('#periodic-deposit', amountConfig);
const periodicDepositToggle = document.getElementById('periodic-deposit-toggle');
// outputs
const resultantStartingAmount = document.getElementById('resultant-starting-amount');
const resultantInterestRate = document.getElementById('resultant-interest-rate');
const resultantNumberOfPeriods = document.getElementById('resultant-number-of-periods');
const resultantPeriodicDeposit = document.getElementById('resultant-periodic-deposit');
const totalPeriodicDeposits = document.getElementById('total-periodic-deposits');
const presentValue = document.getElementById('present-value');
const totalInterest = document.getElementById('total-interest');
const futureValue = document.getElementById('future-value');
// submit button
const shareResultButton = document.getElementById('share-result');
const shareLink = document.getElementById('share-link');
const copyText = document.getElementById('copy-text');
const url = new URL(window.location.href);

periodicDepositToggle.addEventListener('change', () => { 
  if (periodicDepositToggle.checked) {
    periodicDeposit.value = 'End'
  } else {
    periodicDeposit.value = 'Beginning';
  }
});
/*
  # Calculate Total Periodic Deposits
  # Total Periodic Deposits = Number Of Periods * Periodic Deposit
*/
const calculateTotalPeriodicDeposits = () => {
  const numberOfPeriodsValue = parseInt(numberOfPeriods.value);
  const periodicDepositValue = parseInt(periodicDeposit.rawValue);

  if (numberOfPeriodsValue) {
    resultantNumberOfPeriods.innerText = numberOfPeriodsValue;
  } else {
    resultantNumberOfPeriods.innerText = '0';
  }

  if (periodicDepositValue) {
    resultantPeriodicDeposit.innerText = '$' + numberWithCommas(periodicDepositValue) + '/period';
  } else {
    resultantPeriodicDeposit.innerText = '$0/period';
  }

  const totalPeriodicDepositsValue = numberOfPeriodsValue * periodicDepositValue;
  
  if (totalPeriodicDepositsValue) { 
    totalPeriodicDeposits.innerText = '$' + numberWithCommas(totalPeriodicDepositsValue);
  } else {
    totalPeriodicDeposits.innerText = '$0';
  }
}
/*
  # Calculate Present Value
*/
const calculatePresentValue = () => { 
  const interestRateValue = parseFloat(interestRate.value);
  const numberOfPeriodsValue = parseInt(numberOfPeriods.value);
  const startingAmountValue = parseInt(startingAmount.rawValue) || 0;
  let periodicDepositValue = parseInt(periodicDeposit.rawValue);

  if (interestRateValue) {
    resultantInterestRate.innerText = interestRateValue + '%';
  } else {
    resultantInterestRate.innerText = '0%';
  }

  if (startingAmountValue) {
    resultantStartingAmount.innerText = '$' + numberWithCommas(startingAmountValue);
  } else {
    resultantStartingAmount.innerText = '$0';
  }

  if (!periodicDepositToggle.checked) {
    periodicDepositValue += periodicDepositValue * (interestRateValue / 100);
  }

  let pv = PV(interestRateValue / 100, numberOfPeriodsValue, periodicDepositValue); 

  if (pv) { 
    pv = -(pv - startingAmountValue).toFixed(2);
    presentValue.innerText = '$' + numberWithCommas(pv);
    calculateFutureValue(interestRateValue, numberOfPeriodsValue, periodicDepositValue, pv);
  } else {
    presentValue.innerText = '$0';
  }
}
/*
  # Calculate Future Value
*/
const calculateFutureValue = (rate, nper, pmt, pv) => { 
  const fv = FV(rate / 100, nper, pmt, pv);
  console.log(rate, nper, pmt, pv, fv);
}

// add event listeners to number of periods and periodic deposit to calculate total periodic deposits
[numberOfPeriods, periodicDeposit.domElement].forEach(element => element.addEventListener('input', calculateTotalPeriodicDeposits));

[interestRate, numberOfPeriods, startingAmount.domElement, periodicDeposit.domElement, periodicDepositToggle].forEach(element => element.addEventListener('input', calculatePresentValue));