import React, { useCallback, useEffect, useRef, useState } from 'react';
import './container-applications.scss';
import DataGrid, { Column, Selection } from 'devextreme-react/data-grid';
import { apollo } from '../../../../../graphql-apollo';
import { gql } from '@apollo/client';
import Toolbar, { Item } from 'devextreme-react/toolbar';
import Button from 'devextreme-react/button';
import { confirm } from 'devextreme/ui/dialog';
import { ContainerAppEditPopup } from './edit-popup/container-app-edit-popup';
import DataSource from 'devextreme/data/data_source';
import CustomStore from 'devextreme/data/custom_store';
import notify from 'devextreme/ui/notify';

export const ContainerApplications = ({ selectedItem, reload }) => {

  const [gridDataSource, setGridDataSource] = useState<DataSource>();
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupType, setPopupType] = useState('');
  const gridRef = useRef<DataGrid>(null);
  const [app, setApp] = useState<any>(null);

  useEffect(() => {
    setGridDataSource(
      new DataSource({
        store: new CustomStore({
          key: 'name',
          load: () => {
            return apollo
              .query({
                query: gql`
                  query findAllByContainerName($name: String) {
                    findAllByContainerName(name: $name) {
                      id
                      name
                      port
                      containerName
                    }
                  }
                `,
                variables: {
                  name: selectedItem.name,
                },
              })
              .then((result: any) => {
                return result.data.findAllByContainerName;
              });
          },
        }),
      })
    );
  }, [selectedItem]);

  const changePopupVisibility = useCallback(() => {
    setPopupVisible(!popupVisible);
  }, [popupVisible]);

  const onAddPopupClick = useCallback(() => {
    setPopupVisible(true);
    setPopupType('생성');
  }, []);

  const onUpdatePopupClick = useCallback(() => {
    setPopupVisible(true);
    setPopupType('수정');
  }, []);

  const onDeletePopupClick = useCallback(() => {
    const result = confirm('해당 애플리케이션을 삭제하시겠습니까?', '애플리케이션 삭제');
    result.then((dialogResult) => {
      if (dialogResult) {
        apollo
          .mutate({
            mutation: gql`
              mutation deleteApp($name: String) {
                deleteApp(name: $name) {
                  id
                  name
                  container {
                    id
                    name
                    type
                    hostname
                  }
                  port
                }
              }
            `,
            variables: {
              name: app.name,
            },
          })
          .then(() => {
            onSave();
            refresh();
            reload && reload();
          })
          .catch((result: any) => {
            notify(result.graphQLErrors[0].message, 'error', 2500);
          });
      }
    });
  }, [app]);

  const refresh = useCallback(() => {
    gridRef.current?.instance.refresh();
    gridRef.current?.instance.clearSelection();
  }, []);

  const onSave = useCallback(() => {
    refresh();
  }, []);

  const onSelectionChanged = useCallback((e) => {
    const selectedRowsData = e.selectedRowsData[0];
    setApp(selectedRowsData);
  }, []);

  return (
    <div className='view-wrapper container-applications'>
      <Toolbar>
        <Item location='before' locateInMenu='auto'>
          <Button
            icon='plus'
            text='생성'
            type='default'
            stylingMode='contained'
            onClick={onAddPopupClick}
          />
          <Button
            icon='edit'
            text='수정'
            type='default'
            stylingMode='outlined'
            disabled={!app}
            onClick={onUpdatePopupClick}
          />
          <Button
            icon='minus'
            text='삭제'
            type='danger'
            disabled={!app}
            onClick={onDeletePopupClick}
          />
        </Item>
        <Item
          location='before'
          locateInMenu='auto'
          showText='inMenu'
          widget='dxButton'
        >
          <Button
            icon='refresh'
            text='Refresh'
            stylingMode='text'
            onClick={refresh}
          />
        </Item>
      </Toolbar>
      <DataGrid
        id='name'
        dataSource={gridDataSource}
        columnAutoWidth
        wordWrapEnabled
        showBorders
        onSelectionChanged={onSelectionChanged}
        ref={gridRef}
      >
        <Selection mode='single' />
        <Column dataField='containerName' caption='컨테이너' minWidth={150} />
        <Column dataField='name' caption='애플리케이션명' minWidth={150} />
        <Column dataField='port' caption='포트번호' minWidth={150} />
      </DataGrid>
      <ContainerAppEditPopup
        visible={popupVisible}
        setVisible={changePopupVisibility}
        type={popupType}
        selectedItem={app}
        containerName={selectedItem.name}
        onSave={onSave}
        reload={reload}
      />
    </div>
  );
};
