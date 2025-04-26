import React from 'react';

const Layout: React.FC = ({ children }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <header style={{ background: '#f5f5f5', padding: '1rem' }}>
                <h1>Metamuse</h1>
            </header>
            <main style={{ flex: 1, padding: '1rem' }}>
                {children}
            </main>
            <footer style={{ background: '#f5f5f5', padding: '1rem', textAlign: 'center' }}>
                <p>&copy; {new Date().getFullYear()} Metamuse. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Layout