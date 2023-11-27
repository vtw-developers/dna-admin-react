import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { FormPopup } from '../../../../../../components';
import { getSizeQualifier } from '../../../../../../utils/media-query';
import Form, {
  ColCountByScreen,
  GroupItem,
  Item as FormItem,
  Label,
} from 'devextreme-react/form';
import { TextBox } from 'devextreme-react/text-box';
import { apollo } from '../../../../../../graphql-apollo';
import { gql } from '@apollo/client';
import notify from 'devextreme/ui/notify';

type Props = {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  type: string;
  onSave?: () => void;
  selectedItem: any;
  containerName: any;
  reload?: () => void;
};

export const ContainerAppEditPopup = ({
  visible,
  setVisible,
  type,
  onSave,
  selectedItem,
  containerName,
  reload
}: PropsWithChildren<Props>) => {

  const newApp: any = {
    id: '',
    name: '',
    containerName: containerName,
    port: ''
  };

  const [app, setApp] = useState<any>(newApp);

  useEffect(() => {
    if (type == '생성') {
      setApp({ ...newApp });
    } else {
      setApp({ ...selectedItem });
    }
  }, [visible]);

  const updateField = (field: string) => (value) => {
    setApp((prevState) => ({ ...prevState, ...{ [field]: value } }));
  };

  const save = useCallback(() => {
    console.log(app);
    if (type == '생성') {
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
          reload && reload();
        })
        .catch((result: any) => {
          notify(result.graphQLErrors[0].message, 'error', 2500);
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
        .then(() => {
          onSave && onSave();
          reload && reload();
        })
        .catch((result: any) => {
          notify(result.graphQLErrors[0].message, 'error', 2500);
        });
    }
  }, [app]);

  return (
    <FormPopup
      title={type}
      visible={visible}
      setVisible={setVisible}
      onSave={save}
    >
      <Form className='plain-styled-form' screenByWidth={getSizeQualifier}>
        <GroupItem>
          <ColCountByScreen xs={1} sm={1} md={1} lg={1} />
          <FormItem>
            <Label text='컨테이너' />
            <TextBox
              value={app.containerName}
              disabled
              onValueChange={updateField('containerName') }
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
        </GroupItem>
      </Form>
    </FormPopup>

  );
};
