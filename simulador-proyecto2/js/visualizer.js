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
    
    // Posicionamiento mejorado de compuertas
    const xorX = centerX - 150;
    const xorY = centerY - 60;
    const andX = centerX - 150;
    const andY = centerY + 40;
    
    // Dibujar las compuertas internas
    drawXOR(xorX, xorY, GATE_SIZE);
    drawAND(andX, andY, GATE_SIZE);
    
    // Dibujar puertos de entrada
    const inputAX = centerX - 230;
    const inputAY = centerY - 30;
    const inputBX = centerX - 230;
    const inputBY = centerY + 30;
    
    drawPort(inputAX, inputAY, true, "a", inputs.a);
    drawPort(inputBX, inputBY, true, "b", inputs.b);
    
    // Dibujar puertos de salida
    const outputSumX = centerX + 130;
    const outputSumY = centerY - 30;
    const outputCarryX = centerX + 130;
    const outputCarryY = centerY + 30;
    
    drawPort(outputSumX, outputSumY, false, "sum", sum);
    drawPort(outputCarryX, outputCarryY, false, "carry", carry);
    
    // Dibujar conexiones de entrada mejoradas
    // Conexión a-XOR
    drawConnection(inputAX, inputAY, centerX - 200, inputAY);
    drawConnection(centerX - 200, inputAY, centerX - 200, xorY + 15);
    drawConnection(centerX - 200, xorY + 15, xorX, xorY + 15);
    
    // Conexión b-XOR
    drawConnection(inputBX, inputBY, centerX - 190, inputBY);
    drawConnection(centerX - 190, inputBY, centerX - 190, xorY + 45);
    drawConnection(centerX - 190, xorY + 45, xorX, xorY + 45);
    
    // Conexión a-AND
    drawConnection(inputAX, inputAY, centerX - 210, inputAY);
    drawConnection(centerX - 210, inputAY, centerX - 210, andY + 15);
    drawConnection(centerX - 210, andY + 15, andX, andY + 15);
    
    // Conexión b-AND
    drawConnection(inputBX, inputBY, centerX - 180, inputBY);
    drawConnection(centerX - 180, inputBY, centerX - 180, andY + 45);
    drawConnection(centerX - 180, andY + 45, andX, andY + 45);
    
    // Dibujar conexiones de compuertas a salidas
    // XOR a sum
    drawConnection(xorX + GATE_SIZE, xorY + 30, centerX + 50, xorY + 30);
    drawConnection(centerX + 50, xorY + 30, centerX + 50, outputSumY);
    drawConnection(centerX + 50, outputSumY, outputSumX, outputSumY);
    
    // AND a carry
    drawConnection(andX + GATE_SIZE, andY + 30, centerX + 60, andY + 30);
    drawConnection(centerX + 60, andY + 30, centerX + 60, outputCarryY);
    drawConnection(centerX + 60, outputCarryY, outputCarryX, outputCarryY);
    
    // Añadir título en la parte superior
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = TEXT_COLOR;
    ctx.textAlign = 'center';
    ctx.fillText("Medio Sumador (HalfAdder)", centerX, 30);
}

// Función para visualizar el FullAdder
function visualizeFullAdder(inputs) {
    clearCanvas();
    
    // Calcular salidas
    const { sum, carry } = FullAdder(inputs.a, inputs.b, inputs.c);
    
    // Posiciones
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Mejor posicionamiento de componentes internos en escalera
    // Primer medio sumador
    drawChip(centerX - 200, centerY - 90, 90, 50, "HalfAdder 1");
    // Segundo medio sumador - más adelante
    drawChip(centerX - 70, centerY - 10, 90, 50, "HalfAdder 2");
    // Compuerta OR - aún más adelante
    drawOR(centerX + 60, centerY + 40, 40);
    
    // Dibujar puertos de entrada
    const inputAX = centerX - 250;
    const inputAY = centerY - 90;
    const inputBX = centerX - 250;
    const inputBY = centerY - 40;
    const inputCX = centerX - 250;
    const inputCY = centerY + 40;
    
    drawPort(inputAX, inputAY, true, "a", inputs.a);
    drawPort(inputBX, inputBY, true, "b", inputs.b);
    drawPort(inputCX, inputCY, true, "c", inputs.c);
    
    // Dibujar puertos de salida
    const outputSumX = centerX + 150;
    const outputSumY = centerY - 10;
    const outputCarryX = centerX + 150;
    const outputCarryY = centerY + 60;
    
    drawPort(outputSumX, outputSumY, false, "sum", sum);
    drawPort(outputCarryX, outputCarryY, false, "carry", carry);
    
    // Conexiones para HalfAdder1
    drawConnection(inputAX, inputAY, centerX - 200, centerY - 75);
    drawConnection(inputBX, inputBY, centerX - 200, centerY - 65);
    
    // Conexión de salida suma de HalfAdder1 a entrada de HalfAdder2
    drawConnection(centerX - 110, centerY - 70, centerX - 100, centerY - 70);
    drawConnection(centerX - 100, centerY - 70, centerX - 100, centerY - 0);
    drawConnection(centerX - 100, centerY - 0, centerX - 70, centerY + 5);
    
    // Conexión de entrada c a HalfAdder2
    drawConnection(inputCX, inputCY, centerX - 140, inputCY);
    drawConnection(centerX - 140, inputCY, centerX - 140, centerY + 15);
    drawConnection(centerX - 140, centerY + 15, centerX - 70, centerY + 15);
    
    // Conexión de salida suma de HalfAdder2 a salida final
    drawConnection(centerX + 20, centerY + 10, centerX + 80, centerY + 10);
    drawConnection(centerX + 80, centerY + 10, centerX + 80, outputSumY);
    drawConnection(centerX + 80, outputSumY, outputSumX, outputSumY);
    
    // Conexiones para los carry
    // Carry de HalfAdder1 a OR
    drawConnection(centerX - 110, centerY - 55, centerX - 20, centerY - 55);
    drawConnection(centerX - 20, centerY - 55, centerX - 20, centerY + 50);
    drawConnection(centerX - 20, centerY + 50, centerX + 60, centerY + 50);
    
    // Carry de HalfAdder2 a OR
    drawConnection(centerX + 20, centerY + 25, centerX + 40, centerY + 25);
    drawConnection(centerX + 40, centerY + 25, centerX + 40, centerY + 70);
    drawConnection(centerX + 40, centerY + 70, centerX + 60, centerY + 70);
    
    // Conexión de OR a carry final
    drawConnection(centerX + 100, centerY + 60, outputCarryX, outputCarryY);
    
    // Añadir título en la parte superior
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = TEXT_COLOR;
    ctx.textAlign = 'center';
    ctx.fillText("Sumador Completo (FullAdder)", centerX, 30);
}

// Función para visualizar Add16
function visualizeAdd16(inputs) {
    clearCanvas();
    
    // Calcular salidas
    const out = Add16(inputs.a, inputs.b);
    
    // Posiciones
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 - 20;
    
    // Mostrar los valores de entrada/salida en formato decimal
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    const decimalA = binary16ToInt(inputs.a);
    const decimalB = binary16ToInt(inputs.b);
    const decimalOut = binary16ToInt(out);
    
    ctx.fillText(`Decimal a: ${decimalA}`, centerX, centerY - 140);
    ctx.fillText(`Decimal b: ${decimalB}`, centerX, centerY - 120);
    ctx.fillText(`Resultado: ${decimalOut}`, centerX, centerY + 180);
    
    // Añadir título en la parte superior
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = TEXT_COLOR;
    ctx.textAlign = 'center';
    ctx.fillText("Sumador de 16 bits (Add16)", centerX, 30);
    
    // Dibujar puertos principales de entrada
    const inputAX = centerX - 180;
    const inputAY = centerY - 70;
    const inputBX = centerX - 180;
    const inputBY = centerY;
    
    drawPort(inputAX, inputAY, true, "a[16]", 1);
    drawPort(inputBX, inputBY, true, "b[16]", 1);
    
    // Dibujar puerto de salida
    const outputX = centerX + 180;
    const outputY = centerY - 30;
    
    drawPort(outputX, outputY, false, "out[16]", 1);
    
    // Buses principales - más separados y claros
    const busAX = centerX - 140;
    const busBX = centerX - 120;
    const busOutX = centerX + 120;
    
    // Bus de entrada a
    drawConnection(inputAX, inputAY, busAX, inputAY);
    
    // Bus de entrada b
    drawConnection(inputBX, inputBY, busBX, inputBY);
    
    // Visualización mejorada con FullAdders más separados
    // Aumentamos el espaciado vertical y horizontal para más claridad
    const verticalSpacing = 70; // Mayor separación vertical
    const horizontalOffset = 30; // Mayor desplazamiento horizontal para efecto escalera
    
    // Visualizar solo 4 FullAdders para no saturar
    for (let i = 0; i < 4; i++) {  
        const yPos = centerY - 80 + i*verticalSpacing;
        const xOffset = i * horizontalOffset;  // Mayor desplazamiento para efecto escalera
        
        // Dibujar cada FullAdder con mayor tamaño para mejor visualización
        drawChip(centerX - 60 + xOffset, yPos, 90, 40, `FA[${15-i}]`);
        
        // Mostrar bits correspondientes con mejor espaciado
        ctx.font = '11px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`a[${15-i}]=${inputs.a[15-i]}`, centerX - 70 + xOffset, yPos + 15);
        ctx.fillText(`b[${15-i}]=${inputs.b[15-i]}`, centerX - 70 + xOffset, yPos + 30);
        
        ctx.textAlign = 'left';
        ctx.fillText(`out[${15-i}]=${out[15-i]}`, centerX + 40 + xOffset, yPos + 20);
        
        // Dibujar conexiones de cada FullAdder - separadas y más claras
        // Conexiones de entradas a y b desde los buses
        drawConnection(busAX, inputAY, busAX, yPos + 15);
        drawConnection(busAX, yPos + 15, centerX - 60 + xOffset, yPos + 15);
        
        drawConnection(busBX, inputBY, busBX, yPos + 30);
        drawConnection(busBX, yPos + 30, centerX - 60 + xOffset, yPos + 30);
        
        // Conexión de salida al bus de salida
        drawConnection(centerX + 30 + xOffset, yPos + 20, busOutX, yPos + 20);
        
        // Dibujar carry entre FullAdders - Con mejor enrutamiento
        if (i > 0) {
            const prevY = yPos - verticalSpacing;
            const prevXOffset = (i-1) * horizontalOffset;
            
            // Ruta del carry: desde la salida del FA anterior hacia la entrada del FA actual
            // Puntos de conexión para un enrutamiento más claro
            const carryOutX = centerX + 30 + prevXOffset;
            const carryOutY = prevY + 30;
            const carryMidX = centerX - 80 + xOffset; // Punto medio para doblar
            const carryInY = yPos - 5;
            
            // Conexión desde FA anterior a punto medio
            drawConnection(carryOutX, carryOutY, carryMidX, carryOutY);
            // Conexión vertical hacia abajo
            drawConnection(carryMidX, carryOutY, carryMidX, carryInY);
            // Conexión a FA actual
            drawConnection(carryMidX, carryInY, centerX - 60 + xOffset, carryInY);
        }
    }
    
    // Indicar que hay más FullAdders
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText("⋮", centerX, centerY + 150);
    
    // Bus de salida al puerto de salida - Ruta más clara
    drawConnection(busOutX, centerY - 80 + 3*verticalSpacing + 20, busOutX, outputY);
    drawConnection(busOutX, outputY, outputX, outputY);
    
    // Etiquetas para los buses
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText("Bus A", busAX, centerY - 90);
    ctx.fillText("Bus B", busBX, centerY - 90);
    ctx.fillText("Bus Salida", busOutX, centerY - 90);
}

// Función para visualizar Inc16
function visualizeInc16(inputs) {
    clearCanvas();
    
    // Calcular salidas
    const out = Inc16(inputs.in);
    
    // Posiciones
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Visualización de componentes internos mejor posicionados
    // Add16 en el centro
    drawChip(centerX - 70, centerY - 30, 140, 60, "Add16");
    
    // Registradores constantes
    ctx.fillStyle = CHIP_FILL_COLOR;
    ctx.strokeStyle = CHIP_STROKE_COLOR;
    ctx.lineWidth = 1;
    ctx.fillRect(centerX - 70, centerY + 60, 140, 20);
    ctx.strokeRect(centerX - 70, centerY + 60, 140, 20);
    ctx.fillStyle = TEXT_COLOR;
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText("Constante: 1", centerX, centerY + 75);
    
    // Dibujar puertos principales
    const inputX = centerX - 180;
    const inputY = centerY - 15;
    const outputX = centerX + 150;
    const outputY = centerY - 15;
    
    drawPort(inputX, inputY, true, "in[16]", 1);
    drawPort(outputX, outputY, false, "out[16]", 1);
    
    // Conexiones mejoradas
    // Entrada al Add16
    drawConnection(inputX, inputY, centerX - 150, inputY);
    drawConnection(centerX - 150, inputY, centerX - 70, inputY);
    
    // Constante al Add16 - CORREGIDA
    drawConnection(centerX, centerY + 60, centerX, centerY + 40);
    drawConnection(centerX, centerY + 40, centerX - 30, centerY + 40);
    drawConnection(centerX - 30, centerY + 40, centerX - 30, centerY + 5);
    drawConnection(centerX - 30, centerY + 5, centerX - 70, centerY + 5);
    
    // Add16 a salida - CORREGIDA
    drawConnection(centerX + 70, centerY, centerX + 100, centerY);
    drawConnection(centerX + 100, centerY, centerX + 100, outputY);
    drawConnection(centerX + 100, outputY, outputX, outputY);
    
    // Mostrar los valores en formato decimal
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    const decimalIn = binary16ToInt(inputs.in);
    const decimalOut = binary16ToInt(out);
    
    ctx.fillText(`Entrada: ${decimalIn}`, centerX, centerY - 80);
    ctx.fillText(`Salida: ${decimalOut}`, centerX, centerY + 120);
    
    // Añadir título en la parte superior
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = TEXT_COLOR;
    ctx.fillText("Incrementador de 16 bits (Inc16)", centerX, 30);
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
    
    // Dibujar bloques internos de forma más clara con disposición escalonada
    // Bloque de preprocesamiento X
    drawChip(centerX - 180, centerY - 90, 80, 50, "ZX/NX");
    // Bloque de preprocesamiento Y
    drawChip(centerX - 180, centerY + 10, 80, 50, "ZY/NY");
    // Bloque de procesamiento principal (un poco más adelante)
    drawChip(centerX - 40, centerY - 40, 100, 80, "F (ADD/AND)");
    // Bloque de post-procesamiento (aún más adelante)
    drawChip(centerX + 100, centerY - 40, 80, 80, "NO/ZR/NG");
    
    // Mostrar información de control de manera más clara
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`zx=${inputs.zx}`, centerX - 170, centerY - 100);
    ctx.fillText(`nx=${inputs.nx}`, centerX - 140, centerY - 100);
    ctx.fillText(`zy=${inputs.zy}`, centerX - 170, centerY);
    ctx.fillText(`ny=${inputs.ny}`, centerX - 140, centerY);
    ctx.fillText(`f=${inputs.f}`, centerX + 10, centerY - 50);
    ctx.fillText(`no=${inputs.no}`, centerX + 100, centerY - 50);
    
    // Dibujar puertos de entrada y salida
    const inputXX = centerX - 240;
    const inputXY = centerY - 70;
    const inputYX = centerX - 240;
    const inputYY = centerY + 30;
    
    // Puertos de control
    const controlX = centerX - 240;
    const controlY = centerY - 20;
    
    // Puertos de salida
    const outputX = centerX + 200;
    const outputOutY = centerY - 30;
    const outputZrY = centerY;
    const outputNgY = centerY + 30;
    
    // Puertos de entrada principales
    drawPort(inputXX, inputXY, true, "x[16]", 1);
    drawPort(inputYX, inputYY, true, "y[16]", 1);
    
    // Puerto de control agrupado
    drawPort(controlX, controlY, true, "control", 1);
    
    // Puertos de salida
    drawPort(outputX, outputOutY, false, "out[16]", 1);
    drawPort(outputX, outputZrY, false, "zr", zr);
    drawPort(outputX, outputNgY, false, "ng", ng);
    
    // Dibujar conexiones entre bloques de forma más clara - CORREGIDAS
    // X a bloque ZX/NX
    drawConnection(inputXX, inputXY, centerX - 200, inputXY);
    drawConnection(centerX - 200, inputXY, centerX - 180, inputXY);
    
    // Y a bloque ZY/NY
    drawConnection(inputYX, inputYY, centerX - 200, inputYY);
    drawConnection(centerX - 200, inputYY, centerX - 180, inputYY);
    
    // Control a los bloques de control - MEJORADO
    drawConnection(controlX, controlY, centerX - 220, controlY);
    
    // Control a ZX/NX
    drawConnection(centerX - 220, controlY, centerX - 220, centerY - 80);
    drawConnection(centerX - 220, centerY - 80, centerX - 180, centerY - 80);
    drawConnection(centerX - 220, centerY - 80, centerX - 220, centerY - 65);
    drawConnection(centerX - 220, centerY - 65, centerX - 180, centerY - 65);
    
    // Control a ZY/NY
    drawConnection(centerX - 220, controlY, centerX - 220, centerY + 20);
    drawConnection(centerX - 220, centerY + 20, centerX - 180, centerY + 20);
    drawConnection(centerX - 220, centerY + 20, centerX - 220, centerY + 35);
    drawConnection(centerX - 220, centerY + 35, centerX - 180, centerY + 35);
    
    // ZX/NX a F - CORREGIDO
    drawConnection(centerX - 100, centerY - 70, centerX - 40, centerY - 20);
    
    // ZY/NY a F - CORREGIDO
    drawConnection(centerX - 100, centerY + 30, centerX - 40, centerY + 20);
    
    // Control a F (flag f)
    drawConnection(centerX - 220, controlY, centerX - 130, controlY);
    drawConnection(centerX - 130, controlY, centerX - 130, centerY);
    drawConnection(centerX - 130, centerY, centerX - 40, centerY);
    
    // F a NO/ZR/NG - CORREGIDO
    drawConnection(centerX + 60, centerY, centerX + 100, centerY);
    
    // Control a NO/ZR/NG (flag no)
    drawConnection(centerX - 130, controlY, centerX + 50, controlY);
    drawConnection(centerX + 50, controlY, centerX + 50, centerY - 20);
    drawConnection(centerX + 50, centerY - 20, centerX + 100, centerY - 20);
    
    // NO/ZR/NG a puertos de salida - CORREGIDO
    drawConnection(centerX + 180, outputOutY, outputX, outputOutY);
    drawConnection(centerX + 180, outputZrY, outputX, outputZrY);
    drawConnection(centerX + 180, outputNgY, outputX, outputNgY);
    
    // Mostrar valores de entrada/salida
    ctx.font = '14px Arial';
    const decimalX = binary16ToInt(inputs.x);
    const decimalY = binary16ToInt(inputs.y);
    const decimalOut = binary16ToInt(out);
    
    ctx.textAlign = 'center';
    ctx.fillText(`x: ${decimalX}`, centerX, centerY - 130);
    ctx.fillText(`y: ${decimalY}`, centerX, centerY - 110);
    ctx.fillText(`out: ${decimalOut}`, centerX, centerY + 120);
    ctx.fillText(`zr: ${zr} (${zr ? "Salida = 0" : "Salida ≠ 0"})`, centerX, centerY + 140);
    ctx.fillText(`ng: ${ng} (${ng ? "Salida < 0" : "Salida ≥ 0"})`, centerX, centerY + 160);
    
    // Añadir título en la parte superior
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = TEXT_COLOR;
    ctx.textAlign = 'center';
    ctx.fillText("Unidad Aritmético-Lógica (ALU)", centerX, 30);
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