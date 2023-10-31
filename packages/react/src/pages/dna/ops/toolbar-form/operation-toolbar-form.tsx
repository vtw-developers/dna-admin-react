import React from 'react';

import Toolbar, { Item } from 'devextreme-react/toolbar';
import Button from 'devextreme-react/button';

import './operation-toolbar-form.scss';

export const OperationToolbarForm = ({ editing, toggleEditing, onCancelClick, onSaveClick }: {
  editing: boolean, toggleEditing: () => void, onCancelClick: () => void, onSaveClick: (e) => void
}) => {
  return (
    <Toolbar className='toolbar-form'>
      <Item location='before'>
        <span className='dx-form-group-caption'>기본 정보</span>
      </Item>
      <Item location='after' visible={!editing}>
        <Button text='변경' icon='edit' stylingMode='outlined' type='default' onClick={toggleEditing} />
      </Item>
      <Item location='after' visible={editing}>
        <Button text='저장' stylingMode='outlined' type='default' onClick={onSaveClick} />
      </Item>
      <Item location='after' visible={editing}>
        <Button text='취소' stylingMode='text' onClick={onCancelClick} />
      </Item>
    </Toolbar>
  );
};
