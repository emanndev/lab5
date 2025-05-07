export function setupMobileNavigation() {
    const sidebar = document.querySelector('.sidebar');
    const menuToggle = document.querySelector('.menu-toggle');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (!sidebar || !menuToggle || !overlay) return;
    const toggleSidebar = () => {
        sidebar.classList.toggle('active');
    };
    const closeSidebar = () => {
        sidebar.classList.remove('active');
    };
    
    menuToggle.addEventListener('click', toggleSidebar);
    overlay.addEventListener('click', closeSidebar);
    
    // Close sidebar when nav link is clicked (mobile only)
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 1024) {
                closeSidebar();
            }
        });
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 1024) {
            closeSidebar();
        }
    });
}

document.addEventListener('DOMContentLoaded', setupMobileNavigation);