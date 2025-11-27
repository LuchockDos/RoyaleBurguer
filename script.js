// ===============================
//  ESTADO GLOBAL
// ===============================
let Carta = [];
let carrito = [];
let totalPrecio = 0;

// ===============================
//  CARGA DE CARTA
// ===============================
fetch('menu.json')
  .then(res => res.json())
  .then(data => {
    Carta = data.carta;
    renderProductos();
  })
  .catch(err => console.error('Error al cargar el menú:', err));

function renderProductos() {
  const section = document.getElementById('section_products');
  if (!section) return;

  section.innerHTML = '';

  Carta.forEach(categoriaObj => {
    const categoria = categoriaObj.categoria;
    const productos = categoriaObj.productos;

    // TÍTULO DE CATEGORÍA
    const titulo = document.createElement('h1');
    titulo.classList.add('h1_global');
    titulo.textContent = categoria;
    section.appendChild(titulo);

    const article = document.createElement('article');
    article.classList.add('products_article');

    productos.forEach(producto => {
      const card = document.createElement('div');
      card.classList.add('card');

      const img = document.createElement('img');
      img.classList.add('product');
      img.src = producto.imagen;
      img.alt = producto.nombre;

      const h3 = document.createElement('h3');
      h3.classList.add('h3_global');
      h3.innerHTML = producto.nombre.replace(/\n/g, "<br>");

      const precio = document.createElement('span');
      precio.classList.add('price');
      precio.textContent = `$${producto.precio}`;

      const desc = document.createElement('p');
      desc.classList.add('info_product');
      desc.textContent = producto.descripcion;

      // FORM OPCIONES SOLO PARA NUGGETS
      let formSalsas = null;

      if (
        categoria === "Nuggets & Papas" &&
        producto.nombre.includes("Nuggets")
      ) {
        formSalsas = document.createElement("div");
        formSalsas.classList.add("form_salsas");

        const label = document.createElement("p");
        label.textContent = "Salsa a Elección";
        label.classList.add("info_product");

        const contenedorOpciones = document.createElement("div");
        contenedorOpciones.classList.add("salsas_container");

        const opciones = ["Barbacoa", "Ketchup", "Mayo"];

        opciones.forEach(salsa => {
          const wrap = document.createElement("label");
          wrap.classList.add("radio_salsa");

          const radio = document.createElement("input");
          radio.type = "radio";
          radio.name = `salsa_${producto.nombre}`;
          radio.value = salsa;

          const txt = document.createElement("span");
          txt.textContent = salsa;

          wrap.appendChild(radio);
          wrap.appendChild(txt);
          contenedorOpciones.appendChild(wrap);
        });

        formSalsas.append(label, contenedorOpciones);
      }

      // BOTÓN AGREGAR AL CARRITO
      const btn = document.createElement('button');
      btn.classList.add("btn_add_cart");
      btn.textContent = "Agregar";

      btn.addEventListener("click", () => {
        let salsaElegida = null;

        if (formSalsas) {
          const seleccionada = formSalsas.querySelector("input[type='radio']:checked");
          salsaElegida = seleccionada ? seleccionada.value : "Sin especificar";
        }

        agregarAlCarrito({ ...producto, salsa: salsaElegida });
      });

      // ARMADO FINAL DE LA CARD
      card.append(img, h3, precio, desc);

      if (formSalsas) card.appendChild(formSalsas);

      card.appendChild(btn);
      article.appendChild(card);
    });

    section.appendChild(article);
  });
}

// ===============================
//  AGREGAR DIRECTO AL CARRITO
// ===============================
function agregarAlCarrito(producto) {
  let precio = 0;

  if (producto.precios) {
    precio = producto.precios.simple;
  } else {
    precio = producto.precio || 0;
  }

  carrito.push({
    nombre: producto.nombre,
    precio,
    cantidad: 1,
    salsa: producto.salsa || null
  });

  actualizarCarrito();
  actualizarBadge();
  mostrarToast("Producto agregado 🛒", "success");
}

// ===============================
//  MODAL CARRITO
// ===============================
const modalCarrito = document.getElementById('modalCarrito');
const carritoItems = document.getElementById('carritoItems');
const totalCarrito = document.getElementById('totalCarrito');
const openCarrito = document.getElementById('openCarrito');
const closeCarrito = document.getElementById('closeCarrito');
const cartBadge = document.getElementById('cartBadge');

if (openCarrito) {
  openCarrito.addEventListener("click", () => modalCarrito.classList.add('show'));
}
if (closeCarrito) {
  closeCarrito.addEventListener("click", () => modalCarrito.classList.remove('show'));
}
window.addEventListener("click", e => {
  if (e.target === modalCarrito) modalCarrito.classList.remove("show");
});

// ===============================
//  ACTUALIZAR CARRITO
// ===============================
function actualizarCarrito() {
  carritoItems.innerHTML = '';
  totalPrecio = 0;

  carrito.forEach((prod, index) => {
    const div = document.createElement("div");
    div.innerHTML = `
      ${prod.nombre} 
      ${prod.salsa ? `— Salsa: ${prod.salsa}` : ""}
      — $${prod.precio}
      <button class="btn_quitar_producto" onclick="eliminarProducto(${index})">❌</button>
    `;
    carritoItems.appendChild(div);

    totalPrecio += prod.precio;
  });

  totalCarrito.textContent = `$${totalPrecio}`;
  actualizarBadge();
}

// ===============================
//  ELIMINAR PRODUCTO
// ===============================
function eliminarProducto(index) {
  carrito.splice(index, 1);
  actualizarCarrito();
  actualizarBadge();
}

// ===============================
//  BADGE DEL CARRITO
// ===============================
function actualizarBadge() {
  if (!cartBadge) return;
  const total = carrito.length;
  cartBadge.style.display = total > 0 ? 'block' : 'none';
  cartBadge.textContent = total;
}

// ===============================
//  FINALIZAR PEDIDO (WHATSAPP)
// ===============================
const btnFinalizar = document.querySelector('.btn_finalizar');

if (btnFinalizar) {
  btnFinalizar.addEventListener('click', () => {
    if (carrito.length === 0) return alert("Tu carrito está vacío");

    const direccionInput = document.getElementById('direccionEnvio');
    const direccion = direccionInput ? direccionInput.value.trim() : "";
    if (!direccion) return alert("Ingresá la dirección de entrega");

    const metodoPago = document.querySelector('input[name="metodo_pago"]:checked')?.value || "Efectivo";

    let mensaje = "*Nuevo Pedido*\n\n";

    carrito.forEach(i => {
      mensaje += `• ${i.nombre}`;
      if (i.salsa) mensaje += ` — Salsa: ${i.salsa}`;
      mensaje += ` — $${i.precio}\n`;
    });

    mensaje += `\nDirección: ${direccion}\n`;
    mensaje += `El costo del envío depende de la ubicación\n`;
    mensaje += `Pago: ${metodoPago}\n`;
    mensaje += `\nTotal: $${totalPrecio} + Envío`;

    const tel = "5493482536434";
    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(mensaje)}`, "_blank");
  });
}

// ===============================
//  TOAST
// ===============================
function mostrarToast(mensaje, tipo = "success") {
  const toast = document.getElementById("toastMsg");
  if (!toast) return;
  toast.textContent = mensaje;
  toast.className = `toastMsg show ${tipo}`;
  setTimeout(() => toast.classList.remove("show"), 2500);
}

// ===============================
//  BOTÓN VERIFY (CERRAR CARRITO)
// ===============================
const verifyBtn = document.getElementById('verify');
if (verifyBtn) {
  verifyBtn.addEventListener('click', () => {
    modalCarrito.classList.remove('show');
  });
}