/**
 * Sistema centralizado de mapeo de dinosaurios
 * Convierte entre IDs de imagen (dino1, dino2, etc.) y nombres de tipos
 */
class MapeoDinosaurios {
  constructor() {
    // Mapeo principal: ID de imagen → tipo de dinosaurio
    this.imagenATipo = {
      'dino1': 'triceratops',
      'dino2': 'stegosaurus', 
      'dino3': 'brontosaurus',
      'dino4': 'trex',
      'dino5': 'velociraptor',
      'dino6': 'pteranodon'
    };
    
    // Mapeo inverso: tipo de dinosaurio → ID de imagen
    this.tipoAImagen = {};
    Object.entries(this.imagenATipo).forEach(([imagen, tipo]) => {
      this.tipoAImagen[tipo] = imagen;
    });
    
    // Mapeo completo con información adicional
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
  
  /**
   * Obtiene el tipo de dinosaurio desde el src de una imagen
   */
  obtenerTipoDesdeSrc(src) {
    // Buscar qué dino corresponde al src
    for (const [dinoId, tipo] of Object.entries(this.imagenATipo)) {
      if (src.includes(dinoId)) {
        return tipo;
      }
    }
    return 'desconocido';
  }
  
  /**
   * Obtiene el ID de imagen desde un tipo de dinosaurio
   */
  obtenerImagenDesdeTipo(tipo) {
    return this.tipoAImagen[tipo] || 'dino1';
  }
  
  /**
   * Obtiene la ruta completa de la imagen desde un tipo
   */
  obtenerRutaImagenDesdeTipo(tipo) {
    const dinoId = this.obtenerImagenDesdeTipo(tipo);
    return `Recursos/img/${dinoId}.png`;
  }
  
  /**
   * Obtiene información completa de un dinosaurio por tipo
   */
  obtenerInfoPorTipo(tipo) {
    const dinoId = this.obtenerImagenDesdeTipo(tipo);
    return this.dinosaurios[dinoId] || null;
  }
  
  /**
   * Obtiene información completa de un dinosaurio por ID de imagen
   */
  obtenerInfoPorId(dinoId) {
    return this.dinosaurios[dinoId] || null;
  }
  
  /**
   * Obtiene todos los tipos de dinosaurios disponibles
   */
  obtenerTodosLosTipos() {
    return Object.values(this.imagenATipo);
  }
  
  /**
   * Obtiene todos los IDs de imagen disponibles
   */
  obtenerTodosLosIds() {
    return Object.keys(this.imagenATipo);
  }
  
  /**
   * Verifica si un tipo de dinosaurio es válido
   */
  esTipoValido(tipo) {
    return Object.values(this.imagenATipo).includes(tipo);
  }
  
  /**
   * Verifica si un ID de imagen es válido
   */
  esIdValido(dinoId) {
    return Object.keys(this.imagenATipo).includes(dinoId);
  }
  
  /**
   * Convierte un elemento DOM de dinosaurio a objeto completo
   */
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

// Crear instancia global
window.mapeoDinosaurios = new MapeoDinosaurios();

console.log('🦕 Sistema de mapeo de dinosaurios inicializado');