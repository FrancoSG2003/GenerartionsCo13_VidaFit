window.VidaFitApiAdmin = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname)
    ? 'http://localhost:8080/api'
    : 'https://backend-vidafit.onrender.com/api';
