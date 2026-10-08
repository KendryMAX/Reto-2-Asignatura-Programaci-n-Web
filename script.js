'use strict';

const patronVista = /^#[A-Za-z_][A-Za-z0-9_-]*$/;
const vistas = document.querySelectorAll('.vista');
const dialogoExito = document.querySelector('#dialogo-exito');
const formulario = document.querySelector('#formulario-registro');

function mostrarVista(selector) {
  if (!patronVista.test(selector)) {
    return;
  }
  const destino = document.querySelector(selector);
  if (!destino) {
    return;
  }
  vistas.forEach((vista) => {
    vista.hidden = vista !== destino;
  });
}

document.querySelectorAll('.menu-lista a').forEach((enlace) => {
  enlace.addEventListener('click', (evento) => {
    evento.preventDefault();
    mostrarVista(enlace.getAttribute('href'));
  });
});

if (dialogoExito) {
  dialogoExito.addEventListener('cancel', (evento) => {
    evento.preventDefault();
  });

  dialogoExito.addEventListener('close', () => {
    if (formulario) {
      formulario.reset();
    }
    mostrarVista('#inicio');
    window.scrollTo(0, 0);
  });
}

if (formulario) {
  const MENSAJES = {
    nombre: {
      valueMissing: 'Por favor, escriba su nombre.',
      patternMismatch: 'El nombre solo debe contener letras.'
    },
    ci: {
      valueMissing: 'Por favor, escriba su CI.',
      patternMismatch: 'El CI debe tener exactamente 11 dígitos y solo números.'
    },
    contrasena: {
      valueMissing: 'Por favor, escriba una contraseña.'
    },
    confirmacion: {
      valueMissing: 'Por favor, confirme su contraseña.'
    }
  };

  function mensajeDe(campo) {
    const reglas = MENSAJES[campo.name];
    if (reglas) {
      for (const regla of ['valueMissing', 'patternMismatch']) {
        if (campo.validity[regla]) {
          return reglas[regla];
        }
      }
    }
    if (campo.name === 'confirmacion') {
      const contrasena = formulario.elements.contrasena;
      if (contrasena.value && campo.value && contrasena.value !== campo.value) {
        return 'Las contraseñas no coinciden.';
      }
    }
    return '';
  }

  function errorDe(campo) {
    const contenedor = campo.closest('.campo');
    if (!contenedor) {
      return null;
    }
    return contenedor.querySelector('.error');
  }

  function mostrarError(campo) {
    const error = errorDe(campo);
    if (!error) {
      return;
    }
    error.textContent = campo.validationMessage;
    error.hidden = false;
  }

  function ocultarError(campo) {
    const error = errorDe(campo);
    if (!error) {
      return;
    }
    error.hidden = true;
  }

  function actualizarEstado(campo) {
    campo.setCustomValidity(mensajeDe(campo));
    if (campo.validity.valid) {
      ocultarError(campo);
    } else {
      mostrarError(campo);
    }
  }

  const contrasena = formulario.elements.contrasena;
  const confirmacion = formulario.elements.confirmacion;
  const nombre = formulario.elements.nombre;

  nombre.addEventListener('keydown', (evento) => {
    if (evento.key.length === 1 && /\d/.test(evento.key)) {
      evento.preventDefault();
    }
  });

  formulario.querySelectorAll('input').forEach((campo) => {
    campo.addEventListener('input', () => {
      actualizarEstado(campo);
      if (campo.name === 'contrasena' || campo.name === 'confirmacion') {
        actualizarEstado(confirmacion);
      }
    });

    campo.addEventListener('blur', () => {
      actualizarEstado(campo);
    });

    campo.addEventListener('invalid', () => {
      actualizarEstado(campo);
    });
  });

  formulario.addEventListener('submit', (evento) => {
    actualizarEstado(contrasena);
    actualizarEstado(confirmacion);

    if (!formulario.checkValidity()) {
      evento.preventDefault();
      const primerInvalido = formulario.querySelector(':invalid');
      if (primerInvalido) {
        primerInvalido.focus();
      }
      return;
    }

    evento.preventDefault();
    if (dialogoExito) {
      dialogoExito.showModal();
    }
  });

  formulario.addEventListener('reset', () => {
    formulario.querySelectorAll('.error').forEach((error) => {
      error.hidden = true;
    });
    formulario.querySelectorAll('input').forEach((campo) => {
      campo.setCustomValidity('');
    });
    formulario.elements.nombre.focus();
  });
}