import React from 'react';
import { Button } from 'devextreme-react/button';
import Toolbar, { Item } from 'devextreme-react/toolbar';

export const DownloadIde = () => {
  const download = () => {
    fetch('/files/test.exe', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/vnd.microsoft.portable-executable',
      },
    })
      .then((response) => response.blob())
      .then((data) => {
        const link = document.createElement('a');
        const url = window.URL.createObjectURL(data);
        link.href = url;
        link.setAttribute(
          'download',
          'DnASetup.exe',
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }).catch(error => console.log(error));
  };

  return (
    <div className='view-wrapper view-wrapper-task-list bulletin-board-detail'>
      <Toolbar className='toolbar-common'>
        <Item location='before'>
          <span className='toolbar-header'>다운로드</span>
        </Item>
      </Toolbar>
      <Toolbar className='toolbar-common'>
        <Item
          location='before'
          widget='dxButton'
          locateInMenu='auto'
        >
          <Button
            stylingMode='contained'
            text='Download'
            type='default'
            onClick={download}
          />
        </Item>
      </Toolbar>
    </div>
  );
};
