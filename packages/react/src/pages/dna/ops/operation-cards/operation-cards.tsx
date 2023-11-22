import React from 'react';
import TabPanel, { Item as TabPanelItem } from 'devextreme-react/tab-panel';

export const OperationCards = () => {
  return (
    <div className='dx-card details-card' style={{ height: '700px' }}>
      <TabPanel showNavButtons deferRendering={false}>
        <TabPanelItem title='플로우'>
          <iframe src='' style={{ height: '100%', width: '100%', border: 'none' }} />
        </TabPanelItem>
        <TabPanelItem title='데이터소스'>
          <iframe src='' style={{ height: '100%', width: '100%', border: 'none' }} />
        </TabPanelItem>
        <TabPanelItem title='모니터링'>
          <iframe src='' style={{ height: '100%', width: '100%', border: 'none' }} />
        </TabPanelItem>
      </TabPanel>
      {/*<iframe src='' style={{ height: '100%', width: '100%', border: 'none' }} />*/}
    </div>
  );
};
