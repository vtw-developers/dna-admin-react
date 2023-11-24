import React, { useCallback, useEffect, useRef, useState } from 'react';
import './deploy-datasource.scss';
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
import { DatasourceDeployPopup } from '../deploy-popup/datasource-deploy-popup';
import { apollo } from '../../../../graphql-apollo';
import { gql } from '@apollo/client';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';

export const DeployDatasource = ({
  selectedItem
}) => {
  const [dataSources, setDataSources] = useState<any>();
  const [popupVisible, setPopupVisible] = useState(false);
  const treeListRef = useRef<TreeList>(null);

  useEffect(() => {
    reloadDataSource();
  }, [selectedItem]);

  const reloadDataSource = useCallback(() => {
    apollo
      .query({
        query: gql`
          query deployedDataSources($app: String) {
            deployedDataSources(app: $app) {
              appName
              dataSourceName
              deployTime
            }
          }
        `,
        variables: {
          app: selectedItem.name,
        },
      })
      .then((result: any) => {
        setDataSources(result.data.deployedDataSources);
      });
  }, [selectedItem]);

  const changePopupVisibility = useCallback(() => {
    setPopupVisible(!popupVisible);
  }, [popupVisible]);

  const deployDataSourceClick = useCallback(() => {
    setPopupVisible(true);
  }, []);

  const undeployDataSourceClick = useCallback(() => {
    const list = treeListRef.current?.instance.getSelectedRowsData();
    const result = confirm(`선택한 데이터소스 ${list?.length}개를 배포 취소 하시겠습니까?`, '배포 취소');
    result.then((dialogResult) => {
      if (dialogResult) {
        apollo
          .mutate({
            mutation: gql`
              mutation undeployDataSources($dataSources: [deployDataSourceInput]) {
                undeployDataSources(dataSources: $dataSources)
              }
            `,
            variables: {
              dataSources: list,
            }
          })
          .then((result: any) => {
            onSave();
            notify(result.data.undeployDataSources, 'success', 2000);
          });
      }
    });
  }, [selectedItem]);

  const refresh = useCallback(() => {
    reloadDataSource();
    treeListRef.current?.instance.refresh();
  }, [selectedItem]);

  const onSave = useCallback(() => {
    refresh();
  }, [selectedItem]);

  return (
    <div className='view-wrapper view-wrapper-datasource-manage'>
      <Toolbar>
        {/*<Item location='before'>
          <span className='toolbar-header'>데이터소스 배포</span>
        </Item>*/}
        <Item location='before' locateInMenu='auto'>
          <Button
            icon='plus'
            text='deploy'
            type='default'
            stylingMode='contained'
            onClick={deployDataSourceClick}
          />
        </Item>
        <Item location='before' locateInMenu='auto'>
          <Button
            icon='minus'
            text='undeploy'
            type='danger'
            stylingMode='outlined'
            onClick={undeployDataSourceClick}
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
        dataSource={dataSources}
        columnAutoWidth
        wordWrapEnabled
        showBorders
        keyExpr='dataSourceName'
        ref={treeListRef}
      >
        <LoadPanel showPane={false} />
        <HeaderFilter visible />
        <Sorting mode='multiple' />
        <Scrolling rowRenderingMode='virtual' />
        <Selection mode='multiple' />
        <Editing mode='popup' />

        <Column dataField='appName' />
        <Column dataField='dataSourceName' caption='Datasource Name' />
        <Column
          dataField='deployTime'
          dataType='datetime'
          format='yyyy-MM-dd HH:mm:ss'
        />
      </TreeList>
      <DatasourceDeployPopup
        visible={popupVisible}
        setVisible={changePopupVisibility}
        onSave={onSave}
        appName={selectedItem.name}
      />
    </div>
  );
};
