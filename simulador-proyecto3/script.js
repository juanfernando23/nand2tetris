document.addEventListener('DOMContentLoaded', function() {
    // Función para manejar la navegación entre secciones
    const navLinks = document.querySelectorAll('.sidebar a');
    navLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        // Quitar clase "active" de todos y asignarla al enlace clicado
        navLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        // Ocultar todas las secciones
        const sections = document.querySelectorAll('.section');
        sections.forEach(sec => sec.classList.remove('visible'));
        // Mostrar la sección seleccionada
        const sectionId = this.dataset.section;
        document.getElementById(sectionId).classList.add('visible');
      });
    });
  
    /* =========================
       Componente: Bit (1 bit)
    ========================== */
    const bitLoadBtn = document.getElementById('bitLoadBtn');
    const bitInput = document.getElementById('bitInput');
    const bitOutput = document.getElementById('bitOutput');
  
    bitLoadBtn.addEventListener('click', function() {
      let value = parseInt(bitInput.value);
      // Solo se aceptan 0 o 1
      value = (value === 0 || value === 1) ? value : 0;
      bitOutput.textContent = value;
    });
  
    /* ============================
       Componente: Registro de 16 bits
    ============================ */
    const registerLoadBtn = document.getElementById('registerLoadBtn');
    const registerInput = document.getElementById('registerInput');
    const registerOutputContainer = document.getElementById('registerOutputContainer');
    const registerBinaryOutput = document.getElementById('registerBinaryOutput');
    const registerDecimalOutput = document.getElementById('registerDecimalOutput');
  
    function updateRegisterDisplay(value) {
      const binaryStr = value.toString(2).padStart(16, '0');
      registerBinaryOutput.textContent = binaryStr;
      registerDecimalOutput.textContent = value;
      // Actualizamos la representación de los 16 bits
      registerOutputContainer.innerHTML = '';
      for (let i = 0; i < 16; i++) {
        const span = document.createElement('span');
        span.textContent = binaryStr.charAt(i);
        registerOutputContainer.appendChild(span);
      }
    }
  
    registerLoadBtn.addEventListener('click', function() {
      let value = parseInt(registerInput.value);
      if (isNaN(value) || value < 0 || value > 65535) {
        value = 0;
      }
      updateRegisterDisplay(value);
    });
  
    /* ====================================================
       Función genérica para configurar módulos de RAM
    ======================================================*/
    function setupRAMModule(modulePrefix, moduleSize) {
      const addressInput = document.getElementById(modulePrefix + 'Address');
      const valueInput = document.getElementById(modulePrefix + 'InputValue');
      const loadBtn = document.getElementById(modulePrefix + 'LoadBtn');
      const outputContainer = document.getElementById(modulePrefix + 'OutputContainer');
      const binaryOutput = document.getElementById(modulePrefix + 'BinaryOutput');
      const decimalOutput = document.getElementById(modulePrefix + 'DecimalOutput');
  
      // Creamos un arreglo para simular los registros de la RAM
      const registers = new Array(moduleSize).fill(0);
  
      function updateDisplay(val) {
        const binaryStr = val.toString(2).padStart(16, '0');
        binaryOutput.textContent = binaryStr;
        decimalOutput.textContent = val;
        outputContainer.innerHTML = '';
        for (let i = 0; i < 16; i++) {
          const span = document.createElement('span');
          span.textContent = binaryStr.charAt(i);
          outputContainer.appendChild(span);
        }
      }
  
      loadBtn.addEventListener('click', function() {
        let addr = parseInt(addressInput.value);
        if (isNaN(addr) || addr < 0 || addr >= moduleSize) {
          addr = 0;
        }
        let value = parseInt(valueInput.value);
        if (isNaN(value) || value < 0 || value > 65535) {
          value = 0;
        }
        registers[addr] = value;
        updateDisplay(value);
      });
    }
  
    // Configuramos cada módulo de RAM
    setupRAMModule('ram8', 8);
    setupRAMModule('ram64', 64);
    setupRAMModule('ram512', 512);
    setupRAMModule('ram4k', 4096);
    setupRAMModule('ram16k', 16384);
  
    /* ================================
       Componente: Contador de Programa (PC)
    ==================================*/
    const pcBinaryOutput = document.getElementById('pcBinaryOutput');
    const pcDecimalOutput = document.getElementById('pcDecimalOutput');
    const pcLoadValue = document.getElementById('pcLoadValue');
    const pcLoadBtn = document.getElementById('pcLoadBtn');
    const pcIncrementBtn = document.getElementById('pcIncrementBtn');
    const pcStartAutoBtn = document.getElementById('pcStartAutoBtn');
    const pcResetBtn = document.getElementById('pcResetBtn');
  
    let pcValue = 0;
    let autoInterval = null;
  
    function updatePCDisplay() {
      const binaryStr = pcValue.toString(2).padStart(16, '0');
      pcBinaryOutput.textContent = binaryStr;
      pcDecimalOutput.textContent = pcValue;
    }
  
    pcLoadBtn.addEventListener('click', function() {
      let value = parseInt(pcLoadValue.value);
      if (isNaN(value) || value < 0 || value > 65535) {
        value = 0;
      }
      pcValue = value;
      updatePCDisplay();
    });
  
    pcIncrementBtn.addEventListener('click', function() {
      pcValue = (pcValue + 1) % 65536;
      updatePCDisplay();
    });
  
    pcResetBtn.addEventListener('click', function() {
      pcValue = 0;
      updatePCDisplay();
      // Si hay auto incremento activo, lo detenemos
      if (autoInterval) {
        clearInterval(autoInterval);
        autoInterval = null;
        pcStartAutoBtn.textContent = "Iniciar Auto";
      }
    });
  
    pcStartAutoBtn.addEventListener('click', function() {
      if (autoInterval) {
        // Detener auto incremento
        clearInterval(autoInterval);
        autoInterval = null;
        pcStartAutoBtn.textContent = "Iniciar Auto";
      } else {
        // Iniciar auto incremento cada 1 segundo
        autoInterval = setInterval(function() {
          pcValue = (pcValue + 1) % 65536;
          updatePCDisplay();
        }, 1000);
        pcStartAutoBtn.textContent = "Detener Auto";
      }
    });
  
    // Inicializamos la visualización del Contador de Programa
    updatePCDisplay();
  });
  