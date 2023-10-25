import React, { useCallback, useEffect, useRef, useState } from 'react';
import './reservation-list.scss';
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
import { ReservationPopup } from './edit-popup/reservation-popup';

const pageableService = new PageableService();

export const ReservationList = () => {
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
                  query reservations(
                    $page: Int = 0
                    $size: Int = 10
                    $sortBy: String = "id"
                    $sortDir: String = "asc"
                    $filter: String = ""
                  ) {
                    reservations(
                      page: $page
                      size: $size
                      sortBy: $sortBy
                      sortDir: $sortDir
                      filter: $filter
                    ) {
                      totalElements
                      content {
                        id
                        movieName
                        audienceCount
                        fee
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
                return pageableService.transformPage(page.data.reservations);
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

  const onAddClick = useCallback(() => {
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
              <div className='grid-header'>예매 목록</div>
            </Item>
            <Item location='after' locateInMenu='auto'>
              <Button
                icon='plus'
                text='예매하기'
                type='default'
                stylingMode='contained'
                onClick={onAddClick}
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
          <Column dataField='movieName' caption='영화' minWidth={200} />
          <Column dataField='audienceCount' caption='인원' minWidth={100} />
          <Column dataField='fee' caption='금액' minWidth={150} />
        </DataGrid>
        <ReservationPopup
          visible={popupVisible}
          setVisible={changePopupVisibility}
          onSave={onSave}
        />
      </div>
    </div>
  );
};
