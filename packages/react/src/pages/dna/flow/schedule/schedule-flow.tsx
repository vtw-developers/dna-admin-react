import React, { useCallback, useEffect, useRef, useState } from 'react';
import DataGrid, {
  HeaderFilter,
  LoadPanel, Paging, Scrolling, Selection, Sorting
} from 'devextreme-react/data-grid';
import { Column } from 'devextreme-react/gantt';
import Toolbar, { Item } from 'devextreme-react/toolbar';
import Button from 'devextreme-react/button';
import { apollo } from '../../../../graphql-apollo';
import { gql } from '@apollo/client';
import { confirm } from 'devextreme/ui/dialog';
import notify from 'devextreme/ui/notify';
import { ScheduleFlowPopup } from '../schedule-popup/schedule-flow-popup';
import cronstrue from 'cronstrue';
import './schedule-flow.scss';

export const ScheduleFlow = () => {
  const initSchedule = {
    app: '',
    flow: '',
    cronExpr: '10 * * * * ? *',
  };
  const [popupVisible, setPopupVisible] = useState<any>(false);
  const [schedules, setSchedules] = useState<any>();
  const [schedule, setSchedule] = useState<any>(initSchedule);
  const [isRunFlow, setIsRunFlow] = useState<boolean>(false);
  const [isCreateMode, setIsCreateMode] = useState<boolean>(false);
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const schedulesRef = useRef<any>();

  useEffect(() => {
    reloadschedules();
    setInterval(() => {
      reloadschedules();
    }, 5000);
  }, []);

  function reloadschedules() {
    apollo.query({
      query: gql`
        query showSchedules {
          showSchedules {
            app
            flow
            cronExpr
            status
            nextFireTime
            prevFireTime
          }
        }
      `,
      variables: {}
    }).then((result: any) => {
      if (result.errors) {
        console.error(result.errors);
        return;
      }
      const schedules = result.data.showSchedules;
      setSchedules(schedules);
    });
  }

  const onSaved = () => {
    if(isRunFlow) {
      runFlow();
    } else {
      if (isCreateMode) {
        createSchedule();
      } else {
        updateSchedule();
      }
    }
  };

  const onClickCreate = () => {
    setIsRunFlow(false);
    if (schedule?.flow !== '') {
      setIsCreateMode(false);
      const schedule = schedulesRef.current.instance.getSelectedRowsData()[0];
      setSchedule(schedule);
    } else {
      setIsCreateMode(true);
      reset();
    }
    setPopupVisible(true);
  };

  function createSchedule() {
    apollo.mutate<any>({
      mutation: gql`
        mutation createSchedule($app: String, $flow: String, $cronExpr: String) {
          createSchedule(app: $app, flow: $flow, cronExpr: $cronExpr)
        }
      `,
      variables: {
        app: schedule.app,
        flow: schedule.flow,
        cronExpr: schedule.cronExpr
      }
    }).then(result => {
      const createResult = result.data.createSchedule;
      setIsCreateMode(true);
      reset();
      if (createResult.includes('[Error]')) {
        notify(createResult, 'error', 2000);
        return;
      }
      notify(createResult, 'success', 2000);
      reloadschedules();
    });
  }

  const updateSchedule = () => {
    apollo.query<any>({
      query: gql`
        mutation updateSchedule($app: String, $flow: String, $cronExpr: String) {
            updateSchedule(app: $app, flow: $flow, cronExpr: $cronExpr)
        }
      `,
      variables: {
        app: schedule.app,
        flow: schedule.flow,
        cronExpr: schedule.cronExpr
      }
    }).then(result => {
      const updateResult = result.data.updateSchedule;
      if (updateResult.includes('[Error]')) {
        notify(updateResult, 'error', 2000);
        return;
      }
      notify(updateResult, 'success', 2000);
      reloadschedules();
    });
  };

  const start = () => {
    if (schedulesRef.current.instance.getSelectedRowsData().length > 0) {
      apollo.mutate<any>({
        mutation: gql`
          mutation startSchedule($app: String, $flow: String) {
              startSchedule(app: $app, flow: $flow) 
          }
        `,
        variables: {
          app: schedule.app,
          flow: schedule.flow
        }
      }).then(result => {
        const startResult = result.data.startSchedule;
        if (startResult.includes('[Error]')) {
          notify(startResult, 'error', 2000);
          return;
        }
        notify(startResult, 'success', 2000);
        reloadschedules();
      });
    }
  };

  const stop = () => {
    if (schedulesRef.current.instance.getSelectedRowsData().length > 0) {
      apollo.mutate<any>({
        mutation: gql`
            mutation stopSchedule($app: String, $flow: String) {
                stopSchedule(app: $app, flow: $flow)
            }
        `,
        variables: {
          app: schedule.app,
          flow: schedule.flow
        }
      }).then(result => {
        const stopResult = result.data.stopSchedule;
        if (stopResult.includes('[Error]')) {
          notify(stopResult, 'error', 2000);
          return;
        }
        notify(stopResult, 'success', 2000);
        reloadschedules();
      });
    }
  };

  const deleteSchedule = () => {
    if (schedulesRef.current.instance.getSelectedRowsData().length > 0) {
      const result = confirm('플로우 스케줄을 삭제하시겠습니까?', '스케줄 삭제');
      result.then(dialogResult => {
        if(dialogResult) {
          apollo.mutate<any>({
            mutation: gql`
              mutation deleteSchedule($app: String, $flow: String) {
                  deleteSchedule(app: $app, flow: $flow)
              }
            `,
            variables: {
              app: schedule.app,
              flow: schedule.flow
            }
          }).then(result => {
            const deleteResult = result.data.deleteSchedule;
            if (deleteResult.includes('[Error]')) {
              notify(deleteResult, 'error', 2000);
              return;
            }
            notify(deleteResult, 'success', 2000);
            reset();
            reloadschedules();
          });
        }
      });
    }
  };

  const onClickRunFlow = () => {
    setIsRunFlow(true);
    setSchedule(schedule);
    setPopupVisible(true);
  };

  function runFlow() {
    apollo.mutate<any>({
      mutation: gql`
        mutation runFlow($app: String, $flow: String) {
            runFlow(app: $app, flow: $flow)
        }
      `,
      variables: {
        app: schedule.app,
        flow: schedule.flow
      }
    }).then(result => {
      const runFlowResult = result.data.runFlow;
      if (runFlowResult.includes('[Error]')) {
        notify(runFlowResult, 'error', 2000);
        return;
      }
      notify(runFlowResult, 'success', 2000);
      reloadschedules();
    });
  }

  const statusCell = (data) => {
    const status = data.value;
    let style;
    let state;
    if (status === 'NORMAL' || status === 'BLOCKED') {
      style = 'running';
      state = '실행중';
    } else if (status === 'PAUSED' || status === 'COMPLETE') {
      style = 'stopped';
      state = '정지됨';
    } else if (status === 'ERROR' || status === 'NONE') {
      style = 'error';
      state = '오류';
    }
    return <div className={style}>● {state}</div>;
  };

  const onRowClick = useCallback((event) => {
    if (event.data == undefined) {
      return;
    }
    if (schedule !== undefined && event.data !== undefined) {
      const selectedRowKey = schedulesRef.current.instance.getSelectedRowKeys()[0];
      if (schedule?.flow === selectedRowKey.flow &&
          schedule?.app === selectedRowKey.app) {
        schedulesRef.current.instance.clearSelection();
        reset();
      } else {
        setSchedule(event.data);
        setIsSelected(true);
      }
    } else {
      setSchedule(event.data);
      setIsSelected(true);
    }
  }, [schedule]);

  const reset = () => {
    setSchedule(initSchedule);
    setIsSelected(false);
  };

  const convertCronExpression = (cron) => {
    require('cronstrue/locales/ko');
    const converted = cronstrue.toString(cron.value, { locale: 'ko' });
    return converted;
  };

  return (
    <div className='schedules view-wrapper view-wrapper-menu-manage'>
      <Toolbar>
        <Item location='before'>
          <span className='toolbar-header'>스케줄 관리</span>
        </Item>
        <Item location='after' locateInMenu='auto'>
          <Button
            text='플로우 실행'
            icon='video'
            type='success'
            className='gridButton onetimeStart'
            onClick={onClickRunFlow}
          />
          <Button
            icon='plus'
            text={ !isSelected ? '스케줄 생성' : '스케줄 수정' }
            type='default'
            stylingMode='contained'
            onClick={onClickCreate}
          />
          <Button
            text='실행'
            icon='video'
            type='success'
            className='gridButton start'
            onClick={start}
            visible={isSelected}
          />
          <Button
            text='정지'
            icon='square'
            type='danger'
            className='gridButton stop'
            onClick={stop}
            visible={isSelected}
          />
          <Button
            text='삭제'
            icon='clearsquare'
            type='normal'
            onClick={deleteSchedule}
            visible={isSelected}
          />
        </Item>
      </Toolbar>
      <DataGrid
        dataSource={schedules}
        allowColumnResizing
        showBorders
        keyExpr={['app', 'flow']}
        ref={schedulesRef}
        onRowClick={onRowClick}
        style={{ maxHeight: '700px' }}
      >
        <LoadPanel showPane={false} showIndicator={false} />
        <HeaderFilter visible />
        <Sorting mode='multiple' />
        <Scrolling rowRenderingMode='virtual' />
        <Selection mode='single' />
        <Paging pageSize={15} />

        <Column dataField='app' caption='어플리케이션' />
        <Column dataField='flow' caption='플로우' />
        <Column
          dataField='cronExpr'
          caption='크론 표현식'
          customizeText={convertCronExpression}
        />
        <Column
          dataField='status'
          cellRender={statusCell}
          caption='상태'
        />
        <Column
          dataField='nextFireTime'
          caption='다음 실행 일시'
        />
        <Column
          dataField='prevFireTime'
          caption='최근 실행 일시'
          sortOrder='desc'
        />
      </DataGrid>
      <ScheduleFlowPopup
        visible={popupVisible}
        setVisible={setPopupVisible}
        schedule={schedule}
        setSchedule={setSchedule}
        isRunFlow={isRunFlow}
        isCreateMode={isCreateMode}
        onSaved={onSaved}
      />
    </div>
  );
};
