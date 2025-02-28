/**
 * Implementación de los chips del Proyecto 2
 */

// Chip HalfAdder (Medio Sumador)
function HalfAdder(a, b) {
    validateBits(a, b);
    const sum = XOR(a, b);     // La suma es a XOR b
    const carry = AND(a, b);   // El acarreo es a AND b
    return { sum, carry };
}

// Chip FullAdder (Sumador Completo)
function FullAdder(a, b, c) {
    validateBits(a, b, c);
    // Primer medio sumador para a y b
    const { sum: sum1, carry: carry1 } = HalfAdder(a, b);
    // Segundo medio sumador para sum1 y c
    const { sum: finalSum, carry: carry2 } = HalfAdder(sum1, c);
    // El acarreo final es OR de los dos acarreos
    const finalCarry = OR(carry1, carry2);
    return { sum: finalSum, carry: finalCarry };
}

// Chip Add16 (Sumador de 16 bits)
function Add16(a, b) {
    validate16Bits(a, b);
    const result = new Array(16).fill(0);
    let carry = 0;
    
    // Sumar desde el bit menos significativo al más significativo
    for (let i = 15; i >= 0; i--) {
        const { sum, carry: newCarry } = FullAdder(a[i], b[i], carry);
        result[i] = sum;
        carry = newCarry;
    }
    
    return result;
}

// Chip Inc16 (Incrementador de 16 bits)
function Inc16(input) {
    validate16Bits(input);
    // Crear un array de 16 bits con un 1 en la posición menos significativa
    const one = new Array(16).fill(0);
    one[15] = 1;  // El bit menos significativo es 1, el resto 0
    
    // Sumar input + 1 usando Add16
    return Add16(input, one);
}

// Chip ALU (Unidad Aritmético-Lógica)
function ALU(x, y, zx, nx, zy, ny, f, no) {
    validate16Bits(x, y);
    validateBits(zx, nx, zy, ny, f, no);
    
    // Pre-procesamiento de x
    let processedX = [...x]; // Copia el array x
    if (zx === 1) {
        processedX = new Array(16).fill(0); // Si zx=1, fuerza x=0
    }
    if (nx === 1) {
        processedX = NOT16(processedX); // Si nx=1, invierte x
    }
    
    // Pre-procesamiento de y
    let processedY = [...y]; // Copia el array y
    if (zy === 1) {
        processedY = new Array(16).fill(0); // Si zy=1, fuerza y=0
    }
    if (ny === 1) {
        processedY = NOT16(processedY); // Si ny=1, invierte y
    }
    
    // Computación de la función
    let out;
    if (f === 0) {
        out = AND16(processedX, processedY); // Si f=0, out=x&y
    } else {
        out = Add16(processedX, processedY); // Si f=1, out=x+y
    }
    
    // Post-procesamiento
    if (no === 1) {
        out = NOT16(out); // Si no=1, invierte out
    }
    
    // Indicadores de estado
    const zr = out.every(bit => bit === 0) ? 1 : 0; // zr=1 si out=0
    const ng = out[0] === 1 ? 1 : 0; // ng=1 si out<0 (bit más significativo es 1)
    
    return { out, zr, ng };
}

// Descripciones de los chips para el simulador
const chipDescriptions = {
    halfadder: {
        title: "Medio Sumador (HalfAdder)",
        description: "Implementa un medio sumador que toma dos bits de entrada (a y b) y produce dos bits de salida: la suma (sum) y el acarreo (carry).",
        formula: "sum = a XOR b, carry = a AND b",
        inputs: [
            { name: "a", type: "bit" },
            { name: "b", type: "bit" }
        ],
        outputs: [
            { name: "sum", type: "bit" },
            { name: "carry", type: "bit" }
        ]
    },
    fulladder: {
        title: "Sumador Completo (FullAdder)",
        description: "Implementa un sumador completo que toma tres bits de entrada (a, b y c) y produce dos bits de salida: la suma (sum) y el acarreo (carry).",
        formula: "Utiliza dos medios sumadores y una compuerta OR",
        inputs: [
            { name: "a", type: "bit" },
            { name: "b", type: "bit" },
            { name: "c", type: "bit" }
        ],
        outputs: [
            { name: "sum", type: "bit" },
            { name: "carry", type: "bit" }
        ]
    },
    add16: {
        title: "Sumador de 16 bits (Add16)",
        description: "Implementa un sumador que toma dos arrays de 16 bits como entrada y produce un array de 16 bits como salida, representando la suma (ignorando overflow).",
        formula: "Utiliza 16 instancias de FullAdder en cascada",
        inputs: [
            { name: "a", type: "bit16" },
            { name: "b", type: "bit16" }
        ],
        outputs: [
            { name: "out", type: "bit16" }
        ]
    },
    inc16: {
        title: "Incrementador de 16 bits (Inc16)",
        description: "Implementa un incrementador que toma un array de 16 bits como entrada y produce un array de 16 bits como salida, representando la entrada + 1.",
        formula: "Utiliza Add16 con una constante de valor 1",
        inputs: [
            { name: "in", type: "bit16" }
        ],
        outputs: [
            { name: "out", type: "bit16" }
        ]
    },
    alu: {
        title: "Unidad Aritmético-Lógica (ALU)",
        description: "Implementa la ALU de la arquitectura Hack, capaz de realizar diversas operaciones aritméticas y lógicas según los bits de control.",
        formula: "Combina operaciones aritméticas y lógicas según los bits de control",
        inputs: [
            { name: "x", type: "bit16" },
            { name: "y", type: "bit16" },
            { name: "zx", type: "bit", description: "Fuerza x=0" },
            { name: "nx", type: "bit", description: "Invierte x" },
            { name: "zy", type: "bit", description: "Fuerza y=0" },
            { name: "ny", type: "bit", description: "Invierte y" },
            { name: "f", type: "bit", description: "Función: 0=AND, 1=ADD" },
            { name: "no", type: "bit", description: "Invierte salida" }
        ],
        outputs: [
            { name: "out", type: "bit16" },
            { name: "zr", type: "bit", description: "1 si out=0" },
            { name: "ng", type: "bit", description: "1 si out<0" }
        ]
    }
};
