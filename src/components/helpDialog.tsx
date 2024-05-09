import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Divider } from '@mui/material';
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import { howTo } from '../shaders/examples';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';


interface HelpDialogProps {
    open: boolean;
    onClose: () => void;
}

const dialogPaperProps = {
    style: {
        border: "2px solid gray",
        borderRadius: "16px",
        backgroundImage: ""
    }
}

const HelpDialog: React.FC<HelpDialogProps> = ({ open, onClose }) => {
    return (
        <Dialog
            PaperProps={dialogPaperProps}
            open={open} onClose={onClose}>
            <div style={{ backgroundColor: '#282c34' }}>
                <DialogTitle style={{ textAlign: 'center', }}>
                    Raymarching
                </DialogTitle>
                <DialogContent>
                    <div>
                        <div>
                            <div>
                                Raymarching is a technique used in
                                computer graphics to render 3D scenes
                                defined with <a
                                    className='link'
                                    target="_blank" rel="noreferrer"
                                    href='https://en.wikipedia.org/wiki/Signed_distance_function'>
                                    Signed distance functions.
                                </a>
                            </div>
                            <Divider style={{ margin: '10px' }} />
                            <div>
                                You can define your scene by writing the equation to the distance
                                to your scene in the <code>GetDis</code> function and the color of
                                the scene in the <code>GetAlbedo</code> function.
                            </div>
                            <CodeMirror
                                style={{
                                    border: "2px solid gray",
                                    borderRadius: "16px",
                                    margin: "10px",
                                }}
                                className='code-mirror'
                                value={howTo}
                                extensions={[cpp()]}
                                basicSetup={{
                                    foldGutter: false,
                                    dropCursor: false,
                                    allowMultipleSelections: false,
                                    indentOnInput: false,
                                }}
                                theme='dark'
                                editable={false}
                            />
                            <div>
                                Now once you are done writing the code for your scene, you can
                                click the play button <PlayArrowIcon fontSize='small' /> to see the scene rendered in the canvas.
                                If everything compiles correctly, you should see a <CheckIcon fontSize='small' color='success' />
                                otherwise, you will get <ClearIcon fontSize='small' color='error' /> with the error message showing
                                when you hover over the icon.
                            </div>
                            <Divider style={{ margin: '10px' }} />
                            <div>
                                If you want to see some examples, you can click on any of the examples
                                above and the code will be loaded into the editor.
                            </div>
                            <Divider style={{ margin: '10px' }} />
                            <div>
                                And if you want to see how to construct SDFs, you can check out <a
                                    className='link'
                                    target="_blank" rel="noreferrer"
                                    href='https://iquilezles.org/articles/distfunctions/'>
                                    Inigo Quilez's article on distance functions.
                                </a>
                            </div>
                        </div>

                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Close</Button>
                </DialogActions>
            </div>
        </Dialog>
    );
};

export default HelpDialog;