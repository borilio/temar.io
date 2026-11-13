// Listado de cursos para el selector (npm run curso).
//
// - Cada curso indica la carpeta que tendrá dentro de cursos/ y la URL de su repo.
// - Si el curso no está descargado, el selector ofrece clonarlo (git clone).
// - "npm run curso descargar" clona todos los que falten.
// - El nombre del curso NO se pone aquí: se lee de su json/config.json (nombreCurso).
// - Solo cursos con repo PÚBLICO (este archivo está en el repo público de la app).
//   Un curso privado no se pone aquí: se clona a mano en cursos/ y el selector
//   lo mostrará igual, como "solo local".
// - Los cursos que estén en cursos/ y no aparezcan aquí también salen en el selector.

export default [
  {
    carpeta: 'angular',
    repo: 'https://github.com/borilio/curso-angular.git',
  },
  {
    carpeta: 'competencias-digitales',
    repo: 'https://github.com/borilio/curso-competencias-digitales.git',
  },
  {
    carpeta: 'microsoft365',
    repo: 'https://github.com/borilio/curso-microsoft365.git',
  },
  {
    carpeta: 'sqlite',
    repo: 'https://github.com/borilio/curso-sqlite.git',
  },
];
