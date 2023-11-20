import React, { useCallback, useEffect, useRef, useState } from 'react';
import './flow-manage.scss';
import { Column, Editing, TreeList } from 'devextreme-react/tree-list';
import {
  HeaderFilter,
  LoadPanel,
  Scrolling,
  Selection,
  Sorting,
} from 'devextreme-react/data-grid';
import { Button } from 'devextreme-react/button';
import Toolbar, { Item } from 'devextreme-react/toolbar';
import { ProjectImportPopup } from './import-popup/project-import-popup';
import { apollo } from '../../../graphql-apollo';
import { gql } from '@apollo/client';

export const FlowManage = () => {
  const [flowList, setFlowList] = useState<any>();
  const [popupVisible, setPopupVisible] = useState(false);
  const treeListRef = useRef<TreeList>(null);
  useEffect(() => {
    reloadList();
  }, []);

  function reloadList() {
    apollo
      .query({
        query: gql`
          query flows {
            showFlows {
              projectName
              name
              type
              template
            }
          }
        `,
      })
      .then((result: any) => {
        if (result.errors) {
          console.error(result.errors);
          return;
        }
        setFlowList(result.data.showFlows);
      });
  }

  const changePopupVisibility = useCallback(() => {
    setPopupVisible(!popupVisible);
  }, [popupVisible]);

  const importFlowClick = useCallback(() => {
    setPopupVisible(true);
  }, []);

  const refresh = useCallback(() => {
    reloadList();
    treeListRef.current?.instance.refresh();
  }, []);

  const onSave = useCallback(() => {
    refresh();
  }, []);

  return (
    <div className='view-wrapper view-wrapper-menu-manage'>
      <Toolbar>
        <Item location='before'>
          <span className='toolbar-header'>플로우 관리</span>
        </Item>
        <Item location='after' locateInMenu='auto'>
          <Button
            icon='plus'
            text='import'
            type='default'
            stylingMode='contained'
            onClick={importFlowClick}
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
        dataSource={flowList}
        columnAutoWidth
        wordWrapEnabled
        showBorders
        keyExpr='name'
        parentIdExpr='upperMenuId'
        ref={treeListRef}
      >
        <LoadPanel showPane={false} />
        <HeaderFilter visible />
        <Sorting mode='multiple' />
        <Scrolling rowRenderingMode='virtual' />
        <Selection mode='single' />
        <Editing mode='popup' />

        <Column dataField='projectName' />
        <Column dataField='name' />
        <Column dataField='type' />
        <Column dataField='template' />
      </TreeList>
      <ProjectImportPopup
        visible={popupVisible}
        setVisible={changePopupVisibility}
        onSave={onSave}
      />
    </div>
  );
};
