import React, { useState } from 'react';
import { FormField, PanelOptionsGroup } from '@grafana/ui';
import { PanelEditorProps } from '@grafana/data';
import { useDropzone } from 'react-dropzone';
import DeleteIcon from './img/DeleteIcon.svg';
import CheckIcon from './img/CheckIcon.svg';
import Exists from './img/Exists.svg';
import None from './img/None.svg';

import { MapOptions } from './types';

export const MainEditor: React.FC<PanelEditorProps<MapOptions>> = ({ options, onOptionsChange }) => {
  const [inputs, setInputs] = useState(options);
  const [myFiles, setMyFiles] = React.useState<File[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    onOptionsChange(inputs);
  };

  const onDrop = React.useCallback(
    acceptedFiles => {
      setMyFiles([...myFiles, ...acceptedFiles]);
    },
    [myFiles]
  );

  const { getRootProps, getInputProps, inputRef } = useDropzone({
    noKeyboard: true,
    maxSize: 20971520,
    multiple: true,
    onDrop,
  });
  const handleRemoveFile = (fileName: string) => {
    const dt = new DataTransfer();
    const leftOver = myFiles.filter(f => f.name !== fileName);
    leftOver.map(f => {
      dt.items.add(f);
    });

    if (inputRef.current) {
      inputRef.current.files = dt.files;
    }
    setMyFiles(leftOver);
  };
  const addTopology = (fileName: string) => {
    const reader = new FileReader();
    const chosenFile = myFiles.find(f => f.name === fileName);

    reader.onloadend = function() {
      const obj = JSON.parse(reader.result as string);
      onOptionsChange({
        ...options,
        topology: obj,
      });
    };
    reader.readAsText(chosenFile as Blob);
  };

  const baseStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    borderWidth: 2,
    borderRadius: 2,
    borderColor: '#eeeeee',
    borderStyle: 'dashed',
    backgroundColor: '#fafafa',
    color: '#bdbdbd',
    outline: 'none',
    transition: 'border .24s ease-in-out',
  };

  return (
    <PanelOptionsGroup>
      <div className="editor-row">
        <div className="section gf-form-group">
          <h5 className="section-heading">Map Settings</h5>
          <FormField
            label="Center Latitude"
            labelWidth={10}
            inputWidth={40}
            type="number"
            name="center_lat"
            value={inputs.center_lat}
            onChange={handleChange}
          />
          <FormField
            label="Center Longitude"
            labelWidth={10}
            inputWidth={40}
            type="number"
            name="center_lon"
            value={inputs.center_lon}
            onChange={handleChange}
          />
          <FormField
            label="Additional Tile"
            labelWidth={10}
            inputWidth={80}
            type="text"
            name="tile_url"
            value={inputs.tile_url}
            onChange={handleChange}
          />
          <FormField
            label="Initial Zoom"
            labelWidth={10}
            inputWidth={40}
            type="number"
            name="zoom_level"
            value={inputs.zoom_level}
            onChange={handleChange}
          />
          <FormField label="Max Zoom" labelWidth={10} inputWidth={40} type="number" name="max_zoom" value={inputs.max_zoom} onChange={handleChange} />
        </div>
        <div className="section gf-form-group">
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <h5 className="section-heading" style={{ marginTop: 7 }}>
              Drop Topology
            </h5>{' '}
            {options.topology ? <img src={Exists} /> : <img src={None} />}
          </div>
          <section>
            <div {...getRootProps({ className: 'dropzone', style: baseStyle })}>
              <input {...getInputProps()} />
              <p>Drag 'n' drop Topology here, or click to select files</p>
            </div>
            {myFiles.length > 0 ? (
              <div>
                <h4>Files</h4>
                <div>
                  {myFiles.map(file => (
                    <p key={file.name}>
                      {file.name} ({file.size} bytes)
                      <button onClick={() => handleRemoveFile(file.name)}>
                        <img src={DeleteIcon} />
                      </button>
                      <button onClick={() => addTopology(file.name)}>
                        <img src={CheckIcon} />
                      </button>
                    </p>
                  ))}
                </div>
              </div>
            ) : (
              ''
            )}
          </section>
        </div>
      </div>
      <button className="btn btn-inverse" onClick={handleSubmit}>
        Submit
      </button>
    </PanelOptionsGroup>
  );
};
