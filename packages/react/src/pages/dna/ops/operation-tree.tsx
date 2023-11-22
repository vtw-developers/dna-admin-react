import React, { useCallback, useEffect, useRef, useState } from 'react';
import './operation-tree.scss';
import TreeView from 'devextreme-react/tree-view';
import { ContextMenu } from 'devextreme-react';
import DataSource from 'devextreme/data/data_source';
import CustomStore from 'devextreme/data/custom_store';
import { apollo } from '../../../graphql-apollo';
import { gql } from '@apollo/client';
import { OperationDetails } from './operation-details/operation-details';

export const OperationTree = () => {
  const [treeItems, setTreeItems] = useState<DataSource>();
  const [contextItems, setContextItems] = useState<any>();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const treeViewRef = useRef<TreeView>(null);

  useEffect(() => {
    setTreeItems(
      new DataSource({
        store: new CustomStore({
          key: 'id',
          load: () => {
            return apollo
              .query({
                query: gql`
                  query containersByType($type: String) {
                    containersByType(type: $type) {
                      id
                      name
                      type
                      hostname
                    }
                  }
                `,
                variables: {
                  type: 'GROUP',
                },
              })
              .then((containerResult: any) => {
                console.log(containerResult);
                const items: any = [
                  {
                    id: 'Root',
                    name: '운영 목록',
                    itemType: 'root',
                    icon: 'icons/common/operation.png',
                    expanded: true,
                  },
                ];
                containerResult.data.containersByType.forEach((e) => {
                  e.itemType = 'container';
                  items.push(convertToItem(e));
                });
                return apollo
                  .query({
                    query: gql`
                      query findAllApps {
                        findAllApps {
                          id
                          name
                          containerName
                          port
                        }
                      }
                    `,
                  })
                  .then((appResult: any) => {
                    appResult.data.findAllApps.forEach((e) => {
                      e.itemType = 'application';
                      items.push(convertToItem(e));
                    });
                    return apollo
                      .query({
                        query: gql`
                          query showDeployedFlows {
                            showDeployedFlows {
                              appName
                              flowName
                            }
                          }
                        `,
                      })
                      .then((flowResult: any) => {
                        flowResult.data.showDeployedFlows.forEach((e) => {
                          e.itemType = 'deployedFlow';
                          items.push(convertToItem(e));
                        });
                        return items;
                      });
                  });
              });
          },
        }),
      })
    );
    setContextItems(null);
  }, []);

  const convertToItem = useCallback((item) => {
    if (item.itemType === 'container') {
      item.parentName = '운영 목록';
      item.icon = 'icons/common/server.svg';
      item.expanded = true;
    } else if (item.itemType === 'application') {
      item.parentName = item.containerName;
      item.icon = 'icons/common/application.svg';
      item.expanded = true;
    } else if (item.itemType === 'deployedFlow') {
      item.parentName = item.appName;
      item.name = item.flowName;
      item.icon = 'icons/common/flow.svg';
      item.expanded = true;
    }
    return item;
  }, []);

  const onItemClick = useCallback((e) => {
    if (e.itemData.itemType !== 'root') setSelectedItem(e.itemData);
  }, []);

  const onSave = useCallback(() => {
    treeViewRef.current?.instance.getDataSource().load();
  }, []);

  return (
    <div className='view-wrapper view-wrapper-operation-tree'>
      <div className='panels'>
        <div className='left' style={{ borderRight: 'solid 2px lightgrey' }}>
          <TreeView
            id='treeView'
            dataSource={treeItems}
            ref={treeViewRef}
            dataStructure='plain'
            keyExpr='name'
            displayExpr='name'
            parentIdExpr='parentName'
            onItemClick={onItemClick}
          />
          <ContextMenu dataSource={contextItems} target='#treeView' />
        </div>
        <div className='right'>
          {selectedItem && (
            <OperationDetails
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
              onSave={onSave}
            />
          )}
        </div>
      </div>
    </div>
  );
};
