'use strict';

const d = document;
const $root = d.getElementById('root');

// Divide un array en grupos de tamaño "size"
function dividirEnGrupos(array, size) {
  const grupos = [];
  for (let i = 0; i < array.length; i += size) {
    grupos.push(array.slice(i, i + size));
  }
  return grupos;
}

// Divide el total en N carruseles
function dividirEnCarruseles(array, numCarruseles) {
  const tamaño = Math.ceil(array.length / numCarruseles);
  const resultado = [];
  for (let i = 0; i < numCarruseles; i++) {
    resultado.push(array.slice(i * tamaño, (i + 1) * tamaño));
  }
  return resultado;
}

// HTML y controles
function crearCarrusel(id, data) {
  const slides = dividirEnGrupos(data, 4); // 4 tarjetas por slide

  const indicators = slides.map((_, i) => `
    <button type="button" data-bs-target="#${id}" data-bs-slide-to="${i}" class="${i === 0 ? 'active' : ''}" aria-label="Slide ${i + 1}"></button>
  `).join('');

  const items = slides.map((grupo, i) => `
    <div class="carousel-item ${i === 0 ? 'active' : ''}">
      <div class="row">
        ${grupo.map(user => `
          <div class="col-12 col-sm-6 col-md-3 mb-3">
            <div class="card h-100 text-center border-black bg-light border-3">
              <img class="card-img-top" src="${user.usernameGithub ? `https://github.com/${user.usernameGithub}.png` : '../assets/icono.PNG'}" alt="${user.student}">
              <div class="card-body">
                <h5 class="card-title">${user.student}</h5>
                <a href="https://github.com/${user.usernameGithub}" target="_blank" class="btn btn-outline-primary btn-sm">GitHub</a>
                <button class="btn btn-outline-primary btn-sm btn-notas" data-alumno="${user.student}">Notas</button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  return `
    <div id="${id}" class="carousel slide mb-5" data-bs-ride="carousel" data-bs-interval="3000" data-bs-pause="false">
      <div class="carousel-indicators">${indicators}</div>
      <div class="carousel-inner">${items}</div>
      <button class="carousel-control-prev" type="button" data-bs-target="#${id}" data-bs-slide="prev">
        <span class="carousel-control-prev-icon"></span>
        <span class="visually-hidden">Anterior</span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#${id}" data-bs-slide="next">
        <span class="carousel-control-next-icon"></span>
        <span class="visually-hidden">Siguiente</span>
      </button>
    </div>
  `;
}

//notas

function mostrarNotas(nombreEstudiante) {
  fetch('file.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('No se pudo cargar el archivo JSON');
      }
      return response.json();
    })
    .then(datos => {
      const estudiante = datos.find(e => e.student === nombreEstudiante);

      if (!estudiante) {
        alert(`No se encontraron notas para ${nombreEstudiante}`);
        return;
      }

      //promediar notas
      let mensaje = `Estudiante: ${estudiante.student}\n\n`;
      estudiante.projects.forEach(proyecto => {
        const notas = proyecto.score;
        // Calcula el promedio original
        const promedioOriginal = notas.reduce((acc, val) => acc + val, 0) / notas.length;

        // Si hay más de una nota, escala el promedio al rango 1-5
        const promedioEscalado = notas.length > 1 
        ? (1 + promedioOriginal * 4)  // Formula para escalar de [0-1] a [1-5]
        : promedioOriginal;            // Si solo hay una nota, no se escala

        // Fija el número de decimales a 5 y convierte a string
        const promedioStr = promedioEscalado.toFixed(1); // controla el resultado y el numero de decimales con el tofixed

      mensaje += `- Proyecto: ${proyecto.name}\n  Notas: ${notas.join(', ')}\n  Promedio: ${promedioStr}\n\n`;
      });

      alert(mensaje);
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Ocurrió un error al cargar las notas.');
    });
}

// Fetch y renderizado
fetch('file.json')
  .then(res => res.json())
  .then(data => {
    const carruseles = dividirEnCarruseles(data, 4); // 4 carruseles
    let html = '';
    carruseles.forEach((grupo, i) => {
      html += crearCarrusel(`carrusel${i + 1}`, grupo);
    });
    $root.innerHTML = html;
  })
  .catch(err => console.error('Error al cargar datos:', err));

  //detectar cualquier clic en los botones de notas
  document.addEventListener('click', function (e) {
  if (e.target.matches('.btn-notas')) {
    e.preventDefault();
    const nombre = e.target.dataset.alumno;
    mostrarNotas(nombre);
  }
});