# Parser.py
# Módulo para analizar el código ensamblador Hack

import re

class Parser:
    """
    Analiza el código ensamblador Hack y descompone cada instrucción en sus componentes.
    """
    # Tipo de instrucciones
    A_INSTRUCTION = 'A_INSTRUCTION'  # Instrucción @xxx, donde xxx es un número o un símbolo
    C_INSTRUCTION = 'C_INSTRUCTION'  # Instrucción dest=comp;jump
    L_INSTRUCTION = 'L_INSTRUCTION'  # Pseudo-instrucción (Label), formato (xxx)
    
    def __init__(self, filename):
        """
        Abre el archivo de entrada y se prepara para analizarlo.
        
        Args:
            filename (str): Ruta del archivo .asm a analizar
        """
        self.filename = filename
        self.reset()
        
    def reset(self):
        """
        Reinicia el parser para una nueva lectura desde el principio del archivo.
        """
        self.file = open(self.filename, 'r')
        self.current_command = None
        self.current_line_num = 0
        self.next_valid_line = None
        
    def has_more_lines(self):
        """
        Verifica si hay más líneas en el archivo de entrada.
        
        Returns:
            bool: True si hay más líneas, False en caso contrario
        """
        if self.next_valid_line is not None:
            return True
            
        while True:
            line = self.file.readline()
            if not line:  # Fin del archivo
                return False
                
            self.current_line_num += 1
            # Elimina comentarios y espacios en blanco
            line = self._clean_line(line)
            
            if line:  # Si no es una línea vacía después de limpiarla
                self.next_valid_line = line
                return True
    
    def advance(self):
        """
        Lee la siguiente línea del archivo, la establece como la instrucción actual.
        Este método solo debe ser llamado si has_more_lines() es True.
        """
        if self.next_valid_line:
            self.current_command = self.next_valid_line
            self.next_valid_line = None
        else:
            while True:
                line = self.file.readline()
                if not line:  # Fin del archivo (no debería ocurrir si se verifica has_more_lines)
                    raise EOFError("Fin de archivo inesperado")
                    
                self.current_line_num += 1
                # Elimina comentarios y espacios en blanco
                line = self._clean_line(line)
                
                if line:  # Si no es una línea vacía después de limpiarla
                    self.current_command = line
                    break
    
    def instruction_type(self):
        """
        Devuelve el tipo de la instrucción actual.
        
        Returns:
            str: A_INSTRUCTION, C_INSTRUCTION o L_INSTRUCTION
        """
        if self.current_command.startswith('@'):
            return self.A_INSTRUCTION
        elif self.current_command.startswith('(') and self.current_command.endswith(')'):
            return self.L_INSTRUCTION
        else:
            return self.C_INSTRUCTION
    
    def symbol(self):
        """
        Devuelve el símbolo o valor decimal de la instrucción actual @XXX o (XXX).
        Este método debe ser llamado solo si instruction_type() es A_INSTRUCTION o L_INSTRUCTION.
        
        Returns:
            str: El símbolo o valor decimal XXX de @XXX o (XXX)
        """
        if self.instruction_type() == self.A_INSTRUCTION:
            return self.current_command[1:]  # Elimina el '@'
        elif self.instruction_type() == self.L_INSTRUCTION:
            return self.current_command[1:-1]  # Elimina los paréntesis
        else:
            raise ValueError("Llamada a symbol() con un tipo de instrucción incorrecto")
    
    def dest(self):
        """
        Devuelve el mnemónico dest de la instrucción C actual.
        Este método debe ser llamado solo si instruction_type() es C_INSTRUCTION.
        
        Returns:
            str: El mnemónico dest, o None si no hay destino
        """
        if self.instruction_type() != self.C_INSTRUCTION:
            raise ValueError("Llamada a dest() con un tipo de instrucción incorrecto")
            
        # Busca un '=' en la instrucción
        if '=' in self.current_command:
            return self.current_command.split('=')[0]
        else:
            return None
    
    def comp(self):
        """
        Devuelve el mnemónico comp de la instrucción C actual.
        Este método debe ser llamado solo si instruction_type() es C_INSTRUCTION.
        
        Returns:
            str: El mnemónico comp
        """
        if self.instruction_type() != self.C_INSTRUCTION:
            raise ValueError("Llamada a comp() con un tipo de instrucción incorrecto")
            
        # Elimina la parte del destino si existe
        command = self.current_command
        if '=' in command:
            command = command.split('=')[1]
            
        # Elimina la parte del salto si existe
        if ';' in command:
            command = command.split(';')[0]
            
        return command
    
    def jump(self):
        """
        Devuelve el mnemónico jump de la instrucción C actual.
        Este método debe ser llamado solo si instruction_type() es C_INSTRUCTION.
        
        Returns:
            str: El mnemónico jump, o None si no hay salto
        """
        if self.instruction_type() != self.C_INSTRUCTION:
            raise ValueError("Llamada a jump() con un tipo de instrucción incorrecto")
            
        # Busca un ';' en la instrucción
        if ';' in self.current_command:
            return self.current_command.split(';')[1]
        else:
            return None
    
    def _clean_line(self, line):
        """
        Elimina comentarios y espacios en blanco de una línea.
        
        Args:
            line (str): La línea a limpiar
            
        Returns:
            str: La línea limpia sin comentarios ni espacios en blanco
        """
        # Elimina comentarios
        if '//' in line:
            line = line.split('//')[0]
            
        # Elimina espacios en blanco
        line = line.strip()
        
        return line
        
    def close(self):
        """
        Cierra el archivo de entrada.
        """
        self.file.close()