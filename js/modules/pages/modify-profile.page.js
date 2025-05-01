import { authUtils } from '../utils/auth.utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    await authUtils.init();
    
    const userRol = localStorage.getItem('userRol');

    if (userRol === 'ADMIN') {
        document.querySelector('.btn-create')?.classList.remove('d-none');
    } else {
        document.querySelector('.btn-create')?.classList.add('d-none');
    }

    const form = document.querySelector('.user-form');
    const nameInput = form.querySelector('input[type="text"]');
    const lastNameInput = form.querySelectorAll('input[type="text"]')[1];
    const dobInput = form.querySelector('input[type="date"]');
    const phoneInput = form.querySelector('input[type="tel"]');
    const dniInput = form.querySelectorAll('input[type="text"]')[2];
    const profileImg = document.querySelector('#userProfileImage');

    const usernameHeader = document.querySelector('.username');
    const saveBtn = form.querySelector('.save-btn');

    // Bloquear inputs por defecto
    [...form.elements].forEach(input => input.disabled = true);

    const token = localStorage.getItem('jwtToken');
    if (!token) {
        alert('Debes iniciar sesión.');
        window.location.href = '../templates/login.html';
        return;
    }

    try {
        const res = await fetch('http://localhost:8080/usuarios/datos', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Error al obtener datos del usuario');

        const data = await res.json();

        // Rellenar campos
        nameInput.value = data.nombre || '';
        lastNameInput.value = data.apellidos || '';
        dobInput.value = convertirDdMmYyyyToIso(data.fechaNacimiento);

        phoneInput.value = data.telefono || '';
        dniInput.value = data.ndocumento || '';

        usernameHeader.textContent = data.nombre;

        if (data.foto) {
            //const imageUrl = data.foto.replace("https://drive.google.com/uc?export=view&id=", "https://drive.google.com/thumbnail?id=");
            //console.log("Imagen de perfil URL: ", imageUrl);

            profileImg.src = data.foto;
            console.log('Imagen cargada desde URL:', profileImg.src);
        } else {
            profileImg.src = "../assets/images/DEFAULT-USER-IMAGE.png";
        }
        
    } catch (err) {
        console.error('❌ Error cargando perfil:', err);
        alert('Error al cargar tus datos.');
    }

    // Permitir edición
    document.querySelector('.edit-user')?.addEventListener('click', (e) => {
        e.preventDefault();
        [...form.elements].forEach(input => input.disabled = false);
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const payload = {
            nombre: nameInput.value,
            apellidos: lastNameInput.value,
            telefono: phoneInput.value,
            fechaNacimiento: formatearFechaParaApi(dobInput.value),
            ndocumento: dniInput.value
        };

        try {
            const res = await fetch('http://localhost:8080/usuarios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error(await res.text());

            alert('✅ Usuario actualizado correctamente.');
            [...form.elements].forEach(input => input.disabled = true);

        } catch (err) {
            console.error('❌ Error actualizando usuario:', err);
            alert('Error al actualizar el usuario.');
        }
    });

    document.querySelector('.delete-btn')?.addEventListener('click', () => {
        alert('🔒 Funcionalidad de eliminar usuario aún no implementada.');
    });

    document.querySelector('.change-password-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        alert('🔒 Funcionalidad de cambiar contraseña aún no implementada.');
    });

    const imageInput = document.querySelector('#imageInput');
    const changeImageBtn = document.querySelector('.change-img');


    changeImageBtn.addEventListener('click', (e) => {
        e.preventDefault();
        imageInput.click(); 
    });
    
    imageInput.addEventListener('change', async () => {
        const file = imageInput.files[0];
        if (!file) return;
    
        const formData = new FormData();
        formData.append('imagen', file);
    
        try {
            const token = localStorage.getItem('jwtToken');
            const resUpload = await fetch(`http://localhost:8080/usuarios/modificarImagen`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
    
            if (!resUpload.ok) throw new Error(await resUpload.text());
    
            alert('✅ Imagen actualizada correctamente.');
            profileImg.src = URL.createObjectURL(file);
    console.log(profileImg.src);
    
        } catch (err) {
            console.error('❌ Error actualizando imagen:', err);
            alert('Error al actualizar la imagen de perfil.');
        }
    });
    

    // imageInput.addEventListener('change', async () => {
    //     const file = imageInput.files[0];
    //     if (!file) return;
    
    //     const formData = new FormData();
    //     formData.append('imagen', file);
    
    //     try {
    //         const token = localStorage.getItem('jwtToken');
    //         const resUser = await fetch('http://localhost:8080/usuarios/datos', {
    //             headers: { 'Authorization': `Bearer ${token}` }
    //         });
    
    //         if (!resUser.ok) throw new Error('Error al obtener datos del usuario');
    //         const userData = await resUser.json();
    
    //         const resUpload = await fetch(`http://localhost:8080/usuarios/modificarImagen`, {
    //             method: 'POST',
    //             headers: {
    //                 'Authorization': `Bearer ${token}`
    //             },
    //             body: formData
    //         });
    
    //         if (!resUpload.ok) throw new Error(await resUpload.text());
    
    //         alert('✅ Imagen actualizada correctamente.');
    //         // Actualizar preview sin recargar
    //         const newImgUrl = URL.createObjectURL(file);
    //         profileImg.src = newImgUrl;
    
    //     } catch (err) {
    //         console.error('❌ Error actualizando imagen:', err);
    //         alert('Error al actualizar la imagen de perfil.');
    //     }
    // });

});

function convertirDdMmYyyyToIso(fechaStr) {
    const [dia, mes, anio] = fechaStr.split('/');
    return `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
}


// Función para formatear la fecha del input date → backend
function formatearFechaParaApi(valorInputDate) {
    if (!valorInputDate) return '';
    
    const date = new Date(valorInputDate);
    
    // Extraer componentes UTC
    const dd = String(date.getUTCDate()).padStart(2, '0');
    const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
    const yyyy = date.getUTCFullYear();
    
    return `${dd}/${mm}/${yyyy}`;
}