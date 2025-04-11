# proyecto5.py
# Implementación del Proyecto 5 de Nand to Tetris en Python - Computadora Hack

# Importar las funciones y componentes necesarios de proyectos anteriores
from proyecto1 import MUX16, NOT16, AND16, OR16, OR, AND, NOT
from proyecto2 import Add16, Inc16, ALU
from proyecto3 import Register, PC, RAM16K
from proyecto4 import int_to_binary16, binary16_to_int

# --- Constantes para el mapa de memoria ---
SCREEN_BASE_ADDRESS = 16384  # 0x4000
KEYBOARD_ADDRESS = 24576     # 0x6000
RAM_END_ADDRESS = 16383      # 0x3FFF
SCREEN_END_ADDRESS = 24575   # 0x5FFF

class Screen:
    """
    Simula la memoria de la pantalla (8192 registros de 16 bits cada uno).
    En la arquitectura Hack, está mapeada desde la dirección 16384 (0x4000) hasta la 24575 (0x5FFF).
    """
    def __init__(self):
        self.memory = [0] * 8192  # 8K palabras de 16 bits

    def read(self, address):
        """Lee el valor en la dirección especificada."""
        if 0 <= address < 8192:
            return int_to_binary16(self.memory[address])
        raise ValueError(f"Dirección fuera de rango: {address}")

    def clock(self, inp, load, address):
        """Procesa un ciclo de reloj para la pantalla."""
        if load == 1 and 0 <= address < 8192:
            # Guardamos el valor para aplicarlo en update_state
            self._next_address = address
            self._next_value = binary16_to_int(inp)
            self._do_update = True
        else:
            self._do_update = False

    def update_state(self):
        """Actualiza el estado de la memoria de pantalla."""
        if getattr(self, '_do_update', False):
            self.memory[self._next_address] = self._next_value
            self._do_update = False

class Keyboard:
    """
    Simula el registro del teclado.
    En la arquitectura Hack, está mapeado a la dirección 24576 (0x6000).
    """
    def __init__(self):
        self.key_pressed = 0  # Ninguna tecla presionada inicialmente

    def read(self):
        """Retorna el código de la tecla actualmente presionada o 0 si no hay ninguna."""
        return int_to_binary16(self.key_pressed)

    def set_key(self, key_code):
        """Actualiza el código de tecla presionada."""
        self.key_pressed = key_code

    # Nota: El teclado no tiene método clock() ni update_state() porque es solo lectura

class Memory:
    """
    Implementa el mapa de memoria completo de la computadora Hack.
    Integra RAM16K, Screen y Keyboard en un único espacio de direcciones.
    """
    def __init__(self):
        self.ram = RAM16K()
        self.screen = Screen()
        self.keyboard = Keyboard()

    def read(self, address):
        """
        Lee el valor de la memoria en la dirección especificada.
        address es un entero (no binario) para simplificar el acceso.
        """
        # Convertir address a un entero para facilitar las comparaciones
        addr_int = address if isinstance(address, int) else binary16_to_int(address)

        # Direccionar al componente correcto según el rango de dirección
        if 0 <= addr_int <= RAM_END_ADDRESS:  # RAM: 0x0000-0x3FFF
            # Convertir la dirección a formato binario de 14 bits para RAM16K
            addr_bin = int_to_binary16(addr_int)[-14:]
            return self.ram.read(addr_bin)
        elif SCREEN_BASE_ADDRESS <= addr_int <= SCREEN_END_ADDRESS:  # Screen: 0x4000-0x5FFF
            # Ajustar dirección relativa a la pantalla (0-8191)
            screen_addr = addr_int - SCREEN_BASE_ADDRESS
            return self.screen.read(screen_addr)
        elif addr_int == KEYBOARD_ADDRESS:  # Keyboard: 0x6000
            return self.keyboard.read()
        else:
            raise ValueError(f"Dirección fuera del rango de memoria: {addr_int}")

    def clock(self, inp, load, address):
        """
        Simula un ciclo de reloj para la memoria.
        Dirige la operación al componente adecuado según la dirección.
        """
        # Convertir address a un entero para facilitar las comparaciones
        addr_int = address if isinstance(address, int) else binary16_to_int(address)

        # Direccionar al componente correcto según el rango de dirección
        if 0 <= addr_int <= RAM_END_ADDRESS:  # RAM: 0x0000-0x3FFF
            # Convertir la dirección a formato binario de 14 bits para RAM16K
            addr_bin = int_to_binary16(addr_int)[-14:]
            self.ram.clock(inp, load, addr_bin)
        elif SCREEN_BASE_ADDRESS <= addr_int <= SCREEN_END_ADDRESS:  # Screen: 0x4000-0x5FFF
            # Ajustar dirección relativa a la pantalla (0-8191)
            screen_addr = addr_int - SCREEN_BASE_ADDRESS
            self.screen.clock(inp, load, screen_addr)
        # El teclado es solo lectura, no se procesa en clock()

    def update_state(self):
        """Actualiza el estado de todos los componentes de memoria."""
        self.ram.update_state()
        self.screen.update_state()
        # El teclado no tiene estado que actualizar

class CPU:
    """
    Implementa la Unidad Central de Procesamiento (CPU) de la computadora Hack.
    Procesa instrucciones de 16 bits y las ejecuta según la arquitectura definida.
    """
    def __init__(self):
        # Registros internos
        self.a_register = Register()  # Registro A (dirección/valor)
        self.d_register = Register()  # Registro D (datos)
        self.pc = PC()                # Contador de programa

        # Estado para actualización
        self._next_state = {}

    def _decode_c_instruction(self, instruction):
        """Decodifica una instrucción tipo C."""
        # Los bits de la instrucción C están basados en el formato descrito en el libro
        # instruction[0] = 1 (porque es instrucción C)
        # instruction[1:3] no se usan (siempre son 1)
        # instruction[3:10] son los bits 'comp' (a, c1-c6)
        # instruction[10:13] son los bits 'dest' (d1-d3)
        # instruction[13:16] son los bits 'jump' (j1-j3)
        
        # Extracción de partes de la instrucción
        a_bit = instruction[3]
        c_bits = instruction[4:10]  # c1-c6
        d_bits = instruction[10:13]  # d1-d3
        j_bits = instruction[13:16]  # j1-j3
        
        return {
            'a': a_bit,
            'c': c_bits,
            'dest': d_bits,
            'jump': j_bits
        }

    def clock(self, inM, instruction, reset):
        """
        Simula un ciclo de reloj para la CPU.
        
        Parámetros:
        inM -- Valor de 16 bits leído de la memoria en la dirección A
        instruction -- Instrucción actual de 16 bits de la ROM
        reset -- Señal de reset (1 = resetear el PC a 0)
        
        Retorna un diccionario con las siguientes salidas:
        outM -- Valor a escribir en la memoria
        writeM -- Señal para escribir en la memoria (1 = escribir)
        addressM -- Dirección de memoria para lectura/escritura
        pc -- Nueva dirección del contador de programa
        """
        # Valores actuales de los registros
        a_value = self.a_register.output()
        d_value = self.d_register.output()
        
        # Determinar si es una instrucción A o C
        is_a_instruction = instruction[0] == 0
        
        # --- Procesamiento de instrucción A ---
        if is_a_instruction:
            # Instrucción A: Cargar valor en el registro A
            self._next_state['load_a'] = 1
            self._next_state['a_in'] = instruction
            self._next_state['load_d'] = 0
            self._next_state['writeM'] = 0
            
            # El PC siempre se incrementa para una instrucción A
            self._next_state['pc_load'] = 0
            self._next_state['pc_inc'] = 1
        
        # --- Procesamiento de instrucción C ---
        else:
            # Decodificar la instrucción C
            c_parts = self._decode_c_instruction(instruction)
            
            # Determinar las entradas x, y para la ALU
            x = d_value  # Siempre es el registro D
            y = inM if c_parts['a'] == 1 else a_value  # Memoria o registro A según bit 'a'
            
            # Bits de control para la ALU desde los bits comp
            zx = c_parts['c'][0]
            nx = c_parts['c'][1]
            zy = c_parts['c'][2]
            ny = c_parts['c'][3]
            f = c_parts['c'][4]
            no = c_parts['c'][5]
            
            # Ejecutar la ALU
            alu_out, zr, ng = ALU(x, y, zx, nx, zy, ny, f, no)
            
            # Determinar destino de la salida de la ALU
            dest = c_parts['dest']
            self._next_state['load_a'] = dest[0]  # d1 (A)
            self._next_state['load_d'] = dest[1]  # d2 (D)
            self._next_state['writeM'] = dest[2]  # d3 (M)
            
            # Guardar los valores a cargar en los registros
            self._next_state['a_in'] = alu_out if dest[0] == 1 else a_value
            self._next_state['d_in'] = alu_out
            self._next_state['outM'] = alu_out
            
            # Determinar si se debe realizar un salto
            jump = c_parts['jump']
            j1, j2, j3 = jump[0], jump[1], jump[2]
            
            # Lógica de salto según las condiciones:
            # j1 (salto si es negativo), j2 (salto si es cero), j3 (salto si es positivo)
            jump_condition = (j1 and ng) or (j2 and zr) or (j3 and not ng and not zr)
            
            # Configurar el PC según la condición de salto
            self._next_state['pc_load'] = jump_condition
            self._next_state['pc_inc'] = not jump_condition
        
        # Guardar la dirección actual del registro A para referencia en memoria
        self._next_state['addressM'] = a_value
        
        # Configurar el valor del PC
        self._next_state['pc_in'] = a_value

        # Señal de reset siempre tiene prioridad máxima
        self._next_state['reset'] = reset

    def update_state(self):
        """Actualiza el estado de todos los componentes de la CPU."""
        # Actualizar el registro A
        if self._next_state.get('load_a', 0) == 1:
            self.a_register.clock(self._next_state['a_in'], 1)
        else:
            self.a_register.clock([0]*16, 0)  # No cargar
        
        # Actualizar el registro D
        if self._next_state.get('load_d', 0) == 1:
            self.d_register.clock(self._next_state['d_in'], 1)
        else:
            self.d_register.clock([0]*16, 0)  # No cargar
        
        # Actualizar el PC
        self.pc.clock(
            self._next_state['pc_in'],
            self._next_state.get('pc_load', 0),
            self._next_state.get('pc_inc', 1),
            self._next_state.get('reset', 0)
        )
        
        # Actualizar los registros internos
        self.a_register.update_state()
        self.d_register.update_state()
        self.pc.update_state()
        
        # Retornar las salidas relevantes
        outputs = {
            'outM': self._next_state.get('outM', [0]*16),
            'writeM': self._next_state.get('writeM', 0),
            'addressM': self._next_state['addressM'],
            'pc': self.pc.output()
        }
        
        return outputs

class ROM32K:
    """
    Simula la memoria ROM de 32K palabras que contiene el programa.
    En la arquitectura Hack, cada palabra es una instrucción de 16 bits.
    """
    def __init__(self):
        self.memory = [[0] * 16 for _ in range(32768)]  # Inicializar con 32K instrucciones vacías

    def read(self, address):
        """Lee la instrucción en la dirección especificada."""
        addr_int = address if isinstance(address, int) else binary16_to_int(address)
        if 0 <= addr_int < 32768:
            return self.memory[addr_int]
        raise ValueError(f"Dirección fuera de rango para ROM: {addr_int}")

    def load_program(self, program):
        """
        Carga un programa en la ROM.
        El programa es una lista de instrucciones de 16 bits (en formato lista de 0s y 1s).
        """
        for i, instruction in enumerate(program):
            if i < 32768:  # Asegurar que no excedemos el tamaño de la ROM
                self.memory[i] = instruction

class Computer:
    """
    Implementa la computadora Hack completa integrando CPU, Memory y ROM32K.
    """
    def __init__(self):
        self.cpu = CPU()
        self.memory = Memory()
        self.rom = ROM32K()

    def load_program(self, program):
        """Carga un programa en la ROM de la computadora."""
        self.rom.load_program(program)

    def clock_cycle(self, reset=0):
        """
        Ejecuta un ciclo completo de la computadora.
        
        Parámetros:
        reset -- Señal de reset (1 = resetear el PC a 0)
        """
        # Obtener la instrucción actual desde la ROM usando el valor del PC
        pc_value = self.cpu.pc.output()
        instruction = self.rom.read(pc_value)
        
        # Obtener el valor de memoria en la dirección contenida en el registro A
        address_m = self.cpu.a_register.output()
        in_m = self.memory.read(address_m)
        
        # Ejecutar un ciclo de la CPU
        self.cpu.clock(in_m, instruction, reset)
        outputs = self.cpu.update_state()
        
        # Actualizar la memoria según las salidas de la CPU
        self.memory.clock(outputs['outM'], outputs['writeM'], outputs['addressM'])
        self.memory.update_state()
        
        return {
            'pc': outputs['pc'],
            'instruction': instruction,
            'address_m': outputs['addressM'],
            'out_m': outputs['outM'],
            'write_m': outputs['writeM']
        }

    def run(self, cycles=1000, reset=1):
        """
        Ejecuta la computadora durante un número determinado de ciclos.
        
        Parámetros:
        cycles -- Número de ciclos a ejecutar
        reset -- Si es True, resetea el PC al inicio
        
        Retorna:
        Diccionario con el estado final
        """
        # Resetear la CPU en el primer ciclo si se especifica
        first_cycle = reset
        
        # Ejecutar los ciclos
        for i in range(cycles):
            state = self.clock_cycle(1 if first_cycle else 0)
            first_cycle = False
            
            # Opcional: añadir alguna lógica de terminación o depuración aquí
            
        return state

    def set_key(self, key_code):
        """Establece el código de tecla presionada en el teclado."""
        self.memory.keyboard.set_key(key_code)

# --- Funciones de prueba y utilidades ---

def assemble_a_instruction(value):
    """
    Convierte un valor numérico o una etiqueta en una instrucción A.
    Retorna la instrucción como una lista de 16 bits.
    """
    # Valor debe ser un entero entre 0 y 32767
    if not isinstance(value, int) or value < 0 or value > 32767:
        raise ValueError(f"Valor inválido para instrucción A: {value}")
    
    # El bit más significativo es 0 para instrucciones A
    instruction = [0] + int_to_binary16(value)[1:]
    return instruction

def assemble_c_instruction(dest=None, comp=None, jump=None):
    """
    Crea una instrucción C basada en los códigos de dest, comp y jump.
    Retorna la instrucción como una lista de 16 bits.
    """
    # Códigos de destino (dest)
    dest_codes = {
        None: '000', '': '000',
        'M': '001', 'D': '010', 'MD': '011',
        'A': '100', 'AM': '101', 'AD': '110', 'AMD': '111'
    }
    
    # Códigos de computación (comp)
    comp_codes = {
        '0': '0101010', '1': '0111111', '-1': '0111010',
        'D': '0001100', 'A': '0110000', 'M': '1110000',
        '!D': '0001101', '!A': '0110001', '!M': '1110001',
        '-D': '0001111', '-A': '0110011', '-M': '1110011',
        'D+1': '0011111', 'A+1': '0110111', 'M+1': '1110111',
        'D-1': '0001110', 'A-1': '0110010', 'M-1': '1110010',
        'D+A': '0000010', 'D+M': '1000010',
        'D-A': '0010011', 'D-M': '1010011',
        'A-D': '0000111', 'M-D': '1000111',
        'D&A': '0000000', 'D&M': '1000000',
        'D|A': '0010101', 'D|M': '1010101'
    }
    
    # Códigos de salto (jump)
    jump_codes = {
        None: '000', '': '000',
        'JGT': '001', 'JEQ': '010', 'JGE': '011',
        'JLT': '100', 'JNE': '101', 'JLE': '110', 'JMP': '111'
    }
    
    # Verificar que los códigos son válidos
    if dest not in dest_codes:
        raise ValueError(f"Código de destino inválido: {dest}")
    if comp not in comp_codes:
        raise ValueError(f"Código de computación inválido: {comp}")
    if jump not in jump_codes:
        raise ValueError(f"Código de salto inválido: {jump}")
    
    # Construir la instrucción
    # El primer bit es 1 para instrucciones C
    # Los siguientes dos bits son siempre 1 (según la especificación de Hack)
    instruction_str = '111' + comp_codes[comp] + dest_codes[dest] + jump_codes[jump]
    
    # Convertir a lista de bits
    instruction = [int(bit) for bit in instruction_str]
    return instruction

def create_test_program():
    """
    Crea un programa de prueba simple que suma los números del 1 al 5.
    Retorna el programa como una lista de instrucciones (cada instrucción es una lista de bits).
    """
    program = []
    
    # Inicializar R0 = 0 (suma acumulada)
    program.append(assemble_a_instruction(0))  # @0
    program.append(assemble_c_instruction('M', '0', None))  # M=0
    
    # Inicializar R1 = 1 (contador actual)
    program.append(assemble_a_instruction(1))  # @1
    program.append(assemble_c_instruction('M', '1', None))  # M=1
    
    # Inicializar R2 = 5 (límite)
    program.append(assemble_a_instruction(5))  # @5 (carga 5 en el registro A)
    program.append(assemble_c_instruction('D', 'A', None))  # D=A (copia A al registro D)
    program.append(assemble_a_instruction(2))  # @2 (selecciona R2)
    program.append(assemble_c_instruction('M', 'D', None))  # M=D (guarda el valor en R2)
    
    # Etiqueta: LOOP (dirección 8)
    # R0 = R0 + R1 (suma el contador actual)
    program.append(assemble_a_instruction(0))  # @0 (dirección 8)
    program.append(assemble_c_instruction('D', 'M', None))  # D=M (D = R0)
    program.append(assemble_a_instruction(1))  # @1
    program.append(assemble_c_instruction('D', 'D+M', None))  # D=D+M (D = R0 + R1)
    program.append(assemble_a_instruction(0))  # @0
    program.append(assemble_c_instruction('M', 'D', None))  # M=D (R0 = D)
    
    # R1 = R1 + 1 (incrementa el contador)
    program.append(assemble_a_instruction(1))  # @1 (dirección 14)
    program.append(assemble_c_instruction('M', 'M+1', None))  # M=M+1 (R1++)
    
    # if R1 <= R2 goto LOOP
    program.append(assemble_a_instruction(1))  # @1 (dirección 16)
    program.append(assemble_c_instruction('D', 'M', None))  # D=M (D = R1)
    program.append(assemble_a_instruction(2))  # @2
    program.append(assemble_c_instruction('D', 'M-D', None))  # D=M-D (D = R2-R1)
    program.append(assemble_a_instruction(8))  # @8 (dirección de LOOP)
    program.append(assemble_c_instruction(None, 'D', 'JGE'))  # D;JGE (salto si D>=0, es decir R2>=R1)
    
    # Bucle infinito al final
    program.append(assemble_a_instruction(22))  # @22 (dirección actual)
    program.append(assemble_c_instruction(None, '0', 'JMP'))  # 0;JMP
    
    return program

# --- Funciones de prueba ---

def test_memory_component():
    """Prueba el componente Memory."""
    print("=== Prueba del componente Memory ===")
    
    memory = Memory()
    
    # Prueba de escritura y lectura en RAM
    ram_addr = 1000
    ram_value = int_to_binary16(42)
    memory.clock(ram_value, 1, ram_addr)
    memory.update_state()
    read_value = memory.read(ram_addr)
    print(f"RAM[{ram_addr}] = {binary16_to_int(read_value)} (esperado: 42)")
    
    # Prueba de escritura y lectura en Screen
    screen_addr = SCREEN_BASE_ADDRESS + 100
    screen_value = int_to_binary16(255)
    memory.clock(screen_value, 1, screen_addr)
    memory.update_state()
    read_value = memory.read(screen_addr)
    print(f"SCREEN[{screen_addr - SCREEN_BASE_ADDRESS}] = {binary16_to_int(read_value)} (esperado: 255)")
    
    # Prueba de lectura del teclado
    key_code = 65  # ASCII de 'A'
    memory.keyboard.set_key(key_code)
    read_value = memory.read(KEYBOARD_ADDRESS)
    print(f"KEYBOARD = {binary16_to_int(read_value)} (esperado: {key_code})")

def test_cpu_component():
    """Prueba el componente CPU."""
    print("\n=== Prueba del componente CPU ===")
    
    cpu = CPU()
    
    # Prueba de instrucción A
    a_instruction = assemble_a_instruction(42)
    print(f"Ejecutando instrucción A: @42")
    cpu.clock([0]*16, a_instruction, 0)
    outputs = cpu.update_state()
    print(f"Registro A = {binary16_to_int(cpu.a_register.output())} (esperado: 42)")
    print(f"PC = {binary16_to_int(outputs['pc'])} (esperado: 1)")
    
    # Prueba de instrucción C que carga 1 en el registro D (en lugar de 10)
    print("\nEjecutando instrucción C: D=1")
    cpu.clock([0]*16, assemble_c_instruction('D', '1', None), 0)
    outputs = cpu.update_state()
    print(f"Registro D = {binary16_to_int(cpu.d_register.output())} (esperado: 1)")
    print(f"PC = {binary16_to_int(outputs['pc'])} (esperado: 2)")
    
    # Prueba de salto
    print("\nEjecutando instrucción de salto: 0;JMP")
    cpu.clock([0]*16, assemble_c_instruction(None, '0', 'JMP'), 0)
    outputs = cpu.update_state()
    print(f"PC = {binary16_to_int(outputs['pc'])} (esperado: 42 - salto al valor de A)")

def test_computer():
    """Prueba la computadora completa."""
    print("\n=== Prueba de la computadora completa ===")
    
    # Crear y cargar un programa de prueba
    computer = Computer()
    program = create_test_program()
    computer.load_program(program)
    
    print("Programa cargado. Ejecutando 100 ciclos...")
    
    # Ejecutar la computadora durante algunos ciclos con seguimiento
    cycles_to_run = 100
    
    # Seguimiento de registros por ciclo
    print("\nSeguimiento de ejecución:")
    print("CICLO | PC | INSTR | R0 | R1 | R2")
    print("-" * 50)
    
    # Inicializar con reset
    state = None
    for i in range(cycles_to_run):
        # Reset solo en el primer ciclo
        reset = 1 if i == 0 else 0
        
        # Ejecutar un ciclo
        state = computer.clock_cycle(reset)
        
        # Leer valores de memoria para depuración
        r0 = binary16_to_int(computer.memory.read(0))
        r1 = binary16_to_int(computer.memory.read(1))
        r2 = binary16_to_int(computer.memory.read(2))
        
        # Mostrar estado cada 5 ciclos para no saturar la salida
        if i % 5 == 0 or i < 10:
            pc = binary16_to_int(state['pc'])
            print(f"{i:3d} | {pc:3d} | {'-' if pc >= len(program) else 'A' if program[pc][0]==0 else 'C'} | {r0:2d} | {r1:2d} | {r2:2d}")
        
        # Detectar condición de bucle infinito o finalización
        if i > 20 and r1 > r2 + 2:
            print("Programa completado - se detectó condición de salida del bucle.")
            break
    
    # Verificar el resultado en RAM[0] (debe ser la suma de 1+2+3+4+5 = 15)
    result = binary16_to_int(computer.memory.read(0))
    print(f"\nResultado en RAM[0] = {result} (esperado: 15)")
    
    # Estado final
    print(f"PC final = {binary16_to_int(state['pc'])}")
    print(f"R1 (contador) = {binary16_to_int(computer.memory.read(1))}")
    print(f"R2 (límite) = {binary16_to_int(computer.memory.read(2))}")

if __name__ == "__main__":
    # Ejecutar pruebas de cada componente
    test_memory_component()
    test_cpu_component()
    test_computer()