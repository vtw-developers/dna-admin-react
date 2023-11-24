import React, { useCallback, useEffect, useRef, useState } from 'react';
import './container-applications.scss';
import DataGrid, { Column } from 'devextreme-react/data-grid';
import { apollo } from '../../../../../graphql-apollo';
import { gql } from '@apollo/client';

export const ContainerApplications = ({ selectedItem, /*reload*/ }) => {

  const [applications, setApplications] = useState<any>();
  const gridRef = useRef<DataGrid>(null);

  useEffect(() => {
    reloadList();
  }, [selectedItem]);

  const reloadList = useCallback(() => {
    apollo
      .query({
        query: gql`
          query findAllByContainerName($name: String) {
            findAllByContainerName(name: $name) {
                id
                name
                port
                containerName
            }
          }
        `,
        variables: {
          name: selectedItem.name,
        },
      })
      .then((result: any) => {
        setApplications(result.data.findAllByContainerName);
      });
  }, [selectedItem]);

  return (
    <div className='view-wrapper container-applications'>
      <DataGrid
        id='name'
        dataSource={applications}
        columnAutoWidth
        wordWrapEnabled
        showBorders
        ref={gridRef}
      >
        <Column dataField='containerName' caption='컨테이너' minWidth={150} />
        <Column dataField='name' caption='애플리케이션명' minWidth={150} />
        <Column dataField='port' caption='포트번호' minWidth={150} />
      </DataGrid>
    </div>
  );
};
