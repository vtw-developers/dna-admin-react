import React, { useCallback, useEffect, useRef, useState } from 'react';
import './container-list.scss';
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
import DataSource from 'devextreme/data/data_source';
import CustomStore from 'devextreme/data/custom_store';
import { apollo } from '../../../graphql-apollo';
import { gql } from '@apollo/client';
import { ContainerEditPopup } from './edit-popup/container-edit-popup';
import { confirm } from 'devextreme/ui/dialog';

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
            return apollo
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
                const parent = result.data.containers.filter((container) => container.type === 'GROUP');
                setParentContainer(parent);
                return result.data.containers;
              });
          }
        }),
      })
    );
  }, []);

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
    const result = confirm('해당 컨테이너를 삭제하시겠습니까?', '컨테이너 삭제');
    result.then((dialogResult) => {
      if (dialogResult) {
        apollo
          .mutate({
            mutation: gql`
              mutation deleteContainer($name: String) {
                deleteContainer(name: $name)
              }
            `,
            variables: {
              name: selectedItem.name,
            },
          })
          .then(() => {
            onSave && onSave();
            refresh();
          });
      }
    });
  }, [selectedItem]);

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

  const calculateDisplayValue = useCallback((data) => {
    if (data.type === 'SINGLE') return '단독';
    return '그룹';
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
        <Column dataField='name' caption='이름' />
        <Column dataField='type' caption='유형' calculateDisplayValue={calculateDisplayValue} />
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
