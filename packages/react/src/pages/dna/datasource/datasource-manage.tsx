import React, { useCallback, useEffect, useRef, useState } from 'react';
import './datasource-manage.scss';
import Toolbar, { Item } from 'devextreme-react/toolbar';
import { Button } from 'devextreme-react/button';
import { Column, Editing, TreeList } from 'devextreme-react/tree-list';
import {
  HeaderFilter,
  LoadPanel,
  Scrolling,
  Selection,
  Sorting,
} from 'devextreme-react/data-grid';
import { apollo } from '../../../graphql-apollo';
import { gql } from '@apollo/client';
import { DatasourceEditPopup } from './edit-popup/datasource-edit-popup';
import { confirm } from 'devextreme/ui/dialog';
import notify from 'devextreme/ui/notify';
import { DatasourceDeployPopup } from './deploy-popup/datasource-deploy-popup';

export const DatasourceManage = () => {
  const [dataSources, setDataSources] = useState<any>();
  const [popupVisible, setPopupVisible] = useState(false);
  const [deployPopupVisible, setDeployPopupVisible] = useState(false);
  const [popupType, setPopupType] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const treeListRef = useRef<TreeList>(null);
  useEffect(() => {
    reloadDataSources();
  }, []);

  function reloadDataSources() {
    apollo
      .query({
        query: gql`
          query dataSources {
            dataSources {
              id
              projectId
              databaseProduct
              name
              description
              url
              username
              password
            }
          }
        `,
      })
      .then((result: any) => {
        console.log(result);
        setDataSources(result.data.dataSources);
      });
  }

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
    const result = confirm('해당 데이터소스를 삭제하시겠습니까?', '데이터소스 삭제');
    result.then((dialogResult) => {
      console.log(dialogResult);
      if (dialogResult) {
        apollo
          .mutate({
            mutation: gql`
              mutation deleteDataSource($name: String) {
                deleteDataSource(name: $name)
              }
            `,
            variables: {
              name: selectedItem.name,
            },
          })
          .then(() => {
            onSave && onSave();
            refresh();
          })
          .catch((result: any) => {
            notify(result.graphQLErrors[0].message, 'error', 2500);
          });
      }
    });
  }, [selectedItem]);

  const deployDataSourceClick = useCallback(() => {
    setDeployPopupVisible(true);
  }, []);

  const refresh = useCallback(() => {
    reloadDataSources();
    treeListRef.current?.instance.refresh();
    treeListRef.current?.instance.clearSelection();
  }, []);

  const onSave = useCallback(() => {
    refresh();
  }, []);

  const onSelectionChanged = useCallback((e) => {
    const selectedRowsData = e.selectedRowsData[0];
    console.log(selectedRowsData);
    setSelectedItem(selectedRowsData);
  }, []);

  const cellRender = useCallback((data) => {
    return (
      <div className='database-product'>
        <img alt='' src={`icons/database/${data.value}.svg`} />
        {data.value}
      </div>
    );
  }, []);

  return (
    <div className='view-wrapper view-wrapper-datasource-manage'>
      <Toolbar>
        <Item location='before'>
          <span className='toolbar-header'>데이터소스 관리</span>
        </Item>
        <Item location='after' locateInMenu='auto'>
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
            disabled={!selectedItem}
            onClick={onUpdatePopupClick}
          />
          <Button
            icon='minus'
            text='삭제'
            type='danger'
            stylingMode='contained'
            disabled={!selectedItem}
            onClick={onDeletePopupClick}
          />
          <Button
            icon='plus'
            text='배포'
            type='normal'
            stylingMode='contained'
            onClick={deployDataSourceClick}
          />
        </Item>
        <Item
          location='after'
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
      <TreeList
        id='name'
        dataSource={dataSources}
        wordWrapEnabled
        showBorders
        ref={treeListRef}
        onSelectionChanged={onSelectionChanged}
      >
        <LoadPanel showPane={false} />
        <HeaderFilter visible />
        <Sorting mode='multiple' />
        <Scrolling rowRenderingMode='virtual' />
        <Selection mode='single' />
        <Editing mode='popup' />

        <Column dataField='name' />
        <Column
          dataField='databaseProduct'
          caption='Product'
          cellRender={cellRender}
        />
        <Column dataField='url' />
        <Column dataField='username' />
      </TreeList>
      <DatasourceEditPopup
        visible={popupVisible}
        setVisible={changePopupVisibility}
        type={popupType}
        selectedItem={selectedItem}
        onSave={onSave}
      />
      <DatasourceDeployPopup
        visible={deployPopupVisible}
        setVisible={setDeployPopupVisible}
        onSave={onSave}
      />
    </div>
  );
};
