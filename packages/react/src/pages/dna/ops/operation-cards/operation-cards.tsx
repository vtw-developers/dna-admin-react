import React, { useCallback, useEffect, useState } from 'react';
import TabPanel from 'devextreme-react/tab-panel';
import { DeployDatasource } from '../../datasource/deploy/deploy-datasource';
import { AppDeployedFlows } from './flow/app-deployed-flows';
import { apollo } from '../../../../graphql-apollo';
import { gql } from '@apollo/client';
import { ContainerApplications } from './application/container-applications';

export const OperationCards = ({ selectedItem, onSave }) => {
  const [tabs, setTabs] = useState<any>([]);
  const [selectedIndex, setSelectedIndex] = useState<any>(0);

  useEffect(() => {
    if (selectedItem.itemType === 'deployedFlow') {
      setTabs(['Diagram', 'Monitoring']);
    } else if(selectedItem.itemType === 'container') {
      if (selectedItem.type === 'GROUP') {
        apollo
          .query({
            query: gql`
              query containersByGroupName($groupName: String) {
                containersByGroupName(groupName: $groupName) {
                  id
                  name
                  type
                  hostname
                }
              }
            `,
            variables: {
              groupName: selectedItem.name,
            },
          })
          .then((result: any) => {
            const childList = ['Applications'];
            result.data.containersByGroupName.forEach(e => childList.push(e.name));
            setTabs(childList);
          });
      } else {
        setTabs(['Applications', 'Monitoring']);
      }
    } else if (selectedItem.itemType === 'application') {
      setTabs(['Flows', 'DataSources', 'Monitoring']);
    }
    setSelectedIndex(0);
  }, [selectedItem]);

  const tabPanelItem = useCallback(
    (e) => {
      if (e === 'Flows') {
        return <AppDeployedFlows selectedItem={selectedItem} reload={onSave} />;
      } else if (e === 'DataSources') {
        return <DeployDatasource selectedItem={selectedItem} />;
      } else if (e === 'Applications') {
        return <ContainerApplications selectedItem={selectedItem} reload={onSave} />;
      }
      return <></>;
    },
    [selectedItem]
  );

  const onSelectionChanged = useCallback((e) => {
    if (e.name === 'selectedIndex') {
      setSelectedIndex(e.value);
    }
  }, []);

  return (
    <div className='dx-card details-card' style={{ height: '700px' }}>
      <TabPanel
        dataSource={tabs}
        itemRender={tabPanelItem}
        deferRendering={false}
        showNavButtons
        selectedIndex={selectedIndex}
        onOptionChanged={onSelectionChanged}
        repaintChangesOnly
        animationEnabled={false}
        swipeEnabled={false}
        style={{ height: '100%' }}
        noDataText=''
      />
    </div>
  );
};
