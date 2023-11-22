import React, { useCallback, useEffect, useState } from 'react';
import TabPanel from 'devextreme-react/tab-panel';
import { DeployFlow } from '../../flow/deploy/deploy-flow';

export const OperationCards = ({ selectedItem }) => {
  const [tabs, setTabs] = useState<any>([]);
  const [selectedIndex, setSelectedIndex] = useState<any>(0);

  useEffect(() => {
    if (selectedItem.itemType === 'deployedFlow') {
      setTabs(['Diagram', 'Monitoring']);
    } else if (selectedItem.itemType === 'application') {
      setTabs(['Flows', 'DataSources', 'Monitoring']);
    }
    setSelectedIndex(0);
  }, [selectedItem]);

  const tabPanelItem = useCallback(
    (e) => {
      if (e === 'Flows') {
        return <DeployFlow />;
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
