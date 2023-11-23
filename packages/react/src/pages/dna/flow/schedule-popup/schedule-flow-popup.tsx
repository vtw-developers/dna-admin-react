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
    setSchedule((prevState) => ({ ...prevState, ...{ [field]: value } }));
  };

  useEffect(() => {
    if (visible) {
      findApps();
      findFlows();
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
          notify(result.data.findAllApps, 'error', 2000);
          return;
        }
        setApps(result.data.findAllApps);
      });
  }, []);

  const findFlows = useCallback(() => {
    apollo
      .query({
        query: gql`
          query showFlows {
            showFlows {
              name
            }
          }
      `,
      })
      .then((result: any) => {
        if (result.errors) {
          console.error(result.errors);
          notify(result.data.showFlows, 'error', 2000);
          return;
        }
        setFlows(result.data.showFlows);
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
            valueExpr='name'
            displayExpr='name'
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
