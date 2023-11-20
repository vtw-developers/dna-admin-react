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

type Props = {
  visible: boolean;
  type: string;
  width?: number;
  wrapperAttr?: { class: string };
  isSaveDisabled?: boolean;
  setVisible: (visible: boolean) => void;
  onSave?: () => void;
  selectedItem: any;
};

export const ProgramEditPopup = ({
  visible,
  setVisible,
  type,
  onSave,
  selectedItem,
}: PropsWithChildren<Props>) => {
  const newProgram: any = {
    id: undefined,
    name: '',
  };

  useEffect(() => {
    if (type === 'Add') {
      setProgram({
        id: undefined,
        name: '',
        path: '',
      });
    } else if (type === 'Update') {
      setProgram({ ...selectedItem });
    }
  }, [visible]);

  const [program, setProgram] = useState<any>(newProgram);

  const updateField = (field: string) => (value) => {
    setProgram((prevState) => ({ ...prevState, ...{ [field]: value } }));
  };

  const save = useCallback(() => {
    if (type === 'Add') {
      apollo
        .mutate({
          mutation: gql`
            mutation createProgram($program: ProgramInput) {
              createProgram(program: $program)
            }
          `,
          variables: {
            program: program,
          },
        })
        .then((result: any) => {
          console.log(result);
          onSave && onSave();
        });
    } else {
      console.log(program);
      apollo
        .mutate({
          mutation: gql`
            mutation updateProgram($program: ProgramInput) {
              updateProgram(program: $program)
            }
          `,
          variables: {
            program: program,
          },
        })
        .then((result: any) => {
          console.log(result);
          onSave && onSave();
        });
    }
  }, [program]);

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
            <Label text='name' />
            <TextBox value={program.name} onValueChange={updateField('name')} />
          </FormItem>
          <FormItem>
            <Label text='path' />
            <TextBox value={program.path} onValueChange={updateField('path')} />
          </FormItem>
        </GroupItem>
      </Form>
    </FormPopup>
  );
};
