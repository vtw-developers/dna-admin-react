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
import { Button as TextBoxButton, TextBox } from 'devextreme-react/text-box';
import SelectBox from 'devextreme-react/select-box';
import { RadioGroup } from 'devextreme-react';
import DataGrid from 'devextreme-react/data-grid';

type Props = {
  visible: boolean;
  width?: number;
  wrapperAttr?: { class: string };
  isSaveDisabled?: boolean;
  setVisible: (visible: boolean) => void;
  onSave?: () => void;
};

export const ApplicationEditPopup = ({
  visible,
  setVisible,
  onSave,
}: PropsWithChildren<Props>) => {
  const newEmployee: any = {
    id: undefined,
    name: '',
  };

  const [employee, setEmployee] = useState<any>(newEmployee);
  const [isSearchDirectoryClicked, setSearchDirectoryClicked] =
    useState<any>(false);

  const updateField = (field: string) => (value) => {
    setEmployee((prevState) => ({ ...prevState, ...{ [field]: value } }));
  };

  const reset = useCallback(() => {
    setEmployee({ ...newEmployee });
  }, []);

  const save = useCallback(() => {
    console.log(employee);
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

  const close = useCallback(() => {
    reset();
  }, [employee]);

  return (
    <FormPopup
      title='애플리케이션 생성'
      visible={visible}
      setVisible={setVisible}
      onSave={save}
      onClose={close}
    >
      <Form className='plain-styled-form' screenByWidth={getSizeQualifier}>
        <GroupItem>
          <ColCountByScreen xs={1} sm={1} md={1} lg={1} />
          <FormItem>
            <Label text='컨테이너' />
            <SelectBox
              value={employee.container}
              onValueChange={updateField('container')}
              items={[
                'Container-001',
                'Container-002',
                'Container-003',
                'Container-004',
                'Container-005',
              ]}
            />
          </FormItem>
          <FormItem>
            <Label text='애플리케이션명' />
            <TextBox
              value={employee.name}
              onValueChange={updateField('name')}
            />
          </FormItem>
          <FormItem>
            <Label text='Flow 메타 경로 유형' />
            <RadioGroup
              className='radio-btn'
              items={['File System', 'Git Repository']}
              layout='horizontal'
              value={employee.metaPathType}
              onValueChange={updateField('metaPathType')}
            />
          </FormItem>
          {employee.metaPathType === 'File System' && (
            <FormItem>
              <Label text='디렉터리' />
              <TextBox
                value={employee.metaPath}
                onValueChange={updateField('metaPath')}
              >
                <TextBoxButton
                  name='searchDirectory'
                  location='after'
                  options={{
                    text: '검색',
                    onClick: () => setSearchDirectoryClicked(true),
                  }}
                />
              </TextBox>
            </FormItem>
          )}
          {isSearchDirectoryClicked && (
            <FormItem>
              <Label text='Flow 목록' />
              <DataGrid
                dataSource={[
                  {
                    유형: 'TemplatedFlow',
                    이름: 'Flow-001',
                  },
                  {
                    유형: 'TemplatedFlow',
                    이름: 'Flow-002',
                  },
                  {
                    유형: 'TemplatedFlow',
                    이름: 'Flow-003',
                  },
                  {
                    유형: 'TemplatedFlow',
                    이름: 'Flow-004',
                  },
                  {
                    유형: 'GeneralFlow',
                    이름: 'Flow-005',
                  },
                  {
                    유형: 'GeneralFlow',
                    이름: 'Flow-006',
                  },
                ]}
              />
            </FormItem>
          )}
        </GroupItem>
      </Form>
    </FormPopup>
  );
};
