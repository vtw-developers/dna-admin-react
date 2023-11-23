import React, { PropsWithChildren, useCallback, useEffect, useState } from 'react';
import Form, { Item as FormItem, Label } from 'devextreme-react/form';
import { getSizeQualifier } from '../../../../utils/media-query';
import TextBox from 'devextreme-react/text-box';
import SelectBox from 'devextreme-react/select-box';
import { apollo } from '../../../../graphql-apollo';
import { gql } from '@apollo/client';
import notify from 'devextreme/ui/notify';
import { FormPopup } from '../../../../components';

type PopupProps = {
  visible,
  setVisible,
  schedule,
  setSchedule,
  isRunFlow,
  isCreateMode,
  onSaved
}

export const ScheduleFlowPopup = ({
  visible,
  setVisible,
  schedule,
  setSchedule,
  isRunFlow,
  isCreateMode,
  onSaved
}: PropsWithChildren<PopupProps>) => {

  const [apps, setApps] = useState<any>();
  const [flows, setFlows] = useState<any>();

  const updateField = (field: string) => (value) => {
    if (field === 'app') {
      findFlows(value);
    }
    setSchedule((prevState) => ({ ...prevState, ...{ [field]: value } }));
  };

  useEffect(() => {
    if (visible) {
      findApps();
      findFlows(schedule?.app);
    }
  }, [visible]);

  const findApps = useCallback(() => {
    apollo
      .query({
        query: gql`
          query findAllApps {
            findAllApps {
              name
            }
          }
        `,
      })
      .then((result: any) => {
        if (result.errors) {
          console.error(result.errors);
          notify('Find Apps Error', 'error', 2000);
          return;
        }
        setApps(result.data.findAllApps);
      });
  }, []);

  const findFlows = useCallback((appName) => {
    apollo
      .query({
        query: gql`
          query showDeployedFlowsByAppName($appName: String) {
            showDeployedFlowsByAppName(appName: $appName) {
              flowName
            }
          }
          `,
        variables: {
          appName: appName,
        }
      })
      .then((result: any) => {
        const deployedFlows = result.data.showDeployedFlowsByAppName;
        if (result.errors) {
          console.error(result.errors);
          notify('Find DeployedFlows Error', 'error', 2000);
          return;
        }
        setFlows(deployedFlows);
      });
  }, []);

  return (
    <FormPopup
      visible={visible}
      setVisible={setVisible}
      title={ isRunFlow ? 'Run Flow' : isCreateMode ? 'FlowSchedule Create' : 'FlowSchedule Update' }
      onSave={onSaved}
    >
      <Form className='plain-styled-form' screenByWidth={getSizeQualifier}>
        <FormItem>
          <Label text='app name' />
          <SelectBox
            items={apps}
            value={schedule?.app}
            onValueChange={updateField('app')}
            valueExpr='name'
            displayExpr='name'
            disabled={!isCreateMode && !isRunFlow}
          />
        </FormItem>
        <FormItem>
          <Label text='flow name' />
          <SelectBox
            items={flows}
            value={schedule?.flow}
            onValueChange={updateField('flow')}
            valueExpr='flowName'
            displayExpr='flowName'
            disabled={!isCreateMode && !isRunFlow}
          />
        </FormItem>
        <FormItem visible={!isRunFlow}>
          <Label text='Cron Expression' />
          <TextBox
            value={schedule?.cronExpr}
            onValueChange={updateField('cronExpr')}
          />
        </FormItem>
      </Form>
    </FormPopup>
  );
};
