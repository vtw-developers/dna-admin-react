import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Column } from 'devextreme-react/tree-list';
import './program-manage.scss';
import DataGrid, {
  ColumnChooser,
  Editing,
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
import DataSource from 'devextreme/data/data_source';
import CustomStore from 'devextreme/data/custom_store';
import { apollo } from '../../../../graphql-apollo';
import { gql } from '@apollo/client';
import { PageableService } from '../../util/pageable';
import { Contact } from '../../../../types/crm-contact';
import { ProgramEditPopup } from './edit-popup/program-edit-popup';
import { Button } from 'devextreme-react/button';

const pageableService = new PageableService();

export const ProgramManage = () => {
  const [gridDataSource, setGridDataSource] =
    useState<DataSource<Contact[], string>>();
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupType, setPopupType] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const gridRef = useRef<DataGrid>(null);

  useEffect(() => {
    setGridDataSource(
      new DataSource({
        store: new CustomStore({
          key: 'id',
          load: (loadOptions) => {
            const pageable = pageableService.getPageable(loadOptions);

            const pagingProgram = apollo
              .query({
                query: gql`
                  query programs(
                    $page: Int = 0
                    $size: Int = 10
                    $sortBy: String = "id"
                    $sortDir: String = "asc"
                    $filter: String = ""
                  ) {
                    programs(
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
                        url
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
                return pageableService.transformPage(page.data.programs);
              });
            return pagingProgram;
          },
        }),
      })
    );
  }, []);

  const changePopupVisibility = useCallback(() => {
    setPopupVisible(!popupVisible);
  }, [popupVisible]);

  const onAddProgramClick = useCallback(() => {
    setPopupVisible(true);
    setPopupType('Add');
  }, []);

  const onUpdatePopupClick = useCallback(() => {
    setPopupVisible(true);
    setPopupType('Update');
  }, []);

  const onDeletePopupClick = useCallback(() => {
    apollo
      .mutate({
        mutation: gql`
          mutation deleteProgram($id: ID) {
            deleteProgram(id: $id)
          }
        `,
        variables: {
          id: selectedItem.id,
        },
      })
      .then((result: any) => {
        console.log(result);
        onSave && onSave();
        refresh();
      });
  }, [selectedItem]);

  const refresh = useCallback(() => {
    gridRef.current?.instance.refresh();
  }, []);

  const onSave = useCallback(() => {
    refresh();
  }, []);

  const onSelectionChanged = useCallback((e) => {
    const selectedRowsData = e.selectedRowsData[0];
    setSelectedItem(selectedRowsData);
  }, []);

  return (
    <div className='view-wrapper view-wrapper-program-manage'>
      <div id='program-manage-grid'>
        <DataGrid
          dataSource={gridDataSource}
          keyExpr='id'
          showBorders
          ref={gridRef}
          onSelectionChanged={onSelectionChanged}
        >
          <LoadPanel showPane={false} />
          <SearchPanel visible placeholder='검색...' />
          <ColumnChooser enabled />
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
          <HeaderFilter visible />
          <Sorting mode='multiple' />
          <Selection mode='single' />
          <Editing mode='popup' />
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
              <span className='toolbar-header'>Program Manage</span>
            </Item>
            <Item location='after' locateInMenu='auto'>
              <Button
                icon='plus'
                text='add'
                type='default'
                stylingMode='contained'
                onClick={onAddProgramClick}
              />
              <Button
                icon='edit'
                text='edit'
                type='default'
                stylingMode='outlined'
                disabled={!selectedItem}
                onClick={onUpdatePopupClick}
              />
              <Button
                icon='minus'
                text='delete'
                type='danger'
                stylingMode='contained'
                disabled={!selectedItem}
                onClick={onDeletePopupClick}
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
          <Column
            dataField='id'
            caption='ID'
            width={100}
            allowEditing={false}
          />
          <Column dataField='name' />
          <Column dataField='url' />
        </DataGrid>
        <ProgramEditPopup
          visible={popupVisible}
          setVisible={changePopupVisibility}
          type={popupType}
          selectedItem={selectedItem}
          onSave={onSave}
        />
      </div>
    </div>
  );
};
