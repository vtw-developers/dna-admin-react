import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { FormPopup } from '../../../../components';
import { getSizeQualifier } from '../../../../utils/media-query';
import Form, { Item as FormItem, Label } from 'devextreme-react/form';
import SelectBox from 'devextreme-react/select-box';
import { TagBox } from 'devextreme-react';
import { apollo } from '../../../../graphql-apollo';
import { gql } from '@apollo/client';
import notify from 'devextreme/ui/notify';

type Props = {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  onSave?: () => void;
  appName?: any;
};
export const DatasourceDeployPopup = ({
  visible,
  onSave,
  setVisible,
  appName
}: PropsWithChildren<Props>) => {

  const newDeployData: any = {
    app: '',
    dataSourceName: [],
  };

  const [deployData, setDeployData] = useState<any>(newDeployData);
  const [apps, setApps] = useState<any>();
  const [dataSources, setDataSources] = useState<any>();

  useEffect(() => {
    if (visible) {
      if (appName) {
        newDeployData.app = appName;
        setDeployData(newDeployData);
      } else {
        setDeployData(newDeployData);
      }
      findApps();
      findDataSources();
    }
  }, [visible]);

  const updateField = (field: string) => (value) => {
    setDeployData((prevState) => ({ ...prevState, ...{ [field]: value } }));
  };

  const findApps = useCallback(() => {
    apollo
      .query({
        query: gql`
            query findAllApps {
                findAllApps {
                    name
                }
            }
        `,
      })
      .then((result: any) => {
        setApps(result.data.findAllApps);
      });
  }, []);

  const findDataSources = useCallback(() => {
    apollo
      .query({
        query: gql`
            query dataSources {
                dataSources {
                    id
                    projectId
                    databaseProduct
                    name
                    description
                    url
                    username
                    password
                }
            }
        `,
      })
      .then((result: any) => {
        setDataSources(result.data.dataSources);
      });
  }, []);

  const save = useCallback(() => {
    const names = deployData.dataSourceName.map((e) => e.name);
    apollo
      .mutate({
        mutation: gql`
            mutation deployDataSources($app: String, $dataSources: [String]) {
                deployDataSources(app: $app, dataSources: $dataSources)
            }
        `,
        variables: {
          app: deployData.app,
          dataSources: names,
        },
      })
      .then((result: any) => {
        onSave && onSave();
        notify(result.data.deployDataSources, 'success', 2000);
      });
  }, [deployData]);

  return (
    <FormPopup
      title='배포'
      visible={visible}
      setVisible={setVisible}
      onSave={save}
    >
      <Form className='plain-styled-form' screenByWidth={getSizeQualifier}>
        <FormItem>
          <Label text='app name' />
          <SelectBox
            items={apps}
            value={deployData.app}
            onValueChange={updateField('app')}
            valueExpr='name'
            displayExpr='name'
            disabled={!!appName}
          />
        </FormItem>
        <FormItem>
          <Label text='datasource name' />
          <TagBox
            items={dataSources}
            displayExpr='name'
            value={deployData.dataSourceName}
            onValueChange={updateField('dataSourceName')}
          />
        </FormItem>
      </Form>
    </FormPopup>
  );
};
