# Code.py
# Módulo para traducir los mnemónicos de ensamblador Hack a código binario

class Code:
    """
    Proporciona métodos para traducir los mnemónicos de ensamblador Hack
    a sus representaciones binarias correspondientes.
    """
    
    @staticmethod
    def dest(mnemonic):
        """
        Retorna el código binario del campo dest (3 bits).
        
        Args:
            mnemonic (str): El mnemónico del campo dest o None
            
        Returns:
            str: El código binario de 3 bits correspondiente
        """
        # Tabla de traducción para el campo dest
        dest_table = {
            None: "000",  # No hay destino
            "": "000",    # No hay destino (string vacío)
            "M": "001",   # Memoria[A]
            "D": "010",   # Registro D
            "MD": "011",  # Memoria[A] y Registro D
            "A": "100",   # Registro A
            "AM": "101",  # Registro A y Memoria[A]
            "AD": "110",  # Registro A y Registro D
            "AMD": "111"  # Todos los destinos
        }
        
        if mnemonic in dest_table:
            return dest_table[mnemonic]
        else:
            raise ValueError(f"Código dest inválido: '{mnemonic}'")
    
    @staticmethod
    def comp(mnemonic):
        """
        Retorna el código binario del campo comp (7 bits).
        
        Args:
            mnemonic (str): El mnemónico del campo comp
            
        Returns:
            str: El código binario de 7 bits correspondiente
        """
        # Tabla de traducción para el campo comp
        comp_table = {
            "0": "0101010",
            "1": "0111111",
            "-1": "0111010",
            "D": "0001100",
            "A": "0110000", "M": "1110000",
            "!D": "0001101",
            "!A": "0110001", "!M": "1110001",
            "-D": "0001111",
            "-A": "0110011", "-M": "1110011",
            "D+1": "0011111",
            "A+1": "0110111", "M+1": "1110111",
            "D-1": "0001110",
            "A-1": "0110010", "M-1": "1110010",
            "D+A": "0000010", "D+M": "1000010",
            "D-A": "0010011", "D-M": "1010011",
            "A-D": "0000111", "M-D": "1000111",
            "D&A": "0000000", "D&M": "1000000",
            "D|A": "0010101", "D|M": "1010101"
        }
        
        if mnemonic in comp_table:
            return comp_table[mnemonic]
        else:
            raise ValueError(f"Código comp inválido: '{mnemonic}'")
    
    @staticmethod
    def jump(mnemonic):
        """
        Retorna el código binario del campo jump (3 bits).
        
        Args:
            mnemonic (str): El mnemónico del campo jump o None
            
        Returns:
            str: El código binario de 3 bits correspondiente
        """
        # Tabla de traducción para el campo jump
        jump_table = {
            None: "000",  # No hay salto
            "": "000",    # No hay salto (string vacío)
            "JGT": "001", # Salto si mayor que cero
            "JEQ": "010", # Salto si igual a cero
            "JGE": "011", # Salto si mayor o igual a cero
            "JLT": "100", # Salto si menor que cero
            "JNE": "101", # Salto si no igual a cero
            "JLE": "110", # Salto si menor o igual a cero
            "JMP": "111"  # Salto incondicional
        }
        
        if mnemonic in jump_table:
            return jump_table[mnemonic]
        else:
            raise ValueError(f"Código jump inválido: '{mnemonic}'")
            
    @staticmethod
    def a_instruction(value):
        """
        Convierte un valor numérico en una instrucción A de 16 bits.
        
        Args:
            value (int): El valor numérico (dirección)
            
        Returns:
            str: La instrucción A en formato binario de 16 bits
        """
        # Convertir a binario de 15 bits (sin el bit de opcode) y rellenar con ceros a la izquierda
        binary = bin(value)[2:].zfill(15)
        
        # Añadir el bit de opcode (0) para instrucciones A
        return "0" + binary