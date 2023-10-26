import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from 'react';
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
import SelectBox from 'devextreme-react/select-box';

type Props = {
  visible: boolean;
  type: string;
  width?: number;
  wrapperAttr?: { class: string };
  isSaveDisabled?: boolean;
  setVisible: (visible: boolean) => void;
  onSave?: () => void;
  selectedItem: any;
  parentMenu: any;
  programDataSource: any;
};

export const MenuEditPopup = ({
  visible,
  setVisible,
  type,
  onSave,
  selectedItem,
  parentMenu,
  programDataSource,
}: PropsWithChildren<Props>) => {
  const newMenu: any = {
    id: undefined,
    name: '',
  };
  const types = [
    { id: 'group', name: 'Group' },
    { id: 'program', name: 'Program' },
  ];
  const icons = [
    { text: 'Folder', icon: 'folder' },
    { text: 'Box', icon: 'box' },
    { text: 'Check', icon: 'check' },
    { text: 'User', icon: 'user' },
    { text: 'Like', icon: 'like' },
  ];

  useEffect(() => {
    if (type === 'Add') {
      setMenu({
        id: undefined,
        upperMenuId: undefined,
        programId: undefined,
        type: '',
        name: '',
        icon: '',
      });
    } else if (type === 'Update') {
      setMenu({
        id: selectedItem.id,
        upperMenuId: selectedItem.upperMenuId,
        programId: selectedItem.programId,
        type: selectedItem.type,
        name: selectedItem.name,
        icon: selectedItem.icon,
      });
    }
  }, [visible]);

  const [menu, setMenu] = useState<any>(newMenu);

  const updateField = (field: string) => (value) => {
    if (field === 'type' && value === 'group') {
      setMenu((prevState) => ({
        ...prevState,
        ...{ [field]: value, programId: null },
      }));
    } else {
      setMenu((prevState) => ({ ...prevState, ...{ [field]: value } }));
    }
  };
  const save = useCallback(() => {
    console.log(menu);
    if (type === 'Add') {
      apollo
        .mutate({
          mutation: gql`
            mutation createMenu($menu: MenuInput) {
              createMenu(menu: $menu)
            }
          `,
          variables: {
            menu: menu,
          },
        })
        .then(() => {
          onSave && onSave();
        });
    } else {
      apollo
        .mutate({
          mutation: gql`
            mutation updateMenu($menu: MenuInput) {
              updateMenu(menu: $menu)
            }
          `,
          variables: {
            menu: menu,
          },
        })
        .then(() => {
          onSave && onSave();
        });
    }
  }, [menu]);

  return (
    <FormPopup
      title={type}
      visible={visible}
      setVisible={setVisible}
      onSave={save}
    >
      <Form className='plain-styled-form' screenByWidth={getSizeQualifier}>
        <FormItem>
          <Label text='name' />
          <TextBox value={menu.name} onValueChange={updateField('name')} />
        </FormItem>
        <GroupItem>
          <ColCountByScreen xs={1} sm={2} md={2} lg={2} />
          <FormItem>
            <Label text='type' />
            <SelectBox
              items={types}
              value={menu.type}
              onValueChange={updateField('type')}
              valueExpr='id'
              displayExpr='name'
            />
          </FormItem>
          <FormItem>
            <Label text='parentId' />
            <SelectBox
              items={parentMenu}
              value={menu.upperMenuId}
              onValueChange={updateField('upperMenuId')}
              valueExpr='id'
              displayExpr='name'
            />
          </FormItem>
          <FormItem>
            <Label text='programId' />
            <SelectBox
              items={programDataSource}
              disabled={menu.type === 'group'}
              value={menu.programId}
              onValueChange={updateField('programId')}
              valueExpr='id'
              displayExpr='name'
            />
          </FormItem>
          <FormItem>
            <Label text='icon' />
            <SelectBox
              items={icons}
              value={menu.icon}
              onValueChange={updateField('icon')}
              valueExpr='icon'
              displayExpr='text'
            />
          </FormItem>
        </GroupItem>
      </Form>
    </FormPopup>
  );
};
