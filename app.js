// ---- CARGA DE USUARIOS POR DEFECTO ----
// Usuarios: admin, empleado







// ---- METODOS PRODUCTOS ----
function obtenerProductos(){

    return JSON.parse(localStorage.getItem('productos')) || []

}

function guardarProductos(productos) {

    localStorage.setItem('productos', JSON.stringify(productos))

  }


  function anadirProducto() {
    const productoNuevo = obtenerProductoFormulario();
    
    if(validarProductoNuevo(productoNuevo)) {
        if(productoYaExiste(productoNuevo)) {
            mostrarMensaje('Error', 'Ese producto ya existe', 'error');
        } else {
            const productos = obtenerProductos();
            productos.push(productoNuevo);
            guardarProductos(productos);
            mostrarMensaje('Éxito', 'Producto añadido correctamente', 'ok');
        }
    }
}

function obtenerProductoFormulario(){



    const url = document.getElementById('imagen-url').value
    const archivo = document.getElementById('imagen-local').files[0]

    let imagen = null

    if(archivo){
        imagen = archivo;
    }else{
        imagen = url;
    }


    const productoNuevo = {
        nombre: document.getElementById('nombre').value,
        categoria: document.getElementById('categoria').value,
        precio: parseFloat(document.getElementById('precio').value),
        stock: parseInt(document.getElementById('stock').value),
        descripcion: document.getElementById('descripcion').value,
        imagen: imagen
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



function validarProductoNuevo(productoNuevo) {
    if(!productoNuevo.nombre) {
        mostrarMensaje('Error', 'El nombre es obligatorio', 'error');
        return false;
    }
    if(!productoNuevo.categoria) {
        mostrarMensaje('Error', 'La categoría es obligatoria', 'error');
        return false;
    }
    if(!(productoNuevo.precio > 0)) {
        mostrarMensaje('Error', 'El precio debe ser mayor que 0', 'error');
        return false;
    }
    if(!(productoNuevo.stock >= 0)) {
        mostrarMensaje('Error', 'El stock no puede ser negativo', 'error');
        return false;
    }
    return true;
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
    evento.preventDefault();
    anadirProducto();
});

document.getElementById('btn-cerrar').addEventListener('click', (evento) => {
    evento.preventDefault()
    document.getElementById('overlay-message').classList.add('oculto')
    document.getElementById('box-message').classList.add('oculto')
});