import React, { useCallback, useEffect, useRef, useState } from 'react';
import './app-deployed-flows.scss';
import {
  Column,
  Editing,
  Selection,
  TreeList,
} from 'devextreme-react/tree-list';
import {
  HeaderFilter,
  LoadPanel,
  Scrolling,
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
          query showDeployedFlowItemsByAppName($appName: String) {
            showDeployedFlowItemsByAppName(appName: $appName) {
              appName
              deployTime
              flowName
              flowType
              template
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
        const items: any = [];
        result.data.showDeployedFlowItemsByAppName.forEach((e) => {
          items.push(convertToItem(e));
        });
        setFlowList(items);
      });
  }, [selectedItem]);

  const convertToItem = useCallback(
    (item) => {
      if (item.flowName === 'General Flow') {
        item.key = item.flowName;
        item.expanded = true;
      } else if (item.flowType === 'General Flow') {
        item.key = item.flowName;
        item.parentKey = 'General Flow';
        item.expanded = true;
      } else if (item.flowType === 'Templated Flow') {
        item.key = item.flowName;
        item.parentKey = item.template;
        item.expanded = true;
      } else if (item.flowType === 'Flow Template') {
        item.key = item.flowName;
        item.expanded = true;
      }
      return item;
    },
    [selectedItem]
  );

  const changePopupVisibility = useCallback(() => {
    setPopupVisible(!popupVisible);
  }, [popupVisible]);

  const deployFlowClick = useCallback(() => {
    setPopupVisible(true);
  }, []);

  const undeployFlowClick = useCallback(
    () => {
      const list =
        treeListRef.current?.instance.getSelectedRowsData('leavesOnly');
      const items: any = [];
      list?.forEach((e) => {
        if (e.flowName == 'General Flow') return;
        const data = {
          appName: e.appName,
          flowName: e.flowName,
          deployTime: e.deployTime,
        };
        items.push(data);
      });
      if (items?.length == 0) {
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
            flows: items,
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
    <div className='view-wrapper app-deployed-flows'>
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
        id='key'
        dataSource={flowList}
        columnAutoWidth
        wordWrapEnabled
        showBorders
        keyExpr='key'
        parentIdExpr='parentKey'
        ref={treeListRef}
        autoExpandAll
      >
        <LoadPanel showPane={false} />
        <HeaderFilter visible />
        <Sorting mode='multiple' />
        <Scrolling rowRenderingMode='virtual' />
        <Selection mode='multiple' recursive />
        <Editing mode='popup' />

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
