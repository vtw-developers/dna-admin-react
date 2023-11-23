import React, { useCallback } from 'react';
import ScrollView from 'devextreme-react/scroll-view';
import { Item, Toolbar } from 'devextreme-react/toolbar';
import Button from 'devextreme-react/button';
import { OperationCards } from '../operation-cards/operation-cards';

import './operation-details.scss';
import { ContainerForm } from '../operation-form/container-form';
import { ApplicationForm } from '../operation-form/application-form';

export const OperationDetails = ({ selectedItem, setSelectedItem, onSave }) => {
  const onClick = useCallback(() => {
    setSelectedItem(null);
  }, []);

  return (
    <ScrollView className='view-wrapper-scroll'>
      <div className='view-wrapper view-wrapper-operation-details'>
        <Toolbar className='toolbar-details'>
          <Item location='before'>
            <Button icon='arrowleft' stylingMode='text' onClick={onClick} />
          </Item>
          <Item location='before' text={selectedItem?.name ?? 'Loading...'} />
        </Toolbar>
        <div className='panels'>
          <div className='left'>
            {selectedItem.itemType === 'container' && (
              <ContainerForm
                selectedItem={selectedItem}
                setSelectedItem={setSelectedItem}
                onSave={onSave}
              />
            )}
            {selectedItem.itemType === 'application' && (
              <ApplicationForm
                selectedItem={selectedItem}
                setSelectedItem={setSelectedItem}
                onSave={onSave}
              />
            )}
          </div>
          <div className='right'>
            <OperationCards selectedItem={selectedItem} onSave={onSave} />
          </div>
        </div>
      </div>
    </ScrollView>
  );
};
