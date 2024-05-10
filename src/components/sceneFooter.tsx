import { Button } from "@mui/material";
import GitHubIcon from '@mui/icons-material/GitHub';

const links = {
    personalWebsite: 'https://nabilmansour.com/',
    githubRepo: 'https://github.com/NabilNYMansour/ThreeJS-RayMarcher',
}

const buttonStyle: React.CSSProperties = {
    fontFamily: 'Caviar-Dreams',
    textTransform: 'none',
    fontSize: '1em',
    display: 'flex',
    gap: "10%",
    paddingTop: '0px',
    paddingBottom: '0px',
    paddingLeft: '20px',
    paddingRight: '20px',
}

const sceneFooterStyle: React.CSSProperties = {
    color: 'white',
    fontSize: '1em',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '10px',
    position: 'absolute',
    bottom: '0',
    right: '0',
    zIndex: 100,
};

const buttonsListStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '2.5em',
    marginBottom: '10px',
}

export const SceneFooter = () => {
    return <footer style={sceneFooterStyle}>
        <div style={buttonsListStyle}>
            <Button style={buttonStyle} color="inherit" size='large'
                href={links.githubRepo} target="_blank" rel="noreferrer"
            >
                <GitHubIcon fontSize='large' />
                GitHub
            </Button>
            |
            <Button style={buttonStyle} color="inherit" size='large'
                href={links.personalWebsite} target="_blank" rel="noreferrer"
            >
                Developer
            </Button>
        </div>
        Website Made with MUI, Three.js and React
    </footer>
}

export default SceneFooter;
