import { Typography } from '@mui/material';
import React from 'react';

const mobileStyle: React.CSSProperties = {
    border: "2px solid gray",
    borderRadius: "16px",
    backgroundColor: "#282c34",
    padding: "20px",
    margin: "20px",
    opacity: 0.9,
}

const mobileWrapperStyle : React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: 'absolute',
    zIndex: 100,
    height: '85vh',
}

const MobileView: React.FC = () => {
    return (
        <div style={mobileWrapperStyle}>
            <div style={mobileStyle}>
                <Typography variant="h5" align="center">
                    This app is not recommended on mobile devices...
                </Typography>
                <Typography variant="h5" align="center">
                    Please visit on a desktop/laptop, or <a className='link' href="https://nabilmansour.com" target="_blank" rel="noreferrer">
                        Visit Developer's Website.
                    </a>
                </Typography>
            </div>
        </div>
    );
};

export default MobileView;