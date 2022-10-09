// Maximum Supportable Loan Amount
import { amountConfig, generateSharableLink, insertErrorMessage, numberWithCommas, parseFromUrl, removeErrorMessage } from "../utils/utils.js";
// Inputs
const underwrittenNetOperatingIncome = new AutoNumeric('#underwritten-net-operating-income', amountConfig);
const underwrittenCapRate = document.getElementById('underwritten-cap-rate');
const underwrittenDebtYield = document.getElementById('underwritten-debt-yield');
const interestRate = document.getElementById('interest-rate');
const dscrRequirement = document.getElementById('dscr-requirement');
const maximumLTV = document.getElementById('maximum-ltv');
const loanTermPeriod = document.getElementById('loan-term-period');
const loanAmortization = new AutoNumeric('#loan-amortization', {
  decimalPlaces: 0,
  decimalPlacesRawValue: 0,
  minimumValue: "0",
  maximumValue: "12000",
  modifyValueOnWheel: false
});
// Outputs
const valueCapRate = document.getElementById('value-cap-rate');
const maxSupportableLoanAmountPerLTV = document.getElementById('max-supportable-loan-amt-per-ltv');
const allowableDebtService = document.getElementById('allowable-debt-service');
const maxSupportableLoanAmountPerDSCR = document.getElementById('max-supportable-loan-amt-per-dscr');
const maxSupportableLoanAmountPerDebtYield = document.getElementById('max-supportable-loan-amt-per-debt-yield');
const maxSupportableLoanAmount = document.getElementById('max-supportable-loan-amt');
// Resultant Outputs
const resultantUnderwrittenNetOperatingIncome = document.getElementById('resultant-underwritten-net-operating-income');
const resultantUnderwrittenCapRate = document.getElementById('resultant-underwritten-cap-rate');
const resultantMaximumLRV = document.getElementById('resultant-maximum-ltv');
const resultantDscrRequirement = document.getElementById('resultant-dscr-requirement');
const resultantInterestRate = document.getElementById('resultant-interest-rate');
const resultantLoanAmortization = document.getElementById('resultant-loan-amortization');
const resultantUnderwrittenDebtYield = document.getElementById('resultant-underwritten-debt-yield');
// Shareable link
const shareResultButton = document.getElementById('share-result');
const shareLink = document.getElementById('share-link');
const copyText = document.getElementById('copy-text');
const url = new URL(window.location.href);
/*
 # Calculate the Value @ Cap Rate
 # Value @ Cap Rate = underwritten net operating income / underwritten cap rate
 # Any change in the value of underwritten net operating income or underwritten cap rate will trigger a recalculation of the value @ cap rate
 # This is the value which is required to calculate maximum supportable loan amount per LTV
*/
const calculateValueAtCapRate = () => { 
  const underwrittenNetOperatingIncomeValue = parseInt(underwrittenNetOperatingIncome.rawValue);
  const underwrittenCapRateValue = parseFloat(underwrittenCapRate.value);

  if (underwrittenNetOperatingIncomeValue) {
    resultantUnderwrittenNetOperatingIncome.innerText = numberWithCommas(underwrittenNetOperatingIncomeValue);
  } else {
    resultantUnderwrittenNetOperatingIncome.innerText = '$0';
  }

  if (underwrittenCapRateValue) {
    resultantUnderwrittenCapRate.innerText = underwrittenCapRateValue + '%';
  } else {
    resultantUnderwrittenCapRate.innerText = '0.0%';
  }

  if (underwrittenNetOperatingIncomeValue && underwrittenCapRateValue) { 
    const valueAtCapRate = Math.round(underwrittenNetOperatingIncomeValue / (underwrittenCapRateValue / 100));
    valueCapRate.innerText = numberWithCommas(valueAtCapRate);
  } else {
    valueCapRate.innerText = '$0';
  }
  calculateMaximumSupportableLoanAmountPerLTV();
}
/*
 # Calculate the Maximum Supportable Loan Amount Per LTV
 # Maximum Supportable Loan Amount Per LTV = Value @ Cap Rate * Maximum LTV
  # Any change in the value of value @ cap rate or maximum LTV will trigger a recalculation of the maximum supportable loan amount per LTV
  # This is the value which is considered when calculating the maximum supportable loan amount
*/
const calculateMaximumSupportableLoanAmountPerLTV = () => { 
  const valueAtCapRateValue = parseInt(valueCapRate.innerText.replace(/\$|,/g, ''));
  const maximumLTVValue = parseFloat(maximumLTV.value);

  if (maximumLTVValue) {
    resultantMaximumLRV.innerText = maximumLTVValue + '%';
  } else {
    resultantMaximumLRV.innerText = '0.0%';
  }

  if (valueAtCapRateValue && maximumLTVValue) {
    let maxSupportableLoanAmountPerLTVValue = Math.round(valueAtCapRateValue * (maximumLTVValue / 100));
    maxSupportableLoanAmountPerLTV.innerText = numberWithCommas(maxSupportableLoanAmountPerLTVValue);
  } else {
    maxSupportableLoanAmountPerLTV.innerText = '$0';
  }
  calculateMaxSupportableLoanAmount();
}
/*
  # Calculate Allowable Debt Service
  # Allowable Debt Service = underwritten net operating income / dscr requirement
  # Any change in the value of underwritten net operating income or dscr requirement will trigger a recalculation of the allowable debt service
  # This is the value which is considered when calculating the maximum supportable loan amount per DSCR
*/
const calculateAllowableDebtService = () => { 
  const underwrittenNetOperatingIncomeValue = parseInt(underwrittenNetOperatingIncome.rawValue);
  const dscrRequirementValue = parseFloat(dscrRequirement.value);

  if (dscrRequirementValue) {
    resultantDscrRequirement.innerText = dscrRequirementValue;
  } else {
    resultantDscrRequirement.innerText = '0.0';
  }

  if (underwrittenNetOperatingIncomeValue && dscrRequirementValue) { 
    const allowableDebtServiceValue = Math.round(underwrittenNetOperatingIncomeValue / dscrRequirementValue);
    allowableDebtService.innerText = numberWithCommas(allowableDebtServiceValue);
  } else {
    allowableDebtService.innerText = '$0';
  }
  calculateMaximumSupportableLoanAmountPerDSCR();
}
// Courtesy of https://github.com/kgkars/tvm-financejs/blob/master/index.js
const PV = (rate, nper, pmt, fv, type) => {
  type = typeof type === "undefined" ? 0 : type;
  fv = typeof fv === "undefined" ? 0 : fv;

  if (rate === 0) {
    return pmt * nper - fv;
  } else {
    let tempVar = type !== 0 ? 1 + rate : 1;
    let tempVar2 = 1 + rate;
    let tempVar3 = Math.pow(tempVar2, nper);

    return (fv + pmt * tempVar * ((tempVar3 - 1) / rate)) / tempVar3;
  }
}
/*
  # Calculate the Maximum Supportable Loan Amount Per DSCR
  # Maximum Supportable Loan Amount Per DSCR = PV(interest rate / 12, loan amortization, allowable debt service / 12, 0, 0)
  # Any change in the value of interest rate, loan amortization, or allowable debt service will trigger a recalculation of the maximum supportable loan amount per DSCR
  # This is the value which is considered when calculating the maximum supportable loan amount
*/
const calculateMaximumSupportableLoanAmountPerDSCR = () => { 
  let loanAmortizationValue = 0;
  const interestRateValue = parseFloat(interestRate.value);
  const allowableDebtServiceValue = parseInt(allowableDebtService.innerText.replace(/\$|,/g, ''));

  if (loanTermPeriod.checked) {
    loanAmortizationValue = parseFloat(loanAmortization.rawValue);
  } else {
    loanAmortizationValue = parseFloat(loanAmortization.rawValue) * 12;
  }

  if (interestRateValue) { 
    resultantInterestRate.innerText = interestRateValue + '%';
  } else {
    resultantInterestRate.innerText = '0.0%';
  }

  if (loanAmortizationValue) { 
    resultantLoanAmortization.innerText = loanAmortizationValue;
  } else {
    resultantLoanAmortization.innerText = '0';
  }

  if (interestRateValue && loanAmortizationValue && allowableDebtServiceValue) { 
    let maxSupportableLoanAmountPerDSCRValue = Math.round(PV(interestRateValue / 1200, loanAmortizationValue, allowableDebtServiceValue / 12));
    maxSupportableLoanAmountPerDSCR.innerText = numberWithCommas(maxSupportableLoanAmountPerDSCRValue);
  } else {
    maxSupportableLoanAmountPerDSCR.innerText = '$0';
  }
  calculateMaxSupportableLoanAmount();
}
/*
  # Calculate the Maximum Supportable Loan Amount Per Debt Yield
  # Maximum Supportable Loan Amount Per Debt Yield = underwritten net operating income / underwritten debt yield
  # Any change in the value of underwritten net operating income or underwritten debt yield will trigger a recalculation of the maximum supportable loan amount per debt yield
  # This is the value which is considered when calculating the maximum supportable loan amount
*/
const calculateMaxSupportableLoanAmountPerDebtYield = () => { 
  const underwrittenNetOperatingIncomeValue = parseInt(underwrittenNetOperatingIncome.rawValue);
  const underwrittenDebtYieldValue = parseFloat(underwrittenDebtYield.value);

  if (underwrittenDebtYieldValue) { 
    resultantUnderwrittenDebtYield.innerText = underwrittenDebtYieldValue + '%';
  } else {
    resultantUnderwrittenDebtYield.innerText = '0.0%';
  }

  if (underwrittenNetOperatingIncomeValue && underwrittenDebtYieldValue) { 
    const maxSupportableLoanAmountPerDebtYieldValue = Math.round(underwrittenNetOperatingIncomeValue / (underwrittenDebtYieldValue / 100));
    maxSupportableLoanAmountPerDebtYield.innerText = numberWithCommas(maxSupportableLoanAmountPerDebtYieldValue);
  } else {
    maxSupportableLoanAmount.innerText = '$0';
  }
  calculateMaxSupportableLoanAmount();
}
/*
  # Calculate the Maximum Supportable Loan Amount
  # Maximum Supportable Loan Amount = MIN(Maximum Supportable Loan Amount Per LTV, Maximum Supportable Loan Amount Per DSCR, Maximum Supportable Loan Amount Per Debt Yield)
  # Any change in the value of Maximum Supportable Loan Amount Per LTV, Maximum Supportable Loan Amount Per DSCR, or Maximum Supportable Loan Amount Per Debt Yield will trigger a recalculation of the maximum supportable loan amount
*/
const calculateMaxSupportableLoanAmount = () => { 
  const maxSupportableLoanAmountPerLTVValue = parseInt(maxSupportableLoanAmountPerLTV.innerText.replace(/\$|,/g, ''));
  const maxSupportableLoanAmountPerDSCRValue = parseInt(maxSupportableLoanAmountPerDSCR.innerText.replace(/\$|,/g, ''));
  const maxSupportableLoanAmountPerDebtYieldValue = parseInt(maxSupportableLoanAmountPerDebtYield.innerText.replace(/\$|,/g, ''));
  let maxSupportableLoanAmountValue = Number.MAX_SAFE_INTEGER;

  if (maxSupportableLoanAmountPerLTVValue) { 
    maxSupportableLoanAmountValue = Math.min(maxSupportableLoanAmountValue, maxSupportableLoanAmountPerLTVValue);
  }
  if (maxSupportableLoanAmountPerDSCRValue) {
    maxSupportableLoanAmountValue = Math.min(maxSupportableLoanAmountValue, maxSupportableLoanAmountPerDSCRValue);
  }
  if (maxSupportableLoanAmountPerDebtYieldValue) {
    maxSupportableLoanAmountValue = Math.min(maxSupportableLoanAmountValue, maxSupportableLoanAmountPerDebtYieldValue);
  }
  if(maxSupportableLoanAmountValue === Number.MAX_SAFE_INTEGER) {
    maxSupportableLoanAmountValue = 0;
  }
  maxSupportableLoanAmount.innerText = numberWithCommas(maxSupportableLoanAmountValue);

  shareLink.value = generateSharableLink(url, [underwrittenNetOperatingIncome, underwrittenCapRate, underwrittenDebtYield, interestRate, dscrRequirement, maximumLTV, loanTermPeriod, loanAmortization]);
}
/*
  # Validating the DSCR Requirement
  # DSCR Requirement can take values from 0 to 3 (inclusive)
  # Only two decimal places are allowed
*/
const validateDSCRRequirement = (e) => { 
  let value = e.target.value;

  if (value >= 0 && value <= 3) {
    e.target.value = value;
    removeErrorMessage(e);
  } else { 
    insertErrorMessage(e, 'Please select a value between 0 and 3 (inclusive)');
    e.target.value = '3';
  }
}
// Event Listeners
underwrittenNetOperatingIncome.domElement.addEventListener('input', () => {
  calculateValueAtCapRate();
  calculateAllowableDebtService();
  calculateMaxSupportableLoanAmountPerDebtYield();
});
underwrittenCapRate.addEventListener('input', calculateValueAtCapRate);
maximumLTV.addEventListener('input', calculateMaximumSupportableLoanAmountPerLTV);
dscrRequirement.addEventListener('input', (e) => {
  validateDSCRRequirement(e);
  calculateAllowableDebtService();
});
interestRate.addEventListener('input', calculateMaximumSupportableLoanAmountPerDSCR);
loanAmortization.domElement.addEventListener('input', calculateMaximumSupportableLoanAmountPerDSCR);
loanTermPeriod.addEventListener('change', calculateMaximumSupportableLoanAmountPerDSCR);
// Event Listeners for changing Loan Term Period Value
loanTermPeriod.addEventListener('input', () => {
  if (loanTermPeriod.checked) {
    loanTermPeriod.value = 'Monthly';
  } else {
    loanTermPeriod.value = 'Yearly';
  }
});

underwrittenDebtYield.addEventListener('input', calculateMaxSupportableLoanAmountPerDebtYield);
// Event Listners for generating sharable link and copy link to clipboard
shareResultButton.addEventListener('click', () => {
  let link = generateSharableLink(url, [underwrittenNetOperatingIncome, underwrittenCapRate, underwrittenDebtYield, interestRate, dscrRequirement, maximumLTV, loanTermPeriod, loanAmortization]);
  shareLink.value = link;
  shareLink.style.width = 'calc(100% - 3.5rem)';
  shareLink.style.padding = '0.5rem';
  copyText.style.opacity = '1';
});
// Get parmas from url
const params = new URLSearchParams(url.search);
// Toggle checkbox based on url params
if (params.has('loan-term-period')) {
  let value = params.get('loan-term-period');
  
  if (value === 'Monthly') {
    loanTermPeriod.checked = true;
  } else {
    loanTermPeriod.checked = false;
  }
}
// Populating input fields for sharable link and calculating the result
parseFromUrl(window.location.href, [calculateValueAtCapRate, calculateAllowableDebtService, calculateMaxSupportableLoanAmountPerDebtYield]);