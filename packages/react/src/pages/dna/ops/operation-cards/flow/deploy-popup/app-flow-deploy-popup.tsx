import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from 'react';
import Form, { Item as FormItem, Label } from 'devextreme-react/form';
import { gql } from '@apollo/client';
import notify from 'devextreme/ui/notify';
import SelectBox from 'devextreme-react/select-box';
import { RadioGroup, TagBox } from 'devextreme-react';
import { apollo } from '../../../../../../graphql-apollo';
import { FormPopup } from '../../../../../../components';
import { getSizeQualifier } from '../../../../../../utils/media-query';

type Props = {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  onSave?: () => void;
  appName: string;
  reload?: () => void;
};

export const AppFlowDeployPopup = ({
  visible,
  onSave,
  appName,
  setVisible,
  reload,
}: PropsWithChildren<Props>) => {
  const newProject: any = {
    app: appName,
    projectName: '',
    flowName: [],
  };
  useEffect(() => {
    if (visible) {
      setDeployData(newProject);
      findApps();
      findProjects();
      findFlow();
    }
  }, [visible]);

  const [deployData, setDeployData] = useState<any>(newProject);
  const [apps, setApps] = useState<any>();
  const [projects, setProjects] = useState<any>();
  const [flows, setFlows] = useState<any>();
  const [type, setType] = useState<any>('project');

  const types = ['project', 'flow'];
  const updateField = (field: string) => (value) => {
    setDeployData((prevState) => ({ ...prevState, ...{ [field]: value } }));
  };
  const switchType = (e) => {
    setType(e.value);
  };

  const save = useCallback(() => {
    if (type == 'project') {
      apollo
        .mutate({
          mutation: gql`
            mutation deployProject($app: String, $project: String) {
              deployProject(app: $app, project: $project)
            }
          `,
          variables: {
            app: deployData.app,
            project: deployData.projectName,
          },
        })
        .then((result: any) => {
          if (result.errors) {
            console.error(result.errors);
            notify(result.data.deployProject, 'error', 2000);
            return;
          }
          onSave && onSave();
          reload && reload();
          notify(result.data.deployProject, 'success', 2000);
        });
    } else {
      const names = deployData.flowName.map(function(e) {
        return e.name;
      });
      apollo
        .mutate({
          mutation: gql`
            mutation deployFlows($app: String, $flows: [String]) {
              deployFlows(app: $app, flows: $flows)
            }
          `,
          variables: {
            app: deployData.app,
            flows: names,
          },
        })
        .then((result: any) => {
          if (result.errors) {
            console.error(result.errors);
            notify(result.data.deployFlows, 'error', 2000);
            return;
          }
          onSave && onSave();
          reload && reload();
          notify(result.data.deployFlows, 'success', 2000);
        });
    }
  }, [deployData, appName]);

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
        if (result.errors) {
          console.error(result.errors);
          notify(result.data.findAllApps, 'error', 2000);
          return;
        }
        setApps(result.data.findAllApps);
      });
  }, []);

  const findProjects = useCallback(() => {
    apollo
      .query({
        query: gql`
          query showProjects {
            showProjects
          }
        `,
      })
      .then((result: any) => {
        if (result.errors) {
          console.error(result.errors);
          notify(result.data.showProjects, 'error', 2000);
          return;
        }
        setProjects(result.data.showProjects);
      });
  }, []);

  const findFlow = useCallback(() => {
    apollo
      .query({
        query: gql`
          query showFlows {
            showFlows {
              name
            }
          }
        `,
      })
      .then((result: any) => {
        if (result.errors) {
          console.error(result.errors);
          notify(result.data.showFlows, 'error', 2000);
          return;
        }
        setFlows(result.data.showFlows);
      });
  }, []);

  return (
    <FormPopup
      title='Deploy'
      visible={visible}
      setVisible={setVisible}
      onSave={save}
    >
      <RadioGroup
        items={types}
        value={type}
        onValueChanged={switchType}
        layout='horizontal'
      />
      <Form className='plain-styled-form' screenByWidth={getSizeQualifier}>
        <FormItem>
          <Label text='app name' />
          <SelectBox
            items={apps}
            value={deployData.app}
            onValueChange={updateField('app')}
            valueExpr='name'
            disabled={appName != ''}
            displayExpr='name'
          />
        </FormItem>
        <FormItem visible={type === 'project'}>
          <Label text='project name' />
          <SelectBox
            items={projects}
            value={deployData.projectName}
            onValueChange={updateField('projectName')}
          />
        </FormItem>
        <FormItem visible={type === 'flow'}>
          <Label text='flow name' />
          <TagBox
            items={flows}
            displayExpr='name'
            value={deployData.flowName}
            onValueChange={updateField('flowName')}
          />
        </FormItem>
      </Form>
    </FormPopup>
  );
};
