/**
 * Funciones para visualizar los chips
 */

// Configuración del canvas
const canvas = document.getElementById('chip-canvas');
const ctx = canvas.getContext('2d');

// Constantes para la visualización
const CHIP_WIDTH = 200;
const CHIP_HEIGHT = 140;
const PORT_RADIUS = 8;
const WIRE_COLOR = '#555';
const PORT_COLOR = '#3498db';
const CHIP_FILL_COLOR = '#f0f0f0';
const CHIP_STROKE_COLOR = '#34495e';
const TEXT_COLOR = '#333';
const GATE_SIZE = 60;

// Función para limpiar el canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Función para dibujar un chip genérico
function drawChip(x, y, width, height, label) {
    ctx.fillStyle = CHIP_FILL_COLOR;
    ctx.strokeStyle = CHIP_STROKE_COLOR;
    ctx.lineWidth = 2;
    
    // Dibujar el cuerpo del chip
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.fill();
    ctx.stroke();
    
    // Dibujar la etiqueta
    ctx.fillStyle = TEXT_COLOR;
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + width/2, y + height/2);
}

// Función para dibujar un puerto
function drawPort(x, y, isInput, label, value) {
    // Dibujar el círculo del puerto
    ctx.beginPath();
    ctx.arc(x, y, PORT_RADIUS, 0, 2 * Math.PI);
    ctx.fillStyle = value ? '#2ecc71' : PORT_COLOR;
    ctx.fill();
    ctx.strokeStyle = CHIP_STROKE_COLOR;
    ctx.stroke();
    
    // Dibujar la etiqueta
    ctx.fillStyle = TEXT_COLOR;
    ctx.font = '12px Arial';
    ctx.textAlign = isInput ? 'right' : 'left';
    ctx.textBaseline = 'middle';
    const textX = isInput ? x - 15 : x + 15;
    ctx.fillText(label, textX, y);
    
    // Dibujar el valor
    ctx.fillStyle = value ? '#2ecc71' : '#e74c3c';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(value.toString(), x, y);
}

// Función para dibujar una conexión (cable)
function drawConnection(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = WIRE_COLOR;
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Dibuja una compuerta AND
function drawAND(x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + size * 0.6, y);
    ctx.arc(x + size * 0.6, y + size/2, size/2, -Math.PI/2, Math.PI/2);
    ctx.lineTo(x, y + size);
    ctx.closePath();
    ctx.fillStyle = CHIP_FILL_COLOR;
    ctx.fill();
    ctx.strokeStyle = CHIP_STROKE_COLOR;
    ctx.stroke();
    
    ctx.fillStyle = TEXT_COLOR;
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('AND', x + size * 0.4, y + size/2);
}

// Dibuja una compuerta XOR
function drawXOR(x, y, size) {
    // Dibujar el símbolo XOR
    ctx.beginPath();
    ctx.moveTo(x + 5, y);
    ctx.quadraticCurveTo(x + size * 0.4, y + size/2, x + 5, y + size);
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + size * 0.4, y + size/2, x, y + size);
    ctx.moveTo(x + 10, y);
    ctx.lineTo(x + size * 0.7, y);
    ctx.quadraticCurveTo(x + size, y + size/2, x + size * 0.7, y + size);
    ctx.lineTo(x + 10, y + size);
    
    ctx.strokeStyle = CHIP_STROKE_COLOR;
    ctx.stroke();
    
    // Relleno
    ctx.fillStyle = CHIP_FILL_COLOR;
    ctx.fill();
    
    // Texto
    ctx.fillStyle = TEXT_COLOR;
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('XOR', x + size * 0.5, y + size/2);
}

// Dibuja una compuerta OR
function drawOR(x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + size * 0.7, y, x + size, y + size/2);
    ctx.quadraticCurveTo(x + size * 0.7, y + size, x, y + size);
    ctx.quadraticCurveTo(x + size * 0.4, y + size/2, x, y);
    ctx.fillStyle = CHIP_FILL_COLOR;
    ctx.fill();
    ctx.strokeStyle = CHIP_STROKE_COLOR;
    ctx.stroke();
    
    ctx.fillStyle = TEXT_COLOR;
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('OR', x + size * 0.5, y + size/2);
}

// Función para visualizar el HalfAdder
function visualizeHalfAdder(inputs) {
    clearCanvas();
    
    // Calcular salidas
    const { sum, carry } = HalfAdder(inputs.a, inputs.b);
    
    // Posiciones
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const xorX = centerX - 150;
    const xorY = centerY - 40;
    const andX = centerX - 150;
    const andY = centerY + 80;
    
    // Dibujar las compuertas
    drawXOR(xorX, xorY, GATE_SIZE);
    drawAND(andX, andY, GATE_SIZE);
    
    // Dibujar el chip principal
    drawChip(centerX - 80, centerY - 70, CHIP_WIDTH, CHIP_HEIGHT, "HALF ADDER");
    
    // Dibujar puertos de entrada
    const inputAX = centerX - 200;
    const inputAY = centerY - 40;
    const inputBX = centerX - 200;
    const inputBY = centerY + 40;
    
    drawPort(inputAX, inputAY, true, "a", inputs.a);
    drawPort(inputBX, inputBY, true, "b", inputs.b);
    
    // Dibujar puertos de salida
    const outputSumX = centerX + 120;
    const outputSumY = centerY - 40;
    const outputCarryX = centerX + 120;
    const outputCarryY = centerY + 40;
    
    drawPort(outputSumX, outputSumY, false, "sum", sum);
    drawPort(outputCarryX, outputCarryY, false, "carry", carry);
    
    // Dibujar conexiones de entrada a las compuertas
    drawConnection(inputAX, inputAY, xorX, xorY + 15);
    drawConnection(inputBX, inputBY, xorX, xorY + 45);
    drawConnection(inputAX, inputAY, andX, andY + 15);
    drawConnection(inputBX, inputBY, andX, andY + 45);
    
    // Dibujar conexiones de compuertas a salida
    drawConnection(xorX + GATE_SIZE, xorY + 30, outputSumX, outputSumY);
    drawConnection(andX + GATE_SIZE, andY + 30, outputCarryX, outputCarryY);
}

// Función para visualizar el FullAdder
function visualizeFullAdder(inputs) {
    clearCanvas();
    
    // Calcular salidas
    const { sum, carry } = FullAdder(inputs.a, inputs.b, inputs.c);
    
    // Posiciones
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Dibujar el chip principal
    drawChip(centerX - 80, centerY - 70, CHIP_WIDTH, CHIP_HEIGHT, "FULL ADDER");
    
    // Dibujar componentes internos (simplificado)
    // Primer medio sumador
    drawChip(centerX - 180, centerY - 50, 100, 60, "HalfAdder");
    // Segundo medio sumador
    drawChip(centerX - 180, centerY + 30, 100, 60, "HalfAdder");
    // Compuerta OR
    drawOR(centerX - 30, centerY + 40, 50);
    
    // Dibujar puertos de entrada
    const inputAX = centerX - 240;
    const inputAY = centerY - 60;
    const inputBX = centerX - 240;
    const inputBY = centerY - 20;
    const inputCX = centerX - 240;
    const inputCY = centerY + 60;
    
    drawPort(inputAX, inputAY, true, "a", inputs.a);
    drawPort(inputBX, inputBY, true, "b", inputs.b);
    drawPort(inputCX, inputCY, true, "c", inputs.c);
    
    // Dibujar puertos de salida
    const outputSumX = centerX + 120;
    const outputSumY = centerY - 20;
    const outputCarryX = centerX + 120;
    const outputCarryY = centerY + 60;
    
    drawPort(outputSumX, outputSumY, false, "sum", sum);
    drawPort(outputCarryX, outputCarryY, false, "carry", carry);
    
    // Dibujar algunas conexiones principales (simplificado)
    drawConnection(inputAX, inputAY, centerX - 180, centerY - 40);
    drawConnection(inputBX, inputBY, centerX - 180, centerY - 30);
    drawConnection(inputCX, inputCY, centerX - 180, centerY + 50);
    
    drawConnection(centerX - 80, centerY - 30, outputSumX, outputSumY);
    drawConnection(centerX + 20, centerY + 65, outputCarryX, outputCarryY);
}

// Función para visualizar Add16
function visualizeAdd16(inputs) {
    clearCanvas();
    
    // Calcular salidas
    const out = Add16(inputs.a, inputs.b);
    
    // Posiciones
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Dibujar el chip principal
    drawChip(centerX - 100, centerY - 100, CHIP_WIDTH + 50, CHIP_HEIGHT + 100, "ADD16");
    
    // Visualización simplificada con FullAdders
    for (let i = 0; i < 3; i++) {  // Dibujamos solo 3 para simplificar
        drawChip(centerX - 70, centerY - 60 + i*60, 80, 40, "FullAdder");
    }
    ctx.font = '16px Arial';
    ctx.fillText("...", centerX - 30, centerY + 120);
    
    // Mostrar los valores de entrada en formato decimal
    ctx.font = '14px Arial';
    ctx.textAlign = 'right';
    const decimalA = binary16ToInt(inputs.a);
    const decimalB = binary16ToInt(inputs.b);
    const decimalOut = binary16ToInt(out);
    
    ctx.fillText(`Decimal a: ${decimalA}`, centerX - 120, centerY - 140);
    ctx.fillText(`Decimal b: ${decimalB}`, centerX - 120, centerY - 120);
    ctx.fillText(`Resultado: ${decimalOut}`, centerX - 120, centerY - 100);
    
    // Puertos simplificados
    drawPort(centerX - 200, centerY - 50, true, "a[16]", 1);
    drawPort(centerX - 200, centerY, true, "b[16]", 1);
    drawPort(centerX + 150, centerY - 50, false, "out[16]", 1);
}

// Función para visualizar Inc16
function visualizeInc16(inputs) {
    clearCanvas();
    
    // Calcular salidas
    const out = Inc16(inputs.in);
    
    // Posiciones
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Dibujar el chip principal
    drawChip(centerX - 100, centerY - 70, CHIP_WIDTH + 50, CHIP_HEIGHT, "INC16");
    
    // Mostrar los valores en formato decimal
    ctx.font = '14px Arial';
    ctx.textAlign = 'right';
    const decimalIn = binary16ToInt(inputs.in);
    const decimalOut = binary16ToInt(out);
    
    ctx.fillText(`Entrada: ${decimalIn}`, centerX - 120, centerY - 100);
    ctx.fillText(`Salida: ${decimalOut}`, centerX - 120, centerY - 80);
    
    // Visualización simplificada con Add16
    drawChip(centerX - 50, centerY, 100, 60, "Add16");
    
    // Constante +1
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText("+1", centerX - 80, centerY + 30);
    
    // Puertos simplificados
    drawPort(centerX - 200, centerY - 30, true, "in[16]", 1);
    drawPort(centerX + 150, centerY - 30, false, "out[16]", 1);
}

// Función para visualizar la ALU
function visualizeALU(inputs) {
    clearCanvas();
    
    // Calcular salidas
    const { out, zr, ng } = ALU(
        inputs.x, inputs.y, 
        inputs.zx, inputs.nx, inputs.zy, inputs.ny, 
        inputs.f, inputs.no
    );
    
    // Posiciones
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Dibujar el chip principal
    drawChip(centerX - 100, centerY - 100, CHIP_WIDTH + 80, CHIP_HEIGHT + 100, "ALU");
    
    // Mostrar información de control
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Control: zx=${inputs.zx} nx=${inputs.nx} zy=${inputs.zy} ny=${inputs.ny} f=${inputs.f} no=${inputs.no}`, centerX - 90, centerY - 70);
    
    // Mostrar los valores en formato decimal
    ctx.font = '14px Arial';
    const decimalX = binary16ToInt(inputs.x);
    const decimalY = binary16ToInt(inputs.y);
    const decimalOut = binary16ToInt(out);
    
    ctx.fillText(`x: ${decimalX}`, centerX - 90, centerY - 40);
    ctx.fillText(`y: ${decimalY}`, centerX - 90, centerY - 20);
    ctx.fillText(`out: ${decimalOut}`, centerX - 90, centerY);
    ctx.fillText(`zr: ${zr} (${zr ? "Salida es cero" : "Salida no es cero"})`, centerX - 90, centerY + 20);
    ctx.fillText(`ng: ${ng} (${ng ? "Salida es negativa" : "Salida no es negativa"})`, centerX - 90, centerY + 40);
    
    // Puertos simplificados
    drawPort(centerX - 200, centerY - 70, true, "x[16]", 1);
    drawPort(centerX - 200, centerY - 20, true, "y[16]", 1);
    drawPort(centerX - 200, centerY + 30, true, "control[6]", 1);
    drawPort(centerX + 150, centerY - 50, false, "out[16]", 1);
    drawPort(centerX + 150, centerY, false, "zr", zr);
    drawPort(centerX + 150, centerY + 50, false, "ng", ng);
}

// Función principal para seleccionar la visualización según el chip
function visualizeChip(chipType, inputs) {
    switch(chipType) {
        case 'halfadder':
            visualizeHalfAdder(inputs);
            break;
        case 'fulladder':
            visualizeFullAdder(inputs);
            break;
        case 'add16':
            visualizeAdd16(inputs);
            break;
        case 'inc16':
            visualizeInc16(inputs);
            break;
        case 'alu':
            visualizeALU(inputs);
            break;
        default:
            console.error('Tipo de chip no reconocido:', chipType);
    }
}