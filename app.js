// ---- CARGA DE USUARIOS POR DEFECTO ----
// Usuarios: admin, empleado
// Posibilidad de clientes: Cliente1, Cliente2






// ---- METODOS PRODUCTOS ----
function obtenerProductos(){

    return JSON.parse(localStorage.getItem('productos')) || []

}

function guardarProductos(productos) {

    localStorage.setItem('productos', JSON.stringify(productos))

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

// --- VENTANA DE ERROR ---

function mostrarMensaje(titulo, mensaje, tipo){
    document.getElementById('overlay-message').classList.remove('oculto')
    document.getElementById('box-message').classList.remove('oculto')
    document.getElementById('box-message').classList.remove('correct-style','error-style')
    document.getElementById('message-text').textContent = mensaje;
    if(tipo == 'ok'){
        document.getElementById('icon-message').src ='img/bien.png'
        document.getElementById('box-message').classList.add('correct-style')
    }else{
        document.getElementById('icon-message').src ='img/error.png'
        document.getElementById('box-message').classList.add('error-style') 
    }
    document.getElementById('title-message').textContent = titulo;

}






// ---- EVENTOS ----

document.getElementById('nuevoProducto').addEventListener('submit', (evento) => {
    //No se reinicia la página
    evento.preventDefault()
    if(!productoYaExiste(obtenerProductoFormulario())){
        anadirProducto()
        mostrarMensaje('Correcto', 'Aadido correctamente', 'ok')
    }else
        mostrarMensaje('Error', 'Ese producto ya existe', 'error')
})

document.getElementById('btn-cerrar').addEventListener('click', (evento) => {
    evento.preventDefault()
    document.getElementById('overlay-message').classList.add('oculto')
    document.getElementById('box-message').classList.add('oculto')
});