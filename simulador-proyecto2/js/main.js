/**
 * Lógica principal del simulador
 */

// Variables globales
let currentChip = 'halfadder'; // Chip seleccionado por defecto
let currentInputs = {}; // Entradas actuales del chip

// Inicializar el simulador cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    // Configurar selector de chips
    setupChipSelector();
    
    // Cargar el chip por defecto
    loadChip(currentChip);
});

// Configurar el selector de chips
function setupChipSelector() {
    const chipSelector = document.getElementById('chip-selector');
    const chips = chipSelector.querySelectorAll('li');
    
    chips.forEach(chip => {
        chip.addEventListener('click', function() {
            // Quitar clase activa de todos los chips
            chips.forEach(c => c.classList.remove('active'));
            // Añadir clase activa al chip seleccionado
            this.classList.add('active');
            
            // Cargar el chip seleccionado
            currentChip = this.getAttribute('data-chip');
            loadChip(currentChip);
        });
    });
}

// Cargar un chip específico
function loadChip(chipType) {
    // Obtener la descripción del chip
    const chipInfo = chipDescriptions[chipType];
    
    if (!chipInfo) {
        console.error('Información del chip no encontrada:', chipType);
        return;
    }
    
    // Cargar la descripción
    loadChipDescription(chipInfo);
    
    // Configurar los inputs según el tipo de chip
    setupChipInputs(chipInfo);
    
    // Inicializar valores predeterminados para las entradas
    initializeInputs(chipInfo);
    
    // Actualizar la visualización
    updateChipVisualization();
}

// Cargar la descripción del chip
function loadChipDescription(chipInfo) {
    const descriptionContent = document.getElementById('description-content');
    
    let html = `<h3>${chipInfo.title}</h3>`;
    html += `<p>${chipInfo.description}</p>`;
    
    if (chipInfo.formula) {
        html += `<p><strong>Fórmula:</strong> ${chipInfo.formula}</p>`;
    }
    
    // Agregar información sobre entradas y salidas
    html += `<h4>Entradas:</h4><ul>`;
    chipInfo.inputs.forEach(input => {
        let desc = input.description ? ` - ${input.description}` : '';
        html += `<li>${input.name}${desc}</li>`;
    });
    html += `</ul>`;
    
    html += `<h4>Salidas:</h4><ul>`;
    chipInfo.outputs.forEach(output => {
        let desc = output.description ? ` - ${output.description}` : '';
        html += `<li>${output.name}${desc}</li>`;
    });
    html += `</ul>`;
    
    descriptionContent.innerHTML = html;
}

// Configurar los inputs del chip
function setupChipInputs(chipInfo) {
    const inputsContainer = document.getElementById('inputs-container');
    let html = '';
    
    // Crear controles para cada entrada
    chipInfo.inputs.forEach(input => {
        if (input.type === 'bit') {
            // Input para un solo bit (interruptor)
            html += `
                <div class="bit-input">
                    <label for="input-${input.name}">${input.name}:</label>
                    <label class="bit-toggle">
                        <input type="checkbox" id="input-${input.name}" class="chip-input" data-name="${input.name}">
                        <span class="slider"></span>
                    </label>
                    ${input.description ? `<span class="input-description">${input.description}</span>` : ''}
                </div>
            `;
        } else if (input.type === 'bit16') {
            // Input para 16 bits (array de interruptores o entrada numérica)
            html += `
                <div class="bit16-input">
                    <label for="input-${input.name}-decimal">${input.name} (decimal):</label>
                    <input type="number" id="input-${input.name}-decimal" class="chip-input-decimal" data-name="${input.name}" value="0">
                    <div class="bit-array" id="bit-array-${input.name}">
                        <!-- Los bits se generarán dinámicamente -->
                    </div>
                </div>
            `;
        }
    });
    
    inputsContainer.innerHTML = html;
    
    // Configurar los eventos para los inputs
    setupInputEvents(chipInfo);
}

// Configurar eventos para los inputs
function setupInputEvents(chipInfo) {
    // Eventos para inputs de bit único
    const bitInputs = document.querySelectorAll('.chip-input');
    bitInputs.forEach(input => {
        input.addEventListener('change', function() {
            const name = this.getAttribute('data-name');
            currentInputs[name] = this.checked ? 1 : 0;
            updateChipVisualization();
        });
    });
    
    // Eventos para inputs de 16 bits (entrada decimal)
    const decimalInputs = document.querySelectorAll('.chip-input-decimal');
    decimalInputs.forEach(input => {
        input.addEventListener('change', function() {
            const name = this.getAttribute('data-name');
            const value = parseInt(this.value) || 0;
            // Convertir decimal a array de 16 bits
            currentInputs[name] = intToBinary16(value);
            // Actualizar la visualización de bits
            updateBitArray(name, currentInputs[name]);
            updateChipVisualization();
        });
    });
}

// Actualizar la visualización de un array de bits
function updateBitArray(name, bits) {
    const bitArrayContainer = document.getElementById(`bit-array-${name}`);
    if (!bitArrayContainer) return;
    
    let html = '';
    bits.forEach((bit, index) => {
        html += `
            <div class="bit-box ${bit ? 'on' : 'off'}" data-index="${index}">
                ${bit}
            </div>
        `;
    });
    
    bitArrayContainer.innerHTML = html;
}

// Inicializar valores predeterminados para las entradas
function initializeInputs(chipInfo) {
    currentInputs = {};
    
    // Configurar valores predeterminados
    chipInfo.inputs.forEach(input => {
        if (input.type === 'bit') {
            currentInputs[input.name] = 0;
            
            // Actualizar el control en la interfaz
            const inputElement = document.getElementById(`input-${input.name}`);
            if (inputElement) {
                inputElement.checked = false;
            }
        } else if (input.type === 'bit16') {
            currentInputs[input.name] = new Array(16).fill(0);
            
            // Actualizar el control decimal en la interfaz
            const decimalElement = document.getElementById(`input-${input.name}-decimal`);
            if (decimalElement) {
                decimalElement.value = 0;
            }
            
            // Actualizar la visualización de bits
            updateBitArray(input.name, currentInputs[input.name]);
        }
    });
}

// Actualizar la visualización del chip y sus salidas
function updateChipVisualization() {
    // Actualizar la visualización del circuito
    visualizeChip(currentChip, currentInputs);
    
    // Calcular las salidas según el chip actual
    calculateAndDisplayOutputs();
}

// Calcular y mostrar las salidas según el chip actual
function calculateAndDisplayOutputs() {
    const outputsContainer = document.getElementById('outputs-container');
    let html = '';
    
    let outputs = {};
    
    // Calcular las salidas según el chip
    switch (currentChip) {
        case 'halfadder':
            outputs = HalfAdder(currentInputs.a, currentInputs.b);
            break;
        case 'fulladder':
            outputs = FullAdder(currentInputs.a, currentInputs.b, currentInputs.c);
            break;
        case 'add16':
            outputs = { out: Add16(currentInputs.a, currentInputs.b) };
            break;
        case 'inc16':
            outputs = { out: Inc16(currentInputs.in) };
            break;
        case 'alu':
            outputs = ALU(
                currentInputs.x, currentInputs.y,
                currentInputs.zx, currentInputs.nx, currentInputs.zy, currentInputs.ny,
                currentInputs.f, currentInputs.no
            );
            break;
        default:
            console.error('Tipo de chip no reconocido:', currentChip);
            return;
    }
    
    // Generar HTML para mostrar las salidas
    Object.entries(outputs).forEach(([name, value]) => {
        if (Array.isArray(value)) {
            // Salida de 16 bits
            const decimalValue = binary16ToInt(value);
            html += `
                <div class="bit16-output">
                    <span>${name} (decimal): ${decimalValue}</span>
                    <div class="bit-array">
                        ${value.map((bit, index) => 
                            `<div class="bit-box ${bit ? 'on' : 'off'}">${bit}</div>`
                        ).join('')}
                    </div>
                </div>
            `;
        } else {
            // Salida de un solo bit
            html += `
                <div class="bit-output">
                    <span>${name}:</span>
                    <div class="bit-output-value ${value ? 'on' : ''}">${value}</div>
                </div>
            `;
        }
    });
    
    outputsContainer.innerHTML = html;
}
