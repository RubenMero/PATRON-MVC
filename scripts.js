document.addEventListener('DOMContentLoaded', () => {
    const ROLES = {
        ADMINISTRADOR: 'ADMINISTRADOR', 
        SUPERVISOR: 'SUPERVISOR',
        GUARDIA: 'GUARDIA'
    };

    const PERMISSIONS = {
        [ROLES.ADMINISTRADOR]: [
            'dashboard', 
            'registro-ingreso', 
            'registro-salida', 
            'consulta-ingresos', 
            'gestion-usuarios', 
            'reportes', 
            'vehiculos-registrados-r',
            'vehiculos-registrados-rw',
            'vehiculos-full'
        ],
        [ROLES.SUPERVISOR]: [
            'dashboard', 
            'registro-ingreso', 
            'registro-salida', 
            'consulta-ingresos-full', 
            'gestion-usuarios-full', 
            'reportes-full', 
            'vehiculos-registrados-r',
            'vehiculos-rw'
        ],
        [ROLES.GUARDIA]: [
            'dashboard', 
            'registro-ingreso', 
            'registro-salida', 
            'consulta-ingresos-limitado', 
            'reportes-limitado', 
            'vehiculos-registrados-r'
        ]
    };

    const INITIAL_USERS = [
        { id: 1, cedula: '1310000000', nombre: 'Admin ULEAM', email: 'admin@uleam.edu.ec', usuario: 'admin', password: 'admin12345', rol: ROLES.ADMINISTRADOR, estado: 'Activo', lastLogin: null },
        { id: 2, cedula: '1310000001', nombre: 'Guardia Principal', email: 'guardia@uleam.edu.ec', usuario: 'guardia', password: 'guardia12345', rol: ROLES.GUARDIA, estado: 'Activo', lastLogin: null },
        { id: 3, cedula: '1310000002', nombre: 'Supervisor Turno', email: 'supervisor@uleam.edu.ec', usuario: 'supervisor', password: 'supervisor12345', rol: ROLES.SUPERVISOR, estado: 'Activo', lastLogin: null },
    ];

    const MAX_CAPACITY = 500;
    localStorage.setItem('MAX_CAPACITY', MAX_CAPACITY);

    function initializeData(key, initialData) {
        if (!localStorage.getItem(key)) {
            localStorage.setItem(key, JSON.stringify(initialData));
        }
    }

    initializeData('users', INITIAL_USERS);
    initializeData('ingresos', []);
    initializeData('vehiculos', [
        { id: 1, placa: 'MAB-0001', propietario: 'Admin ULEAM', tipoUsuario: 'Docente', marca: 'Toyota', modelo: 'Corolla', estado: 'Autorizado' },
        { id: 2, placa: 'PTE-1234', propietario: 'Supervisor ULEAM', tipoUsuario: 'Administrativo', marca: 'Chevrolet', modelo: 'Aveo', estado: 'Autorizado' },
    ]);

    window.getStoredData = (key) => JSON.parse(localStorage.getItem(key)) || [];
    window.setStoredData = (key, data) => localStorage.setItem(key, JSON.stringify(data));
    window.MAX_CAPACITY = MAX_CAPACITY; 

    window.formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    };
    window.getTodayDateString = () => new Date().toISOString().split('T')[0];
  
    window.getActiveEntries = () => {
        const ingresos = getStoredData('ingresos');
        return ingresos.filter(i => i.estado === 'ACTIVO');
    };

    window.showNotification = (message, type = 'success', duration = 3000) => {
        const notification = document.getElementById('customNotification');
        if (!notification) return;

        notification.textContent = message;
        notification.className = 'show ' + type;
        notification.style.display = 'block';

        setTimeout(() => {
            notification.className = '';
            notification.style.display = 'none';
        }, duration);
    };

    window.login = (user, password) => {
        const users = getStoredData('users');
        const activeUser = users.find(u =>
            (u.usuario === user || u.email === user) && u.password === password && u.estado === 'Activo'
        );

        if (activeUser) {
            // Actualizar lastLogin y guardar
            activeUser.lastLogin = new Date().toLocaleString();
            setStoredData('users', users);

            // Iniciar sesión
            const sessionData = {
                userId: activeUser.id,
                username: activeUser.nombre,
                role: activeUser.rol,
                permissions: PERMISSIONS[activeUser.rol] || [],
                lastLogin: activeUser.lastLogin,
                timestamp: Date.now()
            };
            localStorage.setItem('currentSession', JSON.stringify(sessionData));
            window.location.href = 'dashboard.html';
            return true;
        } else {
            showNotification('Credenciales incorrectas o usuario inactivo.', 'error');
            return false;
        }
    };

    window.logout = () => {
        localStorage.removeItem('currentSession');
        window.location.href = 'login.html';
    };

    window.checkSession = (isLoginPage = false) => {
        const session = localStorage.getItem('currentSession');
        if (session) {
            if (isLoginPage) {
                window.location.href = 'dashboard.html';
            }
            return JSON.parse(session);
        } else if (!isLoginPage) {
            window.location.href = 'login.html';
        }
        return null;
    };

    const session = checkSession(window.location.pathname.includes('login.html'));
    if (session) {
        const sidebar = document.getElementById('sidebar');
        const contentArea = document.getElementById('contentArea');
        const menuToggle = document.getElementById('menuToggle');
        const roleLabel = document.querySelector('.user-role-label');
        const userName = document.querySelector('.user-name-top');
        const navItems = document.querySelectorAll('.sidebar-nav-item');

        if (menuToggle && sidebar && contentArea) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('hidden');
                contentArea.classList.toggle('full-width');
            });
        }

        if (roleLabel) roleLabel.textContent = session.role;
        if (userName) userName.textContent = `👤 ${session.username.split(' ')[0]}`;

        const userPermissions = session.permissions || PERMISSIONS[session.role] || [];
        
        // Mostrar/ocultar elementos del menú según permisos
        navItems.forEach(item => {
            const permissionKey = item.getAttribute('data-permission');
            if (permissionKey) {
                // Verificar si el usuario tiene algún permiso que coincida con el prefijo
                const hasPermission = userPermissions.some(p => 
                    p === permissionKey || 
                    p.startsWith(permissionKey.split('-')[0]) ||
                    permissionKey.startsWith(p.split('-')[0])
                );
                
                if (!hasPermission) {
                    item.style.display = 'none';
                }
            }
        });

        const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
        let pagePermissionKey;

        switch (currentPage) {
            case 'registro-ingreso': pagePermissionKey = 'registro-ingreso'; break;
            case 'registro-salida': pagePermissionKey = 'registro-salida'; break;
            case 'consulta-ingresos': pagePermissionKey = 'consulta-ingresos'; break;
            case 'gestion-usuarios': pagePermissionKey = 'gestion-usuarios'; break;
            case 'reportes': pagePermissionKey = 'reportes'; break;
            case 'vehiculos-registrados': pagePermissionKey = 'vehiculos-registrados'; break;
            default: pagePermissionKey = 'dashboard';
        }
        
        // Verificar acceso a la página actual
        if (pagePermissionKey && pagePermissionKey !== 'dashboard') {
            const hasPageAccess = userPermissions.some(p => 
                p === pagePermissionKey || 
                p.startsWith(pagePermissionKey.split('-')[0]) ||
                pagePermissionKey.startsWith(p.split('-')[0])
            );
            
            if (!hasPageAccess) {
                // Excepción para gestion-usuarios (SUPERVISOR tiene acceso limitado)
                if (currentPage === 'gestion-usuarios' && userPermissions.includes('gestion-usuarios-limitado')) {
                    // Permitido, se restringe internamente en gestion-usuarios.js
                } else {
                    showNotification(`Acceso Denegado. Su rol de ${session.role} no permite acceder a ${currentPage}.`, 'error');
                    setTimeout(() => window.location.href = 'dashboard.html', 1500);
                }
            }
        }
        
        window.CURRENT_USER = session; // Poner sesión disponible globalmente
    }
});

window.isValidPlaca = (placa) => /^[A-Z]{3}-\d{3,4}$/.test(placa.toUpperCase());
window.isValidCedula = (id) => /^\d{10}$/.test(id);
window.isValidEmailUleam = (email) => /^[a-zA-Z0-9._-]+@uleam\.edu\.ec$/.test(email);