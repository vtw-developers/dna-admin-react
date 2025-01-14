import React, { PropsWithChildren, useCallback, useState } from 'react';
import { FormPopup } from '../../../../../components';
import { getSizeQualifier } from '../../../../../utils/media-query';
import Form, {
  ColCountByScreen,
  GroupItem,
  Item as FormItem,
  Label,
} from 'devextreme-react/form';
import { apollo } from '../../../../../graphql-apollo';
import { gql } from '@apollo/client';
import TextBox from 'devextreme-react/text-box';

type Props = {
  visible: boolean;
  width?: number;
  wrapperAttr?: { class: string };
  isSaveDisabled?: boolean;
  setVisible: (visible: boolean) => void;
  onSave?: () => void;
};

export const EmployeeEditPopup = ({
  visible,
  setVisible,
  onSave,
}: PropsWithChildren<Props>) => {
  const newEmployee: any = {
    id: undefined,
    name: '',
  };

  const [employee, setEmployee] = useState<any>(newEmployee);

  const updateField = (field: string) => (value) => {
    setEmployee((prevState) => ({ ...prevState, ...{ [field]: value } }));
  };

  const reset = useCallback(() => {
    setEmployee({ ...newEmployee });
  }, []);

  const close = useCallback(() => {
    reset();
  }, [employee]);

  const save = useCallback(() => {
    apollo
      .mutate({
        mutation: gql`
          mutation createEmployee($employee: EmployeeInput) {
            createEmployee(employee: $employee) {
              id
            }
          }
        `,
        variables: {
          employee: employee,
        },
      })
      .then((result: any) => {
        console.log(result);
        onSave && onSave();
        reset();
      });
  }, [employee]);

  return (
    <FormPopup
      title='직원 생성'
      visible={visible}
      setVisible={setVisible}
      onSave={save}
      onClose={close}
    >
      <Form className='plain-styled-form' screenByWidth={getSizeQualifier}>
        <GroupItem>
          <ColCountByScreen xs={1} sm={2} md={2} lg={2} />
          <FormItem>
            <Label text='이름' />
            <TextBox
              value={employee.name}
              onValueChange={updateField('name')}
            />
          </FormItem>
        </GroupItem>
      </Form>
    </FormPopup>
  );
};
