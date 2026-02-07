// Authentication module for RunTracker PWA

// Login with email and password
async function loginWithEmail(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        let message;
        switch (error.code) {
            case 'auth/user-not-found':
                message = 'No existe una cuenta con este email';
                break;
            case 'auth/wrong-password':
                message = 'Contraseña incorrecta';
                break;
            case 'auth/invalid-email':
                message = 'Email no válido';
                break;
            case 'auth/too-many-requests':
                message = 'Demasiados intentos. Espera un momento';
                break;
            default:
                message = 'Error al iniciar sesión';
        }
        return { success: false, message };
    }
}

// Logout
async function logout() {
    try {
        await auth.signOut();
        window.location.href = '/index.html';
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    }
}

// Get user role from Realtime Database
async function getUserRole(uid) {
    try {
        const snapshot = await db.ref(`users/${uid}/role`).once('value');
        return snapshot.val() || 'athlete';
    } catch (error) {
        console.error('Error al obtener rol:', error);
        return 'athlete';
    }
}

// Get full user profile from Realtime Database
async function getUserProfile(uid) {
    try {
        const snapshot = await db.ref(`users/${uid}`).once('value');
        return snapshot.val();
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        return null;
    }
}

// Listen to auth state changes
function onAuthChange(callback) {
    auth.onAuthStateChanged(callback);
}

// Require authentication — redirect to login if not signed in
function requireAuth() {
    return new Promise((resolve) => {
        auth.onAuthStateChanged(async (user) => {
            if (!user) {
                window.location.href = '/index.html';
                return;
            }
            const role = await getUserRole(user.uid);
            resolve({ user, role });
        });
    });
}

// Redirect to app if already logged in (for login page)
function redirectIfLoggedIn() {
    auth.onAuthStateChanged((user) => {
        if (user) {
            window.location.href = '/app.html';
        }
    });
}
