const display = document.getElementById('display');

function append(value) {
    display.value += value;
}

function clearDisplay() {
    display.value = '';
}

function deleteLast() {
    display.value = display.value.slice(0, -1);
}

function calculate() {
    let expr = display.value;
    try {
        // Replace log10 with Math.log10 for compatibility
        expr = expr.replace(/log10/g, 'Math.log10');
        // Evaluate the expression
        let result = Function('return ' + expr)();
        display.value = result;
    } catch (e) {
        display.value = 'Error';
    }
}
