// Advanced Scientific & Engineering Calculator
class AdvancedCalculator {
    constructor() {
        this.display = document.getElementById('display');
        this.history = document.getElementById('history');
        this.historyList = document.getElementById('history-list');
        this.memoryValue = 0;
        this.currentMode = 'basic';
        this.angleMode = 'deg'; // 'deg', 'rad', 'grad'
        this.baseMode = 'dec'; // 'dec', 'hex', 'oct', 'bin'
        this.isInverse = false;
        this.isHyperbolic = false;
        this.dataSet = [];
        this.calculationHistory = [];
        this.lastResult = 0;
        
        this.updateMemoryDisplay();
        this.updateAngleModeDisplay();
        this.updateBaseModeDisplay();
        
        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }
    
    // Basic Operations
    append(value) {
        if (this.display.value === '0' && /\d/.test(value)) {
            this.display.value = value;
        } else {
            this.display.value += value;
        }
        this.updateHistory();
    }
    
    clearAll() {
        this.display.value = '0';
        this.history.textContent = '';
    }
    
    clearEntry() {
        this.display.value = '0';
    }
    
    deleteLast() {
        if (this.display.value.length > 1) {
            this.display.value = this.display.value.slice(0, -1);
        } else {
            this.display.value = '0';
        }
    }
    
    toggleSign() {
        const current = parseFloat(this.display.value);
        if (!isNaN(current)) {
            this.display.value = (-current).toString();
        }
    }
    
    percentage() {
        const current = parseFloat(this.display.value);
        if (!isNaN(current)) {
            this.display.value = (current / 100).toString();
        }
    }
    
    // Advanced Mathematical Functions
    squareFunction() {
        const current = parseFloat(this.display.value);
        if (!isNaN(current)) {
            this.display.value = Math.pow(current, 2).toString();
            this.addToHistory(`${current}² = ${this.display.value}`);
        }
    }
    
    powerFunction() {
        this.append('**');
    }
    
    reciprocal() {
        const current = parseFloat(this.display.value);
        if (!isNaN(current) && current !== 0) {
            this.display.value = (1 / current).toString();
            this.addToHistory(`1/${current} = ${this.display.value}`);
        }
    }
    
    factorial() {
        const n = parseInt(this.display.value);
        if (!isNaN(n) && n >= 0 && n <= 170) {
            let result = 1;
            for (let i = 2; i <= n; i++) {
                result *= i;
            }
            this.display.value = result.toString();
            this.addToHistory(`${n}! = ${result}`);
        } else {
            this.display.value = 'Error';
        }
    }
    
    power10() {
        const current = parseFloat(this.display.value);
        if (!isNaN(current)) {
            this.display.value = Math.pow(10, current).toString();
            this.addToHistory(`10^${current} = ${this.display.value}`);
        }
    }
    
    nthRoot() {
        this.append('**(1/');
    }
    
    // Trigonometric Functions
    trigFunction(func) {
        const current = parseFloat(this.display.value);
        if (isNaN(current)) return;
        
        let angle = current;
        if (this.angleMode === 'deg') {
            angle = current * Math.PI / 180;
        } else if (this.angleMode === 'grad') {
            angle = current * Math.PI / 200;
        }
        
        let result;
        const funcName = this.isInverse ? `a${func}` : (this.isHyperbolic ? `${func}h` : func);
        
        try {
            if (this.isInverse && this.isHyperbolic) {
                // Inverse hyperbolic functions
                switch(func) {
                    case 'sin': result = Math.asinh(current); break;
                    case 'cos': result = Math.acosh(current); break;
                    case 'tan': result = Math.atanh(current); break;
                }
            } else if (this.isInverse) {
                // Inverse trig functions
                switch(func) {
                    case 'sin': result = Math.asin(current); break;
                    case 'cos': result = Math.acos(current); break;
                    case 'tan': result = Math.atan(current); break;
                }
                if (this.angleMode === 'deg') result = result * 180 / Math.PI;
                if (this.angleMode === 'grad') result = result * 200 / Math.PI;
            } else if (this.isHyperbolic) {
                // Hyperbolic functions
                switch(func) {
                    case 'sin': result = Math.sinh(angle); break;
                    case 'cos': result = Math.cosh(angle); break;
                    case 'tan': result = Math.tanh(angle); break;
                }
            } else {
                // Regular trig functions
                switch(func) {
                    case 'sin': result = Math.sin(angle); break;
                    case 'cos': result = Math.cos(angle); break;
                    case 'tan': result = Math.tan(angle); break;
                }
            }
            
            this.display.value = result.toString();
            this.addToHistory(`${funcName}(${current}) = ${result}`);
        } catch (e) {
            this.display.value = 'Error';
        }
    }
    
    // Special Mathematical Functions
    gammaFunction() {
        // Approximation of Gamma function using Stirling's approximation
        const x = parseFloat(this.display.value);
        if (isNaN(x) || x <= 0) {
            this.display.value = 'Error';
            return;
        }
        
        if (x < 1) {
            // Use recurrence relation: Γ(x) = Γ(x+1)/x
            const result = this.gamma(x + 1) / x;
            this.display.value = result.toString();
        } else {
            const result = this.gamma(x);
            this.display.value = result.toString();
        }
        this.addToHistory(`Γ(${x}) = ${this.display.value}`);
    }
    
    gamma(x) {
        // Lanczos approximation
        const g = 7;
        const C = [0.99999999999980993, 676.5203681218851, -1259.1392167224028,
                   771.32342877765313, -176.61502916214059, 12.507343278686905,
                   -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
        
        if (x < 0.5) return Math.PI / (Math.sin(Math.PI * x) * this.gamma(1 - x));
        
        x--;
        let a = C[0];
        for (let i = 1; i < g + 2; i++) {
            a += C[i] / (x + i);
        }
        
        const t = x + g + 0.5;
        const sqrt2pi = Math.sqrt(2 * Math.PI);
        return sqrt2pi * Math.pow(t, (x + 0.5)) * Math.exp(-t) * a;
    }
    
    combination() {
        // nCr calculation
        this.append('C(');
    }
    
    permutation() {
        // nPr calculation
        this.append('P(');
    }
    
    modOperation() {
        this.append('%');
    }
    
    gcdFunction() {
        this.append('gcd(');
    }
    
    lcmFunction() {
        this.append('lcm(');
    }
    
    primeCheck() {
        const n = parseInt(this.display.value);
        if (isNaN(n) || n < 2) {
            this.display.value = 'Not Prime';
            return;
        }
        
        const isPrime = this.isPrime(n);
        this.display.value = isPrime ? 'Prime' : 'Not Prime';
        this.addToHistory(`${n} is ${isPrime ? 'prime' : 'not prime'}`);
    }
    
    isPrime(n) {
        if (n < 2) return false;
        if (n === 2) return true;
        if (n % 2 === 0) return false;
        
        for (let i = 3; i <= Math.sqrt(n); i += 2) {
            if (n % i === 0) return false;
        }
        return true;
    }
    
    // Memory Functions
    memoryClear() {
        this.memoryValue = 0;
        this.updateMemoryDisplay();
    }
    
    memoryRecall() {
        this.display.value = this.memoryValue.toString();
    }
    
    memoryStore() {
        const current = parseFloat(this.display.value);
        if (!isNaN(current)) {
            this.memoryValue = current;
            this.updateMemoryDisplay();
        }
    }
    
    memoryAdd() {
        const current = parseFloat(this.display.value);
        if (!isNaN(current)) {
            this.memoryValue += current;
            this.updateMemoryDisplay();
        }
    }
    
    memorySubtract() {
        const current = parseFloat(this.display.value);
        if (!isNaN(current)) {
            this.memoryValue -= current;
            this.updateMemoryDisplay();
        }
    }
    
    updateMemoryDisplay() {
        document.getElementById('memory-indicator').textContent = `M: ${this.memoryValue}`;
    }
    
    // Mode Functions
    setMode(mode) {
        this.currentMode = mode;
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.mode-btn[onclick="setMode('${mode}')"]`).classList.add('active');
        
        document.querySelectorAll('.button-panel').forEach(panel => panel.classList.add('hidden'));
        document.getElementById(`${mode}-panel`).classList.remove('hidden');
    }
    
    toggleAngleMode() {
        const modes = ['deg', 'rad', 'grad'];
        const currentIndex = modes.indexOf(this.angleMode);
        this.angleMode = modes[(currentIndex + 1) % modes.length];
        this.updateAngleModeDisplay();
        
        const btn = document.querySelector('.angle-btn');
        btn.textContent = this.angleMode.toUpperCase();
    }
    
    updateAngleModeDisplay() {
        document.getElementById('angle-mode').textContent = this.angleMode.toUpperCase();
    }
    
    toggleInverse() {
        this.isInverse = !this.isInverse;
        const btn = document.querySelector('.mode-toggle[onclick="toggleInverse()"]');
        btn.classList.toggle('active', this.isInverse);
    }
    
    toggleHyp() {
        this.isHyperbolic = !this.isHyperbolic;
        const btn = document.querySelector('.mode-toggle[onclick="toggleHyp()"]');
        btn.classList.toggle('active', this.isHyperbolic);
    }
    
    // Programming Mode Functions
    setBase(base) {
        this.baseMode = base;
        document.querySelectorAll('.base-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.base-btn[onclick="setBase('${base}')"]`).classList.add('active');
        this.updateBaseModeDisplay();
        
        // Convert current display value to new base
        this.convertBase();
    }
    
    updateBaseModeDisplay() {
        document.getElementById('base-mode').textContent = this.baseMode.toUpperCase();
    }
    
    convertBase() {
        let value = this.display.value;
        if (value === '' || value === '0') return;
        
        try {
            let decimalValue;
            
            // Convert from current base to decimal
            switch(this.baseMode) {
                case 'dec': decimalValue = parseInt(value, 10); break;
                case 'hex': decimalValue = parseInt(value, 16); break;
                case 'oct': decimalValue = parseInt(value, 8); break;
                case 'bin': decimalValue = parseInt(value, 2); break;
            }
            
            // Convert decimal to target base
            switch(this.baseMode) {
                case 'dec': this.display.value = decimalValue.toString(10); break;
                case 'hex': this.display.value = decimalValue.toString(16).toUpperCase(); break;
                case 'oct': this.display.value = decimalValue.toString(8); break;
                case 'bin': this.display.value = decimalValue.toString(2); break;
            }
        } catch (e) {
            this.display.value = 'Error';
        }
    }
    
    appendHex(digit) {
        if (this.baseMode === 'hex') {
            this.append(digit);
        }
    }
    
    bitwiseNot() {
        const current = parseInt(this.display.value, this.getBaseRadix());
        if (!isNaN(current)) {
            const result = ~current;
            this.display.value = this.formatInCurrentBase(result);
        }
    }
    
    getBaseRadix() {
        switch(this.baseMode) {
            case 'dec': return 10;
            case 'hex': return 16;
            case 'oct': return 8;
            case 'bin': return 2;
        }
    }
    
    formatInCurrentBase(value) {
        switch(this.baseMode) {
            case 'dec': return value.toString(10);
            case 'hex': return value.toString(16).toUpperCase();
            case 'oct': return value.toString(8);
            case 'bin': return value.toString(2);
        }
    }
    
    // Statistics Functions
    addToDataSet() {
        const value = parseFloat(this.display.value);
        if (!isNaN(value)) {
            this.dataSet.push(value);
            this.updateDataDisplay();
            this.display.value = '0';
        }
    }
    
    clearDataSet() {
        this.dataSet = [];
        this.updateDataDisplay();
    }
    
    removeLastData() {
        this.dataSet.pop();
        this.updateDataDisplay();
    }
    
    updateDataDisplay() {
        document.getElementById('data-list').textContent = '[' + this.dataSet.join(', ') + ']';
        document.getElementById('data-count').textContent = this.dataSet.length;
    }
    
    calculateMean() {
        if (this.dataSet.length === 0) {
            this.display.value = 'No Data';
            return;
        }
        const mean = this.dataSet.reduce((a, b) => a + b, 0) / this.dataSet.length;
        this.display.value = mean.toString();
        this.addToHistory(`Mean = ${mean}`);
    }
    
    calculateMedian() {
        if (this.dataSet.length === 0) {
            this.display.value = 'No Data';
            return;
        }
        const sorted = [...this.dataSet].sort((a, b) => a - b);
        const median = sorted.length % 2 === 0
            ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
            : sorted[Math.floor(sorted.length / 2)];
        this.display.value = median.toString();
        this.addToHistory(`Median = ${median}`);
    }
    
    calculateMode() {
        if (this.dataSet.length === 0) {
            this.display.value = 'No Data';
            return;
        }
        const frequency = {};
        this.dataSet.forEach(val => frequency[val] = (frequency[val] || 0) + 1);
        const maxFreq = Math.max(...Object.values(frequency));
        const modes = Object.keys(frequency).filter(key => frequency[key] === maxFreq);
        this.display.value = modes.length === this.dataSet.length ? 'No Mode' : modes.join(', ');
        this.addToHistory(`Mode = ${this.display.value}`);
    }
    
    calculateStdDev() {
        if (this.dataSet.length < 2) {
            this.display.value = 'Need 2+ Values';
            return;
        }
        const mean = this.dataSet.reduce((a, b) => a + b, 0) / this.dataSet.length;
        const variance = this.dataSet.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (this.dataSet.length - 1);
        const stdDev = Math.sqrt(variance);
        this.display.value = stdDev.toString();
        this.addToHistory(`Std Dev = ${stdDev}`);
    }
    
    calculateVariance() {
        if (this.dataSet.length < 2) {
            this.display.value = 'Need 2+ Values';
            return;
        }
        const mean = this.dataSet.reduce((a, b) => a + b, 0) / this.dataSet.length;
        const variance = this.dataSet.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (this.dataSet.length - 1);
        this.display.value = variance.toString();
        this.addToHistory(`Variance = ${variance}`);
    }
    
    calculateSum() {
        if (this.dataSet.length === 0) {
            this.display.value = 'No Data';
            return;
        }
        const sum = this.dataSet.reduce((a, b) => a + b, 0);
        this.display.value = sum.toString();
        this.addToHistory(`Sum = ${sum}`);
    }
    
    calculateRange() {
        if (this.dataSet.length === 0) {
            this.display.value = 'No Data';
            return;
        }
        const range = Math.max(...this.dataSet) - Math.min(...this.dataSet);
        this.display.value = range.toString();
        this.addToHistory(`Range = ${range}`);
    }
    
    calculateQ1() {
        if (this.dataSet.length < 4) {
            this.display.value = 'Need 4+ Values';
            return;
        }
        const sorted = [...this.dataSet].sort((a, b) => a - b);
        const q1Index = Math.floor(sorted.length / 4);
        this.display.value = sorted[q1Index].toString();
        this.addToHistory(`Q1 = ${sorted[q1Index]}`);
    }
    
    calculateQ3() {
        if (this.dataSet.length < 4) {
            this.display.value = 'Need 4+ Values';
            return;
        }
        const sorted = [...this.dataSet].sort((a, b) => a - b);
        const q3Index = Math.floor(3 * sorted.length / 4);
        this.display.value = sorted[q3Index].toString();
        this.addToHistory(`Q3 = ${sorted[q3Index]}`);
    }
    
    calculateIQR() {
        if (this.dataSet.length < 4) {
            this.display.value = 'Need 4+ Values';
            return;
        }
        const sorted = [...this.dataSet].sort((a, b) => a - b);
        const q1 = sorted[Math.floor(sorted.length / 4)];
        const q3 = sorted[Math.floor(3 * sorted.length / 4)];
        const iqr = q3 - q1;
        this.display.value = iqr.toString();
        this.addToHistory(`IQR = ${iqr}`);
    }
    
    calculateSkewness() {
        if (this.dataSet.length < 3) {
            this.display.value = 'Need 3+ Values';
            return;
        }
        const mean = this.dataSet.reduce((a, b) => a + b, 0) / this.dataSet.length;
        const variance = this.dataSet.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / this.dataSet.length;
        const stdDev = Math.sqrt(variance);
        const skewness = this.dataSet.reduce((a, b) => a + Math.pow((b - mean) / stdDev, 3), 0) / this.dataSet.length;
        this.display.value = skewness.toString();
        this.addToHistory(`Skewness = ${skewness}`);
    }
    
    calculateKurtosis() {
        if (this.dataSet.length < 4) {
            this.display.value = 'Need 4+ Values';
            return;
        }
        const mean = this.dataSet.reduce((a, b) => a + b, 0) / this.dataSet.length;
        const variance = this.dataSet.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / this.dataSet.length;
        const stdDev = Math.sqrt(variance);
        const kurtosis = this.dataSet.reduce((a, b) => a + Math.pow((b - mean) / stdDev, 4), 0) / this.dataSet.length - 3;
        this.display.value = kurtosis.toString();
        this.addToHistory(`Kurtosis = ${kurtosis}`);
    }
    
    // Main Calculate Function
    calculate() {
        let expr = this.display.value;
        if (expr === '' || expr === '0') return;
        
        try {
            // Handle special functions
            expr = this.preprocessExpression(expr);
            
            // Evaluate the expression
            let result = Function('return ' + expr)();
            
            // Handle different number bases for programming mode
            if (this.currentMode === 'programming') {
                result = this.formatInCurrentBase(Math.floor(result));
            } else {
                result = this.formatResult(result);
            }
            
            this.addToHistory(`${this.display.value} = ${result}`);
            this.display.value = result.toString();
            this.lastResult = parseFloat(result);
            
        } catch (e) {
            this.display.value = 'Error';
        }
    }
    
    preprocessExpression(expr) {
        // Replace mathematical constants and functions
        expr = expr.replace(/π/g, 'Math.PI');
        expr = expr.replace(/e(?!\d)/g, 'Math.E');
        expr = expr.replace(/(\d+)C\((\d+)\)/g, 'this.combinationCalc($1, $2)');
        expr = expr.replace(/(\d+)P\((\d+)\)/g, 'this.permutationCalc($1, $2)');
        expr = expr.replace(/gcd\(([^)]+)\)/g, 'this.gcdCalc($1)');
        expr = expr.replace(/lcm\(([^)]+)\)/g, 'this.lcmCalc($1)');
        
        return expr;
    }
    
    formatResult(result) {
        if (isNaN(result) || !isFinite(result)) {
            return 'Error';
        }
        
        // Handle very large or very small numbers
        if (Math.abs(result) > 1e15 || (Math.abs(result) < 1e-10 && result !== 0)) {
            return result.toExponential(10);
        }
        
        // Round to avoid floating point errors
        return Math.round(result * 1e12) / 1e12;
    }
    
    combinationCalc(n, r) {
        if (r > n || r < 0) return 0;
        if (r === 0 || r === n) return 1;
        
        let result = 1;
        for (let i = 0; i < r; i++) {
            result *= (n - i) / (i + 1);
        }
        return Math.round(result);
    }
    
    permutationCalc(n, r) {
        if (r > n || r < 0) return 0;
        if (r === 0) return 1;
        
        let result = 1;
        for (let i = 0; i < r; i++) {
            result *= (n - i);
        }
        return result;
    }
    
    gcdCalc(a, b) {
        a = Math.abs(Math.floor(a));
        b = Math.abs(Math.floor(b));
        while (b !== 0) {
            [a, b] = [b, a % b];
        }
        return a;
    }
    
    lcmCalc(a, b) {
        return Math.abs(a * b) / this.gcdCalc(a, b);
    }
    
    // History Functions
    addToHistory(entry) {
        this.calculationHistory.unshift(entry);
        if (this.calculationHistory.length > 50) {
            this.calculationHistory.pop();
        }
        this.updateHistoryDisplay();
    }
    
    updateHistory() {
        this.history.textContent = this.display.value;
    }
    
    updateHistoryDisplay() {
        if (this.historyList) {
            this.historyList.innerHTML = '';
            this.calculationHistory.forEach(entry => {
                const div = document.createElement('div');
                div.className = 'history-item';
                div.textContent = entry;
                div.onclick = () => {
                    const result = entry.split(' = ')[1];
                    if (result && !isNaN(parseFloat(result))) {
                        this.display.value = result;
                    }
                };
                this.historyList.appendChild(div);
            });
        }
    }
    
    clearHistory() {
        this.calculationHistory = [];
        if (this.historyList) {
            this.historyList.innerHTML = '';
        }
    }
    
    // Keyboard Support
    handleKeyboard(e) {
        const key = e.key;
        
        // Prevent default for calculator keys
        if (/[\d\+\-\*\/\.\(\)=]/.test(key) || key === 'Enter' || key === 'Escape' || key === 'Backspace') {
            e.preventDefault();
        }
        
        switch(key) {
            case '0': case '1': case '2': case '3': case '4':
            case '5': case '6': case '7': case '8': case '9':
            case '.': case '(': case ')':
                this.append(key);
                break;
            case '+':
                this.append('+');
                break;
            case '-':
                this.append('-');
                break;
            case '*':
                this.append('*');
                break;
            case '/':
                this.append('/');
                break;
            case 'Enter':
            case '=':
                this.calculate();
                break;
            case 'Escape':
                this.clearAll();
                break;
            case 'Backspace':
                this.deleteLast();
                break;
            case '%':
                this.percentage();
                break;
        }
    }
}

// Initialize calculator
const calculator = new AdvancedCalculator();

// Global functions for button clicks
function append(value) { calculator.append(value); }
function clearAll() { calculator.clearAll(); }
function clearEntry() { calculator.clearEntry(); }
function deleteLast() { calculator.deleteLast(); }
function toggleSign() { calculator.toggleSign(); }
function percentage() { calculator.percentage(); }
function squareFunction() { calculator.squareFunction(); }
function powerFunction() { calculator.powerFunction(); }
function reciprocal() { calculator.reciprocal(); }
function factorial() { calculator.factorial(); }
function power10() { calculator.power10(); }
function nthRoot() { calculator.nthRoot(); }
function trigFunction(func) { calculator.trigFunction(func); }
function gammaFunction() { calculator.gammaFunction(); }
function combination() { calculator.combination(); }
function permutation() { calculator.permutation(); }
function modOperation() { calculator.modOperation(); }
function gcdFunction() { calculator.gcdFunction(); }
function lcmFunction() { calculator.lcmFunction(); }
function primeCheck() { calculator.primeCheck(); }
function memoryClear() { calculator.memoryClear(); }
function memoryRecall() { calculator.memoryRecall(); }
function memoryStore() { calculator.memoryStore(); }
function memoryAdd() { calculator.memoryAdd(); }
function memorySubtract() { calculator.memorySubtract(); }
function setMode(mode) { calculator.setMode(mode); }
function toggleAngleMode() { calculator.toggleAngleMode(); }
function toggleInverse() { calculator.toggleInverse(); }
function toggleHyp() { calculator.toggleHyp(); }
function setBase(base) { calculator.setBase(base); }
function appendHex(digit) { calculator.appendHex(digit); }
function bitwiseNot() { calculator.bitwiseNot(); }
function addToDataSet() { calculator.addToDataSet(); }
function clearDataSet() { calculator.clearDataSet(); }
function removeLastData() { calculator.removeLastData(); }
function calculateMean() { calculator.calculateMean(); }
function calculateMedian() { calculator.calculateMedian(); }
function calculateMode() { calculator.calculateMode(); }
function calculateStdDev() { calculator.calculateStdDev(); }
function calculateVariance() { calculator.calculateVariance(); }
function calculateSum() { calculator.calculateSum(); }
function calculateRange() { calculator.calculateRange(); }
function calculateQ1() { calculator.calculateQ1(); }
function calculateQ3() { calculator.calculateQ3(); }
function calculateIQR() { calculator.calculateIQR(); }
function calculateSkewness() { calculator.calculateSkewness(); }
function calculateKurtosis() { calculator.calculateKurtosis(); }
function calculate() { calculator.calculate(); }
function clearHistory() { calculator.clearHistory(); }

// Legacy function compatibility
function clearDisplay() { calculator.clearAll(); }
