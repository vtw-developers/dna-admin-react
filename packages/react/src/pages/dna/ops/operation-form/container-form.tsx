import React, { useEffect, useState } from 'react';
import ValidationGroup from 'devextreme-react/validation-group';
import Form, {
  ColCountByScreen,
  GroupItem,
  Item as ItemForm,
} from 'devextreme-react/form';
import classNames from 'classnames';
import { FormTextbox } from '../../../../components';

import './container-form.scss';
import { apollo } from '../../../../graphql-apollo';
import { gql } from '@apollo/client';
import notify from 'devextreme/ui/notify';
import { OperationToolbarForm } from '../toolbar-form/operation-toolbar-form';
import DataGrid, {
  Column,
  Item,
  Scrolling,
  Sorting,
} from 'devextreme-react/data-grid';
import Toolbar from 'devextreme-react/toolbar';

export const ContainerForm = ({ selectedItem, setSelectedItem, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [oldName, setOldName] = useState('');
  const [childContainers, setChildContainers] = useState<any>(null);

  useEffect(() => {
    if (selectedItem.type === 'GROUP') {
      apollo
        .query({
          query: gql`
            query containersByGroupName($groupName: String) {
              containersByGroupName(groupName: $groupName) {
                id
                name
                type
                hostname
              }
            }
          `,
          variables: {
            groupName: selectedItem.name,
          },
        })
        .then((result: any) => {
          setChildContainers(result.data.containersByGroupName);
        });
    }
  }, [selectedItem]);

  const handleEditClick = () => {
    setEditing(!editing);
    setOldName(selectedItem.name);
  };

  const onSaveClick = ({ validationGroup }) => {
    if (!validationGroup.validate().isValid) return;
    const container = {
      id: selectedItem.id,
      name: selectedItem.name,
      type: selectedItem.type,
      hostname: selectedItem.hostname,
    };
    apollo
      .mutate({
        mutation: gql`
          mutation updateContainer(
            $oldName: String
            $newOne: ContainerRequest
          ) {
            updateContainer(oldName: $oldName, newOne: $newOne)
          }
        `,
        variables: {
          oldName: oldName,
          newOne: container,
        },
      })
      .then(() => {
        onSave && onSave();
        handleEditClick();
      })
      .catch((result: any) => {
        notify(result.graphQLErrors[0].message, 'error', 2500);
      });
  };

  const onCancelClick = () => {
    handleEditClick();
  };

  const updateField = (field: string) => (value) => {
    setSelectedItem((prevState) => ({ ...prevState, ...{ [field]: value } }));
  };

  return (
    <>
      <div className='container-form'>
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
                    label='컨테이너 이름'
                    value={selectedItem.name}
                    isEditing={!editing}
                    onValueChange={updateField('name')}
                  />
                </ItemForm>
                <ItemForm disabled>
                  <FormTextbox
                    label='컨테이너 유형'
                    value={selectedItem.type}
                    isEditing={!editing}
                    onValueChange={updateField('type')}
                  />
                </ItemForm>
                {selectedItem.type === 'SINGLE' && (
                  <ItemForm>
                    <FormTextbox
                      label='hostname'
                      value={selectedItem.hostname}
                      isEditing={!editing}
                      onValueChange={updateField('hostname')}
                    />
                  </ItemForm>
                )}
              </GroupItem>
            </GroupItem>
          </Form>
        </ValidationGroup>
      </div>
      {selectedItem.type === 'GROUP' && (
        <>
          <Toolbar className='toolbar-form'>
            <Item location='before'>
              <span className='dx-form-group-caption'>물리적 구성</span>
            </Item>
          </Toolbar>
          <DataGrid
            dataSource={childContainers}
            showBorders
          >
            <Sorting mode='none' />
            <Scrolling mode='virtual' />
            <Column dataField='name' caption='이름' />
            <Column dataField='hostname' caption='hostname' />
          </DataGrid>
        </>
      )}
    </>
  );
};
