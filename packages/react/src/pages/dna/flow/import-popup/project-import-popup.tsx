import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { FormPopup } from '../../../../components';
import { getSizeQualifier } from '../../../../utils/media-query';
import Form, { Item as FormItem, Label } from 'devextreme-react/form';
import TextBox from 'devextreme-react/text-box';
import { apollo } from '../../../../graphql-apollo';
import { gql } from '@apollo/client';
import notify from 'devextreme/ui/notify';

type Props = {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  onSave?: () => void;
};

export const ProjectImportPopup = ({
  visible,
  onSave,
  setVisible,
}: PropsWithChildren<Props>) => {
  const newProject: any = {
    name: '',
    path: '',
  };
  useEffect(() => {
    setProject(newProject);
  }, [visible]);

  const [project, setProject] = useState<any>(newProject);

  const updateField = (field: string) => (value) => {
    setProject((prevState) => ({ ...prevState, ...{ [field]: value } }));
  };
  const save = useCallback(() => {
    apollo
      .mutate({
        mutation: gql`
          mutation importProject($path: String, $name: String) {
            importProject(path: $path, name: $name)
          }
        `,
        variables: {
          path: project.path,
          name: project.name,
        },
      })
      .then((result: any) => {
        if (result.errors) {
          console.error(result.errors);
          notify(result.data.importProject, 'error', 2000);
          return;
        }
        onSave && onSave();
        notify(result.data.importProject, 'success', 2000);
      });
  }, [project]);

  return (
    <FormPopup
      title='Import Project'
      visible={visible}
      setVisible={setVisible}
      onSave={save}
    >
      <Form className='plain-styled-form' screenByWidth={getSizeQualifier}>
        <FormItem>
          <Label text='name' />
          <TextBox value={project.name} onValueChange={updateField('name')} />
        </FormItem>
        <FormItem>
          <Label text='path' />
          <TextBox value={project.path} onValueChange={updateField('path')} />
        </FormItem>
      </Form>
    </FormPopup>
  );
};
