import React, { useCallback, useEffect, useRef, useState } from 'react';
import DataGrid, {
  HeaderFilter,
  LoadPanel,
  Pager,
  Scrolling,
  Selection,
  Sorting,
} from 'devextreme-react/data-grid';
import Toolbar, { Item } from 'devextreme-react/toolbar';
import './schedule-history.scss';
import { Column } from 'devextreme-react/gantt';
import { PageableService } from '../../util/pageable';
import DataSource from 'devextreme/data/data_source';
import Form, { EmptyItem, GroupItem } from 'devextreme-react/form';
import TextBox from 'devextreme-react/text-box';
import SelectBox from 'devextreme-react/select-box';
import { Button } from 'devextreme-react/button';
import { DateRangeBox } from 'devextreme-react';
import CustomStore from 'devextreme/data/custom_store';
import { apollo } from '../../../../graphql-apollo';
import { gql } from '@apollo/client';

const pageableService = new PageableService();
export const ScheduleHistory = () => {
  const historiesRef = useRef<any>();
  const [historiesDatasource, setHistoriesDatasource] = useState<DataSource>();
  const [filterData, setFilterData] = useState<any>();

  const updateField = (field: string) => (value) => {
    if (field === 'dateRange' && (value.value[0] !== null && value.value[1] !== null)) {
      const startDate = setDateRange(value.value[0]);
      const endDate = setDateRange(value.value[1]);
      setFilterData((prevState) => ({ ...prevState, ...{ [field]: `${startDate},${endDate}` } }));
      return;
    } else if (field === 'dateRange' && !(value.value[0] !== null && value.value[1] !== null)) {
      setFilterData((prevState) => ({ ...prevState, ...{ [field]: '' } }));
      return;
    }
    setFilterData((prevState) => ({ ...prevState, ...{ [field]: value.value } }));
  };

  const setDateRange = useCallback((data) => {
    const year = data.getFullYear();
    let month = data.getMonth() + 1;
    month = month < 10 ? `0${month}` : month;
    let day = data.getDate();
    day = day < 10 ? `0${day}` : day;
    const date = `${year}-${month}-${day}`;
    return date;
  }, []);

  const interval = useRef<any>();
  useEffect(() => {
    reloadScheduleHistories();
    interval.current = setInterval(() => {
      setFilterData((prevState) => ({ ...prevState }));
      reloadScheduleHistories();
    }, 5000);
    return () => {
      clearInterval(interval.current);
    };
  }, [filterData]);

  const reloadScheduleHistories = useCallback(() => {
    setHistoriesDatasource(
      new DataSource({
        store: new CustomStore({
          key: 'id',
          load: (loadOptions) => {
            const pageable = pageableService.getPageable(loadOptions);
            const page$ = apollo
              .query({
                query: gql`
                  query showScheduleHistories(
                    $filter: ScheduleHistoryFilter
                    $pagingInput: PagingInput
                  ) {
                    showScheduleHistories(
                      filter: $filter
                      pagingInput: $pagingInput
                    ) {
                      totalElements
                      content {
                        id
                        appName
                        flowName
                        result
                        errorMessage
                        startTime
                        endTime
                      }
                    }
                  }
                `,
                variables: {
                  filter: filterData,
                  pagingInput: pageable
                },
              })
              .then((page: any) => {
                const historiesResult = page.data.showScheduleHistories;
                return pageableService.transformPage(historiesResult);
              });
            return page$;
          },
        }),
      })
    );
  }, [filterData]);

  const customizeDatetime = useCallback((data) => {
    const year = data.value.getFullYear();
    let month = data.value.getMonth() + 1;
    month = month < 10 ? `0${month}` : month;
    let day = data.value.getDate();
    day = day < 10 ? `0${day}` : day;
    const date = `${year}-${month}-${day}`;

    const hours = data.value.getHours();
    let minutes = data.value.getMinutes();
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    let seconds = data.value.getSeconds();
    seconds = seconds < 10 ? `0${seconds}` : seconds;
    const ampm = hours >= 12 ? '오후' : '오전';

    const time = `${ampm} ${hours}:${minutes}:${seconds}`;
    const datetime = `${date}, ${time}`;
    return datetime;
  }, []);

  return (
    <div className='schedules view-wrapper view-wrapper-menu-manage'>
      <Toolbar>
        <Item location='before'>
          <span className='toolbar-header'>스케줄 이력</span>
        </Item>
      </Toolbar>
      <Form formData={filterData} style={{ paddingBottom: '20px' }}>
        <GroupItem colCount={6}>
          <Item>
            <TextBox
              label='어플리케이션명'
              onValueChanged={updateField('appName')}
            />
          </Item>
          <Item>
            <TextBox
              label='플로우명'
              onValueChanged={updateField('flowName')}
            />
          </Item>
          <Item>
            <SelectBox
              label='실행 결과'
              items={['SUCCESS', 'FAIL']}
              onValueChanged={updateField('result')}
            />
          </Item>
          <Item>
            <DateRangeBox
              displayFormat='yyyy-MM-dd'
              showClearButton
              onValueChanged={updateField('dateRange')}
              width='25vw'
            />
          </Item>
          <EmptyItem colSpan={1} />
          <Item>
            <Button
              text='Search'
              onClick={reloadScheduleHistories}
              width='120px'
            />
          </Item>
        </GroupItem>
      </Form>
      <DataGrid
        dataSource={historiesDatasource}
        allowColumnResizing
        showBorders
        ref={historiesRef}
        style={{ maxHeight: '650px' }}
        remoteOperations
      >
        <LoadPanel showPane={false} showIndicator={false} />
        <HeaderFilter visible />
        <Sorting mode='multiple' />
        <Scrolling rowRenderingMode='virtual' />
        <Selection mode='single' />
        <Pager
          visible
          displayMode='full'
          showPageSizeSelector
          showNavigationButtons
        />
        <Column
          dataField='appName'
          caption='어플리케이션'
          allowHeaderFiltering={false}
        />
        <Column
          dataField='flowName'
          caption='플로우'
          allowHeaderFiltering={false}
        />
        <Column
          dataField='result'
          caption='실행 결과'
          allowHeaderFiltering={false}
          allowSorting={false}
        />
        <Column
          dataField='startTime'
          caption='실행 시작 시간'
          dataType='datetime'
          customizeText={customizeDatetime}
          allowHeaderFiltering={false}
        />
        <Column
          dataField='endTime'
          caption='실행 종료 시간'
          sortOrder='desc'
          dataType='datetime'
          customizeText={customizeDatetime}
          allowHeaderFiltering={false}
        />
        <Column
          dataField='errorMessage'
          caption='에러메시지'
          allowHeaderFiltering={false}
          allowSorting={false}
        />
      </DataGrid>
    </div>
  );
};
