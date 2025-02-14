import proyecto1

def binary_str_to_list(s):
    """
    Convierte una cadena de bits (ej. "01010101") en una lista de enteros [0,1,...].
    """
    return [int(ch) for ch in s.strip() if ch in ('0', '1')]

def get_bit_input(prompt):
    """
    Pide al usuario que ingrese un bit (0 o 1) y lo retorna como entero.
    """
    while True:
        bit = input(prompt).strip()
        if bit in ['0', '1']:
            return int(bit)
        print("Entrada inválida. Por favor ingrese 0 o 1.")

# ---------- Pruebas para Puertas Elementales (1 bit) ----------

def test_NAND():
    print("\n--- Prueba de la puerta NAND ---")
    a = get_bit_input("Ingrese bit a (0/1): ")
    b = get_bit_input("Ingrese bit b (0/1): ")
    result = proyecto1.NAND(a, b)
    print(f"NAND({a}, {b}) = {result}")

def test_NOT():
    print("\n--- Prueba de la puerta NOT ---")
    a = get_bit_input("Ingrese bit (0/1): ")
    result = proyecto1.NOT(a)
    print(f"NOT({a}) = {result}")

def test_AND():
    print("\n--- Prueba de la puerta AND ---")
    a = get_bit_input("Ingrese bit a (0/1): ")
    b = get_bit_input("Ingrese bit b (0/1): ")
    result = proyecto1.AND(a, b)
    print(f"AND({a}, {b}) = {result}")

def test_OR():
    print("\n--- Prueba de la puerta OR ---")
    a = get_bit_input("Ingrese bit a (0/1): ")
    b = get_bit_input("Ingrese bit b (0/1): ")
    result = proyecto1.OR(a, b)
    print(f"OR({a}, {b}) = {result}")

def test_XOR():
    print("\n--- Prueba de la puerta XOR ---")
    a = get_bit_input("Ingrese bit a (0/1): ")
    b = get_bit_input("Ingrese bit b (0/1): ")
    result = proyecto1.XOR(a, b)
    print(f"XOR({a}, {b}) = {result}")

# ---------- Pruebas para Multiplexores y Demultiplexores (1 bit) ----------

def test_MUX():
    print("\n--- Prueba del MUX (1 bit) ---")
    a = get_bit_input("Ingrese bit a (0/1): ")
    b = get_bit_input("Ingrese bit b (0/1): ")
    sel = get_bit_input("Ingrese selector (0/1): ")
    result = proyecto1.MUX(a, b, sel)
    print(f"MUX({a}, {b}, {sel}) = {result}")

def test_DMUX():
    print("\n--- Prueba del DMUX (1 bit) ---")
    inp = get_bit_input("Ingrese bit de entrada (0/1): ")
    sel = get_bit_input("Ingrese selector (0/1): ")
    out0, out1 = proyecto1.DMUX(inp, sel)
    print(f"DMUX({inp}, {sel}) -> salida0: {out0}, salida1: {out1}")

# ---------- Pruebas para Operaciones Bit a Bit (16 bits) ----------

def test_NOT16():
    print("\n--- Prueba de NOT16 (16 bits) ---")
    s = input("Ingrese 16 bits (ej: 0101010101010101): ").strip()
    if len(s) != 16:
        print("Error: Debe ingresar exactamente 16 bits.")
        return
    bits = binary_str_to_list(s)
    result = proyecto1.NOT16(bits)
    print(f"NOT16({bits}) = {result}")

def test_AND16():
    print("\n--- Prueba de AND16 (16 bits) ---")
    s1 = input("Ingrese 16 bits para la primera entrada: ").strip()
    s2 = input("Ingrese 16 bits para la segunda entrada: ").strip()
    if len(s1) != 16 or len(s2) != 16:
        print("Error: Cada entrada debe tener 16 bits.")
        return
    bits1 = binary_str_to_list(s1)
    bits2 = binary_str_to_list(s2)
    result = proyecto1.AND16(bits1, bits2)
    print(f"AND16({bits1}, {bits2}) = {result}")

def test_OR16():
    print("\n--- Prueba de OR16 (16 bits) ---")
    s1 = input("Ingrese 16 bits para la primera entrada: ").strip()
    s2 = input("Ingrese 16 bits para la segunda entrada: ").strip()
    if len(s1) != 16 or len(s2) != 16:
        print("Error: Cada entrada debe tener 16 bits.")
        return
    bits1 = binary_str_to_list(s1)
    bits2 = binary_str_to_list(s2)
    result = proyecto1.OR16(bits1, bits2)
    print(f"OR16({bits1}, {bits2}) = {result}")

def test_MUX16():
    print("\n--- Prueba de MUX16 (16 bits) ---")
    s1 = input("Ingrese 16 bits para la primera entrada: ").strip()
    s2 = input("Ingrese 16 bits para la segunda entrada: ").strip()
    if len(s1) != 16 or len(s2) != 16:
        print("Error: Cada entrada debe tener 16 bits.")
        return
    bits1 = binary_str_to_list(s1)
    bits2 = binary_str_to_list(s2)
    sel = get_bit_input("Ingrese el bit selector (0/1): ")
    result = proyecto1.MUX16(bits1, bits2, sel)
    print(f"MUX16({bits1}, {bits2}, {sel}) = {result}")

# ---------- Pruebas para Chips Compuestos ----------

def test_OR8WAY():
    print("\n--- Prueba de OR8WAY (8 bits) ---")
    s = input("Ingrese 8 bits (ej: 01000001): ").strip()
    if len(s) != 8:
        print("Error: Debe ingresar exactamente 8 bits.")
        return
    bits = binary_str_to_list(s)
    result = proyecto1.OR8WAY(bits)
    print(f"OR8WAY({bits}) = {result}")

def test_MUX4WAY16():
    print("\n--- Prueba de MUX4WAY16 (16 bits) ---")
    print("Ingrese 4 entradas de 16 bits cada una:")
    s1 = input("Entrada 1: ").strip()
    s2 = input("Entrada 2: ").strip()
    s3 = input("Entrada 3: ").strip()
    s4 = input("Entrada 4: ").strip()
    if any(len(s) != 16 for s in [s1, s2, s3, s4]):
        print("Error: Cada entrada debe tener exactamente 16 bits.")
        return
    bits1 = binary_str_to_list(s1)
    bits2 = binary_str_to_list(s2)
    bits3 = binary_str_to_list(s3)
    bits4 = binary_str_to_list(s4)
    sel_str = input("Ingrese 2 bits para el selector (ej: 10): ").strip()
    if len(sel_str) != 2:
        print("Error: El selector debe tener exactamente 2 bits.")
        return
    sel = binary_str_to_list(sel_str)
    result = proyecto1.MUX4WAY16(bits1, bits2, bits3, bits4, sel)
    print(f"MUX4WAY16(..., selector {sel}) = {result}")

def test_MUX8WAY16():
    print("\n--- Prueba de MUX8WAY16 (16 bits) ---")
    print("Ingrese 8 entradas de 16 bits cada una:")
    entradas = []
    for i in range(8):
        s = input(f"Entrada {i+1}: ").strip()
        if len(s) != 16:
            print("Error: Cada entrada debe tener exactamente 16 bits.")
            return
        entradas.append(binary_str_to_list(s))
    sel_str = input("Ingrese 3 bits para el selector (ej: 101): ").strip()
    if len(sel_str) != 3:
        print("Error: El selector debe tener exactamente 3 bits.")
        return
    sel = binary_str_to_list(sel_str)
    result = proyecto1.MUX8WAY16(
        entradas[0], entradas[1], entradas[2], entradas[3],
        entradas[4], entradas[5], entradas[6], entradas[7],
        sel
    )
    print(f"MUX8WAY16(..., selector {sel}) = {result}")

def test_DMUX4WAY():
    print("\n--- Prueba de DMUX4WAY (1 bit) ---")
    inp = get_bit_input("Ingrese bit de entrada (0/1): ")
    sel_str = input("Ingrese 2 bits para el selector (ej: 01): ").strip()
    if len(sel_str) != 2:
        print("Error: El selector debe tener exactamente 2 bits.")
        return
    sel = binary_str_to_list(sel_str)
    result = proyecto1.DMUX4WAY(inp, sel)
    print(f"DMUX4WAY({inp}, {sel}) = {result}")

def test_DMUX8WAY():
    print("\n--- Prueba de DMUX8WAY (1 bit) ---")
    inp = get_bit_input("Ingrese bit de entrada (0/1): ")
    sel_str = input("Ingrese 3 bits para el selector (ej: 101): ").strip()
    if len(sel_str) != 3:
        print("Error: El selector debe tener exactamente 3 bits.")
        return
    sel = binary_str_to_list(sel_str)
    result = proyecto1.DMUX8WAY(inp, sel)
    print(f"DMUX8WAY({inp}, {sel}) = {result}")

# ---------- Menú Principal ----------

def main():
    while True:
        print("\n--- Menú de Pruebas de Chips ---")
        print("1. Puertas Elementales (1 bit)")
        print("   1.1. NAND")
        print("   1.2. NOT")
        print("   1.3. AND")
        print("   1.4. OR")
        print("   1.5. XOR")
        print("2. Multiplexores/Demultiplexores (1 bit)")
        print("   2.1. MUX")
        print("   2.2. DMUX")
        print("3. Operaciones Bit a Bit (16 bits)")
        print("   3.1. NOT16")
        print("   3.2. AND16")
        print("   3.3. OR16")
        print("   3.4. MUX16")
        print("4. Chips Compuestos")
        print("   4.1. OR8WAY (8 bits)")
        print("   4.2. MUX4WAY16")
        print("   4.3. MUX8WAY16")
        print("   4.4. DMUX4WAY")
        print("   4.5. DMUX8WAY")
        print("0. Salir")
        
        opcion = input("Seleccione una opción: ").strip()
        
        if opcion == "0":
            print("Saliendo...")
            break
        elif opcion == "1.1":
            test_NAND()
        elif opcion == "1.2":
            test_NOT()
        elif opcion == "1.3":
            test_AND()
        elif opcion == "1.4":
            test_OR()
        elif opcion == "1.5":
            test_XOR()
        elif opcion == "2.1":
            test_MUX()
        elif opcion == "2.2":
            test_DMUX()
        elif opcion == "3.1":
            test_NOT16()
        elif opcion == "3.2":
            test_AND16()
        elif opcion == "3.3":
            test_OR16()
        elif opcion == "3.4":
            test_MUX16()
        elif opcion == "4.1":
            test_OR8WAY()
        elif opcion == "4.2":
            test_MUX4WAY16()
        elif opcion == "4.3":
            test_MUX8WAY16()
        elif opcion == "4.4":
            test_DMUX4WAY()
        elif opcion == "4.5":
            test_DMUX8WAY()
        else:
            print("Opción no válida. Intente nuevamente.")

if __name__ == "__main__":
    main()
  