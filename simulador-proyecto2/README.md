# Simulador Visual de Chips Aritméticos (Proyecto 2)

Este simulador interactivo permite visualizar y experimentar con los chips aritméticos del Proyecto 2 del curso Nand2Tetris.

## Características

- Visualización interactiva de los chips: HalfAdder, FullAdder, Add16, Inc16 y ALU
- Interfaz gráfica que muestra la estructura interna de los chips
- Capacidad para modificar las entradas y ver cómo cambian las salidas en tiempo real
- Representación visual de los valores de bits y sus conexiones

## Cómo usar el simulador

1. Abre el archivo `index.html` en un navegador web moderno
2. Selecciona el chip que deseas visualizar usando el menú de navegación
3. Modifica los valores de entrada usando los interruptores o campos numéricos
4. Observa cómo cambian las salidas y la visualización del circuito en tiempo real

## Chips implementados

### HalfAdder (Medio Sumador)
Suma dos bits y produce un bit de suma y un bit de acarreo.

### FullAdder (Sumador Completo)
Suma tres bits (incluyendo un acarreo de entrada) y produce un bit de suma y un bit de acarreo.

### Add16 (Sumador de 16 bits)
Suma dos números de 16 bits representados en complemento a 2.

### Inc16 (Incrementador de 16 bits)
Incrementa en 1 un número de 16 bits.

### ALU (Unidad Aritmético-Lógica)
Implementa la ALU de la arquitectura Hack, capaz de realizar múltiples operaciones aritmé