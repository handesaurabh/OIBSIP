class TemperatureConverter {
    constructor() {
        this.temperatureInput = document.getElementById('temperature-input');
        this.convertButton = document.getElementById('convert-btn');
        this.resultDisplay = document.getElementById('result-display');
        this.errorMessage = document.getElementById('error-message');
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Convert button click
        this.convertButton.addEventListener('click', () => {
            this.convertTemperature();
        });

        // Enter key press in input field
        this.temperatureInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.convertTemperature();
            }
        });

        // Clear error message when user starts typing
        this.temperatureInput.addEventListener('input', () => {
            this.clearError();
        });

        // Real-time conversion as user types (optional feature)
        this.temperatureInput.addEventListener('input', () => {
            if (this.temperatureInput.value && this.isValidNumber(this.temperatureInput.value)) {
                this.convertTemperature();
            }
        });

        // Update conversion when radio buttons change
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', () => {
                if (this.temperatureInput.value && this.isValidNumber(this.temperatureInput.value)) {
                    this.convertTemperature();
                }
            });
        });
    }

    convertTemperature() {
        const inputValue = this.temperatureInput.value.trim();
        
        // Validate input
        if (!this.validateInput(inputValue)) {
            return;
        }

        const temperature = parseFloat(inputValue);
        const fromUnit = this.getSelectedUnit('from-unit');
        const toUnit = this.getSelectedUnit('to-unit');

        // Check if converting to the same unit
        if (fromUnit === toUnit) {
            this.displayResult(temperature, toUnit, 'Same unit - no conversion needed');
            return;
        }

        try {
            const convertedTemp = this.performConversion(temperature, fromUnit, toUnit);
            this.displayResult(convertedTemp, toUnit);
        } catch (error) {
            this.showError('Conversion error: ' + error.message);
        }
    }

    validateInput(input) {
        this.clearError();

        if (!input) {
            this.showError('Please enter a temperature value');
            return false;
        }

        if (!this.isValidNumber(input)) {
            this.showError('Please enter a valid number');
            return false;
        }

        const temperature = parseFloat(input);
        const fromUnit = this.getSelectedUnit('from-unit');

        // Additional validation for absolute zero
        if (this.isBelowAbsoluteZero(temperature, fromUnit)) {
            this.showError('Temperature cannot be below absolute zero!');
            return false;
        }

        return true;
    }

    isValidNumber(value) {
        return !isNaN(value) && isFinite(value);
    }

    isBelowAbsoluteZero(temperature, unit) {
        const absoluteZero = {
            celsius: -273.15,
            fahrenheit: -459.67,
            kelvin: 0
        };

        return temperature < absoluteZero[unit];
    }

    getSelectedUnit(name) {
        const selectedRadio = document.querySelector(`input[name="${name}"]:checked`);
        return selectedRadio ? selectedRadio.value : null;
    }

    performConversion(temperature, fromUnit, toUnit) {
        // First convert to Celsius as the base unit
        let celsius;
        
        switch (fromUnit) {
            case 'celsius':
                celsius = temperature;
                break;
            case 'fahrenheit':
                celsius = (temperature - 32) * 5 / 9;
                break;
            case 'kelvin':
                celsius = temperature - 273.15;
                break;
            default:
                throw new Error('Invalid from unit');
        }

        // Then convert from Celsius to target unit
        let result;
        
        switch (toUnit) {
            case 'celsius':
                result = celsius;
                break;
            case 'fahrenheit':
                result = (celsius * 9 / 5) + 32;
                break;
            case 'kelvin':
                result = celsius + 273.15;
                break;
            default:
                throw new Error('Invalid to unit');
        }

        return result;
    }

    displayResult(temperature, unit, message = null) {
        this.clearError();
        
        if (message) {
            this.resultDisplay.innerHTML = `
                <div style="font-size: 1.2rem; color: #667eea;">
                    ${message}
                </div>
                <div style="font-size: 1.5rem; margin-top: 10px;">
                    ${this.formatTemperature(temperature, unit)}
                </div>
            `;
        } else {
            this.resultDisplay.innerHTML = this.formatTemperature(temperature, unit);
        }

        // Add a subtle animation
        this.resultDisplay.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.resultDisplay.style.transform = 'scale(1)';
        }, 100);
    }

    formatTemperature(temperature, unit) {
        const roundedTemp = Math.round(temperature * 100) / 100;
        const unitSymbols = {
            celsius: '°C',
            fahrenheit: '°F',
            kelvin: 'K'
        };

        return `${roundedTemp}${unitSymbols[unit]}`;
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.style.opacity = '1';
    }

    clearError() {
        this.errorMessage.textContent = '';
        this.errorMessage.style.opacity = '0';
    }
}

// Utility functions for common conversions
const CommonConversions = {
    waterFreeze: {
        celsius: 0,
        fahrenheit: 32,
        kelvin: 273.15
    },
    waterBoil: {
        celsius: 100,
        fahrenheit: 212,
        kelvin: 373.15
    },
    bodyTemp: {
        celsius: 37,
        fahrenheit: 98.6,
        kelvin: 310.15
    }
};

// Quick conversion buttons (can be added to HTML if desired)
function addQuickConversions() {
    const quickButtons = document.createElement('div');
    quickButtons.className = 'quick-conversions';
    quickButtons.innerHTML = `
        <h4>Quick Conversions:</h4>
        <button onclick="setQuickConversion('waterFreeze')">Water Freezing Point</button>
        <button onclick="setQuickConversion('waterBoil')">Water Boiling Point</button>
        <button onclick="setQuickConversion('bodyTemp')">Body Temperature</button>
    `;
    
    document.querySelector('.converter-card').appendChild(quickButtons);
}

function setQuickConversion(type) {
    const converter = window.temperatureConverter;
    const temp = CommonConversions[type];
    
    converter.temperatureInput.value = temp.celsius;
    converter.convertTemperature();
}

// Initialize the converter when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.temperatureConverter = new TemperatureConverter();
    
    // Set initial focus on input field
    document.getElementById('temperature-input').focus();
    
    // Display welcome message
    document.getElementById('result-display').innerHTML = `
        <div style="color: #667eea; font-size: 1.2rem;">
            Welcome! Enter a temperature to convert
        </div>
    `;
});

// Additional utility functions
function roundToDecimals(number, decimals = 2) {
    return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

function getTemperatureColor(celsius) {
    if (celsius < 0) return '#3498db'; // Blue for freezing
    if (celsius < 20) return '#2ecc71'; // Green for cool
    if (celsius < 30) return '#f39c12'; // Orange for warm
    return '#e74c3c'; // Red for hot
}