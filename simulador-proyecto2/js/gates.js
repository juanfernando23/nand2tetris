/**
 * Implementación de las compuertas lógicas básicas
 */

// Compuertas lógicas simples
function NAND(a, b) {
    return !(a && b) ? 1 : 0;
}

function NOT(a) {
    return a ? 0 : 1;
}

function AND(a, b) {
    return a && b ? 1 : 0;
}

function OR(a, b) {
    return a || b ? 1 : 0;
}

function XOR(a, b) {
    return (a && !b) || (!a && b) ? 1 : 0;
}

// Compuertas de 16 bits
function NOT16(input) {
    return input.map(bit => NOT(bit));
}

function AND16(a, b) {
    const result = [];
    for (let i = 0; i < 16; i++) {
        result[i] = AND(a[i], b[i]);
    }
    return result;
}

function OR16(a, b) {
    const result = [];
    for (let i = 0; i < 16; i++) {
        result[i] = OR(a[i], b[i]);
    }
    return result;
}

function MUX16(a, b, sel) {
    const result = [];
    for (let i = 0; i < 16; i++) {
        result[i] = sel ? b[i] : a[i];
    }
    return result;
}

// Funciones de utilidad para validar entradas
function validateBit(bit) {
    return (bit === 0 || bit === 1);
}

function validateBits(...bits) {
    for (const bit of bits) {
        if (!validateBit(bit)) {
            throw new Error(`Valor de bit inválido: ${bit}`);
        }
    }
    return true;
}

function validate16Bits(...arrays) {
    for (const array of arrays) {
        if (!Array.isArray(array) || array.length !== 16) {
            throw new Error("Se esperaba un array de 16 bits");
        }
        for (let i = 0; i < 16; i++) {
            if (!validateBit(array[i])) {
                throw new Error(`Valor de bit inválido en posición ${i}: ${array[i]}`);
            }
        }
    }
    return true;
}

// Funciones de conversión
function intToBinary16(value) {
    // Convertir un entero a un array de 16 bits (complemento a 2)
    const binary = new Array(16).fill(0);
    
    // Manejar números negativos
    if (value < 0) {
        // Complemento a 2 para números negativos
        const absValue = Math.abs(value + 1);
        let i = 15;
        while (i >= 0 && absValue > 0) {
            binary[i] = (absValue % 2) ? 0 : 1; // Invertimos los bits
            absValue = Math.floor(absValue / 2);
            i--;
        }
        // Rellenamos con 1s los bits restantes
        while (i >= 0) {
            binary[i] = 1;
            i--;
        }
    } else {
        // Para números positivos, conversión binaria normal
        let i = 15;
        let tempValue = value;
        while (i >= 0 && tempValue > 0) {
            binary[i] = tempValue % 2;
            tempValue = Math.floor(tempValue / 2);
            i--;
        }
    }
    
    return binary;
}

function binary16ToInt(binary) {
    // Convertir un array de 16 bits a un entero (complemento a 2)
    if (binary[0] === 1) {
        // Es un número negativo, aplicamos complemento a 2
        const inverted = binary.map(bit => bit === 0 ? 1 : 0);
        let value = 0;
        for (let i = 15; i > 0; i--) {
            value += inverted[i] * Math.pow(2, 15-i);
        }
        return -(value + 1);
    } else {
        // Es un número positivo
        let value = 0;
        for (let i = 0; i < 16; i++) {
            value += binary[i] * Math.pow(2, 15-i);
        }
        return value;
    }
}
