document.addEventListener("DOMContentLoaded", () => {
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
