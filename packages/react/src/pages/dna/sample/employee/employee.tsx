import React, { useState, useEffect, useCallback, useRef } from 'react';
import { jsPDF as JsPdf } from 'jspdf';
import { saveAs } from 'file-saver-es';
import { Workbook } from 'exceljs';

import './employee.scss';

// import { getContacts } from 'dx-template-gallery-data';
import DataGrid, {
  Sorting, Selection, HeaderFilter, Scrolling, SearchPanel,
  ColumnChooser, Export, Column, Toolbar, Item, LoadPanel,
  DataGridTypes
} from 'devextreme-react/data-grid';

import SelectBox from 'devextreme-react/select-box';
import TextBox from 'devextreme-react/text-box';
import Button from 'devextreme-react/button';
import DropDownButton, { DropDownButtonTypes } from 'devextreme-react/drop-down-button';

import { exportDataGrid as exportDataGridToPdf } from 'devextreme/pdf_exporter';
import { exportDataGrid as exportDataGridToXLSX } from 'devextreme/excel_exporter';

import { ContactStatus as ContactStatusType, Contact } from '../../../../types/crm-contact';

import { FormPopup, ContactNewForm, ContactPanel } from '../../../../components';
import { ContactStatus } from '../../../../components';

import { CONTACT_STATUS_LIST } from '../../../../shared/constants';
import DataSource from 'devextreme/data/data_source';
import CustomStore from 'devextreme/data/custom_store';
import { PageableService } from '../../util/pageable';
import { apollo } from '../../../../graphql-apollo';
import { gql } from '@apollo/client';

const pageableService = new PageableService();

type FilterContactStatus = ContactStatusType | 'All';

const filterStatusList = ['All', ...CONTACT_STATUS_LIST];

const cellNameRender = (cell: DataGridTypes.ColumnCellTemplateData) => (
  <div className='name-template'>
    <div>{cell.data.name}</div>
    <div className='position'>{cell.data.position}</div>
  </div>
);

const editCellStatusRender = () => (
  <SelectBox className='cell-info' dataSource={CONTACT_STATUS_LIST} itemRender={ContactStatus} fieldRender={fieldRender} />
);

const cellPhoneRender = (cell: DataGridTypes.ColumnCellTemplateData) => (
  String(cell.data.phone).replace(/(\d{3})(\d{3})(\d{4})/, '+1($1)$2-$3')
);

const fieldRender = (text: string) => (
  <>
    <ContactStatus text={text} />
    <TextBox readOnly />
  </>
);

const onExporting = (e: DataGridTypes.ExportingEvent) => {
  if (e.format === 'pdf') {
    const doc = new JsPdf();
    exportDataGridToPdf({
      jsPDFDocument: doc,
      component: e.component,
    }).then(() => {
      doc.save('Contacts.pdf');
    });
  } else {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Contacts');

    exportDataGridToXLSX({
      component: e.component,
      worksheet,
      autoFilterEnabled: true,
    }).then(() => {
      workbook.xlsx.writeBuffer().then((buffer) => {
        saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Contacts.xlsx');
      });
    });
    e.cancel = true;
  }
};

const dropDownOptions = { width: 'auto' };
const exportFormats = ['xlsx', 'pdf'];

export const Employee = () => {
  const [gridDataSource, setGridDataSource] = useState<DataSource<Contact[], string>>();
  const [isPanelOpened, setPanelOpened] = useState(false);
  const [contactId, setContactId] = useState<number>(0);
  const [popupVisible, setPopupVisible] = useState(false);
  const gridRef = useRef<DataGrid>(null);

  useEffect(() => {
    setGridDataSource(new DataSource({
      store: new CustomStore({
        key: 'id',
        load: (loadOptions) => {
          const pageable = pageableService.getPageable(loadOptions);
          // pageable.filter = this.filter;

          const page$ = apollo.query({
            query: gql`
              query employees(
                $page: Int = 0,
                $size: Int = 10,
                $sortBy: String = "id",
                $sortDir: String = "asc",
                $filter: String = "") {
                employees(page: $page, size: $size, sortBy: $sortBy, sortDir: $sortDir, filter: $filter) {
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
              filter: pageable.filter
            }
          }).then((page: any) => {
            console.log(page);
            return pageableService.transformPage(page.data.employees);
          });
          return page$;
          // return firstValueFrom(page$)
          //     .then((page: any) => {
          //       return pageableService.transformPage(page.data.employees);
          //     });
        },
      })
    }));
  }, []);

  const changePopupVisibility = useCallback(() => {
    setPopupVisible(!popupVisible);
  }, [popupVisible]);

  const changePanelOpened = useCallback(() => {
    setPanelOpened(!isPanelOpened);
    gridRef.current?.instance.option('focusedRowIndex', -1);
  }, [isPanelOpened]);

  const changePanelPinned = useCallback(() => {
    gridRef.current?.instance.updateDimensions();
  }, []);

  const onAddContactClick = useCallback(() => {
    setPopupVisible(true);
  }, []);

  const onRowClick = useCallback(({ data }: DataGridTypes.RowClickEvent) => {
    setContactId(data.id);
    setPanelOpened(true);
  }, []);

  const [status, setStatus] = useState(filterStatusList[0]);

  const filterByStatus = useCallback((e: DropDownButtonTypes.SelectionChangedEvent) => {
    const { item: status }: { item: FilterContactStatus } = e;
    if (status === 'All') {
      gridRef.current?.instance.clearFilter();
    } else {
      gridRef.current?.instance.filter(['status', '=', status]);
    }

    setStatus(status);
  }, []);

  const refresh = useCallback(() => {
    gridRef.current?.instance.refresh();
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
          onRowClick={onRowClick}
          onExporting={onExporting}
          allowColumnReordering
          ref={gridRef}
        >
          <LoadPanel showPane={false} />
          <SearchPanel visible placeholder='Contact Search' />
          <ColumnChooser enabled />
          <Export enabled allowExportSelectedData formats={exportFormats} />
          <Selection
            selectAllMode='allPages'
            showCheckBoxesMode='always'
            mode='multiple'
          />
          <HeaderFilter visible />
          <Sorting mode='multiple' />
          <Scrolling mode='virtual' />
          <Toolbar>
            <Item location='before'>
              <div className='grid-header'>Contacts</div>
            </Item>
            <Item location='before' locateInMenu='auto'>
              <DropDownButton
                items={filterStatusList}
                stylingMode='text'
                text={status}
                dropDownOptions={dropDownOptions}
                useSelectMode
                onSelectionChanged={filterByStatus}
              />
            </Item>
            <Item location='after' locateInMenu='auto'>
              <Button
                icon='plus'
                text='Add Contact'
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
          <Column
            dataField='name'
            caption='Name'
            sortOrder='asc'
            hidingPriority={5}
            minWidth={150}
            cellRender={cellNameRender}
          />
          <Column
            dataField='company'
            caption='Company'
            hidingPriority={5}
            minWidth={150}
          />
          <Column
            dataField='status'
            caption='Status'
            dataType='string'
            hidingPriority={3}
            minWidth={100}
            cellRender={ContactStatus}
            editCellRender={editCellStatusRender}
          />
          <Column dataField='assignedTo' caption='Assigned to' hidingPriority={4} />
          <Column
            dataField='phone'
            caption='Phone'
            hidingPriority={2}
            cellRender={cellPhoneRender}
          />
          <Column dataField='email' caption='Email' hidingPriority={1} />
        </DataGrid>
        <ContactPanel contactId={contactId} isOpened={isPanelOpened} changePanelOpened={changePanelOpened} changePanelPinned={changePanelPinned} />
        <FormPopup title='New Contact' visible={popupVisible} setVisible={changePopupVisibility}>
          <ContactNewForm />
        </FormPopup>
      </div>
    </div>
  );
};
