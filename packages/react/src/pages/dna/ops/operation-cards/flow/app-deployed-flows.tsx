import React, { useCallback, useEffect, useRef, useState } from 'react';
import './app-deployed-flows.scss';
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

import { gql } from '@apollo/client';
import { apollo } from '../../../../../graphql-apollo';
import notify from 'devextreme/ui/notify';
import { AppFlowDeployPopup } from './deploy-popup/app-flow-deploy-popup';

export const AppDeployedFlows = ({ selectedItem, reload }) => {
  const [flowList, setFlowList] = useState<any>();
  const [popupVisible, setPopupVisible] = useState(false);
  const treeListRef = useRef<TreeList>(null);

  useEffect(() => {
    reloadList();
  }, [selectedItem]);

  const reloadList = useCallback(() => {
    apollo
      .query({
        query: gql`
          query showDeployedFlowsByAppName($appName: String) {
            showDeployedFlowsByAppName(appName: $appName) {
              appName
              deployTime
              flowName
            }
          }
        `,
        variables: {
          appName: selectedItem.name,
        },
      })
      .then((result: any) => {
        if (result.errors) {
          console.error(result.errors);
          return;
        }
        setFlowList(result.data.showDeployedFlowsByAppName);
      });
  }, [selectedItem]);

  const changePopupVisibility = useCallback(() => {
    setPopupVisible(!popupVisible);
  }, [popupVisible]);

  const deployFlowClick = useCallback(() => {
    setPopupVisible(true);
  }, []);

  const undeployFlowClick = useCallback(
    (e) => {
      const list = treeListRef.current?.instance.getSelectedRowsData();
      if (list?.length == 0) {
        e.preventDefault();
        return;
      }
      apollo
        .mutate({
          mutation: gql`
            mutation undeployFlows($flows: [deployFlowInput]) {
              undeployFlows(flows: $flows)
            }
          `,
          variables: {
            flows: list,
          },
        })
        .then((result: any) => {
          if (result.errors) {
            console.error(result.errors);
            notify(result.data.undeployFlows, 'error', 2000);
            return;
          }
          onSave();
          reload && reload();
          notify(result.data.undeployFlows, 'success', 2000);
        });
    },
    [selectedItem]
  );

  const refresh = useCallback(() => {
    reloadList();
    treeListRef.current?.instance.refresh();
  }, [selectedItem]);

  const onSave = useCallback(() => {
    refresh();
  }, [selectedItem]);

  return (
    <div className='view-wrapper view-wrapper-menu-manage'>
      <Toolbar>
        <Item location='before' locateInMenu='auto'>
          <Button
            icon='plus'
            text='deploy'
            type='default'
            stylingMode='contained'
            onClick={deployFlowClick}
          />
        </Item>
        <Item location='before' locateInMenu='auto'>
          <Button
            icon='minus'
            text='undeploy'
            type='danger'
            stylingMode='outlined'
            onClick={undeployFlowClick}
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
      <TreeList
        id='name'
        dataSource={flowList}
        columnAutoWidth
        wordWrapEnabled
        showBorders
        keyExpr='flowName'
        parentIdExpr='upperMenuId'
        ref={treeListRef}
      >
        <LoadPanel showPane={false} />
        <HeaderFilter visible />
        <Sorting mode='multiple' />
        <Scrolling rowRenderingMode='virtual' />
        <Selection mode='multiple' />
        <Editing mode='popup' />

        <Column dataField='appName' />
        <Column dataField='flowName' />
        <Column
          dataField='deployTime'
          dataType='datetime'
          format='yyyy-MM-dd HH:mm:ss'
        />
      </TreeList>
      <AppFlowDeployPopup
        visible={popupVisible}
        appName={selectedItem.name}
        setVisible={changePopupVisibility}
        onSave={onSave}
        reload={reload}
      />
    </div>
  );
};
