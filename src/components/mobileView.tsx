import { Typography } from '@mui/material';
import React from 'react';

const MobileView: React.FC = () => {
    // Implement the component logic here

    return (
        <div style={{ display: "flex", flexDirection: 'column', justifyContent: "center", alignItems: "center", height: '85vh' }}>
            <Typography variant="h5" align="center">
                This app is not recommended on mobile devices...
            </Typography>
            <Typography variant="h5" align="center">
                Please visit on a desktop or laptop, or <a className='link' href="https://nabilmansour.com" target="_blank" rel="noreferrer">
                    Visit Developer's Website.
                </a>
            </Typography>

        </div>
    );
};

export default MobileView;