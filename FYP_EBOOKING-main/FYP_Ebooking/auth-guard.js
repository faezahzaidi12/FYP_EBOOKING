/**
 * MyTVETMARA e-Booking - Global Auth Guard
 * -----------------------------------------
 * ADMIN:
 * - hanya boleh masuk ADMIN_PAGE/*
 * - kalau cuba masuk page user -> redirect ke home_admin.html
 *
 * STUDENT:
 * - boleh masuk page user
 * - tak boleh masuk ADMIN_PAGE/*
 *
 * NOT LOGGED IN:
 * - redirect ke index.html
 */

(function () {
    'use strict';

    const ADMIN_EMAIL = 'admin@gmail.com';

    // Detect root project berdasarkan lokasi auth-guard.js
    const scriptEl = document.currentScript;

    const PROJECT_ROOT = scriptEl
        ? new URL('./', scriptEl.src)
        : new URL('./', window.location.href);

    // Page yang boleh dibuka tanpa login
    const PUBLIC_PAGES = new Set([
        'index.html',
        'Register.html'
    ]);

    function getCurrentFileName() {
        const path = window.location.pathname;
        const last = path.split('/').filter(Boolean).pop();

        return last || 'index.html';
    }

    function isAdminPage() {
        return /\/ADMIN_PAGE\//i.test(window.location.pathname);
    }

    function isPublicPage() {
        return PUBLIC_PAGES.has(getCurrentFileName());
    }

    function redirectTo(relativePath) {
        const target = new URL(relativePath, PROJECT_ROOT).href;
        window.location.replace(target);
    }

    async function getCurrentUser() {
        if (!window.supabaseClient) {
            console.error(
                '[AUTH GUARD] supabaseClient tidak dijumpai. ' +
                'Pastikan supabase-config.js load sebelum auth-guard.js'
            );

            return null;
        }

        const { data, error } =
            await window.supabaseClient.auth.getUser();

        if (error) {
            console.error(
                '[AUTH GUARD] Error check user:',
                error
            );

            return null;
        }

        return data?.user || null;
    }

    async function protectCurrentPage() {

        // index.html / Register.html boleh masuk tanpa login
        if (isPublicPage()) {
            return true;
        }

        const user = await getCurrentUser();

        // Tak login
        if (!user) {
            redirectTo('index.html');
            return false;
        }

        const email =
            String(user.email || '')
                .trim()
                .toLowerCase();

        const isAdmin =
            email === ADMIN_EMAIL;

        // ======================================
        // ADMIN PAGE
        // ======================================

        if (isAdminPage()) {

            // Student cuba masuk admin
            if (!isAdmin) {

                alert('ADMIN ACCESS ONLY');

                redirectTo('index.html');

                return false;
            }

            // Admin dibenarkan
            return true;
        }

        // ======================================
        // USER PAGE
        // ======================================

        // Admin cuba buka page student
        if (isAdmin) {

            redirectTo(
                'ADMIN_PAGE/home_admin.html'
            );

            return false;
        }

        // Student dibenarkan
        return true;
    }

    // ======================================
    // LOGOUT
    // ======================================

    async function logout() {

        if (window.supabaseClient) {

            const { error } =
                await window.supabaseClient.auth.signOut();

            if (error) {
                console.error(
                    '[AUTH GUARD] Logout error:',
                    error
                );
            }
        }

        // Clear localStorage lama project
        localStorage.removeItem('userAccount');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('currentUserId');

        redirectTo('index.html');
    }

    // Bagi page lain access function ni
    window.authGuard = {
        ADMIN_EMAIL,
        protectCurrentPage,
        logout,
        getCurrentUser
    };

    // Auto protect page
    document.addEventListener(
        'DOMContentLoaded',
        async function () {
            await protectCurrentPage();
        }
    );

})();