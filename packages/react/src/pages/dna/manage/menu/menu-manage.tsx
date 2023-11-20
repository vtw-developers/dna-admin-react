import React, { useCallback, useEffect, useRef, useState } from 'react';
import './menu-manage.scss';
import { Column, Editing, Lookup, TreeList } from 'devextreme-react/tree-list';
import DataSource from 'devextreme/data/data_source';
import CustomStore from 'devextreme/data/custom_store';
import { apollo } from '../../../../graphql-apollo';
import { gql } from '@apollo/client';
import {
  HeaderFilter,
  LoadPanel,
  Scrolling,
  Selection,
  Sorting,
} from 'devextreme-react/data-grid';
import { Button } from 'devextreme-react/button';
import Toolbar, { Item } from 'devextreme-react/toolbar';
import { MenuEditPopup } from './edit-popup/menu-edit-popup';

export const MenuManage = () => {
  const [treeDataSource, setTreeDataSource] = useState<DataSource>();
  const [programDataSource, setProgramDataSource] = useState<any>();
  const [popupVisible, setPopupVisible] = useState(false);
  const types = [
    { id: 'group', name: 'Group' },
    { id: 'program', name: 'Program' },
  ];
  const [popupType, setPopupType] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [parentMenu, setParentMenu] = useState<any>(null);
  const treeListRef = useRef<TreeList>(null);

  useEffect(() => {
    apollo
      .query({
        query: gql`
          query programs {
            programs {
              id
              name
              path
            }
          }
        `,
      })
      .then((result: any) => {
        if (result.errors) {
          console.error(result.errors);
          return;
        }
        setProgramDataSource(result.data.programs);
      });

    setTreeDataSource(
      new DataSource({
        store: new CustomStore({
          key: 'id',
          load: () => {
            const pagingMenu = apollo
              .query({
                query: gql`
                  query menus {
                    menus {
                      id
                      name
                      type
                      upperMenuId
                      programId
                      programName
                      upperMenuName
                      icon
                    }
                  }
                `,
              })
              .then((result: any) => {
                console.log(result);
                const menus = result.data.menus;
                if (menus) {
                  const items: any[] = [];
                  menus.forEach((e) => {
                    if (e.type == 'group') items.push(e);
                  });
                  setParentMenu(items);
                }
                return result.data.menus;
              });
            return pagingMenu;
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

  const onUpdatePopupClick = useCallback(() => {
    setPopupVisible(true);
    setPopupType('Update');
  }, []);

  const onDeletePopupClick = useCallback(() => {
    apollo
      .mutate({
        mutation: gql`
          mutation deleteMenu($id: ID) {
            deleteMenu(id: $id)
          }
        `,
        variables: {
          id: selectedItem.id,
        },
      })
      .then(() => {
        onSave && onSave();
        refresh();
      });
  }, [selectedItem]);

  const refresh = useCallback(() => {
    treeListRef.current?.instance.refresh();
  }, []);

  const onSave = useCallback(() => {
    refresh();
  }, []);

  const onSelectionChanged = useCallback((e) => {
    const selectedRowsData = e.selectedRowsData[0];
    setSelectedItem(selectedRowsData);
  }, []);

  return (
    <div className='view-wrapper view-wrapper-menu-manage'>
      <Toolbar>
        <Item location='before'>
          <span className='toolbar-header'>메뉴 관리</span>
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
            onClick={onUpdatePopupClick}
          />
          <Button
            icon='minus'
            text='delete'
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
        parentIdExpr='upperMenuId'
        ref={treeListRef}
        onSelectionChanged={onSelectionChanged}
      >
        <LoadPanel showPane={false} />
        <HeaderFilter visible />
        <Sorting mode='multiple' />
        <Scrolling rowRenderingMode='virtual' />
        <Selection mode='single' />
        <Editing mode='popup' />

        <Column minWidth={250} dataField='name' />
        <Column dataField='type' width={100}>
          <Lookup dataSource={types} displayExpr='name' valueExpr='id' />
        </Column>
        <Column dataField='programName' caption='Program' />
        <Column dataField='icon' />
      </TreeList>
      <MenuEditPopup
        visible={popupVisible}
        setVisible={changePopupVisibility}
        type={popupType}
        selectedItem={selectedItem}
        parentMenu={parentMenu}
        programDataSource={programDataSource}
        onSave={onSave}
      />
    </div>
  );
};
