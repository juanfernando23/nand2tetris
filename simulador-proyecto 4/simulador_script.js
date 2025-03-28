// Constants
const SCREEN_BASE_ADDRESS = 16384;
const KEYBOARD_ADDRESS = 24576;
const SCREEN_SIZE_WORDS = 8192;
const BLACK = -1;
const WHITE = 0;

// Global state for simulators
let multState = {
    r0: 5,
    r1: 3,
    r2: 0,
    i: 3,
    step: 0,
    running: false,
    finished: false
};

let fillState = {
    keyPressed: false,
    keyValue: 0,
    ram: {},
    screenPixels: 512, // Simplified for visualization (32x16 instead of full resolution)
    currentColor: WHITE
};

// Tab functionality
function showTab(tabId) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Deactivate all tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Show the selected tab
    document.getElementById(tabId).classList.add('active');
    
    // Activate the clicked button
    document.querySelector(`.tab-button[onclick="showTab('${tabId}')"]`).classList.add('active');
    
    // Initialize the selected simulator if needed
    if (tabId === 'fill' && document.querySelector('.screen-simulation').children.length === 0) {
        initializeFillSimulator();
    }
}

// Mult.asm simulator functions
function runMult() {
    if (multState.finished || multState.running) return;
    
    multState.running = true;
    
    // Run the complete multiplication
    while (multState.i > 0) {
        multState.r2 += multState.r0;
        multState.i--;
        multState.step++;
        
        // Update display as we go
        updateMultDisplay();
        logMultStep();
    }
    
    multState.finished = true;
    multState.running = false;
}

function stepMult() {
    if (multState.finished || multState.running) return;
    
    if (multState.i > 0) {
        multState.r2 += multState.r0;
        multState.i--;
        multState.step++;
        
        updateMultDisplay();
        logMultStep();
        
        if (multState.i === 0) {
            multState.finished = true;
        }
    }
}

function resetMult() {
    const r0Value = parseInt(document.getElementById('r0').value) || 0;
    const r1Value = parseInt(document.getElementById('r1').value) || 0;
    
    multState = {
        r0: r0Value,
        r1: r1Value,
        r2: 0,
        i: r1Value,
        step: 0,
        running: false,
        finished: false
    };
    
    updateMultDisplay();
    document.getElementById('mult-log').innerHTML = 'Simulación reiniciada';
}

function updateMultDisplay() {
    document.getElementById('mult-r0-value').textContent = multState.r0;
    document.getElementById('mult-r1-value').textContent = multState.r1;
    document.getElementById('mult-r2-value').textContent = multState.r2;
    document.getElementById('mult-i-value').textContent = multState.i;
}

function logMultStep() {
    const logElement = document.getElementById('mult-log');
    const message = `Paso ${multState.step}: r2 = ${multState.r2 - multState.r0} + ${multState.r0} = ${multState.r2}, i = ${multState.i + 1} - 1 = ${multState.i}`;
    
    logElement.innerHTML += message + '<br>';
    logElement.scrollTop = logElement.scrollHeight; // Auto-scroll to bottom
}

// Fill.asm simulator functions
function initializeFillSimulator() {
    // Create screen grid (simplified to 32x16 for visualization)
    const screenElement = document.querySelector('.screen-simulation');
    screenElement.innerHTML = ''; // Clear existing content
    
    for (let i = 0; i < fillState.screenPixels; i++) {
        const pixel = document.createElement('div');
        pixel.classList.add('pixel');
        pixel.dataset.index = i;
        screenElement.appendChild(pixel);
    }
    
    // Create memory visualization
    const memoryDisplay = document.getElementById('memory-display');
    memoryDisplay.innerHTML = '';
    
    // Show just a sample of memory locations
    for (let i = 0; i < 64; i++) {
        const address = SCREEN_BASE_ADDRESS + i;
        const block = document.createElement('div');
        block.classList.add('memory-block');
        block.dataset.address = address;
        block.innerHTML = `<div>0x${address.toString(16)}</div><div>${fillState.ram[address] || 0}</div>`;
        memoryDisplay.appendChild(block);
    }
    
    // Initialize RAM with all WHITE
    for (let i = 0; i < SCREEN_SIZE_WORDS; i++) {
        fillState.ram[SCREEN_BASE_ADDRESS + i] = WHITE;
    }
    
    // Setup keyboard button
    const keyboardBtn = document.getElementById('keyboard-btn');
    keyboardBtn.addEventListener('click', toggleKeyboardPress);
    
    // Also listen for actual keyboard events
    document.addEventListener('keydown', () => {
        if (!fillState.keyPressed) {
            toggleKeyboardPress();
        }
    });
    
    document.addEventListener('keyup', () => {
        if (fillState.keyPressed) {
            toggleKeyboardPress();
        }
    });
}

function toggleKeyboardPress() {
    fillState.keyPressed = !fillState.keyPressed;
    fillState.keyValue = fillState.keyPressed ? 75 : 0; // Usar 75 como en el ejemplo (código ASCII de 'k')
    
    const keyStatus = document.getElementById('key-status');
    const keyboardBtn = document.getElementById('keyboard-btn');
    
    if (fillState.keyPressed) {
        keyStatus.textContent = `Presionado (${fillState.keyValue})`;
        keyboardBtn.classList.add('pressed');
        keyboardBtn.textContent = 'Soltar tecla';
    } else {
        keyStatus.textContent = 'No presionado (0)';
        keyboardBtn.classList.remove('pressed');
        keyboardBtn.textContent = 'Presionar cualquier tecla';
    }
    
    // Simulate the Fill.asm behavior
    simulateFillStep();
}

function simulateFillStep() {
    // Determine color based on keyboard state (like in the Python code)
    const colorToFill = fillState.keyPressed ? BLACK : WHITE;
    fillState.currentColor = colorToFill;
    
    // Update RAM and screen visualization
    for (let i = 0; i < SCREEN_SIZE_WORDS; i++) {
        const address = SCREEN_BASE_ADDRESS + i;
        fillState.ram[address] = colorToFill;
        
        // Update memory display (only the visible part)
        if (i < 64) {
            const memoryBlock = document.querySelector(`.memory-block[data-address="${address}"]`);
            if (memoryBlock) {
                memoryBlock.innerHTML = `<div>0x${address.toString(16)}</div><div>${colorToFill}</div>`;
                memoryBlock.classList.add('changed');
                setTimeout(() => {
                    memoryBlock.classList.remove('changed');
                }, 500);
            }
        }
    }
    
    // Update pixels (simplified to match our visualization size)
    const pixels = document.querySelectorAll('.pixel');
    pixels.forEach(pixel => {
        if (colorToFill === BLACK) {
            pixel.classList.add('black');
        } else {
            pixel.classList.remove('black');
        }
    });
}

function resetFill() {
    // Reset the state
    fillState = {
        keyPressed: false,
        keyValue: 0,
        ram: {},
        screenPixels: 512,
        currentColor: WHITE
    };
    
    // Reset UI elements
    const keyStatus = document.getElementById('key-status');
    keyStatus.textContent = 'No presionado (0)';
    
    const keyboardBtn = document.getElementById('keyboard-btn');
    keyboardBtn.classList.remove('pressed');
    keyboardBtn.textContent = 'Presionar cualquier tecla';
    
    // Clear screen
    const pixels = document.querySelectorAll('.pixel');
    pixels.forEach(pixel => {
        pixel.classList.remove('black');
    });
    
    // Reset memory visualization
    for (let i = 0; i < 64; i++) {
        const address = SCREEN_BASE_ADDRESS + i;
        fillState.ram[address] = WHITE;
        const memoryBlock = document.querySelector(`.memory-block[data-address="${address}"]`);
        if (memoryBlock) {
            memoryBlock.innerHTML = `<div>0x${address.toString(16)}</div><div>${WHITE}</div>`;
        }
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    resetMult();
    showTab('mult');
});
