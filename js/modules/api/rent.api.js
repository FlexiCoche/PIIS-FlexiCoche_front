const API_URL = 'http://localhost:8080/alquileres';

export async function createAlquiler(data) {
    const token = localStorage.getItem('jwtToken');

    if (!token) {
        alert('Debes iniciar sesión para realizar una reserva.');
        window.location.href = '../templates/login.html';
        return;
    }

    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
    };

    console.log("📦 Payload final que se enviará al backend:", data);

    const response = await fetch(API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Error del backend:", errorText);
        throw new Error(`Error al crear alquiler: ${errorText}`);
    }

    // ✅ Solo intenta parsear JSON si hay contenido
    const contentLength = response.headers.get("Content-Length");
    if (contentLength && parseInt(contentLength) > 0) {
        return await response.json();
    }

    return null; // todo ha ido bien aunque no haya respuesta
}
