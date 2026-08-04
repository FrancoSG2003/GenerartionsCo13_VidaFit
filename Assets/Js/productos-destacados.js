(() => {
  "use strict";

  const botones = document.querySelectorAll(
    ".vf-destacados__agregar"
  );

  const mensaje = document.getElementById(
    "vf-destacados-mensaje"
  );

  if (!botones.length || !mensaje) {
    return;
  }

  let temporizador;

  botones.forEach((boton) => {
    boton.addEventListener("click", () => {
      const tarjeta = boton.closest(
        ".vf-destacados__producto"
      );

      if (!tarjeta) {
        return;
      }

      const nombre = tarjeta.dataset.nombre;
      const agregado = boton.classList.toggle("agregado");

      tarjeta.classList.toggle(
        "vf-destacados__producto--seleccionado",
        agregado
      );

      boton.textContent = agregado ? "✓" : "+";
      boton.setAttribute("aria-pressed", String(agregado));

      boton.setAttribute(
        "aria-label",
        agregado
          ? `Quitar ${nombre} de la selección`
          : `Agregar ${nombre}`
      );

      mensaje.textContent = agregado
        ? `${nombre} fue agregado a tu selección.`
        : `${nombre} fue retirado de tu selección.`;

      mensaje.classList.add(
        "vf-destacados__mensaje--visible"
      );

      clearTimeout(temporizador);

      temporizador = setTimeout(() => {
        mensaje.textContent = "";

        mensaje.classList.remove(
          "vf-destacados__mensaje--visible"
        );
      }, 3000);
    });
  });
})();