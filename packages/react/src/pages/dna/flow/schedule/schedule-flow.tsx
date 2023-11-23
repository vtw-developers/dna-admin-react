import React, { useEffect, useRef, useState } from 'react';
import DataGrid, {
  HeaderFilter,
  LoadPanel, Scrolling, Selection, Sorting
} from 'devextreme-react/data-grid';
import { Column } from 'devextreme-react/gantt';
import Toolbar, { Item } from 'devextreme-react/toolbar';
import Button from 'devextreme-react/button';
import { apollo } from '../../../../graphql-apollo';
import { gql } from '@apollo/client';
import { confirm } from 'devextreme/ui/dialog';
import notify from 'devextreme/ui/notify';
import { ScheduleFlowPopup } from '../schedule-popup/schedule-flow-popup';
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
    if (schedule.flow !== '') {
      setIsCreateMode(false);
      const schedule = schedulesRef.current.instance.getSelectedRowsData()[0];
      setSchedule(schedule);
    } else {
      setIsCreateMode(true);
      setSchedule(initSchedule);
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
      reloadschedules();
      notify(result.data.createSchedule, 'success', 2000);
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
      reloadschedules();
      notify(result.data.updateSchedule, 'success', 2000);
    });
  };

  const start = () => {
    if (schedulesRef.current.instance.getSelectedRowsData().length > 0) {
      const selectedFlowId = schedulesRef.current.instance.getSelectedRowKeys()[0];
      console.log(selectedFlowId);
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
        reloadschedules();
        notify(result.data.startSchedule, 'success', 2000);
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
        reloadschedules();
        notify(result.data.stopSchedule, 'success', 2000);
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
            reloadschedules();
            setSchedule(initSchedule);
            setIsSelected(false);
            notify(result.data.deleteSchedule, 'success', 2000);
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
      reloadschedules();
      notify(result.data.runFlow, 'success', 2000);
    });
  }

  const statusCell = (data) => {
    const status = data.value;
    let style;
    let state;
    if (status === 'NORMAL' || status === 'BLOCKED') {
      style = 'running';
      state = 'Running';
    } else if (status === 'PAUSED' || status === 'COMPLETE') {
      style = 'stopped';
      state = 'Stopped';
    } else if (status === 'ERROR' || status === 'NONE') {
      style = 'error';
      state = 'Error';
    }
    return <div className={style}>● {state}</div>;
  };

  const onRowClick = (event) => {
    if (event.data == undefined) {
      return;
    }
    if (schedule !== undefined && event.data !== undefined) {
      const selectedRowKey = schedulesRef.current.instance.getSelectedRowKeys()[0];
      if (schedule?.flow === selectedRowKey.flow &&
          schedule?.app === selectedRowKey.app) {
        schedulesRef.current.instance.clearSelection();
        setIsSelected(false);
        setSchedule(initSchedule);
      } else {
        setSchedule(event.data);
        setIsSelected(true);
      }
    } else {
      setSchedule(event.data);
      setIsSelected(true);
    }
  };

  // function convertCronExpression(cron) {
  //   const cronstrue = require('cronstrue');
  //   require('cronstrue/locales/ko');
  //   const locale = sessionStorage.getItem('locale');
  //
  //   let converted = cronstrue.toString(cron.value, { locale: 'en' });
  //   if (locale != 'en') {
  //     converted = cronstrue.toString(cron.value,{ locale: 'ko' });
  //   }
  //   return converted;
  // }

  return (
    <div className='schedules view-wrapper view-wrapper-menu-manage'>
      <Toolbar>
        <Item location='before'>
          <span className='toolbar-header'>스케줄 관리</span>
        </Item>
        <Item location='after' locateInMenu='auto'>
          <Button
            icon='plus'
            text={ !isSelected ? 'Create' : 'Update' }
            type='default'
            stylingMode='contained'
            onClick={onClickCreate}
          />
          <Button
            text='Run Flow'
            icon='video'
            type='success'
            className='gridButton onetimeStart'
            onClick={onClickRunFlow}
            visible={isSelected}
          />
          <Button
            text='Start'
            icon='video'
            type='success'
            className='gridButton start'
            onClick={start}
            visible={isSelected}
          />
          <Button
            text='Stop'
            icon='square'
            type='danger'
            className='gridButton stop'
            onClick={stop}
            visible={isSelected}
          />
          <Button
            text='Delete'
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
      >
        <LoadPanel showPane={false} showIndicator={false} />
        <HeaderFilter visible />
        <Sorting mode='multiple' />
        <Scrolling rowRenderingMode='virtual' />
        <Selection mode='single' />

        <Column dataField='app' />
        <Column dataField='flow' />
        <Column dataField='cronExpr' caption='Cron Expression' />
        <Column
          dataField='status'
          cellRender={statusCell}
        />
        <Column
          dataField='nextFireTime'
          caption='Next FireTime'
        />
        <Column
          dataField='prevFireTime'
          caption='Prev FireTime'
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
