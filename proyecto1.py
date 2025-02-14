# ---------- Puertas Elementales (1 bit) ----------

def NAND(a, b):
    """
    Implementa la puerta NAND.
    Retorna 0 si ambos a y b son 1, de lo contrario retorna 1.
    """
    return 0 if a == 1 and b == 1 else 1

def NOT(a):
    """
    Implementa la puerta NOT utilizando NAND.
    """
    return NAND(a, a)

def AND(a, b):
    """
    Implementa la puerta AND utilizando NAND y NOT.
    """
    return NOT(NAND(a, b))

def OR(a, b):
    """
    Implementa la puerta OR utilizando NAND y NOT.
    """
    return NAND(NOT(a), NOT(b))

def XOR(a, b):
    """
    Implementa la puerta XOR.
    Equivale a: (a OR b) AND (NOT (a AND b)).
    """
    return AND(OR(a, b), NAND(a, b))

# ---------- Multiplexores y Demultiplexores (1 bit) ----------

def MUX(a, b, sel):
    """
    Implementa un multiplexor 2:1.
    Si sel es 0 retorna a; si sel es 1 retorna b.
    """
    return OR(AND(a, NOT(sel)), AND(b, sel))

def DMUX(inp, sel):
    """
    Implementa un demultiplexor 1:2.
    Si sel es 0, la primera salida es inp y la segunda es 0;
    si sel es 1, la primera salida es 0 y la segunda es inp.
    Retorna una tupla: (out0, out1).
    """
    return AND(inp, NOT(sel)), AND(inp, sel)

# ---------- Operaciones Bit a Bit (16 bits) ----------

def NOT16(a):
    """
    Aplica la puerta NOT a cada uno de los 16 bits de la lista 'a'.
    """
    return [NOT(x) for x in a]

def AND16(a, b):
    """
    Aplica la puerta AND de forma bit a bit entre dos listas (16 bits cada una).
    """
    return [AND(x, y) for x, y in zip(a, b)]

def OR16(a, b):
    """
    Aplica la puerta OR de forma bit a bit entre dos listas (16 bits cada una).
    """
    return [OR(x, y) for x, y in zip(a, b)]

def MUX16(a, b, sel):
    """
    Implementa un multiplexor de 16 bits.
    Combina dos listas (a y b) de 16 bits, usando 'sel' como selector.
    """
    return [MUX(x, y, sel) for x, y in zip(a, b)]

# ---------- Chips Compuestos ----------

def OR8WAY(inp):
    """
    Combina 8 bits (lista 'inp') mediante puertas OR.
    Retorna 1 si al menos uno de los bits es 1, de lo contrario retorna 0.
    """
    result = 0
    for bit in inp:
        result = OR(result, bit)
    return result

def MUX4WAY16(a, b, c, d, sel):
    """
    Implementa un multiplexor 4 vías para 16 bits.
    
    Parámetros:
      a, b, c, d: Listas de 16 bits.
      sel: Lista de 2 bits (por ejemplo, [sel0, sel1]).
    
    Nota: El orden de los bits de 'sel' depende de la convención.
    En esta implementación se utiliza el primer bit para seleccionar entre
    cada par (a con b, y c con d) y el segundo para elegir entre los resultados.
    """
    mux1 = MUX16(a, b, sel[0])
    mux2 = MUX16(c, d, sel[0])
    return MUX16(mux1, mux2, sel[1])

def MUX8WAY16(a, b, c, d, e, f, g, h, sel):
    """
    Implementa un multiplexor 8 vías para 16 bits.
    
    Parámetros:
      a, b, c, d, e, f, g, h: Listas de 16 bits.
      sel: Lista de 3 bits.
    
    Se agrupan los 8 conjuntos en dos grupos de 4 vías utilizando los dos bits
    menos significativos, y luego se selecciona el grupo final con el tercer bit.
    """
    mux_low = MUX4WAY16(a, b, c, d, [sel[1], sel[0]])
    mux_high = MUX4WAY16(e, f, g, h, [sel[1], sel[0]])
    return MUX16(mux_low, mux_high, sel[2])

def DMUX4WAY(inp, sel):
    """
    Implementa un demultiplexor 1:4 para una entrada de 1 bit.
    
    Parámetros:
      inp: Bit de entrada.
      sel: Lista de 2 bits.
    
    Retorna una tupla (a, b, c, d) para las 4 salidas.
    """
    a = AND(inp, AND(NOT(sel[1]), NOT(sel[0])))
    b = AND(inp, AND(NOT(sel[1]), sel[0]))
    c = AND(inp, AND(sel[1], NOT(sel[0])))
    d = AND(inp, AND(sel[1], sel[0]))
    return a, b, c, d

def DMUX8WAY(inp, sel):
    """
    Implementa un demultiplexor 1:8 para una entrada de 1 bit.
    
    Parámetros:
      inp: Bit de entrada.
      sel: Lista de 3 bits.
    
    Estrategia:
      1. Se utiliza DMUX para dividir 'inp' según el bit más significativo (sel[2]),
         obteniéndose dos grupos.
      2. Se aplica DMUX4WAY a cada grupo usando los dos bits menos significativos.
    
    Retorna una tupla con 8 salidas.
    """
    # Divide la entrada según el tercer bit de selección.
    a, b = DMUX(inp, sel[2])
    # Aplica DMUX4WAY a cada mitad usando los bits sel[1] y sel[0].
    low_group = DMUX4WAY(a, [sel[1], sel[0]])
    high_group = DMUX4WAY(b, [sel[1], sel[0]])
    return low_group + high_group
