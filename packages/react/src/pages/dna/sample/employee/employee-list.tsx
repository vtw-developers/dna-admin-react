import React, { useCallback, useEffect, useRef, useState } from 'react';
import './employee-list.scss';
import DataGrid, {
  Column,
  ColumnChooser,
  HeaderFilter,
  Item,
  LoadPanel,
  Pager,
  Paging,
  Scrolling,
  SearchPanel,
  Selection,
  Sorting,
  Toolbar,
} from 'devextreme-react/data-grid';
import Button from 'devextreme-react/button';
import { Contact } from '../../../../types/crm-contact';
import DataSource from 'devextreme/data/data_source';
import CustomStore from 'devextreme/data/custom_store';
import { PageableService } from '../../util/pageable';
import { apollo } from '../../../../graphql-apollo';
import { gql } from '@apollo/client';
import { EmployeeEditPopup } from './edit-popup/employee-edit-popup';

const pageableService = new PageableService();

export const EmployeeList = () => {
  const [gridDataSource, setGridDataSource] =
    useState<DataSource<Contact[], string>>();
  const [popupVisible, setPopupVisible] = useState(false);
  const gridRef = useRef<DataGrid>(null);

  useEffect(() => {
    setGridDataSource(
      new DataSource({
        store: new CustomStore({
          key: 'id',
          load: (loadOptions) => {
            const pageable = pageableService.getPageable(loadOptions);

            const page$ = apollo
              .query({
                query: gql`
                  query employees(
                    $page: Int = 0
                    $size: Int = 10
                    $sortBy: String = "id"
                    $sortDir: String = "asc"
                    $filter: String = ""
                  ) {
                    employees(
                      page: $page
                      size: $size
                      sortBy: $sortBy
                      sortDir: $sortDir
                      filter: $filter
                    ) {
                      totalElements
                      content {
                        id
                        name
                        gender
                        birthDate
                      }
                    }
                  }
                `,
                variables: {
                  page: pageable.page || 0,
                  size: pageable.size,
                  sortBy: pageable.sortBy,
                  sortDir: pageable.sortDir,
                  filter: pageable.filter,
                },
              })
              .then((page: any) => {
                console.log(page);
                return pageableService.transformPage(page.data.employees);
              });
            return page$;
          },
        }),
      })
    );
  }, []);

  const changePopupVisibility = useCallback(() => {
    setPopupVisible(!popupVisible);
  }, [popupVisible]);

  const onAddContactClick = useCallback(() => {
    setPopupVisible(true);
  }, []);

  const refresh = useCallback(() => {
    gridRef.current?.instance.refresh();
  }, []);

  const onSave = useCallback(() => {
    refresh();
  }, []);

  return (
    <div className='view crm-contact-list'>
      <div className='view-wrapper view-wrapper-contact-list'>
        <DataGrid
          className='grid'
          noDataText=''
          focusedRowEnabled
          height='100%'
          dataSource={gridDataSource}
          allowColumnReordering
          ref={gridRef}
          remoteOperations
        >
          <LoadPanel showPane={false} />
          <SearchPanel visible placeholder='검색...' />
          <ColumnChooser enabled />
          <Selection
            selectAllMode='allPages'
            showCheckBoxesMode='always'
            mode='multiple'
          />
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
              <div className='grid-header'>직원 목록</div>
            </Item>
            <Item location='after' locateInMenu='auto'>
              <Button
                icon='plus'
                text='직원 생성'
                type='default'
                stylingMode='contained'
                onClick={onAddContactClick}
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
            <Item location='after' locateInMenu='auto'>
              <div className='separator' />
            </Item>
            <Item name='exportButton' />
            <Item location='after' locateInMenu='auto'>
              <div className='separator' />
            </Item>
            <Item name='columnChooserButton' locateInMenu='auto' />
            <Item name='searchPanel' locateInMenu='auto' />
          </Toolbar>
          <Column dataField='name' caption='이름' minWidth={150} />
        </DataGrid>
        <EmployeeEditPopup
          visible={popupVisible}
          setVisible={changePopupVisibility}
          onSave={onSave}
        />
      </div>
    </div>
  );
};
