import React, { useCallback, useEffect, useState } from 'react';
import './operation-tree.scss';
import TreeView from 'devextreme-react/tree-view';
import { ContextMenu } from 'devextreme-react';
import DataSource from 'devextreme/data/data_source';
import CustomStore from 'devextreme/data/custom_store';
import { apollo } from '../../../graphql-apollo';
import { gql } from '@apollo/client';

export const OperationTree = () => {
  const [treeItems, setTreeItems] = useState<DataSource>();
  const [contextItems, setContextItems] = useState<any>();

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
              .then((result: any) => {
                const items: any = [];
                result.data.containersByType.forEach((e) => {
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
                  .then((result: any) => {
                    result.data.findAllApps.forEach((e) => {
                      e.itemType = 'application';
                      items.push(convertToItem(e));
                    });
                    return items;
                  });
              });
          },
        }),
      })
    );
    setContextItems(null);
  }, []);

  const convertToItem = useCallback((item) => {
    console.log(item);
    if (item.itemType === 'container') {
      item.parentName = null;
      item.icon = 'icons/common/server.svg';
      item.expanded = true;
    } else if (item.itemType === 'application') {
      item.parentName = item.containerName;
      item.icon = 'icons/common/application.svg';
      item.expanded = true;
    }
    return item;
  }, []);

  return (
    <div className='view-wrapper view-wrapper-operation-tree'>
      <TreeView
        id='treeView'
        dataSource={treeItems}
        dataStructure='plain'
        keyExpr='name'
        displayExpr='name'
        parentIdExpr='parentName'
      />
      <ContextMenu dataSource={contextItems} target='#treeView' />
    </div>
  );
};
