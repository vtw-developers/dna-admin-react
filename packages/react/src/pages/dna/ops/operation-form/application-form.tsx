import React, { useState } from 'react';
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
import { custom } from 'devextreme/ui/dialog';
import { OperationToolbarForm } from '../toolbar-form/operation-toolbar-form';

export const ApplicationForm = ({
  selectedItem,
  setSelectedItem,
  onSave
}) => {
  const [editing, setEditing] = useState(false);

  const handleEditClick = () => {
    setEditing(!editing);
  };

  const onSaveClick = ({ validationGroup }) => {
    console.log(selectedItem);
    if (!validationGroup.validate().isValid) return;
    const app = {
      id: selectedItem.id,
      name: selectedItem.name,
      containerName: selectedItem.containerName,
      port: selectedItem.port
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

  const updateField = (field: string | number) => (value: string | number) => {
    setSelectedItem((prevState) => ({ ...prevState, ...{ [field]: value } }));
  };

  return (
    <div className='application-form'>
      <ValidationGroup>
        <OperationToolbarForm
          toggleEditing={handleEditClick}
          onSaveClick={onSaveClick}
          editing={editing}
          onCancelClick={onCancelClick}
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
            </GroupItem>
          </GroupItem>
        </Form>
      </ValidationGroup>
    </div>
  );
};
