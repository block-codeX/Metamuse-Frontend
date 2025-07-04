import React from 'react';

const Layout: React.FC = ({ children }) => {
    return (
        <div className='flex flex-col h-screen overflow-auto'>
            <main style={{ flex: 1, padding: '0' }}>
                {children}
            </main>
        </div>
    );
};

export default Layout