# proyecto4_logic_binary.py

# Importar funciones necesarias de proyectos anteriores
# Asegúrate de que estos archivos existan y contengan las funciones correctas
try:
    from proyecto1 import MUX16, OR16, AND16, NOT16 # (Y otras si son necesarias)
    from proyecto2 import Add16, ALU # (ALU podría no ser necesaria aquí, pero Add16 sí)
except ImportError as e:
    print(f"Error importando de proyecto1/proyecto2: {e}")
    print("Asegúrate de que los archivos proyecto1.py y proyecto2.py estén en el mismo directorio.")
    # Define funciones dummy para que el script no falle completamente
    def Add16(a, b): print("Add16 no disponible"); return [0]*16
    # Añade otras funciones dummy si es necesario

# --- Funciones Auxiliares (Conversión y Constantes Binarias) ---

def int_to_binary16(n):
    """Convierte un entero a una lista binaria de 16 bits (complemento a dos)."""
    if not isinstance(n, int):
        raise TypeError("La entrada debe ser un entero")
    # Manejo de números negativos usando complemento a dos para 16 bits
    if n < 0:
        n = (1 << 16) + n
    # Asegurarse de que el número esté dentro del rango representable (opcional, pero bueno para positivos grandes)
    n = n & 0xFFFF # Máscara para 16 bits

    binary_list = [0] * 16
    for i in range(16):
        if (n >> i) & 1:
            binary_list[15 - i] = 1
    return binary_list

def binary16_to_int(binary_list):
    """Convierte una lista binaria de 16 bits a un entero (interpretando complemento a dos)."""
    if len(binary_list) != 16 or not all(bit in (0, 1) for bit in binary_list):
        raise ValueError("La entrada debe ser una lista de 16 bits (0s y 1s)")

    value = 0
    for bit in binary_list:
        value = (value << 1) | bit

    # Interpretar como complemento a dos si el bit más significativo es 1
    if binary_list[0] == 1:
        value = value - (1 << 16)
    return value

# Constantes binarias de 16 bits
ZERO16 = int_to_binary16(0)
ONE16 = int_to_binary16(1)
MINUS_ONE16 = int_to_binary16(-1) # Representación binaria de -1 en C2

# --- Lógica de Mult.asm (Versión Binaria) ---

def mult_binary(r0_bin, r1_bin):
    

    r2_bin = list(ZERO16) # Usar list() para crear una copia mutable

    i_bin = list(r1_bin)

    # Bucle: repetir mientras i_bin no sea cero
    # Necesitamos una forma de comparar i_bin con cero y decrementar
    # Esto usualmente involucraría la ALU, pero aquí lo simulamos en Python

    # Convertir i_bin a entero para controlar el bucle (simplificación de la simulación)
    # En hardware real, se usaría una comparación con 0 y un decremento binario.
    i_int = binary16_to_int(i_bin)

    while i_int > 0:
        # Sumar r0_bin al resultado r2_bin usando el sumador binario
        r2_bin = Add16(r2_bin, r0_bin)

        # Decrementar el contador (i = i - 1)
        # Esto requiere sumar -1 (MINUS_ONE16)
        # i_bin = Add16(i_bin, MINUS_ONE16) # Esto es incorrecto, Add16 es para A+B
        # Decremento real: i = i - 1. Lo simulamos en entero por facilidad
        i_int -= 1

        # Convertir de nuevo a binario si necesitáramos usar i_bin (no es estrictamente necesario aquí)
        # i_bin = int_to_binary16(i_int) # Actualizar i_bin si se usara en comparaciones binarias

    return r2_bin


# --- Lógica de Fill ---

# Constantes para simular las direcciones de memoria
SCREEN_BASE_ADDRESS = 16384
KEYBOARD_ADDRESS = 24576
SCREEN_SIZE_WORDS = 8192 # 8K words = 8 * 1024 words

# Colores (en la simulación Hack, -1 es negro, 0 es blanco)
BLACK = -1 # O podríamos usar 0xFFFF si trabajáramos con unsigned 16-bit
WHITE = 0

def fill_screen_based_on_keyboard(keyboard_value):



    if keyboard_value == 0:
        return WHITE
    else:
        return BLACK

def simulate_fill_step(ram, keyboard_value):

    #Simula UNA pasada completa de la lógica de Fill
    
    color_to_fill = fill_screen_based_on_keyboard(keyboard_value)

    # Simula el llenado de la memoria de pantalla en la RAM simulada

    for i in range(SCREEN_SIZE_WORDS):
        address = SCREEN_BASE_ADDRESS + i
        ram[address] = color_to_fill

    print(f"Simulación: Llenando pantalla con {'NEGRO' if color_to_fill == BLACK else 'BLANCO'} (valor: {color_to_fill})")


# --- Pruebas ---
if __name__ == "__main__":
    print("--- Probando lógica de Mult.asm ---")
    result1 = mult(5, 3)
    print(f"mult(5, 3) = {result1}") # Esperado: 15

    result2 = mult(10, 0)
    print(f"mult(10, 0) = {result2}") # Esperado: 0

    result3 = mult(0, 7)
    print(f"mult(0, 7) = {result3}") # Esperado: 0

    result4 = mult(100, 100)
    print(f"mult(100, 100) = {result4}") # Esperado: 10000

    print("\n--- Probando lógica de Fill.asm ---")
    # Simular la RAM como un diccionario
    simulated_ram = {}

    # Prueba 1: Sin tecla presionada
    print("Prueba 1: Sin tecla presionada")
    key_val = 0 # Valor típico si no hay tecla
    simulate_fill_step(simulated_ram, key_val)
    # Verificar algunas direcciones de pantalla (deberían ser WHITE=0)
    print(f"RAM[{SCREEN_BASE_ADDRESS}] = {simulated_ram.get(SCREEN_BASE_ADDRESS, 'No Escrito')}")
    print(f"RAM[{SCREEN_BASE_ADDRESS + 100}] = {simulated_ram.get(SCREEN_BASE_ADDRESS + 100, 'No Escrito')}")
    print(f"RAM[{SCREEN_BASE_ADDRESS + SCREEN_SIZE_WORDS - 1}] = {simulated_ram.get(SCREEN_BASE_ADDRESS + SCREEN_SIZE_WORDS - 1, 'No Escrito')}")

    print("\nPrueba 2: Tecla presionada (ej: código ASCII para 'k')")
    key_val = 75 # Valor ASCII de 'k'
    simulate_fill_step(simulated_ram, key_val)
    # Verificar algunas direcciones de pantalla (deberían ser BLACK=-1)
    print(f"RAM[{SCREEN_BASE_ADDRESS}] = {simulated_ram.get(SCREEN_BASE_ADDRESS, 'No Escrito')}")
    print(f"RAM[{SCREEN_BASE_ADDRESS + 100}] = {simulated_ram.get(SCREEN_BASE_ADDRESS + 100, 'No Escrito')}")
    print(f"RAM[{SCREEN_BASE_ADDRESS + SCREEN_SIZE_WORDS - 1}] = {simulated_ram.get(SCREEN_BASE_ADDRESS + SCREEN_SIZE_WORDS - 1, 'No Escrito')}")

    print("\nPrueba 3: Sin tecla presionada (de nuevo)")
    key_val = 0
    simulate_fill_step(simulated_ram, key_val)
    # Verificar algunas direcciones de pantalla (deberían ser WHITE=0)
    print(f"RAM[{SCREEN_BASE_ADDRESS}] = {simulated_ram.get(SCREEN_BASE_ADDRESS, 'No Escrito')}")
    print(f"RAM[{SCREEN_BASE_ADDRESS + SCREEN_SIZE_WORDS - 1}] = {simulated_ram.get(SCREEN_BASE_ADDRESS + SCREEN_SIZE_WORDS - 1, 'No Escrito')}")