# proyecto3.py
# Implementación del Proyecto 3 de Nand to Tetris en Python - Memoria

# Importar las funciones necesarias de proyecto1 y proyecto2
from proyecto1 import (
    
    DMUX4WAY, DMUX8WAY, MUX8WAY16,MUX4WAY16 # Asegúrate de importar MUX8WAY16 aquí
     
)
from proyecto2 import Inc16, Add16  # Inc16 y Add16 del proyecto2

class Bit:

    def __init__(self):
        self.state = 0  # Estado inicial del bit (0 o 1)
        self._next_state = 0 # Almacena el siguiente estado para actualizar en el ciclo de reloj

    def output(self):
        return self.state

    def clock(self, inp, load):
        """
        Simula un ciclo de reloj para el Bit.
        Actualiza el estado basado en la entrada y la señal de carga.
        """
        if load == 1:
            self._next_state = inp  # Cargar nueva entrada
        else:
            self._next_state = self.state  # Mantener estado actual

    def update_state(self):
        """
        Actualiza el estado al valor calculado en _next_state.
        Debe ser llamado después de invocar clock para todos los componentes
        en un mismo ciclo de reloj.
        """
        self.state = self._next_state

class Register:
    """
    Implementa un registro de 16 bits (Register).
    """
    def __init__(self):
        self.bits = [Bit() for _ in range(16)] # Array de 16 objetos Bit

    def output(self):
        """Retorna el valor actual del registro como una lista de 16 bits."""
        return [bit.output() for bit in self.bits]

    def clock(self, inp, load):
        """
        Simula un ciclo de reloj para el Register de 16 bits.
        Aplica la señal de reloj a cada Bit individual.
        """
        for i in range(16):
            self.bits[i].clock(inp[i], load)

    def update_state(self):
        """
        Actualiza el estado de todos los Bits en el registro.
        Debe ser llamado después de invocar clock para todos los componentes
        en un mismo ciclo de reloj.
        """
        for bit in self.bits:
            bit.update_state()

class RAM8:
    """
    Implementa una memoria RAM de 8 registros de 16 bits (RAM8).
    """
    def __init__(self):
        self.registers = [Register() for _ in range(8)] # Array de 8 objetos Register

    def read(self, address):
        """
        Lee el valor del registro en la dirección especificada.
        Esta operación es combinacional y el resultado está disponible inmediatamente.
        """
        outputs = [reg.output() for reg in self.registers]
        sel = [address[0], address[1], address[2]] # address es una lista de 3 bits
        return MUX8WAY16(outputs[0], outputs[1], outputs[2], outputs[3],
                          outputs[4], outputs[5], outputs[6], outputs[7], sel)

    def clock(self, inp, load, address):
        """
        Simula un ciclo de reloj para RAM8.
        Carga el valor de entrada en el registro seleccionado por 'address' si load=1.
        """
        dmux_outputs = DMUX8WAY(load, [address[0], address[1], address[2]])
        for i in range(8):
            self.registers[i].clock(inp, dmux_outputs[i])

    def update_state(self):
        """
        Actualiza el estado de todos los Registros en RAM8.
        Debe ser llamado después de invocar clock para todos los componentes
        en un mismo ciclo de reloj.
        """
        for reg in self.registers:
            reg.update_state()

class RAM64:
    """
    Implementa una memoria RAM de 64 registros de 16 bits (RAM64),
    construida a partir de 8 chips RAM8.
    """
    def __init__(self):
        self.ram8_chips = [RAM8() for _ in range(8)] # Array de 8 objetos RAM8

    def read(self, address):
        """
        Lee el valor del registro en la dirección especificada de RAM64.
        """
        sel_ram8 = [address[0], address[1], address[2]] # Bits MSB para seleccionar RAM8
        sel_reg_in_ram8 = [address[3], address[4], address[5]] # Bits LSB para seleccionar registro en RAM8
        outputs_ram8 = [chip.read(sel_reg_in_ram8) for chip in self.ram8_chips]
        return MUX8WAY16(outputs_ram8[0], outputs_ram8[1], outputs_ram8[2], outputs_ram8[3],
                          outputs_ram8[4], outputs_ram8[5], outputs_ram8[6], outputs_ram8[7], sel_ram8)

    def clock(self, inp, load, address):
        """
        Simula un ciclo de reloj para RAM64.
        """
        sel_ram8 = [address[0], address[1], address[2]] # Bits MSB para seleccionar RAM8
        dmux_outputs = DMUX8WAY(load, sel_ram8)
        sel_reg_in_ram8 = [address[3], address[4], address[5]] # Bits LSB para seleccionar registro en RAM8

        for i in range(8):
            self.ram8_chips[i].clock(inp, dmux_outputs[i], sel_reg_in_ram8)

    def update_state(self):
        """
        Actualiza el estado de todas las RAM8 en RAM64.
        """
        for chip in self.ram8_chips:
            chip.update_state()

class RAM512:
    """
    Implementa una memoria RAM de 512 registros de 16 bits (RAM512),
    construida a partir de 8 chips RAM64.
    """
    def __init__(self):
        self.ram64_chips = [RAM64() for _ in range(8)]

    def read(self, address):
        sel_ram64 = [address[0], address[1], address[2]]
        sel_reg_in_ram64 = [address[3], address[4], address[5], address[6], address[7], address[8]]
        outputs_ram64 = [chip.read(sel_reg_in_ram64) for chip in self.ram64_chips]
        return MUX8WAY16(outputs_ram64[0], outputs_ram64[1], outputs_ram64[2], outputs_ram64[3],
                          outputs_ram64[4], outputs_ram64[5], outputs_ram64[6], outputs_ram64[7], sel_ram64)

    def clock(self, inp, load, address):
        sel_ram64 = [address[0], address[1], address[2]]
        dmux_outputs = DMUX8WAY(load, sel_ram64)
        sel_reg_in_ram64 = [address[3], address[4], address[5], address[6], address[7], address[8]]
        for i in range(8):
            self.ram64_chips[i].clock(inp, dmux_outputs[i], sel_reg_in_ram64)

    def update_state(self):
        for chip in self.ram64_chips:
            chip.update_state()

class RAM4K:
    """
    Implementa RAM4K (4096 registros) usando 8 chips RAM512.
    """
    def __init__(self):
        self.ram512_chips = [RAM512() for _ in range(8)]

    def read(self, address):
        sel_ram512 = [address[0], address[1], address[2]]
        sel_reg_in_ram512 = address[3:] # address[3] hasta address[11]
        outputs_ram512 = [chip.read(sel_reg_in_ram512) for chip in self.ram512_chips]
        return MUX8WAY16(outputs_ram512[0], outputs_ram512[1], outputs_ram512[2], outputs_ram512[3],
                          outputs_ram512[4], outputs_ram512[5], outputs_ram512[6], outputs_ram512[7], sel_ram512)

    def clock(self, inp, load, address):
        sel_ram512 = [address[0], address[1], address[2]]
        dmux_outputs = DMUX8WAY(load, sel_ram512)
        sel_reg_in_ram512 = address[3:] # address[3] hasta address[11]
        for i in range(8):
            self.ram512_chips[i].clock(inp, dmux_outputs[i], sel_reg_in_ram512)

    def update_state(self):
        for chip in self.ram512_chips:
            chip.update_state()

class RAM16K:
    """
    Implementa RAM16K (16384 registros) usando 4 chips RAM4K.
    """
    def __init__(self):
        self.ram4k_chips = [RAM4K() for _ in range(4)]

    def read(self, address):
        sel_ram4k = [address[0], address[1]]
        sel_reg_in_ram4k = address[2:] # address[2] hasta address[13]
        outputs_ram4k = [chip.read(sel_reg_in_ram4k) for chip in self.ram4k_chips]
        return MUX4WAY16(outputs_ram4k[0], outputs_ram4k[1], outputs_ram4k[2], outputs_ram4k[3], sel_ram4k)

    def clock(self, inp, load, address):
        sel_ram4k = [address[0], address[1]]
        dmux_outputs = DMUX4WAY(load, sel_ram4k)
        sel_reg_in_ram4k = address[2:] # address[2] hasta address[13]
        for i in range(4):
            self.ram4k_chips[i].clock(inp, dmux_outputs[i], sel_reg_in_ram4k)

    def update_state(self):
        for chip in self.ram4k_chips:
            chip.update_state()

class PC:
    """
    Implementa el Program Counter (PC) de 16 bits.
    """
    def __init__(self):
        self.register = Register() # Usa un Register de 16 bits para almacenar el contador

    def output(self):
        """Retorna el valor actual del PC."""
        return self.register.output()

    def clock(self, inp, load, inc, reset):
        """
        Simula un ciclo de reloj para el PC.
        Maneja las operaciones de reset, carga e incremento.
        """
        current_output = self.register.output()
        incremented_output = Inc16(current_output)

        # Prioridad: reset > load > increment > mantener
        if reset == 1:
            load_value = [0] * 16 # Reset a 0
            load_signal = 1
        elif load == 1:
            load_value = inp # Cargar nueva entrada
            load_signal = 1
        elif inc == 1:
            load_value = incremented_output # Incrementar
            load_signal = 1
        else:
            load_value = [0] * 16 # Valor no importa, se mantiene el estado actual
            load_signal = 0 # No cargar, mantener estado

        self.register.clock(load_value, load_signal)

    def update_state(self):
        """
        Actualiza el estado del Register dentro del PC.
        """
        self.register.update_state()

def binary_to_int(binary_list):
    """Convierte una lista binaria a un entero."""
    value = 0
    for bit in binary_list:
        value = (value << 1) | bit
    return value

def int_to_binary(integer, bits=16):
    """Convierte un entero a una lista binaria de 'bits' longitud."""
    if integer < 0:
        integer = integer % (1 << bits) # Manejar números negativos en complemento a dos
    return [(integer >> i) & 1 for i in range(bits - 1, -1, -1)]

if __name__ == "__main__":
    print("=== Pruebas de Proyecto3: Memoria ====")

    # --- Pruebas de Bit ---
    print("\n--- Pruebas de Bit ---")
    bit = Bit()
    print(f"Estado inicial de Bit: {bit.output()}") # Debe ser 0

    bit.clock(1, 1) # Cargar 1
    bit.update_state()
    print(f"Después de cargar 1: {bit.output()}") # Debe ser 1

    bit.clock(0, 0) # Mantener estado
    bit.update_state()
    print(f"Después de mantener estado: {bit.output()}") # Debe ser 1

    # --- Pruebas de Register ---
    print("\n--- Pruebas de Register ---")
    reg = Register()
    initial_reg_output = reg.output()
    print(f"Estado inicial de Register: {initial_reg_output}") # Debe ser [0]*16

    input_value = int_to_binary(5) # 5 en binario de 16 bits
    reg.clock(input_value, 1) # Cargar valor 5
    reg.update_state()
    print(f"Después de cargar 5: {reg.output()}") # Debe ser binario para 5

    reg.clock(int_to_binary(10), 0) # Mantener estado
    reg.update_state()
    print(f"Después de mantener estado: {reg.output()}") # Debe ser binario para 5 (mantiene el valor cargado)

    # --- Pruebas de RAM8 ---
    print("\n--- Pruebas de RAM8 ---")
    ram8 = RAM8()
    address_5 = int_to_binary(5, 3)[-3:] # Dirección 5 en 3 bits
    value_123 = int_to_binary(123) # Valor 123 en 16 bits

    ram8.clock(value_123, 1, address_5) # Escribir 123 en dirección 5
    ram8.update_state()

    read_address_5 = int_to_binary(5, 3)[-3:]
    read_address_3 = int_to_binary(3, 3)[-3:]
    print(f"Leer dirección 5 después de escribir 123: {ram8.read(read_address_5)}") # Debe ser binario de 123
    print(f"Leer dirección 3 (sin escribir): {ram8.read(read_address_3)}") # Debe ser [0]*16 inicialmente

    # --- Pruebas de PC ---
    print("\n--- Pruebas de PC ---")
    pc = PC()
    print(f"PC inicial: {pc.output()}") # Debe ser [0]*16

    pc.clock([0]*16, 0, 1, 0) # Incrementar
    pc.update_state()
    print(f"PC después de incrementar: {pc.output()}") # Debe ser 1

    pc.clock(int_to_binary(10), 1, 0, 0) # Cargar 10
    pc.update_state()
    print(f"PC después de cargar 10: {pc.output()}") # Debe ser 10

    pc.clock([0]*16, 0, 0, 1) # Reset
    pc.update_state()
    print(f"PC después de resetear: {pc.output()}") # Debe ser 0

    