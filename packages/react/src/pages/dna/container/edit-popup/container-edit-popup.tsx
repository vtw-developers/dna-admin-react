import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from 'react';
import Form, {
  ColCountByScreen,
  GroupItem,
  Item as FormItem,
  Label,
} from 'devextreme-react/form';
import { getSizeQualifier } from '../../../../utils/media-query';
import TextBox from 'devextreme-react/text-box';
import { FormPopup } from '../../../../components';
import SelectBox from 'devextreme-react/select-box';
import { apollo } from '../../../../graphql-apollo';
import { gql } from '@apollo/client';
import notify from 'devextreme/ui/notify';

type Props = {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  type: string;
  onSave?: () => void;
  selectedItem: any;
  parentContainer: any;
};

export const ContainerEditPopup = ({
  visible,
  setVisible,
  type,
  onSave,
  selectedItem,
  parentContainer,
}: PropsWithChildren<Props>) => {

  const newContainer: any = {
    id: undefined,
    name: '',
    parentId: undefined,
  };

  const types = [
    { id: 'GROUP', name: 'Group' },
    { id: 'SINGLE', name: 'Single' },
  ];

  useEffect(() => {
    if (type === '생성') {
      setContainer({ ...newContainer });
    } else {
      setContainer({ ...selectedItem });
      setOldName(selectedItem?.name);
    }
  }, [visible]);

  const [container, setContainer] = useState<any>(newContainer);
  const [oldName, setOldName] = useState('');

  const updateField = (field: string) => (value) => {
    setContainer((prevState) => ({ ...prevState, ...{ [field]: value } }));
  };

  const reset = useCallback(() => {
    setContainer({ ...newContainer });
  }, []);

  const save = useCallback(() => {
    if (type === '생성') {
      apollo
        .mutate({
          mutation: gql`
            mutation createContainer($container: ContainerInput) {
              createContainer(container: $container)
            }
          `,
          variables: {
            container: container,
          },
        })
        .then((result: any) => {
          console.log(result);
          onSave && onSave();
          reset();
        })
        .catch((result: any) => {
          console.log(result);
          notify('서버 이름이 이미 존재합니다.', 'error', 2500);
        });
    } else {
      apollo
        .mutate({
          mutation: gql`
            mutation updateContainer($oldName: String, $newOne: ContainerInput) {
                updateContainer(oldName: $oldName, newOne: $newOne)
            }
          `,
          variables: {
            oldName: oldName,
            newOne: container
          },
        })
        .then(() => {
          onSave && onSave();
        });
    }
  }, [container]);

  return (
    <FormPopup
      title={type}
      visible={visible}
      setVisible={setVisible}
      onSave={save}
    >
      <Form className='plain-styled-form' screenByWidth={getSizeQualifier}>
        <FormItem>
          <Label text='이름' />
          <TextBox value={container.name} onValueChange={updateField('name')} />
        </FormItem>
        <FormItem>
          <Label text='유형' />
          <SelectBox
            items={types}
            value={container.type}
            onValueChange={updateField('type')}
            valueExpr='id'
            displayExpr='name'
          />
        </FormItem>
        {container.type == 'SINGLE' && (
          <FormItem>
            <Label text='그룹' />
            <SelectBox
              items={parentContainer}
              value={container.parentId}
              onValueChange={updateField('parentId')}
              valueExpr='id'
              displayExpr='name'
            />
          </FormItem>
        )}
        <FormItem>
          <Label text='hostname' />
          <TextBox
            value={container.hostname}
            onValueChange={updateField('hostname')}
          />
        </FormItem>
        <GroupItem>
          <ColCountByScreen xs={1} sm={2} md={2} lg={2} />
        </GroupItem>
      </Form>
    </FormPopup>
  );
};
