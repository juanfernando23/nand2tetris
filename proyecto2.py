# Importar las funciones necesarias del proyecto1
from proyecto1 import (
    AND, OR, NOT, XOR, NAND,
    NOT16, AND16, OR16, MUX16,
    validate_bits, validate_16bits
)

def HalfAdder(a, b):
    """
    Implementa un medio sumador.
    
    Entradas:
      a, b: Bits individuales
    
    Retorna:
      Una tupla (sum, carry) donde:
      sum: La suma de a y b (bit menos significativo) = a XOR b
      carry: El acarreo (bit más significativo) = a AND b
    """
    validate_bits(a, b)
    sum_bit = XOR(a, b)
    carry_bit = AND(a, b)
    return sum_bit, carry_bit

def FullAdder(a, b, c):
    """
    Implementa un sumador completo.
    
    Entradas:
      a, b, c: Tres bits individuales
    
    Retorna:
      Una tupla (sum, carry) donde:
      sum: La suma de a, b y c (bit menos significativo)
      carry: El acarreo (bit más significativo)
    """
    validate_bits(a, b, c)
    # Primer medio sumador para a y b
    sum1, carry1 = HalfAdder(a, b)
    # Segundo medio sumador para sum1 y c
    final_sum, carry2 = HalfAdder(sum1, c)
    # El acarreo final es OR de los dos acarreos
    final_carry = OR(carry1, carry2)
    return final_sum, final_carry

def Add16(a, b):
    """
    Implementa un sumador de 16 bits.
    
    Entradas:
      a, b: Dos arrays de 16 bits
    
    Retorna:
      Un array de 16 bits representando la suma de a y b (ignorando overflow)
    """
    validate_16bits(a, b)
    result = [0] * 16
    carry = 0  # Carry inicial es 0
    
    # Sumar desde el bit menos significativo al más significativo
    for i in range(15, -1, -1):
        result[i], carry = FullAdder(a[i], b[i], carry)
    
    return result

def Inc16(inp):
    """
    Implementa un incrementador de 16 bits.
    
    Entradas:
      inp: Un array de 16 bits
    
    Retorna:
      Un array de 16 bits representando inp + 1 (ignorando overflow)
    """
    validate_16bits(inp)
    # Crear un array de 16 bits con un 1 en la posición menos significativa
    one = [0] * 16
    one[15] = 1  # El bit menos significativo es 1, el resto 0
    
    # Sumar inp + 1 usando Add16
    return Add16(inp, one)

def ALU(x, y, zx, nx, zy, ny, f, no):
    """
    Implementa la Unidad Aritmético-Lógica (ALU) de Hack.
    
    Entradas:
      x, y: Dos arrays de 16 bits
      zx, nx, zy, ny, f, no: Bits de control
    
    Retorna:
      Una tupla (out, zr, ng) donde:
      out: Un array de 16 bits que contiene el resultado
      zr: 1 si out == 0, 0 en caso contrario
      ng: 1 si out < 0 (bit más significativo de out es 1), 0 en caso contrario
    """
    validate_16bits(x, y)
    validate_bits(zx, nx, zy, ny, f, no)
    
    # Pre-procesamiento de x
    if zx == 1:
        x = [0] * 16  # Si zx=1, fuerza x=0
    if nx == 1:
        x = NOT16(x)  # Si nx=1, invierte x
    
    # Pre-procesamiento de y
    if zy == 1:
        y = [0] * 16  # Si zy=1, fuerza y=0
    if ny == 1:
        y = NOT16(y)  # Si ny=1, invierte y
    
    # Computación de la función
    if f == 0:
        out = AND16(x, y)  # Si f=0, out=x&y
    else:
        out = Add16(x, y)  # Si f=1, out=x+y
    
    # Post-procesamiento
    if no == 1:
        out = NOT16(out)  # Si no=1, invierte out
    
    # Indicadores de estado
    zr = 1 if all(bit == 0 for bit in out) else 0  # zr=1 si out=0
    ng = 1 if out[0] == 1 else 0  # ng=1 si out<0 (bit más significativo es 1)
    
    return out, zr, ng

if __name__ == "__main__":
    print("=== Pruebas de Proyecto2: Chips Aritméticos ===")
    
    # Pruebas de HalfAdder
    print("\nPruebas de HalfAdder:")
    for a in [0, 1]:
        for b in [0, 1]:
            sum_bit, carry = HalfAdder(a, b)
            print(f"HalfAdder({a},{b}) = (sum={sum_bit}, carry={carry})")
    
    # Pruebas de FullAdder
    print("\nPruebas de FullAdder:")
    for a in [0, 1]:
        for b in [0, 1]:
            for c in [0, 1]:
                sum_bit, carry = FullAdder(a, b, c)
                print(f"FullAdder({a},{b},{c}) = (sum={sum_bit}, carry={carry})")
    
    # Pruebas de Add16
    print("\nPruebas de Add16:")
    a16 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0]  # 10 en binario
    b16 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1]  # 5 en binario
    
    try:
        sum16 = Add16(a16, b16)  # Debería ser 15 (1111 en binario)
        print(f"Add16 resultado: {sum16}")
        print(f"En base 10: {sum16[-4:]} representa {sum16[-4]*8 + sum16[-3]*4 + sum16[-2]*2 + sum16[-1]*1}")
    except Exception as e:
        print(f"Error en Add16: {e}")
    
    # Pruebas de Inc16
    print("\nPruebas de Inc16:")
    try:
        inc_result = Inc16(a16)  # Debería ser 11 (1011 en binario)
        print(f"Inc16 resultado: {inc_result}")
        print(f"En base 10: {inc_result[-4:]} representa {inc_result[-4]*8 + inc_result[-3]*4 + inc_result[-2]*2 + inc_result[-1]*1}")
    except Exception as e:
        print(f"Error en Inc16: {e}")
    
    # Pruebas de ALU
    print("\nPruebas de ALU:")
    # Casos de prueba específicos para la ALU
    test_cases = [
        # zx nx zy ny  f no → Operación
        [1, 0, 1, 0, 1, 0],  # Salida = 0
        [1, 1, 1, 1, 1, 1],  # Salida = 1
        [1, 1, 1, 0, 1, 0],  # Salida = -1
        [0, 0, 1, 1, 0, 0],  # Salida = x
        [1, 1, 0, 0, 0, 0],  # Salida = y
        [0, 0, 1, 1, 0, 1],  # Salida = !x
        [1, 1, 0, 0, 0, 1],  # Salida = !y
        [0, 0, 1, 1, 1, 1],  # Salida = -x
        [1, 1, 0, 0, 1, 1],  # Salida = -y
        [0, 1, 1, 1, 1, 1],  # Salida = x + 1
        [1, 1, 0, 1, 1, 1],  # Salida = y + 1
        [0, 0, 1, 1, 1, 0],  # Salida = x - 1
        [1, 1, 0, 0, 1, 0],  # Salida = y - 1
        [0, 0, 0, 0, 1, 0],  # Salida = x + y
        [0, 1, 0, 0, 1, 1],  # Salida = x - y
        [0, 0, 0, 1, 1, 1],  # Salida = y - x
        [0, 0, 0, 0, 0, 0],  # Salida = x & y
        [0, 1, 0, 1, 0, 1],  # Salida = x | y
    ]
    
    test_x = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0]  # 2 en binario
    test_y = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1]  # 3 en binario
    
    operations = [
        "0", "1", "-1", "x", "y", "!x", "!y", "-x", "-y",
        "x+1", "y+1", "x-1", "y-1", "x+y", "x-y", "y-x", "x&y", "x|y"
    ]
    
    try:
        for i, (zx, nx, zy, ny, f, no) in enumerate(test_cases):
            out, zr, ng = ALU(test_x, test_y, zx, nx, zy, ny, f, no)
            print(f"ALU(x=2, y=3, control={[zx, nx, zy, ny, f, no]}) = "
                  f"{operations[i]} → (out={out}, zr={zr}, ng={ng})")
    except Exception as e:
        print(f"Error en ALU: {e}")

    # Verificación especial de la tabla de verdad de la ALU
    print("\nVerificación de casos específicos de la ALU:")
    # x = 0101 (5), y = 1010 (-6 en complemento a 2)
    x_test = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1]  # 5
    y_test = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0]  # -6 en C2
    
    # Verificación de x + y = -1
    out, zr, ng = ALU(x_test, y_test, 0, 0, 0, 0, 1, 0)  # x + y
    print(f"x + y = 5 + (-6) = -1: out={out}, zr={zr}, ng={ng}")
    
    # Verificación de 0
    out, zr, ng = ALU(x_test, y_test, 1, 0, 1, 0, 1, 0)  # 0
    print(f"0: out={out}, zr={zr}, ng={ng}")
    
    # Verificación de -1
    out, zr, ng = ALU(x_test, y_test, 1, 1, 1, 0, 1, 0)  # -1
    print(f"-1: out={out}, zr={zr}, ng={ng}")
    
    # Verificación de x
    out, zr, ng = ALU(x_test, y_test, 0, 0, 1, 1, 0, 0)  # x
    print(f"x (5): out={out}, zr={zr}, ng={ng}")
    
    # Verificación de y
    out, zr, ng = ALU(x_test, y_test, 1, 1, 0, 0, 0, 0)  # y
    print(f"y (-6): out={out}, zr={zr}, ng={ng}")
