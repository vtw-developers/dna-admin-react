import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from 'react';
import Form, { Item as FormItem, Label } from 'devextreme-react/form';
import { getSizeQualifier } from '../../../../utils/media-query';
import TextBox from 'devextreme-react/text-box';
import { FormPopup } from '../../../../components';
import { apollo } from '../../../../graphql-apollo';
import { gql } from '@apollo/client';

type Props = {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  type: string;
  onSave?: () => void;
  selectedItem: any;
};

export const DatasourceEditPopup = ({
  visible,
  setVisible,
  type,
  onSave,
  selectedItem,
}: PropsWithChildren<Props>) => {
  const [dataSource, setDataSource] = useState<any>(null);

  useEffect(() => {
    setDataSource({ ...selectedItem });
  }, [visible]);

  const updateField = (field: string) => (value) => {
    setDataSource((prevState) => ({ ...prevState, ...{ [field]: value } }));
  };

  const reset = useCallback(() => {
    setDataSource(null);
  }, []);

  const save = useCallback(() => {
    apollo
      .mutate({
        mutation: gql`
          mutation updateDataSource($dataSource: DataSourceInput) {
              updateDataSource(dataSource: $dataSource)
          }
        `,
        variables: {
          dataSource: dataSource
        }
      })
      .then((result: any) => {
        console.log(result);
        onSave && onSave();
        reset();
      });
  }, [dataSource]);

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
          <TextBox value={dataSource?.name} onValueChange={updateField('name')}
          />
        </FormItem>
        <FormItem>
          <Label text='url' />
          <TextBox value={dataSource?.url} onValueChange={updateField('url')} />
        </FormItem>
        <FormItem>
          <Label text='username' />
          <TextBox value={dataSource?.username} onValueChange={updateField('username')}
          />
        </FormItem>
        <FormItem>
          <Label text='password' />
          <TextBox value={dataSource?.password} onValueChange={updateField('password')}
          />
        </FormItem>
      </Form>
    </FormPopup>
  );
};
