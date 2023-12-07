import React, { useCallback, useEffect, useRef, useState } from 'react';
import DataGrid, {
  HeaderFilter,
  LoadPanel, Pager, Scrolling, Selection, Sorting
} from 'devextreme-react/data-grid';
import Toolbar, { Item } from 'devextreme-react/toolbar';
import { apollo } from '../../../../graphql-apollo';
import { gql } from '@apollo/client';
import './schedule-history.scss';
import { Column } from 'devextreme-react/gantt';
import { PageableService } from '../../util/pageable';
import DataSource from 'devextreme/data/data_source';
import CustomStore from 'devextreme/data/custom_store';
import ArrayStore from 'devextreme/data/array_store';

const pageableService = new PageableService();
export const ScheduleHistory = () => {
  const historiesRef = useRef<any>();
  const [historiesDatasource, setHistoriesDatasource] = useState<DataSource>();
  const [appFilterData, setAppFilterData] = useState<any>();
  const [flowFilterData, setFlowFilterData] = useState<any>();
  const [resultFilterData, setResultFilterData] = useState<any>();

  useEffect(() => {
    reloadScheduleHistories();
    setInterval(() => {
      reloadScheduleHistories();
    }, 5000);
  }, []);

  const reloadScheduleHistories = useCallback(() => {
    setHistoriesDatasource(
      new DataSource({
        store: new CustomStore({
          key: 'id',
          load: (loadOptions) => {
            const pageable = pageableService.getPageable(loadOptions);
            const page$ = apollo.query({
              query: gql`
                query showScheduleHistories($pagingInput: PagingInput) {
                showScheduleHistories(pagingInput: $pagingInput) {
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
                pagingInput: pageable
              }
            }).then((page: any) => {
              const historiesResult = page.data.showScheduleHistories;

              const appFilterItems = historiesResult.content?.map(item => item.appName);
              const flowFilterItems = historiesResult.content?.map(item => item.flowName);
              const resultFilterItems = historiesResult.content?.map(item => item.result);
              setAppFilterData(loadFilter(appFilterItems));
              setFlowFilterData(loadFilter(flowFilterItems));
              setResultFilterData(loadFilter(resultFilterItems));

              return pageableService.transformPage(historiesResult);
            });
            return page$;
          },
        }),
      })
    );
  }, []);

  const loadFilter = useCallback((items) => {
    items = items?.filter((value, index, self) => self.indexOf(value) === index);
    const filterData = {
      store: new ArrayStore({ data: items }),
      map: (item) => {
        return {
          text: item,
          value: item
        };
      },
    };
    return filterData;
  }, []);

  const customizeDatetime = useCallback((data) => {
    const year = data.value.getFullYear();
    const month = data.value.getMonth() + 1;
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
      <DataGrid
        dataSource={historiesDatasource}
        allowColumnResizing
        showBorders
        ref={historiesRef}
        style={{ maxHeight: '700px' }}
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
        <Column dataField='appName' caption='어플리케이션'>
          <HeaderFilter dataSource={appFilterData} allowSelectAll={false} />
        </Column>
        <Column dataField='flowName' caption='플로우'>
          <HeaderFilter dataSource={flowFilterData} allowSelectAll={false} />
        </Column>
        <Column dataField='result' caption='실행 결과'>
          <HeaderFilter dataSource={resultFilterData} allowSelectAll={false} />
        </Column>
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
        />
      </DataGrid>
    </div>
  );
};
