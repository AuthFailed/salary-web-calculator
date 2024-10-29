// scripts/pdfAnalyzer.js
import * as pdfjsLib from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.7.76/pdf.min.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.7.76/pdf.worker.min.mjs';

export function initializePDFAnalyzer() {
    const fileInput = document.getElementById('pdf-upload');
    const analyzeButton = document.getElementById('analyze-pdf');
    const resultArea = document.getElementById('pdf-result');
    const useRateButton = document.getElementById('use-rate');
    const monthLabel = document.getElementById('month-label');
    const loadingIndicator = document.getElementById('loading-indicator');

    async function extractTextFromPDF(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;
            const page = await pdf.getPage(1);
            const textContent = await page.getTextContent();
            return textContent.items.map(item => item.str).join(' ');
        } catch (error) {
            console.error('PDF extraction error:', error);
            throw new Error('Ошибка при чтении PDF файла. Убедитесь, что файл не поврежден.');
        }
    }

    function parsePayslip(text) {
        console.log('Starting to parse payslip');

        const result = {
            month: '',
            hourlyRate: 0,
            workedHours: 0,
            grossSalary: 0,
            deductions: 0,
            netSalary: 0,
            nightHours: 0,
            nightAmount: 0
        };

        try {
            // Extract month and year
            const monthMatch = text.match(/РАСЧЕТНЫЙ ЛИСТОК ЗА ([А-Я]+ \d{4})/);
            if (monthMatch) {
                result.month = monthMatch[1];
                console.log('Found month:', result.month);
            }

            // Extract hourly rate
            const ratePatterns = [
                /Оклад\s*\(тариф\):\s*(\d+)/,
                /Оклад\s*\(тариф\)\s*:\s*(\d+)/,
                /Оклад\s*\(\s*тариф\s*\)\s*:\s*(\d+)/,
                /Оклад \(тариф\): (\d+)/
            ];

            for (const pattern of ratePatterns) {
                const rateMatch = text.match(pattern);
                if (rateMatch) {
                    result.hourlyRate = parseInt(rateMatch[1]);
                    console.log('Found rate:', result.hourlyRate);
                    break;
                }
            }

            // Extract worked hours
            const hoursMatches = text.match(/Оплата по часовому тарифу[^]+ (\d+),00 чс\./);
            if (hoursMatches) {
                result.workedHours = parseInt(hoursMatches[1]);
                console.log('Found worked hours:', result.workedHours);
            }

            // Extract night hours with amount
            const nightMatch = text.match(/Доплата за ночные часы[^]+ (\d+),00 чс\. ([\d\s]+),\d+/);
            if (nightMatch) {
                result.nightHours = parseInt(nightMatch[1]);
                result.nightAmount = parseFloat(nightMatch[2].replace(/\s/g, ''));
                console.log('Found night hours:', result.nightHours);
                console.log('Found night amount:', result.nightAmount);
            }

            // Extract amounts
            const grossMatch = text.match(/Начислено:\s*([\d\s]+)[,.]?\d*/);
            if (grossMatch) {
                result.grossSalary = parseFloat(grossMatch[1].replace(/\s/g, ''));
                console.log('Found gross salary:', result.grossSalary);
            }

            const deductionsMatch = text.match(/Удержано:\s*([\d\s]+)[,.]?\d*/);
            if (deductionsMatch) {
                result.deductions = parseFloat(deductionsMatch[1].replace(/\s/g, ''));
                console.log('Found deductions:', result.deductions);
            }

            const netMatch = text.match(/К выплате:\s*([\d\s]+)[,.]?\d*/);
            if (netMatch) {
                result.netSalary = parseFloat(netMatch[1].replace(/\s/g, ''));
                console.log('Found net salary:', result.netSalary);
            }

            if (!result.hourlyRate) {
                throw new Error('Не удалось найти часовую ставку в расчетном листе');
            }

            return result;
        } catch (error) {
            console.error('Parsing error details:', error);
            throw new Error('Ошибка при анализе данных расчетного листа: ' + error.message);
        }
    }

    function updateUI(data) {
        // Format currency values
        const formatCurrency = (amount) =>
            new Intl.NumberFormat('ru-RU', {
                style: 'currency',
                currency: 'RUB',
                minimumFractionDigits: 2
            }).format(amount);

        // Format hours with proper Russian pluralization
        const formatHours = (hours) => {
            let form = 'часов';
            if (hours % 10 === 1 && hours % 100 !== 11) {
                form = 'час';
            } else if ([2, 3, 4].includes(hours % 10) && ![12, 13, 14].includes(hours % 100)) {
                form = 'часа';
            }
            return `${hours} ${form}`;
        };

        // Update month
        monthLabel.textContent = data.month;
        monthLabel.classList.remove('hidden');

        // Update basic info
        document.getElementById('hourly-rate').textContent = formatCurrency(data.hourlyRate);
        document.getElementById('total-hours').textContent = formatHours(data.workedHours);

        // Update night hours
        if (data.nightHours > 0) {
            const nightHoursContainer = document.getElementById('night-hours-container');
            const nightHoursElement = document.getElementById('night-hours');
            const nightAmountElement = document.getElementById('night-amount');

            nightHoursContainer.classList.remove('hidden');
            nightHoursElement.textContent = formatHours(data.nightHours);
            if (data.nightAmount > 0) {
                nightAmountElement.textContent = `(${formatCurrency(data.nightAmount)})`;
            }
        }

        // Update salary info
        document.getElementById('gross-salary').textContent = formatCurrency(data.grossSalary);
        document.getElementById('deductions').textContent = formatCurrency(data.deductions);
        document.getElementById('net-salary').textContent = formatCurrency(data.netSalary);

        // Calculate and update effective rate
        const effectiveRate = data.grossSalary / data.workedHours;
        document.getElementById('effective-rate').textContent = formatCurrency(effectiveRate);

        // Show results and enable "Use Rate" button
        resultArea.classList.remove('hidden');
        useRateButton.classList.remove('hidden');
        useRateButton.dataset.rate = data.hourlyRate;
    }

    analyzeButton.addEventListener('click', async () => {
        const file = fileInput.files[0];
        if (!file) {
            alert('Пожалуйста, выберите PDF файл');
            return;
        }

        try {
            showLoadingState(true);
            resultArea.classList.add('hidden');

            const text = await extractTextFromPDF(file);
            const data = parsePayslip(text);
            updateUI(data);

        } catch (error) {
            console.error('Error analyzing PDF:', error);
            alert(error.message || 'Произошла ошибка при анализе PDF');
        } finally {
            showLoadingState(false);
        }
    });

    function showLoadingState(show) {
        if (show) {
            loadingIndicator.classList.remove('hidden');
            analyzeButton.disabled = true;
            analyzeButton.classList.add('opacity-50');
        } else {
            loadingIndicator.classList.add('hidden');
            analyzeButton.disabled = false;
            analyzeButton.classList.remove('opacity-50');
        }
    }

    useRateButton.addEventListener('click', () => {
        const rate = useRateButton.dataset.rate;
        sessionStorage.setItem('hourlyRate', rate);
        window.location.href = '/';
    });
}