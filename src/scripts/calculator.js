export function initializeCalculator() {
    document.getElementById('calculate').addEventListener('click', () => {
        const hours = parseFloat(document.getElementById('hours').value) || 0;
        const rate = parseFloat(document.getElementById('rate').value) || 0;
        const premiumPercent = parseFloat(document.getElementById('premium').value) || 0;

        const result = document.getElementById('result');
        const baseSalary = document.getElementById('base-salary');
        const premiumAmount = document.getElementById('premium-amount');
        const totalSalary = document.getElementById('total-salary');

        const baseAmount = hours * rate;
        const premiumValue = baseAmount * (premiumPercent / 100);
        const total = baseAmount + premiumValue;

        result.classList.remove('hidden');

        // Format numbers to Russian locale with ₽ symbol
        const formatCurrency = (amount) =>
            new Intl.NumberFormat('ru-RU', {
                style: 'currency',
                currency: 'RUB',
                minimumFractionDigits: 2
            }).format(amount);

        baseSalary.textContent = formatCurrency(baseAmount);
        premiumAmount.textContent = formatCurrency(premiumValue);
        totalSalary.textContent = formatCurrency(total);

        // Reset and trigger animations
        result.style.animation = 'none';
        result.offsetHeight;
        result.style.animation = null;
    });
}