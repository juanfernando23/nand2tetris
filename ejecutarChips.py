from proyecto1 import *  # ...existing code in proyecto1.py...

def test_elementales():
    print("\n--- Puertas Elementales ---")
    print("1. NAND\n2. NOT\n3. AND\n4. OR\n5. XOR")
    opcion = input("Elige una opción: ")
    try:
        if opcion == "1":
            a = int(input("Ingresa primer bit (0 o 1): "))
            b = int(input("Ingresa segundo bit (0 o 1): "))
            print("NAND:", NAND(a, b))
        elif opcion == "2":
            a = int(input("Ingresa un bit (0 o 1): "))
            print("NOT:", NOT(a))
        elif opcion == "3":
            a = int(input("Ingresa primer bit (0 o 1): "))
            b = int(input("Ingresa segundo bit (0 o 1): "))
            print("AND:", AND(a, b))
        elif opcion == "4":
            a = int(input("Ingresa primer bit (0 o 1): "))
            b = int(input("Ingresa segundo bit (0 o 1): "))
            print("OR:", OR(a, b))
        elif opcion == "5":
            a = int(input("Ingresa primer bit (0 o 1): "))
            b = int(input("Ingresa segundo bit (0 o 1): "))
            print("XOR:", XOR(a, b))
        else:
            print("Opción no válida.")
    except Exception as e:
        print("Error en la entrada:", e)

def test_mux_dmux():
    print("\n--- Multiplexores y Demultiplexores ---")
    print("1. MUX (2:1)\n2. DMUX (1:2)")
    opcion = input("Elige una opción: ")
    try:
        if opcion == "1":
            a = int(input("Ingresa a (0 o 1): "))
            b = int(input("Ingresa b (0 o 1): "))
            sel = int(input("Ingresa sel (0 o 1): "))
            print("MUX:", MUX(a, b, sel))
        elif opcion == "2":
            inp = int(input("Ingresa inp (0 o 1): "))
            sel = int(input("Ingresa sel (0 o 1): "))
            out0, out1 = DMUX(inp, sel)
            print("DMUX: out0 =", out0, ", out1 =", out1)
        else:
            print("Opción no válida.")
    except Exception as e:
        print("Error en la entrada:", e)

def test_16bits():
    print("\n--- Operaciones 16 bits ---")
    print("Se usarán listas de 16 bits (ejemplo: [0,1,0,1,...])")
    try:
        # Para simplificar se pueden usar listas predefinidas o pedir al usuario una cadena de 16 dígitos.
        lista_input = input("Ingresa 16 bits (sin espacios, ej: 0101010101010101): ")
        if len(lista_input) != 16 or any(c not in "01" for c in lista_input):
            print("Entrada inválida. Se usarán valores predeterminados.")
            a = [0,1]*8
        else:
            a = [int(c) for c in lista_input]
        # Para operaciones binarias se usa otra lista (puede ser la misma)
        b = a[::-1]  # ejemplo: lista invertida

        print("NOT16:", NOT16(a))
        print("AND16:", AND16(a, b))
        print("OR16: ", OR16(a, b))
        # Para MUX16 se usa un selector bit y se demuestra la selección entre las dos listas.
        sel = int(input("Para MUX16, ingresa sel (0 o 1): "))
        print("MUX16:", MUX16(a, b, sel))
    except Exception as e:
        print("Error en la entrada:", e)

def test_compuestos():
    print("\n--- Chips Compuestos ---")
    try:
        print("1. OR8WAY\n2. MUX4WAY16\n3. MUX8WAY16\n4. DMUX4WAY\n5. DMUX8WAY")
        opcion = input("Elige una opción: ")
        if opcion == "1":
            # Se espera siempre una cadena de 8 dígitos, ej: 00000001
            entrada = input("Ingresa 8 bits pegados (ej: 00000001): ").strip()
            if len(entrada) != 8:
                print("Se esperaban 8 bits.")
                return
            bits = list(entrada)
            if len(bits) != 8:
                print("Se esperaban 8 bits.")
                return
            inp = [int(x) for x in bits]
            print("OR8WAY:", OR8WAY(inp))
        elif opcion == "2":
            # Para MUX4WAY16 se ingresan 4 listas de 16 bits. Se usará una entrada simplificada.
            print("Utilizando listas de 16 bits predeterminadas.")
            a = [0]*16; b = [1]*16; c = [0,1]*8; d = [1,0]*8
            sel = input("Ingresa 2 bits de selección (ej: 01): ")
            if len(sel) != 2:
                print("Se esperaban 2 bits.")
                return
            sel = [int(x) for x in sel]
            print("MUX4WAY16:", MUX4WAY16(a, b, c, d, sel))
        elif opcion == "3":
            print("Utilizando listas de 16 bits predeterminadas.")
            a = [0]*16; b = [1]*16; c = [0,1]*8; d = [1,0]*8; e = [0]*16; f = [1]*16; g = [0,1]*8; h = [1,0]*8
            sel = input("Ingresa 3 bits de selección (ej: 010): ")
            if len(sel) != 3:
                print("Se esperaban 3 bits.")
                return
            sel = [int(x) for x in sel]
            print("MUX8WAY16:", MUX8WAY16(a, b, c, d, e, f, g, h, sel))
        elif opcion == "4":
            inp = int(input("Ingresa inp (0 o 1): "))
            sel = input("Ingresa 2 bits de selección para DMUX4WAY (ej: 10): ")
            if len(sel) != 2:
                print("Se esperaban 2 bits.")
                return
            sel = [int(x) for x in sel]
            print("DMUX4WAY:", DMUX4WAY(inp, sel))
        elif opcion == "5":
            inp = int(input("Ingresa inp (0 o 1): "))
            sel = input("Ingresa 3 bits de selección para DMUX8WAY (ej: 101): ")
            if len(sel) != 3:
                print("Se esperaban 3 bits.")
                return
            sel = [int(x) for x in sel]
            print("DMUX8WAY:", DMUX8WAY(inp, sel))
        else:
            print("Opción no válida.")
    except Exception as e:
        print("Error en la entrada:", e)

def main():
    while True:
        print("\n===== Menu Principal =====")
        print("1. Probar Puertas Elementales")
        print("2. Probar Multiplexores y Demultiplexores")
        print("3. Probar Operaciones 16 bits")
        print("4. Probar Chips Compuestos")
        print("5. Salir")
        opcion = input("Elige una opción: ")
        if opcion == "1":
            test_elementales()
        elif opcion == "2":
            test_mux_dmux()
        elif opcion == "3":
            test_16bits()
        elif opcion == "4":
            test_compuestos()
        elif opcion == "5":
            print("Saliendo...")
            break
        else:
            print("Opción no válida.")

if __name__ == "__main__":
    main()
