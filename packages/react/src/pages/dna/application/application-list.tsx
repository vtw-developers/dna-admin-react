import React, { useCallback, useEffect, useRef, useState } from 'react';
import './application-list.scss';
import DataGrid, {
  Column,
  HeaderFilter,
  Item,
  Pager,
  Paging,
  Scrolling,
  SearchPanel,
  Sorting,
  Toolbar,
} from 'devextreme-react/data-grid';
import Button from 'devextreme-react/button';
import DataSource from 'devextreme/data/data_source';
import CustomStore from 'devextreme/data/custom_store';
import { PageableService } from '../util/pageable';
import { apollo } from '../../../graphql-apollo';
import { gql } from '@apollo/client';
import { ApplicationEditPopup } from './edit-popup/application-edit-popup';
import { confirm } from 'devextreme/ui/dialog';

const pageableService = new PageableService();

export const ApplicationList = () => {
  const [gridDataSource, setGridDataSource] = useState<DataSource>();
  const [popupVisible, setPopupVisible] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const newApp: any = {
    id: '',
    name: '',
    containerName: '',
    port: ''
  };
  const [app, setApp] = useState<any>(newApp);
  const gridRef = useRef<DataGrid>(null);

  useEffect(() => {
    setGridDataSource(
      new DataSource({
        store: new CustomStore({
          key: 'id',
          load: (loadOptions) => {
            const pageable = pageableService.getPageable(loadOptions);
            const pagingApps = apollo
              .query({
                query: gql`
                  query apps(
                    $page: Int = 0
                    $size: Int = 100000
                    $sortBy: String = "id"
                    $sortDir: String = "asc"
                  ) {
                    apps(
                      page: $page
                      size: $size
                      sortBy: $sortBy
                      sortDir: $sortDir
                    ) {
                      totalElements
                      content {
                        id
                        name
                        containerName
                        port
                      }
                    }
                  }
                `,
                variables: {
                  page: pageable.page || 0,
                  size: pageable.size,
                  sortBy: pageable.sortBy,
                  sortDir: pageable.sortDir,
                },
              })
              .then((page: any) => {
                return pageableService.transformPage(page.data.apps);
              });
            return pagingApps;
          },
        }),
      })
    );
  }, []);

  const changePopupVisibility = useCallback(() => {
    setPopupVisible(!popupVisible);
  }, [popupVisible]);

  const refresh = useCallback(() => {
    gridRef.current?.instance.refresh();
  }, []);

  const onSave = useCallback(() => {
    refresh();
  }, []);

  const reset = useCallback(() => {
    setApp({ ...newApp });
  }, []);

  const onRowClick = (e) => {
    gridRef?.current?.instance.selectRowsByIndexes(e.rowIndex);
    const value = e.data;
    if (value.name === app.name) {
      gridRef?.current?.instance.clearSelection();
      setIsSelected(false);
      reset();
    } else {
      setApp(value);
      setIsSelected(true);
    }
  };

  const remove = () => {
    const result = confirm('해당 어플리케이션을 삭제하시겠습니까?', '어플리케이션 삭제');
    result.then(dialogResult => {
      if (dialogResult) {
        apollo
          .mutate({
            mutation: gql`
              mutation deleteApp($name: String) {
                deleteApp(name: $name) {
                  id
                  name
                  container {
                    id
                    name
                    type
                    hostname
                  }
                  port
                }
              }
            `,
            variables: {
              name: app.name,
            },
          })
          .then(() => {
            onSave && onSave();
            reset();
            setIsSelected(false);
          });
      }
    });
  };

  return (
    <div className='view crm-contact-list'>
      <div className='view-wrapper view-wrapper-contact-list app-list'>
        <DataGrid
          className='grid'
          height='100%'
          dataSource={gridDataSource}
          allowColumnReordering
          ref={gridRef}
          onRowClick={onRowClick}
        >
          <SearchPanel visible placeholder='검색...' />
          <HeaderFilter visible />
          <Sorting mode='multiple' />
          <Scrolling rowRenderingMode='virtual' />
          <Paging defaultPageSize={10} />
          <Pager
            visible
            displayMode='full'
            showPageSizeSelector
            showInfo
            showNavigationButtons
          />
          <Toolbar>
            <Item location='before'>
              <div className='grid-header'>어플리케이션 목록</div>
            </Item>
            <Item location='after' locateInMenu='auto'>
              <div className='button'>
                <Button
                  text='어플리케이션 생성'
                  icon='plus'
                  type='success'
                  className='gridButton create'
                  stylingMode='contained'
                  visible={!isSelected}
                  onClick={changePopupVisibility}
                />
                <Button
                  text='수정'
                  icon='edit'
                  type='default'
                  className='gridButton update'
                  visible={isSelected}
                  onClick={changePopupVisibility}
                />
                <Button
                  text='삭제'
                  icon='clearsquare'
                  type='danger'
                  className='gridButton delete'
                  visible={isSelected}
                  onClick={remove}
                />
              </div>
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
            <Item location='after' locateInMenu='auto'>
              <div className='separator' />
            </Item>
            <Item name='searchPanel' locateInMenu='auto' />
          </Toolbar>
          <Column dataField='containerName' caption='컨테이너' minWidth={150} />
          <Column dataField='name' caption='애플리케이션명' minWidth={150} />
          <Column dataField='port' caption='포트번호' minWidth={150} />
        </DataGrid>
        <ApplicationEditPopup
          visible={popupVisible}
          setVisible={setPopupVisible}
          onSave={onSave}
          app={app}
          setApp={setApp}
          isSelected={isSelected}
        />
      </div>
    </div>
  );
};
