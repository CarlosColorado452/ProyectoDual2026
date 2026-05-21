
// ---- METODOS PRODUCTOS ----
function obtenerProductos(){

    return JSON.parse(localStorage.getItem('productos')) || [];

}

function guardarProductos(productos) {

    localStorage.setItem('productos', JSON.stringify(productos));

  }


function anadirProducto(){
    
    const productos = obtenerProductos()
    productos.push(obtenerProductoFormulario())
    guardarProductos(productos)
    
}

function obtenerProductoFormulario(){

    const productoNuevo = {
        nombre: document.getElementById('nombre').value,
        categoria: document.getElementById('categoria').value,
        precio: parseFloat(document.getElementById('precio').value),
        stock: parseInt(document.getElementById('stock').value),
        descripcion: document.getElementById('descripcion').value
    }
    return productoNuevo

}


function productoYaExiste(productoNuevo){

    for (let producto of obtenerProductos()){
        if(normalizar(producto.nombre) == normalizar(productoNuevo.nombre))
            return true
    }
    return false

}

function normalizar(texto) {
    // Transforma un texto a minusculas, ademas de eliminar los acentos de las vocales y otros simbolos
    // Lo necesitamos para comoprobar correctamente a la hora de añadir un nuevo producto
    return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  }


// ---- EVENTOS ----

document.getElementById('nuevoProducto').addEventListener('submit', (evento) => {
    evento.preventDefault()
    anadirProducto();
})