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

export const DatasourceManage = () => {
  const [dataSources, setDataSources] = useState<any>();
  const [popupVisible, setPopupVisible] = useState(false);
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

  const updateClick = useCallback(() => {
    setPopupVisible(true);
    setPopupType('수정');
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
            icon='edit'
            text='수정'
            type='default'
            stylingMode='contained'
            disabled={!selectedItem}
            onClick={updateClick}
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
        <Column dataField='databaseProduct' caption='Product' cellRender={cellRender} />
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
    </div>
  );
};
