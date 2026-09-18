/**
 * AURA DEVELOPMENT — MORTGAGE & INVESTMENT CALCULATOR
 * Интерактивный калькулятор ипотеки и беспроцентной рассрочки
 */

class MortgageCalculator {
  constructor() {
    this.priceInput = document.getElementById('calc-price-range');
    this.priceDisplay = document.getElementById('calc-price-display');

    this.downPaymentInput = document.getElementById('calc-dp-range');
    this.downPaymentDisplay = document.getElementById('calc-dp-display');
    this.downPaymentRubDisplay = document.getElementById('calc-dp-rub');

    this.termInput = document.getElementById('calc-term-range');
    this.termDisplay = document.getElementById('calc-term-display');

    this.programSelect = document.getElementById('calc-program-select');

    // Outputs
    this.monthlyPaymentEl = document.getElementById('calc-monthly-payment');
    this.loanAmountEl = document.getElementById('calc-loan-amount');
    this.requiredIncomeEl = document.getElementById('calc-required-income');
    this.consultantBtn = document.getElementById('calc-send-ai-btn');

    if (this.priceInput) {
      this.init();
    }
  }

  init() {
    const updateHandler = () => this.calculate();

    this.priceInput.addEventListener('input', updateHandler);
    this.downPaymentInput.addEventListener('input', updateHandler);
    this.termInput.addEventListener('input', updateHandler);
    if (this.programSelect) {
      this.programSelect.addEventListener('change', updateHandler);
    }

    if (this.consultantBtn) {
      this.consultantBtn.addEventListener('click', () => {
        const price = this.formatCurrency(this.priceInput.value);
        const dp = this.downPaymentInput.value;
        const monthly = this.monthlyPaymentEl.textContent;
        const query = `Рассчитай покупку объекта за ${price} ₽ с первым взносом ${dp}%. Ежемесячный платеж около ${monthly}`;
        if (window.aiConsultant) {
          window.aiConsultant.openWithQuery(query);
        }
      });
    }

    this.calculate();
  }

  calculate() {
    const price = parseFloat(this.priceInput.value);
    const dpPercent = parseFloat(this.downPaymentInput.value);
    const termYears = parseFloat(this.termInput.value);
    const program = this.programSelect ? this.programSelect.value : 'developer_subsidized';

    // Down payment in rubles
    const dpRub = price * (dpPercent / 100);
    const loanAmount = price - dpRub;

    // Determine interest rate
    let annualRate = 0.048; // 4.8% default subsidized
    if (program === 'zero_installment') {
      annualRate = 0.0; // 0% developer installment
    } else if (program === 'standard') {
      annualRate = 0.125; // 12.5%
    }

    let monthlyPayment = 0;

    if (annualRate === 0) {
      // 0% installment is simple loan amount / months
      const months = Math.min(termYears * 12, 36); // max 36 months for 0%
      monthlyPayment = loanAmount / months;
    } else {
      // Standard annuity formula
      const monthlyRate = annualRate / 12;
      const totalMonths = termYears * 12;
      monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
    }

    const requiredIncome = monthlyPayment * 1.6;

    // Update UI
    if (this.priceDisplay) this.priceDisplay.textContent = `${this.formatCurrency(price)} ₽`;
    if (this.downPaymentDisplay) this.downPaymentDisplay.textContent = `${dpPercent}%`;
    if (this.downPaymentRubDisplay) this.downPaymentRubDisplay.textContent = `(${this.formatCurrency(dpRub)} ₽)`;
    if (this.termDisplay) this.termDisplay.textContent = `${termYears} ${this.pluralizeYears(termYears)}`;

    if (this.monthlyPaymentEl) this.monthlyPaymentEl.textContent = `${this.formatCurrency(Math.round(monthlyPayment))} ₽/мес`;
    if (this.loanAmountEl) this.loanAmountEl.textContent = `${this.formatCurrency(Math.round(loanAmount))} ₽`;
    if (this.requiredIncomeEl) this.requiredIncomeEl.textContent = `от ${this.formatCurrency(Math.round(requiredIncome))} ₽`;
  }

  formatCurrency(val) {
    return Math.round(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  pluralizeYears(n) {
    if (n === 1) return 'год';
    if (n >= 2 && n <= 4) return 'года';
    return 'лет';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.mortgageCalculator = new MortgageCalculator();
});
