import React, { PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { FormPopup } from '../../../../components';
import { getSizeQualifier } from '../../../../utils/media-query';
import Form, {
  ColCountByScreen,
  GroupItem,
  Item as FormItem,
  Label,
} from 'devextreme-react/form';
import { apollo } from '../../../../graphql-apollo';
import { gql } from '@apollo/client';
import { TextBox } from 'devextreme-react/text-box';
import SelectBox from 'devextreme-react/select-box';
import { custom } from 'devextreme/ui/dialog';

type Props = {
  visible: boolean;
  width?: number;
  wrapperAttr?: { class: string };
  isSaveDisabled?: boolean;
  setVisible: (visible: boolean) => void;
  onSave?: () => void;
  app: any;
  setApp: any;
  isSelected: boolean;
};

export const ApplicationEditPopup = ({
  visible,
  setVisible,
  onSave,
  app,
  setApp,
  isSelected
}: PropsWithChildren<Props>) => {
  const newApp: any = {
    id: '',
    name: '',
    containerName: '',
    port: ''
  };
  // const [isSearchDirectoryClicked, setSearchDirectoryClicked] = useState<any>(false);
  const [containers, setContainers] = useState<any>();

  const loadContainers = async() => {
    const containerNames = await apollo
      .query({
        query: gql`
          query containers {
            containers {
              id
              name
              type
              hostname
              groupName
            }
          }
        `,
      })
      .then((result: any) => {
        const list = result.data.containers.filter(c => c.groupName === null);
        const containerNameList = list.map(c => c.name);
        return containerNameList;
      });
    setContainers(containerNames);
    return containerNames;
  };

  useEffect(() => {
    loadContainers();
  }, []);

  const updateField = (field: string) => (value) => {
    setApp((prevState) => ({ ...prevState, ...{ [field]: value } }));
  };

  const reset = useCallback(() => {
    setApp({ ...newApp });
  }, []);

  const validation = () => {
    const portNumber = Number(app.port);
    if (app.containerName === '') {
      setVisible(true);
      const alert = custom({
        title: '컨테이너 없음',
        messageHtml: '컨테이너를 지정해주세요.',
        buttons: [{ text: '확인' }]
      });
      alert.show();
      return false;
    } else if (app.name === '') {
      setVisible(true);
      const alert = custom({
        title: '이름 없음',
        messageHtml: '어플리케이션의 이름을 입력해주세요.',
        buttons: [{ text: '확인' }]
      });
      alert.show();
      return false;
    } else if (isNaN(portNumber)) {
      setVisible(true);
      const alert = custom({
        title: '포트번호 지정 오류',
        messageHtml: '숫자로 입력해주세요.',
        buttons: [{ text: '확인' }]
      });
      alert.show();
      return false;
    }
  };

  const save = useCallback(() => {
    if (validation() === false) {
      return;
    }
    if (!isSelected) {
      apollo
        .mutate({
          mutation: gql`
            mutation createApp($app: ApplicationInput) {
              createApp(app: $app) {
                id
                name
                container {
                  id
                  name
                  type
                  hostname
                }
                port
              }
            }
          `,
          variables: {
            app: app
          },
        })
        .then(() => {
          onSave && onSave();
          reset();
        }).catch(error => {
          const cause = error.graphQLErrors[0].message;
          if (cause === 'AlreadyExistName') {
            setVisible(true);
            const alert = custom({
              title: '중복된 이름',
              messageHtml: '이미 존재하는 이름입니다.',
              buttons: [{ text: '확인' }]
            });
            alert.show();
            return;
          }
        });
    } else {
      apollo
        .mutate({
          mutation: gql`
            mutation updateApp($newOne: ApplicationInput) {
              updateApp(newOne: $newOne) {
                id
                name
                container {
                  id
                  name
                  type
                  hostname
                }
                port
              }
            }
          `,
          variables: {
            newOne: app
          },
        })
        .then((result: any) => {
          const updated = result.data.updateApp;
          const updatedApp = {
            id: updated.id,
            name: updated.name,
            containerName: updated.container.name,
            port: updated.port
          };
          onSave && onSave();
          setApp(updatedApp);
        }).catch(error => {
          const cause = error.graphQLErrors[0].message;
          if (cause === 'AlreadyExistName') {
            setVisible(true);
            const alert = custom({
              title: '중복된 이름',
              messageHtml: '이미 존재하는 이름입니다.',
              buttons: [{ text: '확인' }]
            });
            alert.show();
            return;
          }
        });
    }
  }, [app]);

  return (
    <FormPopup
      title={isSelected ? '어플리케이션 수정' : '어플리케이션 생성'}
      visible={visible}
      setVisible={setVisible}
      onSave={save}
    >
      <Form className='plain-styled-form' screenByWidth={getSizeQualifier}>
        <GroupItem>
          <ColCountByScreen xs={1} sm={1} md={1} lg={1} />
          <FormItem>
            <Label text='컨테이너' />
            <SelectBox
              dataSource={containers}
              value={app.containerName}
              onValueChange={updateField('containerName')}
            />
          </FormItem>
          <FormItem>
            <Label text='애플리케이션명' />
            <TextBox
              value={app.name}
              onValueChange={updateField('name')}
            />
          </FormItem>
          <FormItem>
            <Label text='포트번호' />
            <TextBox
              value={app.port}
              onValueChange={updateField('port')}
            />
          </FormItem>
          {/*<FormItem>*/}
          {/*  <Label text='Flow 메타 경로 유형' />*/}
          {/*  <RadioGroup*/}
          {/*    className='radio-btn'*/}
          {/*    items={['File System', 'Git Repository']}*/}
          {/*    layout='horizontal'*/}
          {/*    value={employee.metaPathType}*/}
          {/*    onValueChange={updateField('metaPathType')}*/}
          {/*  />*/}
          {/*</FormItem>*/}
          {/*{employee.metaPathType === 'File System' && (*/}
          {/*  <FormItem>*/}
          {/*    <Label text='디렉터리' />*/}
          {/*    <TextBox*/}
          {/*      value={employee.metaPath}*/}
          {/*      onValueChange={updateField('metaPath')}*/}
          {/*    >*/}
          {/*      <TextBoxButton*/}
          {/*        name='searchDirectory'*/}
          {/*        location='after'*/}
          {/*        options={{*/}
          {/*          text: '검색',*/}
          {/*          onClick: () => setSearchDirectoryClicked(true),*/}
          {/*        }}*/}
          {/*      />*/}
          {/*    </TextBox>*/}
          {/*  </FormItem>*/}
          {/*)}*/}
          {/*{isSearchDirectoryClicked && (*/}
          {/*  <FormItem>*/}
          {/*    <Label text='Flow 목록' />*/}
          {/*    <DataGrid*/}
          {/*      dataSource={[*/}
          {/*        {*/}
          {/*          유형: 'TemplatedFlow',*/}
          {/*          이름: 'Flow-001',*/}
          {/*        },*/}
          {/*        {*/}
          {/*          유형: 'TemplatedFlow',*/}
          {/*          이름: 'Flow-002',*/}
          {/*        },*/}
          {/*        {*/}
          {/*          유형: 'TemplatedFlow',*/}
          {/*          이름: 'Flow-003',*/}
          {/*        },*/}
          {/*        {*/}
          {/*          유형: 'TemplatedFlow',*/}
          {/*          이름: 'Flow-004',*/}
          {/*        },*/}
          {/*        {*/}
          {/*          유형: 'GeneralFlow',*/}
          {/*          이름: 'Flow-005',*/}
          {/*        },*/}
          {/*        {*/}
          {/*          유형: 'GeneralFlow',*/}
          {/*          이름: 'Flow-006',*/}
          {/*        },*/}
          {/*      ]}*/}
          {/*    />*/}
          {/*  </FormItem>*/}
          {/*)}*/}
        </GroupItem>
      </Form>
    </FormPopup>
  );
};
