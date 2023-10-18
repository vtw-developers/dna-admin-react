import React, { useCallback, useEffect, useRef, useState } from 'react';
import './container-list.scss';
import Toolbar, { Item } from 'devextreme-react/toolbar';
import { Button } from 'devextreme-react/button';
import { Column, Editing, TreeList } from 'devextreme-react/tree-list';
import { HeaderFilter, LoadPanel, Scrolling, Selection, Sorting } from 'devextreme-react/data-grid';
import DataSource from 'devextreme/data/data_source';
import CustomStore from 'devextreme/data/custom_store';
import { apollo } from '../../../graphql-apollo';
import { gql } from '@apollo/client';
import { ContainerEditPopup } from './edit-popup/container-edit-popup';

export const ContainerList = () => {
  const [treeDataSource, setTreeDataSource] = useState<DataSource>();
  const [parentContainer, setParentContainer] = useState<any>(null);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupType, setPopupType] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const treeListRef = useRef<TreeList>(null);

  useEffect(() => {
    setTreeDataSource(
      new DataSource({
        store: new CustomStore({
          key: 'id',
          load: () => {
            const containers = apollo
              .query({
                query: gql`
                  query containers {
                      containers {
                          id
                          name
                          type
                          hostname
                          parentId
                      }
                  }
                `,
              })
              .then((result: any) => {
                console.log(result.data.containers);
                const servers = result.data.containers;
                if (servers) {
                  const items: any[] = servers.filter(server => server.type === 'GROUP');
                  setParentContainer(items);
                }
                return result.data.containers;
              });
            return containers;
          },
        }),
      })
    );
  }, []);

  const changePopupVisibility = useCallback(() => {
    setPopupVisible(!popupVisible);
  }, [popupVisible]);

  const onAddMenuClick = useCallback(() => {
    setPopupVisible(true);
    setPopupType('Add');
  }, []);

  const refresh = useCallback(() => {
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

  return (
    <div className='view-wrapper view-wrapper-container-list'>
      <Toolbar>
        <Item location='before'>
          <span className='toolbar-header'>컨테이너 목록</span>
        </Item>
        <Item location='after' locateInMenu='auto'>
          <Button
            icon='plus'
            text='add'
            type='default'
            stylingMode='contained'
            onClick={onAddMenuClick}
          />
          <Button
            icon='edit'
            text='edit'
            type='default'
            stylingMode='outlined'
            disabled={!selectedItem}
          />
          <Button
            icon='minus'
            text='delete'
            type='danger'
            stylingMode='contained'
            disabled={!selectedItem}
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
        id='id'
        dataSource={treeDataSource}
        columnAutoWidth
        wordWrapEnabled
        showBorders
        keyExpr='id'
        parentIdExpr='parentId'
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
        <Column dataField='type' />
        <Column dataField='hostname' />
      </TreeList>
      <ContainerEditPopup
        visible={popupVisible}
        setVisible={changePopupVisibility}
        type={popupType}
        selectedItem={selectedItem}
        parentContainer={parentContainer}
        onSave={onSave}
      />
    </div>
  );
};
