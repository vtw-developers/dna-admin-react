import React, { useCallback, useEffect, useRef, useState } from 'react';
import './deploy-flow.scss';
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
import { apollo } from '../../../../graphql-apollo';
import { ProjectDeployPopup } from '../deploy-popup/project-deploy-popup';
import notify from 'devextreme/ui/notify';

export const DeployFlow = () => {
  const [flowList, setFlowList] = useState<any>();
  const [popupVisible, setPopupVisible] = useState(false);
  const treeListRef = useRef<TreeList>(null);
  useEffect(() => {
    reloadList();
  }, []);

  const reloadList = useCallback(() => {
    apollo
      .query({
        query: gql`
          query showDeployedFlows {
            showDeployedFlows {
              appName
              deployTime
              flowName
            }
          }
        `,
      })
      .then((result: any) => {
        if (result.errors) {
          console.error(result.errors);
          return;
        }
        const items: any = [];
        result.data.showDeployedFlows.forEach((e) => {
          items.push(convertToItem(e));
        });
        setFlowList(items);
      });
  }, []);

  const convertToItem = useCallback((item) => {
    item.key = `${item.appName}_${item.flowName}`;
    return item;
  }, []);

  const changePopupVisibility = useCallback(() => {
    setPopupVisible(!popupVisible);
  }, [popupVisible]);

  const deployFlowClick = useCallback(() => {
    setPopupVisible(true);
  }, []);

  const undeployFlowClick = useCallback(() => {
    const getSelectedRowsData =
      treeListRef.current?.instance.getSelectedRowsData();

    const items: any = [];
    getSelectedRowsData?.forEach((e) => {
      const data = {
        appName: e.appName,
        flowName: e.flowName,
        deployTime: e.deployTime,
      };
      items.push(data);
    });
    console.log(items);
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
        onSave && onSave();
        notify(result.data.undeployFlows, 'success', 2000);
      });
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
          <span className='toolbar-header'>플로우 배포</span>
        </Item>
        <Item location='after' locateInMenu='auto'>
          <Button
            icon='plus'
            text='deploy'
            type='default'
            stylingMode='contained'
            onClick={deployFlowClick}
          />
        </Item>
        <Item location='after' locateInMenu='auto'>
          <Button
            icon='minus'
            text='undeploy'
            type='danger'
            stylingMode='outlined'
            onClick={undeployFlowClick}
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
        keyExpr='key'
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
      <ProjectDeployPopup
        visible={popupVisible}
        setVisible={changePopupVisibility}
        onSave={onSave}
      />
    </div>
  );
};
