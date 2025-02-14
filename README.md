# Proyecto 1: Puertas Lógicas Elementales

Este proyecto forma parte del curso *Nand2Tetris* y tiene como objetivo implementar un conjunto de chips lógicos elementales que serán la base para la construcción de la CPU y la memoria (RAM) en proyectos posteriores.

## Objetivos del Proyecto

- Implementar chips lógicos básicos (exceptuando **Nand**, que ya está dado):
  - **Puertas elementales (1 bit):**
    - `Not`
    - `And`
    - `Or`
    - `Xor`
  - **Multiplexores y Demultiplexores (1 bit):**
    - `Mux`
    - `DMux`
  - **Operaciones de 16 bits (bit a bit):**
    - `Not16`
    - `And16`
    - `Or16`
    - `Mux16`
  - **Chips compuestos:**
    - `Or8Way`
    - `Mux4Way16`
    - `Mux8Way16`
    - `DMux4Way`
    - `DMux8Way`

## Archivos Proporcionados

Para cada chip se te han entregado tres archivos:

1. **Archivo HDL (`Xxx.hdl`):**  
   Contiene la estructura del chip y comentarios, pero la sección `PARTS` debe completarse con la implementación correcta.

2. **Script de prueba (`Xxx.tst`):**  
   Define cómo se deben probar los chips, indicando las entradas y salidas esperadas.

3. **Archivo de comparación (`Xxx.cmp`):**  
   Contiene las salidas correctas esperadas para cada prueba, las cuales serán usadas para validar tu implementación.

## Entornos de Desarrollo

Puedes trabajar en el proyecto utilizando uno de los siguientes entornos:

- **IDE Online de nand2tetris:**  
  La opción recomendada. Todos los archivos estarán disponibles en el navegador, lo que permite editar y probar el código HDL directamente.

- **Simulador de Escritorio:**  
  Descarga la suite de nand2tetris desde [nand2tetris.org](https://www.nand2tetris.org) y utiliza los archivos en la carpeta `projects/1`. Puedes editar los archivos HDL con cualquier editor de texto y probar tu código con el simulador de hardware incluido.

## Guía de Implementación

1. **Revisa la Documentación y Tutoriales:**  
   Antes de comenzar, revisa la [Guía del HDL](https://www.nand2tetris.org) y los tutoriales sobre el simulador de hardware. Esto te ayudará a comprender mejor la sintaxis y la lógica necesaria para la implementación.

2. **Completa la Sección `PARTS` en Cada Archivo HDL:**  
   Utiliza otros chips ya implementados para construir chips más complejos. Por ejemplo, puedes implementar `Not` a partir de `Nand`, o `Mux` combinando puertas `And` y `Or`.

3. **Prueba Tu Implementación:**  
   - En el **IDE Online**, ejecuta directamente los scripts de prueba.
   - En el **simulador de escritorio**, carga el script de prueba correspondiente y ejecuta las pruebas para comparar tus resultados con el archivo `.cmp`.

4. **Depuración y Correcciones:**  
   Si alguna prueba falla, revisa la implementación en la sección `PARTS`, verifica la lógica y compara con la implementación "builtin" (integrada) disponible en el simulador.

## Ejemplo de Implementación en Python (Para Entender la Lógica)

Se proporciona una implementación en Python para entender cómo funcionan las puertas lógicas y chips compuestos. Este ejemplo es **solo educativo** y refleja la lógica que deberás implementar en HDL.

```python
def NAND(a, b):
    return 0 if a == 1 and b == 1 else 1

def NOT(a):
    return NAND(a, a)

def AND(a, b):
    return NOT(NAND(a, b))

def OR(a, b):
    return NAND(NOT(a), NOT(b))

def XOR(a, b):
    return AND(OR(a, b), NAND(a, b))

def MUX(a, b, sel):
    return OR(AND(a, NOT(sel)), AND(b, sel))

def DMUX(inp, sel):
    return AND(inp, NOT(sel)), AND(inp, sel)

def NOT16(a):
    return [NOT(x) for x in a]

def AND16(a, b):
    return [AND(x, y) for x, y in zip(a, b)]

def OR16(a, b):
    return [OR(x, y) for x, y in zip(a, b)]

def MUX16(a, b, sel):
    return [MUX(x, y, sel) for x, y in zip(a, b)]

def OR8WAY(inp):
    result = 0
    for bit in inp:
        result = OR(result, bit)
    return result

def MUX4WAY16(a, b, c, d, sel):
    mux1 = MUX16(a, b, sel[0])
    mux2 = MUX16(c, d, sel[0])
    return MUX16(mux1, mux2, sel[1])

def MUX8WAY16(a, b, c, d, e, f, g, h, sel):
    mux_low = MUX4WAY16(a, b, c, d, [sel[1], sel[0]])
    mux_high = MUX4WAY16(e, f, g, h, [sel[1], sel[0]])
    return MUX16(mux_low, mux_high, sel[2])

def DMUX4WAY(inp, sel):
    a = AND(inp, AND(NOT(sel[1]), NOT(sel[0])))
    b = AND(inp, AND(NOT(sel[1]), sel[0]))
    c = AND(inp, AND(sel[1], NOT(sel[0])))
    d = AND(inp, AND(sel[1], sel[0]))
    return a, b, c, d

def DMUX8WAY(inp, sel):
    # Dividir la entrada según el tercer bit de selección
    a, b = DMUX(inp, sel[2])
    low_group = DMUX4WAY(a, [sel[1], sel[0]])
    high_group = DMUX4WAY(b, [sel[1], sel[0]])
    return low_group + high_group
