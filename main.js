document.addEventListener("DOMContentLoaded", () => {
  // ==================== FUNCIONALIDADES DE ACCESIBILIDAD ====================
  const a11yToggle = document.getElementById("a11y-toggle");
  const a11yMenu = document.getElementById("a11y-menu");
  const a11yClose = document.getElementById("a11y-close");
  const a11yReset = document.getElementById("a11y-reset");

  // Variables de opciones
  const readerCheckbox = document.getElementById("a11y-reader");
  const contrastCheckbox = document.getElementById("a11y-contrast");
  const fontSizeSlider = document.getElementById("a11y-font-size");
  const lineHeightSelect = document.getElementById("a11y-line-height");
  const linksCheckbox = document.getElementById("a11y-links");
  const readingModeCheckbox = document.getElementById("a11y-reading-mode");
  const animationsCheckbox = document.getElementById("a11y-animations");

  // Cargar configuración guardada
  function loadA11ySettings() {
    const saved = localStorage.getItem("a11ySettings");
    if (saved) {
      const settings = JSON.parse(saved);
      
      if (settings.contrast) {
        contrastCheckbox.checked = true;
        document.documentElement.classList.add("a11y-high-contrast");
      }
      
      if (settings.fontSize) {
        fontSizeSlider.value = settings.fontSize;
        applyFontSize(settings.fontSize);
      }
      
      if (settings.lineHeight) {
        lineHeightSelect.value = settings.lineHeight;
        applyLineHeight(settings.lineHeight);
      }
      
      if (settings.links) {
        linksCheckbox.checked = true;
        document.documentElement.classList.add("a11y-links");
      }
      
      if (settings.readingMode) {
        readingModeCheckbox.checked = true;
        document.documentElement.classList.add("a11y-reading-mode");
      }
      
      if (settings.noAnimations) {
        animationsCheckbox.checked = true;
        document.documentElement.classList.add("a11y-no-animations");
      }
    }
  }

  // Guardar configuración
  function saveA11ySettings() {
    const settings = {
      contrast: contrastCheckbox.checked,
      fontSize: fontSizeSlider.value,
      lineHeight: lineHeightSelect.value,
      links: linksCheckbox.checked,
      readingMode: readingModeCheckbox.checked,
      noAnimations: animationsCheckbox.checked
    };
    localStorage.setItem("a11ySettings", JSON.stringify(settings));
  }

  // Alternar panel
  a11yToggle.addEventListener("click", () => {
    const isHidden = a11yMenu.classList.contains("hidden");
    if (isHidden) {
      a11yMenu.classList.remove("hidden");
      a11yToggle.setAttribute("aria-expanded", "true");
    } else {
      a11yMenu.classList.add("hidden");
      a11yToggle.setAttribute("aria-expanded", "false");
    }
  });

  // Cerrar panel
  a11yClose.addEventListener("click", () => {
    a11yMenu.classList.add("hidden");
    a11yToggle.setAttribute("aria-expanded", "false");
  });

  // Contraste alto
  contrastCheckbox.addEventListener("change", () => {
    if (contrastCheckbox.checked) {
      document.documentElement.classList.add("a11y-high-contrast");
    } else {
      document.documentElement.classList.remove("a11y-high-contrast");
    }
    saveA11ySettings();
  });

  // Tamaño de fuente
  function applyFontSize(size) {
    document.documentElement.style.fontSize = size + "px";
  }

  fontSizeSlider.addEventListener("input", () => {
    applyFontSize(fontSizeSlider.value);
    saveA11ySettings();
  });

  // Espaciado de línea
  function applyLineHeight(value) {
    document.documentElement.style.lineHeight = value;
  }

  lineHeightSelect.addEventListener("change", () => {
    applyLineHeight(lineHeightSelect.value);
    saveA11ySettings();
  });

  // Resaltar enlaces
  linksCheckbox.addEventListener("change", () => {
    if (linksCheckbox.checked) {
      document.documentElement.classList.add("a11y-links");
    } else {
      document.documentElement.classList.remove("a11y-links");
    }
    saveA11ySettings();
  });

  // Modo lectura
  readingModeCheckbox.addEventListener("change", () => {
    if (readingModeCheckbox.checked) {
      document.documentElement.classList.add("a11y-reading-mode");
    } else {
      document.documentElement.classList.remove("a11y-reading-mode");
    }
    saveA11ySettings();
  });

  // Pausar animaciones
  animationsCheckbox.addEventListener("change", () => {
    if (animationsCheckbox.checked) {
      document.documentElement.classList.add("a11y-no-animations");
    } else {
      document.documentElement.classList.remove("a11y-no-animations");
    }
    saveA11ySettings();
  });

  // Lector de voz - VERSIÓN MEJORADA
  let isUserStopping = false;
  
  if (readerCheckbox) {
    readerCheckbox.addEventListener("change", function() {
      console.log("Reader checkbox cambió:", this.checked);
      if (this.checked) {
        isUserStopping = false;
        speakPageContent();
      } else {
        isUserStopping = true;
        stopSpeaking();
      }
    });
  }

  function speakPageContent() {
    try {
      // Cancelar cualquier síntesis anterior
      window.speechSynthesis.cancel();
      
      // Esperar un poco antes de comenzar
      setTimeout(() => {
        const text = getPageText();
        
        if (!text || text.trim().length === 0) {
          alert("No hay contenido para leer");
          if (readerCheckbox) readerCheckbox.checked = false;
          return;
        }

        console.log("Iniciando lectura de:", text.substring(0, 100) + "...");
        
        // Crear utterance
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "es-ES";
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onstart = function() {
          console.log("Lectura iniciada");
        };

        utterance.onend = function() {
          console.log("Lectura finalizada");
          if (readerCheckbox && !isUserStopping) readerCheckbox.checked = false;
        };

        utterance.onerror = function(event) {
          console.error("Error al leer:", event.error);
          // Solo mostrar alerta si el usuario no detuvo deliberadamente
          if (event.error !== "interrupted" && !isUserStopping) {
            alert("Error al leer el contenido: " + event.error);
          }
          if (readerCheckbox) readerCheckbox.checked = false;
        };

        // Hablar
        window.speechSynthesis.speak(utterance);
      }, 100);
      
    } catch (error) {
      console.error("Error en speakPageContent:", error);
      alert("Error: " + error.message);
      if (readerCheckbox) readerCheckbox.checked = false;
    }
  }

  function stopSpeaking() {
    window.speechSynthesis.cancel();
    console.log("Lectura detenida");
  }

  function getPageText() {
    try {
      // Obtener el elemento principal
      const pageElement = document.querySelector(".page");
      let text = "";
      
      if (pageElement) {
        // Si existe la clase page, usar eso
        text = pageElement.innerText;
      } else {
        // Si no, usar todo el body
        text = document.body.innerText;
      }
      
      // Limpiar espacios en blanco excesivos
      text = text.replace(/\s+/g, " ").trim();
      
      return text;
    } catch (error) {
      console.error("Error obteniendo texto:", error);
      return "No se pudo obtener el contenido de la página";
    }
  }

  // Restablecer configuración
  a11yReset.addEventListener("click", () => {
    // Reiniciar valores
    contrastCheckbox.checked = false;
    fontSizeSlider.value = 16;
    lineHeightSelect.value = "1.5";
    linksCheckbox.checked = false;
    readingModeCheckbox.checked = false;
    animationsCheckbox.checked = false;
    readerCheckbox.checked = false;

    // Remover clases
    document.documentElement.classList.remove("a11y-high-contrast", "a11y-links", "a11y-reading-mode", "a11y-no-animations");
    
    // Remover estilos inline
    document.documentElement.style.fontSize = "";
    document.documentElement.style.lineHeight = "";

    // Detener síntesis de voz si está activa
    if (isSpeaking) {
      stopTextToSpeech();
    }

    // Limpiar almacenamiento local
    localStorage.removeItem("a11ySettings");
  });

  // Cargar configuración al iniciar
  loadA11ySettings();

  // ==================== RESTO DE FUNCIONALIDADES ====================
  
  // 1. Actualizar año en footer
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // 2. Navegación suave (smooth scroll)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });
  });

  // 3. Manejo del formulario
  const contactForm = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");

  if (contactForm) {
    contactForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      
      // Validar checkbox de términos y condiciones
      const aceptaTerminos = document.getElementById("aceptaTerminos");
      if (aceptaTerminos && !aceptaTerminos.checked) {
        if (formStatus) {
          formStatus.textContent = "Debes aceptar los Términos y Condiciones para continuar.";
          formStatus.style.color = "#ef4444";
        }
        aceptaTerminos.focus();
        return;
      }
      
      if (formStatus) {
        formStatus.textContent = "Enviando tu mensaje...";
        formStatus.style.color = "var(--primary)";
      }

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      const formData = new FormData(contactForm);

      try {
        const resp = await fetch(contactForm.action, {
          method: contactForm.method || 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });

        if (resp.ok) {
          if (formStatus) {
            formStatus.textContent = "Mensaje enviado. Te responderé pronto.";
            formStatus.style.color = "#15803d"; // verde
          }
          contactForm.reset();
        } else {
          const data = await resp.json().catch(() => null);
          const msg = data && data.error ? data.error : 'Error al enviar. Intenta de nuevo.';
          if (formStatus) {
            formStatus.textContent = msg;
            formStatus.style.color = "#ef4444";
          }
        }
      } catch (err) {
        if (formStatus) {
          formStatus.textContent = "Error de red. Intenta de nuevo.";
          formStatus.style.color = "#ef4444";
        }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  // 4. Efecto hover en tarjetas de servicios
  const serviceCards = document.querySelectorAll(".service-card");
  serviceCards.forEach(card => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-4px)";
      this.style.boxShadow = "0 20px 40px rgba(15, 23, 42, 0.12)";
      this.style.transition = "all 0.3s ease";
    });

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)";
      this.style.boxShadow = "0 14px 26px rgba(15, 23, 42, 0.06)";
    });
  });

  // 5. Animación de números en las métricas (cuando entran en vista)
  const observerOptions = {
    threshold: 0.5,
    rootMargin: "0px 0px -100px 0px"
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = "fadeInUp 0.6s ease forwards";
      }
    });
  }, observerOptions);

  // Observar tarjetas de servicios
  serviceCards.forEach(card => observer.observe(card));

  // 6. Validación del formulario en tiempo real
  const inputs = contactForm?.querySelectorAll("input[required], textarea[required]");
  if (inputs) {
    inputs.forEach(input => {
      input.addEventListener("blur", function () {
        validateField(this);
      });
    });
  }

  // Función de validación
  function validateField(field) {
    if (!field.value.trim()) {
      field.style.borderColor = "#ef4444";
      field.style.background = "rgba(239, 68, 68, 0.05)";
    } else {
      field.style.borderColor = "rgba(148, 163, 184, 0.55)";
      field.style.background = "#f9fafb";
    }
  }

  // 7. Efecto activo en la navegación al hacer scroll
  const navLinks = document.querySelectorAll("nav a");
  window.addEventListener("scroll", () => {
    let current = "";
    const sections = document.querySelectorAll("section");

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (pageYOffset >= sectionTop - 200) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active");
      }
    });
  });

  // 9. Mobile menu toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mainNav = document.getElementById('main-nav');
  if (mobileMenuBtn && mainNav) {
    mobileMenuBtn.addEventListener('click', function () {
      const expanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', String(!expanded));
      if (!expanded) {
        mainNav.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      } else {
        mainNav.style.display = 'none';
        document.body.style.overflow = '';
      }
    });

    // Close button inside mobile nav
    const mobileMenuClose = document.getElementById('mobileMenuClose');
    if (mobileMenuClose) {
      mobileMenuClose.addEventListener('click', () => {
        mainNav.style.display = 'none';
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    }

    // Close menu on link click
    mainNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mainNav.style.display = 'none';
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // 8. Log de inicialización
  console.log("ACADEXA - Aplicación inicializada correctamente");
});

// Animación CSS (agregar a estilos si se necesita)
// @keyframes fadeInUp {
//   from {
//     opacity: 0;
//     transform: translateY(20px);
//   }
//   to {
//     opacity: 1;
//     transform: translateY(0);
//   }
// }
