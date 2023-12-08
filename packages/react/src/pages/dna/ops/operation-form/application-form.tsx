import React, { useCallback, useEffect, useState } from 'react';
import ValidationGroup from 'devextreme-react/validation-group';
import Form, {
  ColCountByScreen,
  GroupItem,
  Item as ItemForm,
} from 'devextreme-react/form';
import classNames from 'classnames';
import { FormTextbox } from '../../../../components';

import './application-form.scss';
import { apollo } from '../../../../graphql-apollo';
import { gql } from '@apollo/client';
import { confirm, custom } from 'devextreme/ui/dialog';
import { OperationToolbarForm } from '../toolbar-form/operation-toolbar-form';
import DataGrid, {
  Column,
  LoadPanel,
  Scrolling,
  Sorting,
} from 'devextreme-react/data-grid';
import Button from 'devextreme-react/button';
import notify from 'devextreme/ui/notify';

export const ApplicationForm = ({ selectedItem, setSelectedItem, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [appStatus, setAppStatus] = useState<any>();

  useEffect(() => {
    checkStatus(selectedItem);
    const timer = setInterval(() => {
      checkStatus(selectedItem);
    }, 5000);
    return () => clearInterval(timer);
  }, [selectedItem]);

  const handleEditClick = () => {
    setEditing(!editing);
  };

  const checkStatus = (item) => {
    apollo
      .query({
        query: gql`
          query appStatus($name: String) {
            appStatus(name: $name) {
              name
              status
            }
          }
        `,
        variables: {
          name: item.name,
        },
      })
      .then((result: any) => {
        setAppStatus(result.data.appStatus);
      });
  };

  const onSaveClick = ({ validationGroup }) => {
    if (!validationGroup.validate().isValid) return;
    const app = {
      id: selectedItem.id,
      name: selectedItem.name,
      containerName: selectedItem.containerName,
      port: selectedItem.port,
    };
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
          newOne: app,
        },
      })
      .then(() => {
        onSave && onSave();
        handleEditClick();
      })
      .catch((error) => {
        const cause = error.graphQLErrors[0].message;
        if (cause === 'AlreadyExistName') {
          const alert = custom({
            title: '중복된 이름',
            messageHtml: '이미 존재하는 이름입니다.',
            buttons: [{ text: '확인' }],
          });
          alert.show();
          return;
        }
      });
  };

  const onCancelClick = () => {
    handleEditClick();
  };

  const onDeleteClick = () => {
    const result = confirm('해당 애플리케이션을 삭제하시겠습니까?', '애플리케이션 삭제');
    result.then(dialogResult => {
      if (dialogResult) {
        apollo
          .mutate({
            mutation: gql`
              mutation deleteApp($name: String) {
                deleteApp(name: $name) {
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
              name: selectedItem.name,
            },
          })
          .then(() => {
            onSave && onSave();
            setSelectedItem(null);
          });
      }
    });
  };

  const updateField = (field: string | number) => (value: string | number) => {
    setSelectedItem((prevState) => ({ ...prevState, ...{ [field]: value } }));
  };

  const cellRender = useCallback((item) => {
    return (
      <>
        {item.data.status === 'UP' ?
          <i className='dx-icon-isnotblank' style={{ color: '#41b400' }}>운영중</i>
          : <i className='dx-icon-isnotblank' style={{ color: '#cbc7b9' }}>정지됨</i>
        }
      </>
    );
  }, []);

  const redeployFlows = () => {
    apollo
      .mutate({
        mutation: gql`
          mutation redeployFlows($app: String) {
            redeployFlows(app: $app) {
              name
              status
            }
          }
        `,
        variables: {
          app: selectedItem.name,
        },
      })
      .then((result: any) => {
        const succeeded = result.data.redeployFlows.filter(e => e.status === 'Succeeded').map(item => item.name);
        const failed = result.data.redeployFlows.filter(e => e.status === 'Failed').map(item => item.name);
        notify(`배포 성공: ${succeeded} / 배포 실패: ${failed}`, 'success', 5000);
      });
  };

  return (
    <div className='application-form'>
      <ValidationGroup>
        <OperationToolbarForm
          toggleEditing={handleEditClick}
          onSaveClick={onSaveClick}
          editing={editing}
          onCancelClick={onCancelClick}
          onDeleteClick={onDeleteClick}
        />
        <Form
          className={classNames({
            'plain-styled-form': true,
            'view-mode': !editing,
          })}
          labelMode='floating'
        >
          <GroupItem colCount={1}>
            <ColCountByScreen xs={2} />
            <GroupItem>
              <ItemForm>
                <Button
                  text='재배포'
                  icon='refresh'
                  stylingMode='outlined'
                  type='normal'
                  style={{ float: 'right' }}
                  onClick={redeployFlows}
                />
              </ItemForm>
              <ItemForm>
                <FormTextbox
                  label='애플리케이션 이름'
                  value={selectedItem.name}
                  isEditing={!editing}
                  onValueChange={updateField('name')}
                />
              </ItemForm>
              <ItemForm disabled>
                <FormTextbox
                  label='컨테이너'
                  value={selectedItem.containerName}
                  isEditing={!editing}
                  onValueChange={updateField('containerName')}
                />
              </ItemForm>
              <ItemForm>
                <FormTextbox
                  label='포트번호'
                  value={selectedItem.port}
                  isEditing={!editing}
                  onValueChange={updateField('port')}
                />
              </ItemForm>
              <ItemForm>
                <DataGrid
                  dataSource={appStatus}
                  showBorders
                >
                  <Sorting mode='none' />
                  <Scrolling mode='virtual' />
                  <LoadPanel enabled={false} />
                  <Column dataField='name' caption='컨테이너' />
                  <Column dataField='status' caption='상태' cellRender={cellRender} />
                </DataGrid>
              </ItemForm>
            </GroupItem>
          </GroupItem>
        </Form>
      </ValidationGroup>
    </div>
  );
};
