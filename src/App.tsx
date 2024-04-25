import { useState } from 'react';
import './App.css'
import Scene from './components/scene'
import { Button, Divider, Icon, IconButton, ThemeProvider, Tooltip, Typography } from '@mui/material';
import { darkTheme } from './themes/themes';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { marcher, other, utils } from './shaders/engine';
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { checkShaderComplied, fragCode, uniformCode, vertCode } from './shaders/main';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { megnerSponge, monoOxide } from './shaders/examples';

function App() {
  const [editorCode, setEditorCode] = useState<string>(monoOxide);
  const [editorCodeChanges, setEditorCodeChanges] = useState<string>(monoOxide);
  const [shadersCompiled, setShadersCompiled] = useState<0 | 1 | 2>(1);

  const [showCode, setShowCode] = useState<boolean>(true);

  const applyChanges = () => {
    // vertCode is guaranteed to be compiled
    const checkShaders = checkShaderComplied(vertCode, uniformCode + utils + editorCodeChanges + marcher + other + fragCode)
    setShadersCompiled(checkShaders.compiled ? 1 : 0);
    if (checkShaders.compiled) {
      setEditorCode(editorCodeChanges);
    }
  };

  const toggleShowCode = () => {
    setShowCode(!showCode);
  }

  const switchExample = (example: string) => {
    setEditorCodeChanges(example);
    setShowCode(true);
    setShadersCompiled(2);
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <div>
        <div className='top-bar-wrapper'>
          <div className='top-bar'>
            <Button
              style={{ minWidth: '120px' }}
              onClick={toggleShowCode}
              startIcon={showCode ? <CloseFullscreenIcon /> : <OpenInFullIcon />}
            >
              {showCode ? "Hide Code" : "Show Code"}
            </Button>
            <Divider orientation="vertical" variant="fullWidth" flexItem />
            <Typography style={{ padding: '8px' }} ><b>Examples</b></Typography>
            <Divider orientation="vertical" variant="middle" flexItem />
            <Button
              onClick={() => switchExample(monoOxide)}
            >
              Mono Oxide
            </Button>
            <Button
              onClick={() => switchExample(megnerSponge)}
            >
              Menger Sponge
            </Button>
          </div>
        </div>
        {/* ------------------------ Editor ------------------------ */}
        <div className='editor'>
          <div className={'code-mirror-wrapper' + (showCode ? " " : " fade-out")}>
            {/* ------------------------ Top bar ------------------------ */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography style={{ paddingLeft: "8px" }}>Main SDF Code</Typography>
              <Tooltip title="hide code" placement="top" enterDelay={500}>
                <IconButton onClick={toggleShowCode}>
                  <CloseFullscreenIcon sx={{ fontSize: "small" }} />
                </IconButton>
              </Tooltip>
            </div>
            {/* --------------------------------------------------------- */}


            {/* ------------------------ Code Mirror ------------------------ */}
            <CodeMirror
              className='code-mirror'
              value={editorCodeChanges}
              onChange={(code) => {
                setEditorCodeChanges(code);
                setShadersCompiled(2);
              }}
              basicSetup={{
                foldGutter: false,
                dropCursor: false,
                allowMultipleSelections: false,
                indentOnInput: false,
              }}
              theme='dark'
              extensions={[cpp()]}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && event.altKey) {
                  event.preventDefault();
                  applyChanges();
                }
              }}
            />
            {/* ------------------------------------------------------------- */}


            {/* ------------------------ Bottom bar ------------------------ */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Tooltip title="Run code (Alt + Enter)" enterDelay={500}>
                <IconButton
                  color='primary'
                  onClick={applyChanges}>
                  <PlayArrowIcon />
                </IconButton>
              </Tooltip>
              <Typography>{editorCodeChanges.length} chars</Typography>
              <Tooltip title={shadersCompiled === 2 ?
                "Not compiled" :
                shadersCompiled ? "Compiled" : "Error found"} enterDelay={500}>
                <Icon style={{ padding: '8px' }}>
                  {shadersCompiled === 2 ?
                    <WarningAmberIcon color='warning' /> :
                    shadersCompiled ?
                      <CheckIcon color='success' /> :
                      <ClearIcon color='error' />}
                </Icon>
              </Tooltip>
            </div>
            {/* ----------------------------------------------------------- */}
          </div>
        </div>
        {/* -------------------------------------------------------- */}

        {/* ------------------------ Scene ------------------------ */}
        <Scene shaderCode={uniformCode + utils + editorCode + marcher + other} />
        {/* ------------------------------------------------------- */}
      </div>
    </ThemeProvider >
  );
}

export default App
