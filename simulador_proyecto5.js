document.addEventListener('DOMContentLoaded', () => {
    // --- Constantes y Estado Global ---
    const SCREEN_BASE_ADDRESS = 16384;
    const KEYBOARD_ADDRESS = 24576;
    const RAM_END_ADDRESS = 16383;
    const SCREEN_END_ADDRESS = 24575;
    const RAM_DISPLAY_SIZE = 16; // Cuántas direcciones mostrar a la vez

    let computer = null;
    let romProgram = [];
    let simulationInterval = null;
    let simulationSpeed = 500; // ms
    let currentRamViewAddress = 0;

    // --- Elementos del DOM ---
    const pcValueEl = document.getElementById('pc-value');
    const aRegValueEl = document.getElementById('a-reg-value');
    const dRegValueEl = document.getElementById('d-reg-value');
    const instructionValueEl = document.getElementById('instruction-value');
    const decodedValueEl = document.getElementById('decoded-value');
    const romListEl = document.getElementById('rom-list');
    const ramDisplayEl = document.getElementById('ram-display');
    const keyboardValueEl = document.getElementById('keyboard-value');
    const keyInputEl = document.getElementById('key-input');
    const screenCanvas = document.getElementById('screen-canvas');
    const screenCtx = screenCanvas.getContext('2d');
    const logOutputEl = document.getElementById('log-output');

    const resetBtn = document.getElementById('reset-btn');
    const stepBtn = document.getElementById('step-btn');
    const runBtn = document.getElementById('run-btn');
    const stopBtn = document.getElementById('stop-btn');
    const speedSlider = document.getElementById('speed-slider');
    const speedValueEl = document.getElementById('speed-value');
    const ramAddressInput = document.getElementById('ram-address');
    const gotoRamBtn = document.getElementById('goto-ram-btn');


    // --- Clases del Simulador (Simplificadas) ---

    // Helper: Conversión Binaria
    function intToBinary16(n) {
        let bin = (n & 0xFFFF).toString(2); // Asegura que sea un número de 16 bits con complemento a dos si es negativo
        while (bin.length < 16) {
            bin = '0' + bin;
        }
        return bin.split('').map(Number); // Array de números
    }

    function binary16ToInt(binArr) {
        if (!binArr || binArr.length !== 16) return 0;
        const binStr = binArr.join('');
        // Interpretar como complemento a dos si el bit más significativo es 1
        if (binStr[0] === '1') {
            // Calcular el valor negativo
            let value = 0;
            for (let i = 0; i < 16; i++) {
                value = (value << 1) | (binStr[i] === '1' ? 1 : 0);
            }
            // Convertir de C2 a decimal negativo
            return value - 65536;
        } else {
            // Convertir directamente a decimal positivo
            return parseInt(binStr, 2);
        }
    }

    class Register {
        constructor() {
            this.value = intToBinary16(0);
            this._nextValue = [...this.value];
        }
        output() { return [...this.value]; }
        clock(inp, load) {
            if (load === 1) {
                this._nextValue = [...inp];
            } else {
                 this._nextValue = [...this.value]; // Mantener valor
            }
        }
        update_state() { this.value = [...this._nextValue]; }
    }

     class PC {
        constructor() {
            this.register = new Register();
        }
        output() { return this.register.output(); }
        clock(inp, load, inc, reset) {
            let nextVal;
            if (reset === 1) {
                nextVal = intToBinary16(0);
                load = 1; // Forzar carga
            } else if (load === 1) {
                nextVal = [...inp];
            } else if (inc === 1) {
                const currentValInt = binary16ToInt(this.register.output());
                nextVal = intToBinary16((currentValInt + 1) & 0xFFFF); // Incrementar y wraparound
                load = 1; // Forzar carga
            } else {
                nextVal = this.register.output(); // Mantener
                load = 0;
            }
            this.register.clock(nextVal, load);
        }
        update_state() { this.register.update_state(); }
    }

    // --- ALU (Muy simplificada - necesita implementación completa) ---
    function ALU(x, y, zx, nx, zy, ny, f, no) {
        // --- ¡Esta es una implementación MUY BÁSICA y necesita ser completada! ---
        let x_val = binary16ToInt(x);
        let y_val = binary16ToInt(y);

        if (zx === 1) x_val = 0;
        if (nx === 1) x_val = ~x_val;
        if (zy === 1) y_val = 0;
        if (ny === 1) y_val = ~y_val;

        let out_val;
        if (f === 1) {
            out_val = x_val + y_val; // Suma
        } else {
            out_val = x_val & y_val; // AND
        }

        if (no === 1) {
            out_val = ~out_val;
        }

        const out = intToBinary16(out_val & 0xFFFF); // Resultado de 16 bits
        const zr = (out_val & 0xFFFF) === 0 ? 1 : 0;
        const ng = out[0] === 1 ? 1 : 0; // Bit más significativo

        return { out, zr, ng };
    }


    // --- Clases de Memoria (Simplificadas) ---
    class RAM16K {
        constructor() { this.memory = new Array(16384).fill(null).map(() => intToBinary16(0)); } // Inicializa con arrays
        read(address) { // address es array binario de 14 bits
             const addrInt = parseInt(address.join(''), 2);
             if (addrInt >= 0 && addrInt < 16384) {
                 // Asegurarse de que siempre devolvemos un array, incluso si algo salió mal
                 return Array.isArray(this.memory[addrInt]) ? [...this.memory[addrInt]] : intToBinary16(0);
             }
             return intToBinary16(0); // Fuera de rango
        }
        clock(inp, load, address) {
             const addrInt = parseInt(address.join(''), 2);
             if (load === 1 && addrInt >= 0 && addrInt < 16384) {
                 // Simular DFF: guardar para el próximo ciclo (simplificado aquí)
                 this.memory[addrInt] = [...inp]; // Asigna una copia del array de entrada
             }
        }
        update_state() { /* En JS simple, la actualización es inmediata */ }
        reset() {
            // Correcto: Iterar y asignar un nuevo array de bits a cada posición
            for (let i = 0; i < this.memory.length; i++) {
                this.memory[i] = intToBinary16(0);
            }
        }
    }

    class Screen {
         constructor() {
             this.memory = new Array(8192).fill(0); // Almacena enteros
             this._needsUpdate = true; // Inicializar como true para dibujar al inicio
         }
         read(address) { // address es entero 0-8191
             if (address >= 0 && address < 8192) return intToBinary16(this.memory[address]);
             return intToBinary16(0);
         }
         clock(inp, load, address) { // address es entero 0-8191
             if (load === 1 && address >= 0 && address < 8192) {
                 this.memory[address] = binary16ToInt(inp);
                 this._needsUpdate = true; // Marcar para redibujar
             }
         }
         update_state() {
             if (this._needsUpdate) {
                 drawScreen(); // Activar la función de dibujo si hubo cambios
                 this._needsUpdate = false;
             }
         }
         reset() {
             this.memory.fill(0);
             this._needsUpdate = true;
             // Asegurarse de que el canvas se limpie visualmente en reset
             if (screenCtx) {
                 screenCtx.fillStyle = 'white';
                 screenCtx.fillRect(0, 0, screenCanvas.width, screenCanvas.height);
             }
         }
    }

     class Keyboard {
        constructor() { this.key_pressed = 0; }
        read() { return intToBinary16(this.key_pressed); }
        set_key(key_code) { this.key_pressed = key_code; }
        reset() { this.key_pressed = 0; }
    }

    class Memory {
        constructor() {
            this.ram = new RAM16K();
            this.screen = new Screen();
            this.keyboard = new Keyboard();
        }
        read(address) { // address es array binario de 16 bits
            const addrInt = binary16ToInt(address);
            if (addrInt >= 0 && addrInt <= RAM_END_ADDRESS) {
                return this.ram.read(address.slice(-14)); // Usa los últimos 14 bits
            } else if (addrInt >= SCREEN_BASE_ADDRESS && addrInt <= SCREEN_END_ADDRESS) {
                return this.screen.read(addrInt - SCREEN_BASE_ADDRESS);
            } else if (addrInt === KEYBOARD_ADDRESS) {
                return this.keyboard.read();
            }
            // Comentado o eliminado para evitar errores si se accede fuera de rango durante la simulación normal
            // log(`Error: Lectura de memoria fuera de rango: ${addrInt}`);
            return intToBinary16(0); // Devuelve 0 si está fuera de rango conocido
        }
        clock(inp, load, address) {
            const addrInt = binary16ToInt(address);
             if (addrInt >= 0 && addrInt <= RAM_END_ADDRESS) {
                this.ram.clock(inp, load, address.slice(-14));
            } else if (addrInt >= SCREEN_BASE_ADDRESS && addrInt <= SCREEN_END_ADDRESS) {
                this.screen.clock(inp, load, addrInt - SCREEN_BASE_ADDRESS);
            }
            // Keyboard es solo lectura
        }
        update_state() {
            this.ram.update_state();
            this.screen.update_state();
        }
        reset() {
            this.ram.reset();
            this.screen.reset();
            this.keyboard.reset();
        }
    }

    class ROM32K {
        constructor() { this.memory = new Array(32768).fill(null).map(() => intToBinary16(0)); } // Inicializa con arrays
        read(address) { // address es array binario de 16 bits
            const addrInt = binary16ToInt(address);
            if (addrInt >= 0 && addrInt < 32768) {
                 // Asegurarse de que siempre devolvemos un array
                 return Array.isArray(this.memory[addrInt]) ? [...this.memory[addrInt]] : intToBinary16(0);
            }
             // Comentado o eliminado para evitar errores si se accede fuera de rango
             // log(`Error: Lectura de ROM fuera de rango: ${addrInt}`);
            return intToBinary16(0); // Instrucción NOP o error
        }
        load_program(program) {
            program.forEach((instr, i) => {
                if (i < 32768) this.memory[i] = [...instr];
            });
        }
    }

     // --- CPU (Simplificada - necesita implementación completa de clock) ---
    class CPU {
        constructor() {
            this.a_register = new Register();
            this.d_register = new Register();
            this.pc = new PC();
            this._next_state = {}; // Para almacenar valores intermedios
        }

        decode_c_instruction(instruction) {
             return {
                a: instruction[3],
                c: instruction.slice(4, 10),
                dest: instruction.slice(10, 13),
                jump: instruction.slice(13, 16)
            };
        }

        clock(inM, instruction, reset) {
            const a_value = this.a_register.output();
            const d_value = this.d_register.output();
            const is_a_instruction = instruction[0] === 0;

            this._next_state = { // Resetear estado intermedio
                 pc_in: a_value, // Valor por defecto para saltos
                 addressM: a_value, // Dirección de memoria siempre es A
                 reset: reset
            };

            if (is_a_instruction) {
                this._next_state.load_a = 1;
                this._next_state.a_in = [...instruction];
                this._next_state.load_d = 0;
                this._next_state.writeM = 0;
                this._next_state.pc_load = 0;
                this._next_state.pc_inc = 1;
            } else { // Instrucción C
                const c_parts = this.decode_c_instruction(instruction);
                const x = d_value; // Siempre D
                const y = (c_parts.a === 1) ? inM : a_value; // M o A

                const zx = c_parts.c[0], nx = c_parts.c[1], zy = c_parts.c[2];
                const ny = c_parts.c[3], f = c_parts.c[4], no = c_parts.c[5];

                const { out: alu_out, zr, ng } = ALU(x, y, zx, nx, zy, ny, f, no);

                const dest = c_parts.dest;
                this._next_state.load_a = dest[0];
                this._next_state.load_d = dest[1];
                this._next_state.writeM = dest[2];

                this._next_state.a_in = (dest[0] === 1) ? [...alu_out] : [...a_value]; // Cargar A si dest[0]=1
                this._next_state.d_in = [...alu_out]; // Siempre disponible para D
                this._next_state.outM = [...alu_out]; // Salida para M

                const jump = c_parts.jump;
                const j1 = jump[0], j2 = jump[1], j3 = jump[2];
                const jump_condition = (j1 === 1 && ng === 1) || (j2 === 1 && zr === 1) || (j3 === 1 && ng === 0 && zr === 0);

                this._next_state.pc_load = jump_condition ? 1 : 0;
                this._next_state.pc_inc = jump_condition ? 0 : 1;
            }
        }

        update_state() {
            // Actualizar registros basados en _next_state
            this.a_register.clock(this._next_state.a_in || intToBinary16(0), this._next_state.load_a || 0);
            this.d_register.clock(this._next_state.d_in || intToBinary16(0), this._next_state.load_d || 0);

            this.pc.clock(
                this._next_state.pc_in,
                this._next_state.pc_load,
                this._next_state.pc_inc,
                this._next_state.reset
            );

            // Actualizar estado interno de los registros
            this.a_register.update_state();
            this.d_register.update_state();
            this.pc.update_state();

            // Retornar salidas
            return {
                outM: this._next_state.outM || intToBinary16(0),
                writeM: this._next_state.writeM || 0,
                addressM: this._next_state.addressM,
                pc: this.pc.output()
            };
        }
        reset() {
             this.a_register.clock(intToBinary16(0), 1); this.a_register.update_state();
             this.d_register.clock(intToBinary16(0), 1); this.d_register.update_state();
             this.pc.clock(intToBinary16(0), 0, 0, 1); this.pc.update_state(); // Reset PC
        }
    }

    class Computer {
        constructor() {
            this.cpu = new CPU();
            this.memory = new Memory();
            this.rom = new ROM32K();
        }
        load_program(program) {
            this.rom.load_program(program);
            updateRomView(); // Actualizar vista de la ROM
        }
        clock_cycle(reset = 0) {
            const pc_value = this.cpu.pc.output();
            const instruction = this.rom.read(pc_value);
            const address_m_bin = this.cpu.a_register.output(); // Dirección M es el valor actual de A
            const in_m = this.memory.read(address_m_bin);

            this.cpu.clock(in_m, instruction, reset);
            const cpuOutputs = this.cpu.update_state();

            this.memory.clock(cpuOutputs.outM, cpuOutputs.writeM, cpuOutputs.addressM);
            this.memory.update_state();

            return {
                pc: cpuOutputs.pc,
                instruction: instruction,
                address_m: cpuOutputs.addressM,
                out_m: cpuOutputs.outM,
                write_m: cpuOutputs.writeM,
                a_reg: this.cpu.a_register.output(),
                d_reg: this.cpu.d_register.output(),
            };
        }
         reset() {
             this.cpu.reset();
             this.memory.reset();
             // ROM no se resetea, solo se recarga el programa si es necesario
             log("Computer Reset");
             updateUI();
             drawScreen(); // Limpiar pantalla visual
         }
    }

    // --- Funciones de Ensamblaje (JS) ---
    function assemble_a_instruction(value) {
        if (typeof value !== 'number' || value < 0 || value > 32767) {
            throw new Error(`Valor inválido para instrucción A: ${value}`);
        }
        return [0, ...intToBinary16(value).slice(1)];
    }

    function assemble_c_instruction(dest, comp, jump) {
        const dest_codes = { null: '000', '': '000', M: '001', D: '010', MD: '011', A: '100', AM: '101', AD: '110', AMD: '111' };
        const comp_codes = { // Asegúrate de que estos coincidan con tu Python
            '0': '0101010', '1': '0111111', '-1': '0111010', 'D': '0001100', 'A': '0110000', 'M': '1110000',
            '!D': '0001101', '!A': '0110001', '!M': '1110001', '-D': '0001111', '-A': '0110011', '-M': '1110011',
            'D+1': '0011111', 'A+1': '0110111', 'M+1': '1110111', 'D-1': '0001110', 'A-1': '0110010', 'M-1': '1110010',
            'D+A': '0000010', 'D+M': '1000010', 'D-A': '0010011', 'D-M': '1010011', 'A-D': '0000111', 'M-D': '1000111',
            'D&A': '0000000', 'D&M': '1000000', 'D|A': '0010101', 'D|M': '1010101'
        };
        const jump_codes = { null: '000', '': '000', JGT: '001', JEQ: '010', JGE: '011', JLT: '100', JNE: '101', JLE: '110', JMP: '111' };

        const dest_code = dest_codes[dest];
        const comp_code = comp_codes[comp];
        const jump_code = jump_codes[jump];

        if (!dest_code || !comp_code || !jump_code) {
            throw new Error(`Instrucción C inválida: dest=${dest}, comp=${comp}, jump=${jump}`);
        }
        const instruction_str = '111' + comp_code + dest_code + jump_code;
        return instruction_str.split('').map(Number);
    }

    function create_test_program() {
        // Reimplementación de create_test_program de Python
        let program = [];
        try {
            program.push(assemble_a_instruction(0));    // @0
            program.push(assemble_c_instruction('M', '0', null)); // M=0
            program.push(assemble_a_instruction(1));    // @1
            program.push(assemble_c_instruction('M', '1', null)); // M=1
            program.push(assemble_a_instruction(5));    // @5
            program.push(assemble_c_instruction('D', 'A', null)); // D=A
            program.push(assemble_a_instruction(2));    // @2
            program.push(assemble_c_instruction('M', 'D', null)); // M=D (R2=5)
            // LOOP (address 8)
            program.push(assemble_a_instruction(0));    // @0
            program.push(assemble_c_instruction('D', 'M', null)); // D=M (D=R0)
            program.push(assemble_a_instruction(1));    // @1
            program.push(assemble_c_instruction('D', 'D+M', null)); // D=D+M (D=R0+R1)
            program.push(assemble_a_instruction(0));    // @0
            program.push(assemble_c_instruction('M', 'D', null)); // M=D (R0=D)
            // R1 = R1 + 1 (address 14)
            program.push(assemble_a_instruction(1));    // @1
            program.push(assemble_c_instruction('M', 'M+1', null)); // M=M+1
            // if R1 <= R2 goto LOOP (address 16)
            program.push(assemble_a_instruction(1));    // @1
            program.push(assemble_c_instruction('D', 'M', null)); // D=M (D=R1)
            program.push(assemble_a_instruction(2));    // @2
            program.push(assemble_c_instruction('D', 'M-D', null)); // D=M-D (D=R2-R1)
            program.push(assemble_a_instruction(8));    // @8 (LOOP address)
            program.push(assemble_c_instruction(null, 'D', 'JGE')); // if D>=0 (R2>=R1) goto LOOP
            // END (address 22)
            program.push(assemble_a_instruction(22));   // @22
            program.push(assemble_c_instruction(null, '0', 'JMP')); // 0;JMP (Infinite loop)
        } catch (e) {
            log(`Error creando programa de prueba: ${e.message}`);
            return [];
        }
        return program;
    }

     // --- Funciones de UI ---
    function log(message) {
        logOutputEl.textContent += message + '\n';
        logOutputEl.scrollTop = logOutputEl.scrollHeight; // Auto-scroll
    }

    function updateUI(state) {
        if (!computer) return;
        state = state || { // Obtener estado actual si no se pasa
             pc: computer.cpu.pc.output(),
             instruction: computer.rom.read(computer.cpu.pc.output()),
             a_reg: computer.cpu.a_register.output(),
             d_reg: computer.cpu.d_register.output(),
        };

        const pcInt = binary16ToInt(state.pc);
        pcValueEl.textContent = pcInt;
        aRegValueEl.textContent = binary16ToInt(state.a_reg);
        dRegValueEl.textContent = binary16ToInt(state.d_reg);
        instructionValueEl.textContent = `[${state.instruction.join('')}]`;
        decodedValueEl.textContent = decodeInstructionForDisplay(state.instruction);
        keyboardValueEl.textContent = binary16ToInt(computer.memory.keyboard.read());

        // Actualizar vista ROM y resaltar PC
        const romItems = romListEl.getElementsByTagName('li');
        for (let i = 0; i < romItems.length; i++) {
            romItems[i].classList.remove('active');
            if (i === pcInt) {
                romItems[i].classList.add('active');
                // Scroll ROM view if needed
                romItems[i].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }

        updateRamView();
        // drawScreen(); // Llamar a la función de dibujo de pantalla
    }

     function updateRomView() {
        romListEl.innerHTML = ''; // Limpiar vista
        romProgram.forEach((instr, index) => {
            const li = document.createElement('li');
            li.textContent = `${index.toString().padStart(5, ' ')}: ${instr.join('')}`;
            romListEl.appendChild(li);
        });
    }

     function updateRamView() {
         if (!computer) return;
         ramDisplayEl.innerHTML = ''; // Limpiar
         const startAddr = Math.max(0, currentRamViewAddress);
         const endAddr = Math.min(RAM_END_ADDRESS, startAddr + RAM_DISPLAY_SIZE - 1);

         for (let addr = startAddr; addr <= endAddr; addr++) {
             const value = computer.memory.read(intToBinary16(addr));
             const div = document.createElement('div');
             div.textContent = `RAM[${addr.toString().padStart(5, ' ')}] = ${binary16ToInt(value).toString().padStart(6, ' ')} [${value.join('')}]`;
             ramDisplayEl.appendChild(div);
         }
     }

     function decodeInstructionForDisplay(instruction) {
         if (instruction[0] === 0) { // Instrucción A
             const value = binary16ToInt(instruction);
             return `@${value}`;
         } else { // Instrucción C
             // --- ¡Esta es una decodificación MUY BÁSICA! Necesita mapeo inverso completo ---
             const compMap = { '0101010': '0', '0111111': '1', '0111010': '-1', '0001100': 'D', '0110000': 'A', '1110000': 'M', /* ... agregar más ... */ };
             const destMap = { '000': '', '001': 'M=', '010': 'D=', '011': 'MD=', '100': 'A=', '101': 'AM=', '110': 'AD=', '111': 'AMD=' };
             const jumpMap = { '000': '', '001': ';JGT', '010': ';JEQ', '011': ';JGE', '100': ';JLT', '101': ';JNE', '110': ';JLE', '111': ';JMP' };

             const compBits = instruction.slice(4, 10).join('');
             const destBits = instruction.slice(10, 13).join('');
             const jumpBits = instruction.slice(13, 16).join('');

             const compStr = compMap[compBits] || `comp?(${compBits})`;
             const destStr = destMap[destBits] || '';
             const jumpStr = jumpMap[jumpBits] || '';

             return `${destStr}${compStr}${jumpStr}`;
         }
     }

     function drawScreen() {
         if (!computer) return;
         
         // Limpiar canvas
         screenCtx.fillStyle = 'white';
         screenCtx.fillRect(0, 0, screenCanvas.width, screenCanvas.height);
         screenCtx.fillStyle = 'black';
         
         // Constantes para dibujo optimizado
         const pixelWidth = screenCanvas.width / 512;
         const pixelHeight = screenCanvas.height / 256;

         // Recorrer cada palabra de memoria de la pantalla
         for (let addrOffset = 0; addrOffset < 8192; addrOffset++) {
             const word = computer.memory.screen.memory[addrOffset];
             if (word === 0) continue; // Optimización: omitir palabras vacías (blanco)
             
             // Calcular fila y columna inicial para esta palabra
             const y = Math.floor(addrOffset / 32); // 512 pixels / 16 bits = 32 palabras por fila
             const wordX = (addrOffset % 32) * 16; // Cada palabra tiene 16 bits
             
             // Procesar cada bit en la palabra (16 bits)
             for (let bit = 0; bit < 16; bit++) {
                 if ((word & (1 << bit)) !== 0) {
                     // Convertir bit a coordenada X (los bits se cuentan de derecha a izquierda)
                     const x = wordX + (15 - bit);
                     
                     // Dibujar el pixel (optimizado para no dibujar fuera del canvas)
                     if (x < 512 && y < 256) {
                         screenCtx.fillRect(
                             x * pixelWidth, 
                             y * pixelHeight, 
                             pixelWidth, 
                             pixelHeight
                         );
                     }
                 }
             }
         }
         
         // Eliminar la nota que decía que la visualización requiere implementación
         const noteElement = document.querySelector('.screen-view .note');
         if (noteElement) noteElement.textContent = 'Pantalla actualizada';
     }


    // --- Control de Simulación ---
    function doStep() {
        if (!computer) return;
        try {
            const state = computer.clock_cycle();
            updateUI(state);
            log(`Ciclo completado. PC=${binary16ToInt(state.pc)}`);
        } catch (e) {
            log(`Error en ciclo: ${e.message}`);
            stopSimulation();
        }
    }

    function runSimulation() {
        if (simulationInterval) return; // Ya está corriendo
        runBtn.disabled = true;
        stepBtn.disabled = true;
        stopBtn.disabled = false;
        resetBtn.disabled = true;

        simulationInterval = setInterval(() => {
            doStep();
            // Podríamos añadir una condición de parada aquí si el PC no cambia
        }, simulationSpeed);
        log(`Simulación iniciada (velocidad: ${simulationSpeed}ms)`);
    }

    function stopSimulation() {
        if (!simulationInterval) return;
        clearInterval(simulationInterval);
        simulationInterval = null;
        runBtn.disabled = false;
        stepBtn.disabled = false;
        stopBtn.disabled = true;
        resetBtn.disabled = false;
        log("Simulación detenida.");
    }

    function resetSimulation() {
        stopSimulation();
        logOutputEl.textContent = ''; // Limpiar log primero
        computer = new Computer(); // Crear nueva instancia
        romProgram = create_test_program();
        if (romProgram.length === 0) {
             log("Error: No se pudo cargar el programa de prueba.");
             return; // Detener si el programa no se cargó
        }
        computer.load_program(romProgram);
        computer.reset(); // Resetear estado interno
        log("Computadora inicializada y programa de prueba cargado.");
        currentRamViewAddress = 0; // Resetear vista RAM
        ramAddressInput.value = 0;
        updateUI(); // Actualizar UI al estado inicial
        drawScreen(); // Dibujar pantalla inicial (limpia)
        
        // Añadir mensaje sobre la pantalla
        log("Pantalla inicializada. Se actualizará automáticamente cuando cambie.");
    }

    // --- Event Listeners ---
    resetBtn.addEventListener('click', resetSimulation);
    stepBtn.addEventListener('click', doStep);
    runBtn.addEventListener('click', runSimulation);
    stopBtn.addEventListener('click', stopSimulation);

    speedSlider.addEventListener('input', (e) => {
        simulationSpeed = parseInt(e.target.value);
        speedValueEl.textContent = `${simulationSpeed} ms`;
        if (simulationInterval) { // Si está corriendo, reiniciar con nueva velocidad
            stopSimulation();
            runSimulation();
        }
    });

     gotoRamBtn.addEventListener('click', () => {
         const addr = parseInt(ramAddressInput.value);
         if (!isNaN(addr) && addr >= 0 && addr <= RAM_END_ADDRESS) {
             currentRamViewAddress = addr;
             updateRamView();
         } else {
             alert("Dirección RAM inválida.");
         }
     });

     keyInputEl.addEventListener('keyup', (e) => {
         if (computer) {
             let keyCode = 0;
             if (e.target.value.length > 0) {
                 keyCode = e.target.value.charCodeAt(0);
             }
             computer.memory.keyboard.set_key(keyCode);
             keyboardValueEl.textContent = keyCode; // Actualizar UI inmediatamente
             // Limpiar input después de un tiempo para simular presión momentánea
             setTimeout(() => {
                 if (computer && computer.memory.keyboard.key_pressed === keyCode) {
                      computer.memory.keyboard.set_key(0);
                      keyboardValueEl.textContent = 0;
                      e.target.value = '';
                 }
             }, 500); // Mantener presionado por 500ms
         }
     });


    // --- Inicialización ---
    resetSimulation(); // Inicializar al cargar la página

    // Agregar botón para dibujar un patrón simple en la pantalla como demostración
    const demoScreenBtn = document.createElement('button');
    demoScreenBtn.textContent = 'Demo Pantalla';
    demoScreenBtn.style.marginLeft = '10px';
    
    demoScreenBtn.addEventListener('click', () => {
        if (!computer) return;
        
        // Dibujar un patrón simple (un rectángulo y una diagonal)
        log("Dibujando patrón de demostración en la pantalla...");
        
        // Rectángulo en la esquina superior izquierda
        for (let i = 100; i < 150; i++) {
            for (let j = 5; j < 30; j++) {
                const addr = Math.floor(i / 16) + (j * 32);
                const bit = i % 16;
                const bitMask = 1 << (15 - bit); // Los bits van de izquierda a derecha
                computer.memory.screen.memory[addr] |= bitMask;
            }
        }
        
        // Línea diagonal
        for (let i = 0; i < 100; i++) {
            const addr = Math.floor(i / 16) + (i * 32);
            const bit = i % 16;
            const bitMask = 1 << (15 - bit);
            computer.memory.screen.memory[addr] |= bitMask;
        }
        
        computer.memory.screen._needsUpdate = true;
        computer.memory.screen.update_state();
        log("Patrón de demostración dibujado. La pantalla se ha actualizado.");
    });
    
    // Añadir el botón a la interfaz junto a los controles existentes
    document.querySelector('.controls').appendChild(demoScreenBtn);

});
