/*
 * mapeoDinosaurios.js:
 * Provee mapeos y utilidades para relacionar identificadores de dinosaurios
 * con imágenes, nombres y metadatos. Centraliza las referencias a recursos
 * para evitar duplicaciones en la interfaz.
 */

class MapeoDinosaurios {
  constructor() {

    this.imagenATipo = {
      'dino1': 'triceratops',
      'dino2': 'stegosaurus', 
      'dino3': 'brontosaurus',
      'dino4': 'trex',
      'dino5': 'velociraptor',
      'dino6': 'pteranodon'
    };

    this.tipoAImagen = {};
    Object.entries(this.imagenATipo).forEach(([imagen, tipo]) => {
      this.tipoAImagen[tipo] = imagen;
    });

    this.dinosaurios = {
      'dino1': {
        id: 'dino1',
        tipo: 'triceratops',
        nombre: 'Triceratops',
        imagen: 'Recursos/img/dino1.png',
        descripcion: 'Herbívoro con tres cuernos'
      },
      'dino2': {
        id: 'dino2',
        tipo: 'stegosaurus',
        nombre: 'Stegosaurus',
        imagen: 'Recursos/img/dino2.png',
        descripcion: 'Herbívoro con placas en el lomo'
      },
      'dino3': {
        id: 'dino3',
        tipo: 'brontosaurus',
        nombre: 'Brontosaurus',
        imagen: 'Recursos/img/dino3.png',
        descripcion: 'Herbívoro de cuello largo'
      },
      'dino4': {
        id: 'dino4',
        tipo: 'trex',
        nombre: 'T-Rex',
        imagen: 'Recursos/img/dino4.png',
        descripcion: 'Carnívoro rey de los dinosaurios'
      },
      'dino5': {
        id: 'dino5',
        tipo: 'velociraptor',
        nombre: 'Velociraptor',
        imagen: 'Recursos/img/dino5.png',
        descripcion: 'Carnívoro ágil y cazador'
      },
      'dino6': {
        id: 'dino6',
        tipo: 'pteranodon',
        nombre: 'Pteranodon',
        imagen: 'Recursos/img/dino6.png',
        descripcion: 'Reptil volador'
      }
    };
  }
  
  
  obtenerTipoDesdeSrc(src) {

    for (const [dinoId, tipo] of Object.entries(this.imagenATipo)) {
      if (src.includes(dinoId)) {
        return tipo;
      }
    }
    return 'desconocido';
  }
  
  
  obtenerImagenDesdeTipo(tipo) {
    return this.tipoAImagen[tipo] || 'dino1';
  }
  
  
  obtenerRutaImagenDesdeTipo(tipo) {
    const dinoId = this.obtenerImagenDesdeTipo(tipo);
    return `Recursos/img/${dinoId}.png`;
  }
  
  
  obtenerInfoPorTipo(tipo) {
    const dinoId = this.obtenerImagenDesdeTipo(tipo);
    return this.dinosaurios[dinoId] || null;
  }
  
  
  obtenerInfoPorId(dinoId) {
    return this.dinosaurios[dinoId] || null;
  }
  
  
  obtenerTodosLosTipos() {
    return Object.values(this.imagenATipo);
  }
  
  
  obtenerTodosLosIds() {
    return Object.keys(this.imagenATipo);
  }
  
  
  esTipoValido(tipo) {
    return Object.values(this.imagenATipo).includes(tipo);
  }
  
  
  esIdValido(dinoId) {
    return Object.keys(this.imagenATipo).includes(dinoId);
  }
  
  
  convertirElementoAObjeto(elementoDino) {
    const img = elementoDino.querySelector('img');
    if (!img) return null;
    
    const tipo = this.obtenerTipoDesdeSrc(img.src);
    const info = this.obtenerInfoPorTipo(tipo);
    
    return {
      elemento: elementoDino,
      tipo: tipo,
      id: info ? info.id : `temp_${tipo}`,
      imagen: img.src,
      nombre: info ? info.nombre : tipo,
      descripcion: info ? info.descripcion : ''
    };
  }
}

window.mapeoDinosaurios = new MapeoDinosaurios();

console.log('🦕 Sistema de mapeo de dinosaurios inicializado');