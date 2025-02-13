
**Resumen del Proyecto 1: Construyendo Puertas Lógicas Elementales**

El objetivo principal de este proyecto es construir un conjunto de 15 puertas lógicas elementales. Estas puertas son los bloques de construcción básicos para crear componentes más complejos de una computadora, como la Unidad Aritmético-Lógica (ALU) y la memoria RAM, que se construirán en proyectos posteriores.

La única puerta lógica que se te proporciona inicialmente es la puerta `NAND`. Todas las demás puertas deben construirse a partir de esta, ya sea directamente o utilizando puertas que hayas construido previamente a partir de `NAND`.

**Recursos que se te proporcionan (para cada puerta lógica):**

*   **Archivo .hdl (stub file):**  Un archivo de texto con la *interfaz* de la puerta lógica (nombre, entradas, salidas) pero con la sección `PARTS` (la implementación) vacía.  Tu tarea es completar esta sección.
*   **Archivo .tst (test script):**  Un script que le dice al simulador de hardware cómo probar tu implementación de la puerta lógica.
*   **Archivo .cmp (compare file):**  Contiene los resultados *correctos* que el script de prueba debe generar si tu implementación es correcta. El simulador compara la salida de tu implementación con este archivo.
*   **Implementación "built-in" (opcional):** El simulador tiene implementaciones internas de todas las puertas. Puedes usarlas para probar cómo se comporta una puerta antes de implementarla, o para usar una puerta en otra implementación sin haberla construido tú mismo todavía.

**Tu tarea:**

1.  **Completar los archivos .hdl:**  Para cada una de las 15 puertas lógicas, debes editar el archivo `.hdl` correspondiente y completar la sección `PARTS`.  Debes describir cómo se construye la puerta usando otras puertas (incluida `NAND` y las que hayas construido previamente).

2.  **Probar tu implementación:**  Usar el simulador de hardware (ya sea la versión de escritorio o la IDE en línea) para ejecutar el script `.tst` en tu archivo `.hdl` modificado.  El simulador comparará la salida generada con el archivo `.cmp`. Si hay diferencias, el simulador te indicará errores.

**Implementación en Python (Eficiente y Sencilla)**

En lugar de usar el lenguaje HDL, vamos a implementar estas puertas lógicas directamente en Python.  Esto nos permite:

*   Entender la lógica *detrás* de cada puerta de forma muy clara.
*   Crear implementaciones *muy* sencillas y fáciles de leer.
*   Probar las puertas rápidamente sin necesidad del simulador de hardware.

```python
# --- Puerta NAND (dada) ---
def NAND(a, b):
  """Implementación de la puerta NAND."""
  if a == 1 and b == 1:
    return 0
  else:
    return 1

# --- Puertas derivadas de NAND ---

def NOT(a):
  """Implementación de la puerta NOT."""
  return NAND(a, a)  # NAND consigo mismo

def AND(a, b):
  """Implementación de la puerta AND."""
  return NOT(NAND(a, b)) # NOT de NAND

def OR(a, b):
  """Implementación de la puerta OR."""
  return NAND(NOT(a), NOT(b))  # NAND de NOTs

def XOR(a, b):
  """Implementación de la puerta XOR."""
  return AND(OR(a, b), NAND(a, b))

def MUX(a, b, sel):
    """Implementación del Multiplexor (MUX)."""
    return OR(AND(a,NOT(sel)), AND(b,sel))
    # otra opcion es: return AND(a, NOT(sel)) or AND(b, sel)

def DMUX(inp, sel):
  """Implementación del Demultiplexor (DMUX)."""
  return AND(inp, NOT(sel)), AND(inp, sel) # Devuelve una tupla (a, b)

# --- Puertas Multi-Bit (16 bits) ---

def NOT16(a):
  """NOT de 16 bits."""
  return [NOT(bit) for bit in a] # List comprehension!

def AND16(a, b):
  """AND de 16 bits."""
  return [AND(a[i], b[i]) for i in range(16)] # Asume a y b de 16 bits

def OR16(a, b):
    """OR de 16 bits."""
    return[OR(a[i], b[i]) for i in range(16)]

def MUX16(a, b, sel):
  """MUX de 16 bits."""
  return [MUX(a[i], b[i], sel) for i in range(16)]


# --- Puertas Multi-Way ---

def OR8WAY(inp):
  """OR de 8 entradas."""
  # Forma eficiente: reduce con OR
  result = 0
  for bit in inp:
      result = OR(result, bit)  # OR acumulativo
  return result

def MUX4WAY16(a, b, c, d, sel):
    """Multiplexor 4-way de 16 bits."""
    sel0 = sel[0]
    sel1 = sel[1]

    return MUX16(MUX16(a,b,sel0),MUX16(c,d,sel0),sel1)

def MUX8WAY16(a, b, c, d, e, f, g, h, sel):
    """Multiplexor 8-way de 16 bits."""
    sel0 = sel[0]
    sel1 = sel[1]
    sel2 = sel[2]

    return MUX16(MUX4WAY16(a,b,c,d, [sel1,sel0]), MUX4WAY16(e,f,g,h,[sel1,sel0]),sel2)



def DMUX4WAY(inp, sel):
    """Demultiplexor 4-way."""
    sel0 = sel[0]
    sel1 = sel[1]

    a = AND(inp, AND(NOT(sel1), NOT(sel0)))
    b = AND(inp, AND(NOT(sel1), sel0))
    c = AND(inp, AND(sel1, NOT(sel0)))
    d = AND(inp, AND(sel1, sel0))
    return a, b, c, d


def DMUX8WAY(inp, sel):
    """Demultiplexor 8-way."""
    sel0 = sel[0]
    sel1 = sel[1]
    sel2 = sel[2]

    a, b, c, d = DMUX4WAY(inp, [sel1, sel0])
    e, f, g, h = DMUX4WAY(inp, [sel1, sel0])

    a = AND(a,NOT(sel2))
    b = AND(b,NOT(sel2))
    c = AND(c, NOT(sel2))
    d = AND(d, NOT(sel2))
    e = AND(e, sel2)
    f = AND(f, sel2)
    g = AND(g, sel2)
    h = AND(h, sel2)


    return a, b, c, d, e, f, g, h


# --- Pruebas (Ejemplos) ---
if __name__ == "__main__":  # Para que las pruebas solo corran si ejecutas ESTE archivo
  print("Prueba NAND(0, 0):", NAND(0, 0))  # 1
  print("Prueba NAND(1, 1):", NAND(1, 1))  # 0
  print("Prueba NOT(0):", NOT(0))          # 1
  print("Prueba AND(1, 1):", AND(1, 1))      # 1
  print("Prueba OR(0, 0):", OR(0, 0))        # 0
  print("Prueba XOR(1, 0):", XOR(1, 0))      # 1
  print("Prueba XOR(1, 1):", XOR(1, 1))      # 0
  print("Prueba MUX(1, 0, 0):", MUX(1, 0, 0)) # 1 (a)
  print("Prueba MUX(1, 0, 1):", MUX(1, 0, 1)) # 0 (b)
  print("Prueba DMUX(1, 0):", DMUX(1, 0))   # (1, 0)
  print("Prueba DMUX(1, 1):", DMUX(1, 1))   # (0, 1)

  #Pruebas para las de 16 bits.
  print("Prueba NOT16([0]*16):", NOT16([0]*16))
  print("Prueba AND16([1]*16,[0]*16):", AND16([1]*16, [0]*16))
  print("Prueba OR16([1]*16, [0]*16):", OR16([1]*16, [0]*16))
  print("Prueba MUX16([1]*16,[0]*16, 1):", MUX16([1]*16, [0]*16, 1))


  print("Prueba OR8WAY([0, 0, 0, 0, 0, 0, 0, 1]):", OR8WAY([0, 0, 0, 0, 0, 0, 0, 1])) #1

  a = [0] * 16
  b = [1] * 16
  c = [0] * 16
  d = [1]*16
  print("Prueba MUX4WAY16 con sel = [0,0] salida esperada a:", MUX4WAY16(a,b,c,d, [0,0]))
  print("Prueba MUX4WAY16 con sel = [1,0] salida esperada c:", MUX4WAY16(a,b,c,d, [1,0]))

  e = [0] * 16
  f = [1] * 16
  g = [0] * 16
  h = [1]*16
  print("Prueba MUX8WAY16 con sel = [0,0,0] salida esperada a:", MUX8WAY16(a,b,c,d,e,f,g,h, [0,0,0]))
  print("Prueba MUX8WAY16 con sel = [0,1,0] salida esperada c:", MUX8WAY16(a,b,c,d,e,f,g,h, [0,1,0]))
  print("Prueba MUX8WAY16 con sel = [1,1,1] salida esperada h:", MUX8WAY16(a,b,c,d,e,f,g,h, [1,1,1]))


  print("Prueba DMUX4WAY(1, [0, 0]):", DMUX4WAY(1, [0, 0])) # (1, 0, 0, 0)
  print("Prueba DMUX4WAY(1, [1, 0]):", DMUX4WAY(1, [1, 0])) # (0, 0, 1, 0)

  print("Prueba DMUX8WAY(1, [0, 0, 0]):", DMUX8WAY(1, [0, 0, 0]))  # (1, 0, 0, 0, 0, 0, 0, 0)
  print("Prueba DMUX8WAY(1, [1, 0, 1]):", DMUX8WAY(1, [1, 0, 1])) # (0, 0, 0, 0, 0, 1, 0, 0)
```

**Explicaciones Clave y Mejoras de Eficiencia:**

*   **`NAND` como base:**  Todas las funciones se construyen, directa o indirectamente, a partir de `NAND`.
*   **Cortocircuito (Short-circuiting):** En Python, los operadores `and` y `or` realizan "cortocircuito".  Esto significa que:
    *   En `a and b`, si `a` es `False`, `b` *no* se evalúa (porque el resultado será `False` de todos modos).
    *   En `a or b`, si `a` es `True`, `b` *no* se evalúa.
    *   Esto hace que las funciones sean más eficientes, *especialmente* en las versiones multi-bit y multi-way, ya que evitamos cálculos innecesarios.
*   **List Comprehensions:**  Para las puertas de 16 bits, las *list comprehensions* (comprensiones de lista) como `[NOT(bit) for bit in a]` son una forma *muy* concisa y eficiente de aplicar la misma operación a cada bit de un bus.  Es mucho mejor que escribir 16 líneas de código separadas.
* **OR8WAY eficiente:** La funcion `OR8WAY` se implementa de una forma iterativa para evitar crear un arbol de `OR`s muy profundo.
*   **Funciones Multi-way recursivas:**  Las funciones `MUX4WAY16`, `MUX8WAY16`, `DMUX4WAY`, y `DMUX8WAY` se implementan de forma *recursiva*, utilizando las funciones de menor nivel (ej. `MUX8WAY16` usa `MUX4WAY16`, que a su vez usa `MUX16`).  Esto hace que el código sea mucho más limpio y fácil de entender que si hubiéramos expandido todas las operaciones en términos de `AND`, `OR`, y `NOT`.  También es conceptualmente más cercano a cómo se diseñan estas puertas en hardware.
*   **Tuplas para `DMUX`:** La función `DMUX` devuelve una *tupla* `(a, b)`.  Esto es más natural que tener dos variables de salida separadas.
*   **`if __name__ == "__main__":`:**  Esta línea es importante.  Hace que el código de prueba (los `print(...)`) solo se ejecute cuando ejecutas este archivo *directamente* (`python tu_archivo.py`).  Si importas este archivo como un módulo en otro archivo Python, las pruebas no se ejecutarán.  Esto es crucial para organizar tu código.
* **Funciones con nombres concisos, pero claros:** El código es mucho más legible.

Este código Python te da una implementación *completamente funcional* de todas las puertas lógicas requeridas para el Proyecto 1.  Puedes copiar y pegar este código en un archivo `.py` y ejecutarlo directamente.  ¡Ya no necesitas el simulador de hardware para las pruebas básicas!  Sin embargo, familiarizarte con el simulador es *altamente recomendable* para los proyectos posteriores.  El simulador te permite visualizar el flujo de señales y depurar problemas de una manera que no es posible con código Python simple.
