# Assembler.py
# Ensamblador para la plataforma Hack - Proyecto 6 de Nand2Tetris

import os
import sys
from Parser import Parser
from Code import Code
from SymbolTable import SymbolTable

def is_number(s):
    """
    Verifica si una cadena es un número.
    
    Args:
        s (str): La cadena a verificar
        
    Returns:
        bool: True si la cadena representa un número, False en caso contrario
    """
    try:
        int(s)
        return True
    except ValueError:
        return False

def assemble(input_file):
    """
    Ensambla un archivo .asm en un archivo .hack usando el proceso de dos pasadas.
    
    Args:
        input_file (str): Ruta del archivo .asm a ensamblar
    """
    # Derivar el nombre del archivo de salida
    output_file = os.path.splitext(input_file)[0] + ".hack"
    
    # Inicializar la tabla de símbolos con los símbolos predefinidos
    symbol_table = SymbolTable()
    
    # Primera pasada: Construir la tabla de símbolos para las etiquetas
    print(f"Primera pasada: Analizando etiquetas en {input_file}...")
    parser = Parser(input_file)
    rom_address = 0  # Contador de instrucciones (direcciones ROM)
    
    while parser.has_more_lines():
        parser.advance()
        inst_type = parser.instruction_type()
        
        if inst_type == Parser.L_INSTRUCTION:
            # Encontramos una etiqueta, la añadimos a la tabla de símbolos
            symbol = parser.symbol()
            if not symbol_table.contains(symbol):
                symbol_table.add_entry(symbol, rom_address)
        else:
            # Para instrucciones A o C, incrementamos el contador de ROM
            rom_address += 1
    
    parser.close()
    
    # Segunda pasada: Traducir las instrucciones
    print(f"Segunda pasada: Traduciendo instrucciones...")
    parser = Parser(input_file)  # Reiniciamos el parser
    
    with open(output_file, 'w') as f_out:
        while parser.has_more_lines():
            parser.advance()
            inst_type = parser.instruction_type()
            
            if inst_type == Parser.A_INSTRUCTION:
                # Instrucción A (@xxx)
                symbol = parser.symbol()
                if is_number(symbol):
                    # Es un valor numérico directo
                    value = int(symbol)
                else:
                    # Es un símbolo (etiqueta o variable)
                    if not symbol_table.contains(symbol):
                        # Es una nueva variable, la añadimos a la tabla
                        symbol_table.add_variable(symbol)
                    value = symbol_table.get_address(symbol)
                
                # Convertir el valor a binario y escribir al archivo
                binary_code = Code.a_instruction(value)
                f_out.write(binary_code + "\n")
                
            elif inst_type == Parser.C_INSTRUCTION:
                # Instrucción C (dest=comp;jump)
                dest_mnemonic = parser.dest()
                comp_mnemonic = parser.comp()
                jump_mnemonic = parser.jump()
                
                # Traducir a binario
                dest_bits = Code.dest(dest_mnemonic)
                comp_bits = Code.comp(comp_mnemonic)
                jump_bits = Code.jump(jump_mnemonic)
                
                # Ensamblar la instrucción C completa (111 + comp + dest + jump)
                binary_code = "111" + comp_bits + dest_bits + jump_bits
                f_out.write(binary_code + "\n")
                
            # Ignoramos las instrucciones L (etiquetas) en la segunda pasada
    
    parser.close()
    print(f"Ensamblado completado. Resultado guardado en {output_file}")

def main():
    """
    Función principal que maneja la entrada de línea de comandos.
    """
    if len(sys.argv) != 2:
        print("Uso: python Assembler.py archivo.asm")
        sys.exit(1)
        
    input_file = sys.argv[1]
    
    # Verificar que el archivo de entrada existe y tiene extensión .asm
    if not os.path.isfile(input_file):
        print(f"Error: El archivo '{input_file}' no existe.")
        sys.exit(1)
    
    if not input_file.endswith('.asm'):
        print(f"Error: El archivo '{input_file}' no tiene la extensión .asm")
        sys.exit(1)
    
    # Ensamblar el archivo
    assemble(input_file)

if __name__ == "__main__":
    main()