// Variable para guardar el índice del producto que se esta editando actualmente
let productoEditandoIndex = null

// ---- METODOS PRODUCTOS ----
function obtenerProductos(){

    return JSON.parse(localStorage.getItem('productos')) || []

}

function guardarProductos(productos) {

    localStorage.setItem('productos', JSON.stringify(productos))

  }


  async function anadirProducto() {
    let productoNuevo = obtenerProductoFormulario();

    if(productoNuevo.imagen instanceof File) {
        if(productoNuevo.imagen.size > 200000) {
            mostrarMensaje('Error', 'La imagen no puede superar 200KB', 'error');
            return;
        }
        productoNuevo.imagen = await convertirABase64(productoNuevo.imagen);
    }

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

function obtenerProductoFormulario() {
    const archivo = document.getElementById('imagen-local').files[0];
    const url = document.getElementById('imagen-url').value.trim();

    let imagen = null;
    if(archivo) {
        imagen = archivo;
    } else if(url) {
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
    return productoNuevo;
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
function pintarInventario(productos) {

    const grid = document.getElementById('inventarioGrid');
    const vacio = document.getElementById('inventarioVacio');
    const contador = document.getElementById('inventarioContador');

    // Limpiar cards anteriores pero mantener el div de vacio
    grid.innerHTML = '';
    grid.appendChild(vacio);

    if(productos.length === 0) {
        vacio.classList.remove('oculto');
        contador.textContent = '0 productos';
        return;
    }

    vacio.classList.add('oculto');
    contador.textContent = `${productos.length} productos`;

    productos.forEach((producto, index) => {
        const card = document.createElement('div');
        card.classList.add('producto-card');

        const imagenHTML = producto.imagen
            ? `<img src="${producto.imagen}" alt="${producto.nombre}">`
            : `<span class="producto-card__imagen--placeholder">📦</span>`;

        const stockClase = producto.stock < 5 ? 'producto-card__stock--bajo' : '';

        card.innerHTML = `
            <div class="producto-card__imagen">${imagenHTML}</div>
            <div class="producto-card__body">
                <p class="producto-card__nombre">${producto.nombre}</p>
                <p class="producto-card__categoria">${producto.categoria}</p>
                <p class="producto-card__stock ${stockClase}">Stock: ${producto.stock}</p>
            </div>
            <div class="producto-card__footer">
                <span class="producto-card__precio">${producto.precio}€</span>
            </div>
        `;

        card.addEventListener('click', () => abrirPanel(index));
        grid.appendChild(card);
    });
}

function obtenerProductosFiltrados() {
    const busqueda = normalizar(document.getElementById('buscador').value);
    const precioMin = parseFloat(document.getElementById('precioMin').value) || 0;
    const precioMax = parseFloat(document.getElementById('precioMax').value) || Infinity;
    const stockMin = parseInt(document.getElementById('stockMin').value) || 0;
    const stockMax = parseInt(document.getElementById('stockMax').value) || Infinity;
    const categoriasSeleccionadas = [...document.querySelectorAll('.filtro-cat:checked')].map(cb => normalizar(cb.value));

    return obtenerProductos().filter(producto => {
        return normalizar(producto.nombre).includes(busqueda)
            && producto.precio >= precioMin
            && producto.precio <= precioMax
            && producto.stock >= stockMin
            && producto.stock <= stockMax
            && (categoriasSeleccionadas.length === 0 || categoriasSeleccionadas.includes(normalizar(producto.categoria)));
    });
}

async function editarProducto() {
    let productos = obtenerProductos();

    const archivo = document.getElementById('editImagenLocal').files[0];
    const url = document.getElementById('editImagenUrl').value.trim();

    let imagen = productos[productoEditandoIndex].imagen;
    if(archivo) {
        if(archivo.size > 200000) {
            mostrarMensaje('Error', 'La imagen supera 200KB, usa webp', 'error');
            return;
        }
        imagen = await convertirABase64(archivo);
    } else if(url) {
        imagen = url;
    }

    const productoEditar = {
        nombre: document.getElementById('editNombre').value,
        categoria: document.getElementById('editCategoria').value,
        precio: parseFloat(document.getElementById('editPrecio').value),
        descripcion: document.getElementById('editDescripcion').value,
        stock: productos[productoEditandoIndex].stock,
        imagen: imagen
    }

    if(validarProductoNuevo(productoEditar)) {
        productos[productoEditandoIndex] = productoEditar;
        guardarProductos(productos);
        cerrarModalEditar();
        pintarInventario(obtenerProductosFiltrados());
        pintarCategorias();
        mostrarMensaje('Correcto', 'Producto editado correctamente', 'ok');
    }
}

function convertirABase64(archivo) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject('Error al leer el archivo');
        reader.readAsDataURL(archivo);
    });
}


function eliminarProducto() {
    let productos = obtenerProductos();
    productos.splice(productoEditandoIndex, 1);
    guardarProductos(productos);
    cerrarPanel();
    pintarInventario(obtenerProductosFiltrados());
    mostrarMensaje('Borrado', 'Producto borrado correctamente', 'ok');
}

function limpiarFiltros() {
    document.getElementById('buscador').value = '';
    document.getElementById('precioMin').value = '';
    document.getElementById('precioMax').value = '';
    document.getElementById('stockMin').value = '';
    document.getElementById('stockMax').value = '';
    document.querySelectorAll('.filtro-cat').forEach(cb => cb.checked = false);
    pintarInventario(obtenerProductosFiltrados());
}

function abrirPanel(index) {
    productoEditandoIndex = index;
    const productos = obtenerProductos();
    const producto = productos[index];

    document.getElementById('panelTitulo').textContent = producto.nombre;
    document.getElementById('panelCategoria').textContent = producto.categoria;
    document.getElementById('panelPrecio').textContent = producto.precio + '€';
    document.getElementById('panelDescripcion').textContent = producto.descripcion || 'Sin descripción';
    document.getElementById('panelStock').textContent = producto.stock;

    const imagen = document.getElementById('panelImagen');
    if(producto.imagen) {
        imagen.src = producto.imagen;
        imagen.style.display = 'block';
    } else {
        imagen.style.display = 'none';
    }

    document.getElementById('panelLateral').classList.remove('oculto');
    document.getElementById('panelLateral').classList.add('visible');
    document.getElementById('overlayPanel').classList.remove('oculto');
}
function abrirModalEditar(index) {
    const productos = obtenerProductos();
    const producto = productos[index];
    productoEditandoIndex = index;

    document.getElementById('editNombre').value = producto.nombre;
    document.getElementById('editCategoria').value = producto.categoria;
    document.getElementById('editPrecio').value = producto.precio;
    document.getElementById('editDescripcion').value = producto.descripcion || '';
    document.getElementById('editImagenUrl').value = producto.imagen || '';

    const preview = document.getElementById('editImagenPreview');
    if(producto.imagen) {
        preview.src = producto.imagen;
        preview.style.display = 'block';
    } else {
        preview.style.display = 'none';
    }

    cerrarPanel();
    document.getElementById('modalEditar').classList.add('visible');
    document.getElementById('overlayPanel').classList.remove('oculto');
}

function cerrarPanel() {
    document.getElementById('panelLateral').classList.remove('visible');
    document.getElementById('panelLateral').classList.add('oculto');
    document.getElementById('overlayPanel').classList.add('oculto');
}

function cerrarModalEditar() {
    document.getElementById('modalEditar').classList.remove('visible');
    document.getElementById('overlayPanel').classList.add('oculto');
}


function actualizarResumen() {
    const productos = obtenerProductos();
    
    const totalProductos = productos.length;
    const categorias = new Set(productos.map(p => p.categoria)).size;
    const stockBajo = productos.filter(p => p.stock < 5).length;

    document.getElementById('statProductos').textContent = totalProductos;
    document.getElementById('statCategorias').textContent = categorias;
    document.getElementById('statStockBajo').textContent = stockBajo;
}

function obtenerUsuarios() {
    return JSON.parse(localStorage.getItem('usuarios')) || [];
}


function inicializarUsuarios() {
    if(obtenerUsuarios().length === 0) {
        usuarios = [
            { usuario: 'admin', password: 'admin', rol: 'admin' },
            { usuario: 'empleado', password: '1234', rol: 'empleado' }
        ]
        guardarUsuarios(usuarios);

    }
}
function guardarUsuarios(usuarios) {
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
}

function obtenerSesion() {
    return JSON.parse(localStorage.getItem('sesion'));
}

function login() {
    inicializarUsuarios();
    const nombre = document.getElementById('usuario').value;
    const password = document.getElementById('password').value;
    
    const usuarios = obtenerUsuarios();
    const encontrado = usuarios.find(u => u.usuario === nombre && u.password === password);
    
    if(encontrado) {
        localStorage.setItem('sesion', JSON.stringify(encontrado));
        window.location.href = 'menu.html';
    } else {
        mostrarMensaje('Error', 'Usuario o contraseña incorrectos', 'error');
    }
    console.log('login ejecutado');
}

function registro() {
    const nombre = document.getElementById('usuario').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;

    if(!nombre || !password) {
        mostrarMensaje('Error', 'Rellena todos los campos', 'error');
        return;
    }

    if(password !== passwordConfirm) {
        mostrarMensaje('Error', 'Las contraseñas no coinciden', 'error');
        return;
    }

    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

    if(usuarios.find(u => u.usuario === nombre)) {
        mostrarMensaje('Error', 'Ese usuario ya existe', 'error');
        return;
    }

    usuarios.push({ usuario: nombre, password: password, rol: 'empleado' });
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    mostrarMensaje('Correcto', 'Cuenta creada correctamente', 'ok');
    setTimeout(() => window.location.href = 'login.html', 1500);
}

function aplicarPermisos() {
    const sesion = obtenerSesion();
    
    if(!sesion) {
        if(!window.location.href.includes('login.html') && 
           !window.location.href.includes('registro.html')) {
            window.location.href = 'login.html';
        }
        return;
    }
    
    if(sesion.rol === 'empleado') {
        const ids = ['btnAnadir', 'newProductNav', 'newProductNavMobile'];
        ids.forEach(id => {
            const el = document.getElementById(id);
            if(el) el.classList.add('oculto');
        });

        const grid = document.getElementById('cardsGrid');
        if(grid) grid.classList.add('cards-grid--dos');
    }
}

function protegerPaginaAdmin() {
    if(!window.location.href.includes('anadir.html')) return;
    
    const sesion = obtenerSesion();
    if(sesion && sesion.rol !== 'admin') {
        window.location.href = 'menu.html';
    }
}

function cerrarSesion() {
    localStorage.removeItem('sesion');
    window.location.href = 'login.html';
}

function actualizarStock(tipo) {
    const productos = obtenerProductos();
    const producto = productos[productoEditandoIndex];

    if(tipo === 'restar' && producto.stock === 0) {
        mostrarMensaje('Error', 'El stock no puede ser negativo', 'error');
        return;
    }

    if(tipo === 'sumar') {
        producto.stock++;
    } else {
        producto.stock--;
    }

    guardarProductos(productos);
    
    // Actualizar el número en el panel sin cerrarlo
    const panelStock = document.getElementById('panelStock');
    if(panelStock) panelStock.textContent = producto.stock;

    pintarInventario(obtenerProductosFiltrados());
}
function pintarCategorias() {
    const productos = obtenerProductos();
    const categorias = [...new Set(productos.map(p => p.categoria))];
    const contenedor = document.getElementById('categoriaContent');
    if(!contenedor) return;

    if(categorias.length === 0) {
        contenedor.innerHTML = '<p class="filtro-empty">Sin categorías aún</p>';
        return;
    }

    contenedor.innerHTML = categorias.map(cat => `
        <label class="filtro-checkbox">
            <input type="checkbox" value="${capitalizar(cat)}" class="filtro-cat">
            ${capitalizar(cat)}
        </label>
    `).join('');
}

function inicializarProductos() {
    if(obtenerProductos().length > 0) return;

    const productos = [
        { nombre: 'Nigiri Salmón', categoria: 'nigiri', precio: 3.50, stock: 20, imagen: 'https://shajo.es/wp-content/uploads/2023/03/NIGIRI-SALMON.png', descripcion: 'Nigiri fresco de salmón noruego.' },
        { nombre: 'Nigiri Atún', categoria: 'nigiri', precio: 3.50, stock: 15, imagen: 'https://sushitabtob.com/wp-content/uploads/2018/06/nigiri-at%C3%BAn.png', descripcion: 'Nigiri de atún rojo de temporada.' },
        { nombre: 'Maki California', categoria: 'maki', precio: 6.99, stock: 10, imagen: 'https://wschodniasushi.pl/wp-content/uploads/2025/04/IMG_8088-kopia-scaled.png', descripcion: 'Rollo california con aguacate y pepino.' },
        { nombre: 'Maki Spicy Tuna', categoria: 'maki', precio: 7.50, stock: 8, imagen: 'https://shinzo.nl/wp-content/uploads/2023/03/Gerecht-039.png', descripcion: 'Rollo picante de atún con sriracha.' },
        { nombre: 'Temaki Salmón', categoria: 'temaki', precio: 5.99, stock: 12, imagen: 'https://dusushi3.es/public/uploadfile/20210317170720563294.png', descripcion: 'Cono de alga con salmón y arroz.' },
        { nombre: 'Sashimi Salmón', categoria: 'sashimi', precio: 9.99, stock: 6, imagen: 'https://elpezquesemuerdelacola.com/wp-content/uploads/2022/10/18.png', descripcion: 'Láminas finas de salmón fresco.' },
        { nombre: 'Sashimi Atún', categoria: 'sashimi', precio: 11.50, stock: 4, imagen: 'https://elpezquesemuerdelacola.com/wp-content/uploads/2022/10/17.png', descripcion: 'Láminas de atún rojo premium.' },
        { nombre: 'Gyoza Pollo', categoria: 'caliente', precio: 5.50, stock: 18, imagen: 'https://hisupo.es/wp-content/uploads/2022/12/gyoza-de-pollo.webp', descripcion: 'Empanadillas japonesas de pollo a la plancha.' },
        { nombre: 'Edamame', categoria: 'entrante', precio: 3.99, stock: 25, imagen: 'https://maximfood.com/wp-content/uploads/2024/07/Edamame-1.png', descripcion: 'Vainas de soja cocidas con sal marina.' },
        { nombre: 'Miso Soup', categoria: 'entrante', precio: 2.50, stock: 30, imagen: 'https://chinabox.com.ua/wp-content/uploads/2024/03/miso-sup-2.png', descripcion: 'Sopa tradicional japonesa con tofu y alga.' },
        { nombre: 'Uramaki Aguacate', categoria: 'maki', precio: 8.50, stock: 7, imagen: 'https://palencia.pokesushi.es/wp-content/uploads/sites/4/2021/10/08-2-uramaki-salmon-aguacate.png', descripcion: 'Rollo invertido con aguacate y sésamo.' },
        { nombre: 'Takoyaki', categoria: 'caliente', precio: 6.50, stock: 3, imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT19ELuaowOObh7VnM8Vrbl7I5VGkoKUuo9Xw&s', descripcion: 'Bolitas de pulpo rebozadas con salsa takoyaki.' },
        { nombre: 'Onigiri Salmón', categoria: 'onigiri', precio: 4.50, stock: 14, imagen: 'https://145866929.cdn6.editmysite.com/uploads/1/4/5/8/145866929/CWJEO2EANJRJKOL6FHQ3J7CC.png', descripcion: 'Triángulo de arroz relleno de salmón.' },
        { nombre: 'Ramen Tonkotsu', categoria: 'caliente', precio: 12.99, stock: 2, imagen: 'https://matsudai.co.uk/cdn/shop/products/sunset-red-tonkotsu-ramen-kit-248864.png?v=1647717786', descripcion: 'Ramen con caldo de cerdo y chashu.' },
        { nombre: 'Dorayaki', categoria: 'postre', precio: 3.50, stock: 20, imagen: 'https://pokesushi.es/wp-content/uploads/2021/10/13-1-dorayaki-japonesa.png', descripcion: 'Bizcocho japonés relleno de pasta de judía.' },
    ];

    guardarProductos(productos);
}

function capitalizar(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
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

const formularioEvento = document.getElementById('nuevoProducto')
if(formularioEvento){
    formularioEvento.addEventListener('submit', (evento) => {
        evento.preventDefault();
        anadirProducto();
    });
}

const btnCerrarEvento = document.getElementById('btn-cerrar')
if(btnCerrarEvento){
    btnCerrarEvento.addEventListener('click', (evento) => {
        evento.preventDefault()
        document.getElementById('overlay-message').classList.add('oculto')
        document.getElementById('box-message').classList.add('oculto')
    });
}

const hamburguerEvento = document.getElementById('hamburger')
if(hamburguerEvento){
    hamburguerEvento.addEventListener('click', () => {
        document.getElementById('navMobile').classList.toggle('visible');
    });
}

const filtrosEvento = document.getElementById('filtrosToggle')
if(filtrosEvento){
    filtrosEvento.addEventListener('click', () => {
        document.getElementById('filtrosPanel').classList.toggle('visible');
        document.getElementById('filtrosToggle').classList.toggle('abierto');
    })
}
document.addEventListener('click', (e) => {
    const panel = document.getElementById('filtrosPanel');
    const toggle = document.getElementById('filtrosToggle');
    if(!panel || !toggle) return;
    if (!panel.contains(e.target) && !toggle.contains(e.target)) {
        panel.classList.remove('visible');
        toggle.classList.remove('abierto');
    }
});

const panelCerrar = document.getElementById('panelCerrar');
if(panelCerrar) panelCerrar.addEventListener('click', cerrarPanel)


    if(document.getElementById('inventarioGrid')) {
        const params = new URLSearchParams(window.location.search);
        if(params.get('stockMax')) {
            document.getElementById('stockMax').value = params.get('stockMax');
        }
        inicializarProductos();
        pintarInventario(obtenerProductosFiltrados());
        pintarCategorias();
    }

const btnEditar = document.getElementById('btnEditar');
if(btnEditar) {
    btnEditar.addEventListener('click', () => {
        abrirModalEditar(productoEditandoIndex);
    });
}

const modalEditarCerrar = document.getElementById('modalEditarCerrar');
if(modalEditarCerrar) modalEditarCerrar.addEventListener('click', cerrarModalEditar);

const overlayPanel = document.getElementById('overlayPanel');
if(overlayPanel) overlayPanel.addEventListener('click', cerrarPanel);

const formEditar = document.getElementById('formEditar');
if(formEditar) {
    formEditar.addEventListener('submit', (e) => {
        e.preventDefault();
        editarProducto();
        
    });
}

const btnEliminar = document.getElementById('btnEliminar');
if(btnEliminar) btnEliminar.addEventListener('click', eliminarProducto);

const buscador = document.getElementById('buscador');
if(buscador) buscador.addEventListener('input', () => {
    pintarInventario(obtenerProductosFiltrados());
});

['precioMin', 'precioMax', 'stockMin', 'stockMax'].forEach(id => {
    const filtro = document.getElementById(id);
    if(filtro) filtro.addEventListener('input', () => {
        pintarInventario(obtenerProductosFiltrados());
    });
});

const filtroLimpiar = document.getElementById('filtroLimpiar');
if(filtroLimpiar) filtroLimpiar.addEventListener('click', limpiarFiltros);

if(document.getElementById('statProductos')) {
    actualizarResumen();
}

const formLogin = document.getElementById('login');
if(formLogin) {
    formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        login();
    });
}

const logOut = document.getElementById('logOut');
if(logOut) logOut.addEventListener('click', cerrarSesion);

const logOutMobile = document.getElementById('logOutMobile');
if(logOutMobile) logOutMobile.addEventListener('click', cerrarSesion);

const formRegistro = document.getElementById('registro');
if(formRegistro) {
    formRegistro.addEventListener('submit', (e) => {
        e.preventDefault();
        registro();
    });
}


const btnSumar = document.getElementById('btnSumar');
if(btnSumar) btnSumar.addEventListener('click', () => actualizarStock('sumar'));

const btnRestar = document.getElementById('btnRestar');
if(btnRestar) btnRestar.addEventListener('click', () => actualizarStock('restar'));

const btnStockBajo = document.getElementById('btnStockBajo');
if(btnStockBajo) btnStockBajo.addEventListener('click', () => {
    window.location.href = 'inventario.html?stockMax=4';
});

const categoriaContent = document.getElementById('categoriaContent');
if(categoriaContent) {
    categoriaContent.addEventListener('change', () => {
        pintarInventario(obtenerProductosFiltrados());
    });
}


aplicarPermisos();
protegerPaginaAdmin()