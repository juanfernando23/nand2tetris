/**
 * simulador_proyecto6.js
 * Simulador de Ensamblador Hack - Proyecto 6 Nand2Tetris
 */

document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos del DOM
    const assemblyCodeTextarea = document.getElementById('assembly-code');
    const loadExampleBtn = document.getElementById('load-example-btn');
    const loadFileBtn = document.getElementById('load-file-btn');
    const fileInput = document.getElementById('file-input');
    const assembleBtn = document.getElementById('assemble-btn');
    const step1Btn = document.getElementById('step1-btn');
    const step2Btn = document.getElementById('step2-btn');
    const resetBtn = document.getElementById('reset-btn');
    const binaryCodeDiv = document.getElementById('binary-code');
    const symbolTableBody = document.querySelector('#symbol-table tbody');
    const inputPreview = document.getElementById('input-preview');
    const firstPassDetails = document.getElementById('first-pass-details');
    const secondPassDetails = document.getElementById('second-pass-details');
    const outputPreview = document.getElementById('output-preview');
    const assemblyLog = document.getElementById('assembly-log');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // Inicializar editor CodeMirror (mejor experiencia de edición que textarea)
    const editor = CodeMirror.fromTextArea(assemblyCodeTextarea, {
        lineNumbers: true,
        mode: 'javascript', // No hay modo específico para Hack, usamos javascript como aproximación
        theme: 'dracula',
        lineWrapping: true,
        tabSize: 2
    });

    // Estado del simulador
    let assemblyState = {
        inputCode: '',
        symbolTable: {},
        nextVariableAddress: 16,
        romAddress: 0,
        binaryCode: [],
        currentPass: 0, // 0: sin iniciar, 1: primera pasada, 2: segunda pasada
        instructionMap: [], // Mapeo entre líneas originales y instrucciones
        firstPassCompleted: false,
        assemblyCompleted: false,
        errors: []
    };

    // Constantes y tablas de traducción
    const INSTRUCTION_TYPE = {
        A_INSTRUCTION: 'A_INSTRUCTION',
        C_INSTRUCTION: 'C_INSTRUCTION',
        L_INSTRUCTION: 'L_INSTRUCTION'
    };

    const PREDEFINED_SYMBOLS = {
        "SP": 0,     // Stack pointer
        "LCL": 1,    // Local segment
        "ARG": 2,    // Argument segment
        "THIS": 3,   // This segment
        "THAT": 4,   // That segment
        "R0": 0,     // Register 0
        "R1": 1,     // Register 1
        "R2": 2,     // Register 2
        "R3": 3,     // Register 3
        "R4": 4,     // Register 4
        "R5": 5,     // Register 5
        "R6": 6,     // Register 6
        "R7": 7,     // Register 7
        "R8": 8,     // Register 8
        "R9": 9,     // Register 9
        "R10": 10,   // Register 10
        "R11": 11,   // Register 11
        "R12": 12,   // Register 12
        "R13": 13,   // Register 13
        "R14": 14,   // Register 14
        "R15": 15,     // Register 15
        "SCREEN": 16384, // Screen memory map
        "KBD": 24576    // Keyboard memory map
    };

    const DEST_TABLE = {
        null: "000",
        "": "000",
        "M": "001",
        "D": "010",
        "MD": "011",
        "A": "100",
        "AM": "101",
        "AD": "110",
        "AMD": "111"
    };

    const COMP_TABLE = {
        "0": "0101010",
        "1": "0111111",
        "-1": "0111010",
        "D": "0001100",
        "A": "0110000", "M": "1110000",
        "!D": "0001101",
        "!A": "0110001", "!M": "1110001",
        "-D": "0001111",
        "-A": "0110011", "-M": "1110011",
        "D+1": "0011111",
        "A+1": "0110111", "M+1": "1110111",
        "D-1": "0001110",
        "A-1": "0110010", "M-1": "1110010",
        "D+A": "0000010", "D+M": "1000010",
        "D-A": "0010011", "D-M": "1010011",
        "A-D": "0000111", "M-D": "1000111",
        "D&A": "0000000", "D&M": "1000000",
        "D|A": "0010101", "D|M": "1010101"
    };

    const JUMP_TABLE = {
        null: "000",
        "": "000",
        "JGT": "001",
        "JEQ": "010",
        "JGE": "011",
        "JLT": "100",
        "JNE": "101",
        "JLE": "110",
        "JMP": "111"
    };

    // Ejemplo de código ensamblador Hack para cargar
    const EXAMPLE_CODE = `// Programa para sumar dos números
// R0 = R1 + R2

@R1    // Carga valor de R1
D=M    // D = RAM[R1]
@R2    // Carga valor de R2
D=D+M  // D = D + RAM[R2]
@R0    // Selecciona R0
M=D    // RAM[R0] = D

(LOOP)  // Bucle infinito
@LOOP
0;JMP
`;

    // Funciones auxiliares
    function isNumber(str) {
        return /^\d+$/.test(str);
    }

    function convertToBinary(value, bits = 15) {
        // Convertir a binario y rellenar con ceros a la izquierda
        return (value >>> 0).toString(2).padStart(bits, '0').slice(-bits);
    }

    function aInstruction(value) {
        // Convierte un valor numérico en una instrucción A de 16 bits
        return "0" + convertToBinary(value, 15);
    }

    // Funciones principales de ensamblado
    function parseInstruction(line) {
        // Eliminar comentarios y espacios en blanco
        line = line.split('//')[0].trim();
        
        if (!line) return null; // Línea vacía o comentario
        
        if (line.startsWith('@')) { // Instrucción A (@xxx)
            return {
                type: INSTRUCTION_TYPE.A_INSTRUCTION,
                symbol: line.substring(1).trim()
            };
        } else if (line.startsWith('(') && line.endsWith(')')) { // Etiqueta (XXX)
            return {
                type: INSTRUCTION_TYPE.L_INSTRUCTION,
                symbol: line.substring(1, line.length - 1).trim()
            };
        } else { // Instrucción C (dest=comp;jump)
            let destPart = null;
            let compPart = line;
            let jumpPart = null;
            
            // Separar dest si existe
            if (line.includes('=')) {
                const parts = line.split('=');
                destPart = parts[0].trim();
                compPart = parts[1].trim();
            }
            
            // Separar jump si existe
            if (compPart.includes(';')) {
                const parts = compPart.split(';');
                compPart = parts[0].trim();
                jumpPart = parts[1].trim();
            }
            
            return {
                type: INSTRUCTION_TYPE.C_INSTRUCTION,
                dest: destPart,
                comp: compPart,
                jump: jumpPart
            };
        }
    }

    function resetState() {
        assemblyState = {
            inputCode: editor.getValue(),
            symbolTable: { ...PREDEFINED_SYMBOLS }, // Copiar símbolos predefinidos
            nextVariableAddress: 16,
            romAddress: 0,
            binaryCode: [],
            currentPass: 0,
            instructionMap: [],
            firstPassCompleted: false,
            assemblyCompleted: false,
            errors: []
        };
        
        // Limpiar visualizaciones
        binaryCodeDiv.innerHTML = '';
        symbolTableBody.innerHTML = '';
        firstPassDetails.innerHTML = '';
        secondPassDetails.innerHTML = '';
        outputPreview.innerHTML = '';
        inputPreview.innerHTML = '';
        
        // Actualizar la interfaz
        updateUI();
        
        // Mostrar código de entrada en el preview
        const codeLines = assemblyState.inputCode.split('\n');
        inputPreview.innerHTML = codeLines.slice(0, 10).join('<br>');
        if (codeLines.length > 10) {
            inputPreview.innerHTML += '<br>...';
        }
        
        log('Estado reiniciado. Listo para ensamblar.');
    }

    function firstPass() {
        if (!assemblyState.inputCode) {
            log('Error: No hay código para ensamblar.', 'error');
            return false;
        }
        
        assemblyState.currentPass = 1;
        log('Iniciando Primera Pasada: Analizando etiquetas y construyendo tabla de símbolos...', 'success');
        
        const lines = assemblyState.inputCode.split('\n');
        let romAddress = 0;
        let details = '';
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const parsedInst = parseInstruction(line);
            
            if (parsedInst) {
                assemblyState.instructionMap.push({
                    lineNumber: i,
                    originalLine: line,
                    parsedInstruction: parsedInst,
                    romAddress: parsedInst.type !== INSTRUCTION_TYPE.L_INSTRUCTION ? romAddress : null
                });
                
                if (parsedInst.type === INSTRUCTION_TYPE.L_INSTRUCTION) {
                    // Etiqueta: añadir a la tabla de símbolos con la dirección actual
                    if (!assemblyState.symbolTable[parsedInst.symbol]) {
                        assemblyState.symbolTable[parsedInst.symbol] = romAddress;
                        details += `Etiqueta encontrada: (${parsedInst.symbol}) → ROM[${romAddress}]<br>`;
                    } else if (assemblyState.symbolTable[parsedInst.symbol] !== romAddress) {
                        assemblyState.errors.push(`Error: Etiqueta '${parsedInst.symbol}' redefinida.`);
                        log(`Error: Etiqueta '${parsedInst.symbol}' redefinida.`, 'error');
                    }
                } else {
                    // Instrucción A o C: incrementar contador de ROM
                    romAddress++;
                }
            }
        }
        
        // Guardar romAddress para la segunda pasada
        assemblyState.romAddress = romAddress;
        
        // Actualizar detalles de la primera pasada
        firstPassDetails.innerHTML = details || 'No se encontraron etiquetas para añadir a la tabla de símbolos.';
        
        // Actualizar tabla de símbolos en la interfaz
        updateSymbolTable();
        
        // Marcar como completada
        assemblyState.firstPassCompleted = true;
        updateUI();
        
        log(`Primera pasada completada. Se encontraron ${romAddress} instrucciones.`, 'success');
        return true;
    }

    function secondPass() {
        if (!assemblyState.firstPassCompleted) {
            log('Error: Debes completar la primera pasada antes.', 'error');
            return false;
        }
        
        assemblyState.currentPass = 2;
        log('Iniciando Segunda Pasada: Traduciendo instrucciones a código binario...', 'success');
        
        const binary = [];
        let details = '';
        
        for (const inst of assemblyState.instructionMap) {
            const parsed = inst.parsedInstruction;
            
            // Saltar etiquetas en la segunda pasada
            if (parsed.type === INSTRUCTION_TYPE.L_INSTRUCTION) continue;
            
            let binaryCode = '';
            
            if (parsed.type === INSTRUCTION_TYPE.A_INSTRUCTION) {
                let value;
                if (isNumber(parsed.symbol)) {
                    // Valor numérico directo
                    value = parseInt(parsed.symbol);
                    details += `@${parsed.symbol} (valor) → ${aInstruction(value)}<br>`;
                } else {
                    // Símbolo (etiqueta o variable)
                    if (assemblyState.symbolTable[parsed.symbol] === undefined) {
                        // Nueva variable: asignar la siguiente dirección disponible
                        assemblyState.symbolTable[parsed.symbol] = assemblyState.nextVariableAddress++;
                        details += `@${parsed.symbol} (nueva variable) → ${aInstruction(assemblyState.symbolTable[parsed.symbol])}<br>`;
                    } else {
                        details += `@${parsed.symbol} (símbolo) → ${aInstruction(assemblyState.symbolTable[parsed.symbol])}<br>`;
                    }
                    value = assemblyState.symbolTable[parsed.symbol];
                }
                
                binaryCode = aInstruction(value);
            } else if (parsed.type === INSTRUCTION_TYPE.C_INSTRUCTION) {
                // Obtener bits para cada parte de la instrucción C
                const destBits = DEST_TABLE[parsed.dest] || DEST_TABLE[null];
                const compBits = COMP_TABLE[parsed.comp];
                const jumpBits = JUMP_TABLE[parsed.jump] || JUMP_TABLE[null];
                
                if (!compBits) {
                    assemblyState.errors.push(`Error: Comp inválido: '${parsed.comp}'`);
                    log(`Error: Comp inválido: '${parsed.comp}'`, 'error');
                    continue;
                }
                
                // Ensamblar la instrucción C completa (111 + comp + dest + jump)
                binaryCode = "111" + compBits + destBits + jumpBits;
                
                let instStr = '';
                if (parsed.dest) instStr += parsed.dest + '=';
                instStr += parsed.comp;
                if (parsed.jump) instStr += ';' + parsed.jump;
                
                details += `${instStr} → ${binaryCode}<br>`;
            }
            
            binary.push({
                originalLine: inst.originalLine,
                binaryCode: binaryCode,
                lineNumber: inst.lineNumber
            });
        }
        
        // Guardar código binario generado
        assemblyState.binaryCode = binary;
        
        // Actualizar detalles de la segunda pasada
        secondPassDetails.innerHTML = details;
        
        // Actualizar tabla de símbolos con posibles nuevas variables
        updateSymbolTable();
        
        // Mostrar código binario en la interfaz
        binaryCodeDiv.innerHTML = '';
        for (const line of binary) {
            const div = document.createElement('div');
            div.classList.add('binary-line');
            div.innerHTML = `<span class="line-number">${line.lineNumber + 1}:</span> ${line.binaryCode} <span class="line-comment">// ${line.originalLine.trim()}</span>`;
            binaryCodeDiv.appendChild(div);
        }
        
        // Mostrar vista previa del resultado
        outputPreview.innerHTML = binary.slice(0, 10).map(line => line.binaryCode).join('<br>');
        if (binary.length > 10) {
            outputPreview.innerHTML += '<br>...';
        }
        
        // Marcar como completado
        assemblyState.assemblyCompleted = true;
        updateUI();
        
        log(`Segunda pasada completada. Se generaron ${binary.length} instrucciones binarias.`, 'success');
        return true;
    }

    function assemble() {
        resetState();
        
        if (firstPass()) {
            secondPass();
            log('Ensamblado completado con éxito!', 'success');
            
            // Mostrar pestaña de código binario
            showTab('binary');
        }
    }

    // Funciones de UI
    function updateUI() {
        // Habilitar/deshabilitar botones según el estado
        step1Btn.disabled = assemblyState.firstPassCompleted;
        step2Btn.disabled = !assemblyState.firstPassCompleted || assemblyState.assemblyCompleted;
        
        // Actualizar visualización de proceso
        document.querySelectorAll('.step-box').forEach(box => box.classList.remove('active'));
        
        if (assemblyState.currentPass === 1) {
            document.getElementById('first-pass-box').classList.add('active');
        } else if (assemblyState.currentPass === 2) {
            document.getElementById('second-pass-box').classList.add('active');
        }
        
        if (assemblyState.assemblyCompleted) {
            document.getElementById('output-box').classList.add('active');
        }
    }

    function updateSymbolTable() {
        symbolTableBody.innerHTML = '';
        
        // Primero mostrar símbolos predefinidos
        for (const [symbol, address] of Object.entries(PREDEFINED_SYMBOLS)) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${symbol}</td>
                <td>${address}</td>
                <td>Predefinido</td>
            `;
            symbolTableBody.appendChild(row);
        }
        
        // Luego mostrar etiquetas y variables
        for (const [symbol, address] of Object.entries(assemblyState.symbolTable)) {
            // Saltar los predefinidos que ya se mostraron
            if (PREDEFINED_SYMBOLS[symbol] !== undefined) continue;
            
            let type = 'Variable';
            // Si la dirección es menor que la primera dirección de variables (16),
            // entonces es una etiqueta (excepto si es un símbolo predefinido)
            if (address < 16) {
                type = 'Etiqueta';
            }
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${symbol}</td>
                <td>${address}</td>
                <td>${type}</td>
            `;
            symbolTableBody.appendChild(row);
        }
    }

    function log(message, type = 'info') {
        const logEntry = document.createElement('div');
        logEntry.classList.add('log-entry', type);
        logEntry.textContent = message;
        assemblyLog.appendChild(logEntry);
        assemblyLog.scrollTop = assemblyLog.scrollHeight; // Auto-scroll
    }

    function showTab(tabId) {
        // Desactivar todas las pestañas
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Activar la pestaña seleccionada
        document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(`${tabId}-content`).classList.add('active');
    }

    // Event Listeners
    loadExampleBtn.addEventListener('click', () => {
        editor.setValue(EXAMPLE_CODE);
        log('Ejemplo de código cargado.');
        resetState();
    });

    loadFileBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            editor.setValue(event.target.result);
            log(`Archivo "${file.name}" cargado.`);
            resetState();
        };
        reader.onerror = () => {
            log('Error al leer el archivo.', 'error');
        };
        reader.readAsText(file);
    });

    assembleBtn.addEventListener('click', assemble);
    step1Btn.addEventListener('click', firstPass);
    step2Btn.addEventListener('click', secondPass);
    resetBtn.addEventListener('click', resetState);

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            showTab(tabId);
        });
    });

    // Cargar el ejemplo por defecto
    editor.setValue(EXAMPLE_CODE);
    resetState();
    log('Simulador inicializado. Ejemplo de código cargado.');
});