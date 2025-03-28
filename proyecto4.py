# proyecto4_logic.py

# --- Lógica de Mult.asm ---

def mult(r0, r1):
    """
    Simula la lógica de Mult.asm para calcular r0 * r1 mediante suma repetida.

    Args:
        r0 (int): Valor en RAM[0]. Se asume r0 >= 0.
        r1 (int): Valor en RAM[1]. Se asume r1 >= 0.

    Returns:
        int: El resultado de r0 * r1. Se asume que el resultado < 32768.
             Retorna -1 si las precondiciones no se cumplen (opcional).
    """
    # Verificar precondiciones (opcional pero buena práctica)
    if r0 < 0 or r1 < 0:
        print("Advertencia: Se esperan valores R0 y R1 no negativos.")
        # Podrías retornar un error o un valor especial
        # return -1 # Indicador de error

    # Inicializar el resultado (como si fuera R2)
    r2 = 0
    # Inicializar el contador del bucle (como si fuera 'i') con el valor de r1
    i = r1

    # Bucle: repetir r1 veces
    while i > 0:
        # Sumar r0 al resultado
        r2 = r2 + r0
        # Decrementar el contador
        i = i - 1

    # Verificar postcondición (opcional)
    # if r2 >= 32768:
    #    print("Advertencia: El resultado de la multiplicación excede 32767.")

    return r2

# --- Lógica de Fill.asm ---

# Constantes para simular las direcciones de memoria
SCREEN_BASE_ADDRESS = 16384
KEYBOARD_ADDRESS = 24576
SCREEN_SIZE_WORDS = 8192 # 8K words = 8 * 1024 words

# Colores (en la simulación Hack, -1 es negro, 0 es blanco)
BLACK = -1 # O podríamos usar 0xFFFF si trabajáramos con unsigned 16-bit
WHITE = 0

def fill_screen_based_on_keyboard(keyboard_value):
    """
    Simula la lógica de decisión de Fill.asm basada en la entrada del teclado.
    Esta función determina QUÉ color usar, pero no simula el llenado en sí.

    Args:
        keyboard_value (int): El valor leído del teclado simulado (RAM[KBD]).
                             0 si no hay tecla presionada, != 0 si hay tecla.

    Returns:
        int: El color a usar para llenar la pantalla (BLACK o WHITE).
    """
    if keyboard_value == 0:
        return WHITE
    else:
        return BLACK

def simulate_fill_step(ram, keyboard_value):
    """
    Simula UNA pasada completa de la lógica de Fill.asm:
    1. Lee el valor del teclado.
    2. Determina el color.
    3. Llena la memoria RAM simulada (área de pantalla) con ese color.

    Args:
        ram (dict): Un diccionario que simula la RAM. Las claves son direcciones.
        keyboard_value (int): El valor actual del teclado simulado.
    """
    color_to_fill = fill_screen_based_on_keyboard(keyboard_value)

    # Simula el llenado de la memoria de pantalla en la RAM simulada
    # ptr = SCREEN_BASE_ADDRESS
    # i = SCREEN_SIZE_WORDS
    # while i > 0:
    #    ram[ptr] = color_to_fill
    #    ptr += 1
    #    i -= 1
    # Forma más pythónica:
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