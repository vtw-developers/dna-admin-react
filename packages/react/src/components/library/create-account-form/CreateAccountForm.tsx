import React, { useState, useRef, useCallback } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import Form, { Item, Label, ButtonItem, ButtonOptions, RequiredRule, CustomRule, /*EmailRule*/ } from 'devextreme-react/form';
import LoadIndicator from 'devextreme-react/load-indicator';
import notify from 'devextreme/ui/notify';

import { createAccount } from '../../../api/auth';

import './CreateAccountForm.scss';

export const CreateAccountForm = ({ redirectLink = '/login', buttonLink }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const formData = useRef({ username: '', password: '', name: '' });

  const onSubmit = useCallback(
    async(e) => {
      e.preventDefault();
      const { username, password, name } = formData.current;
      setLoading(true);

      const result = await createAccount(username, password, name) as any;
      setLoading(false);
      if (result.isOk) {
        navigate(buttonLink);
      } else {
        notify(result.message, 'error', 2000);
      }
    },
    [navigate]
  );

  const confirmPassword = useCallback(({ value }) => value === formData.current.password, []);

  return (
    <form className='create-account-form' onSubmit={onSubmit}>
      <Form formData={formData.current} disabled={loading}>
        <Item dataField='username' editorType='dxTextBox' editorOptions={usernameEditorOptions}>
          <RequiredRule message='Username is required' />
          <Label visible={false} />
        </Item>
        <Item dataField='name' editorType='dxTextBox' editorOptions={nameEditorOptions}>
          <RequiredRule message='name is required' />
          <Label visible={false} />
        </Item>
        <Item dataField='password' editorType='dxTextBox' editorOptions={passwordEditorOptions}>
          <RequiredRule message='Password is required' />
          <Label visible={false} />
        </Item>
        <Item dataField='confirmedPassword' editorType='dxTextBox' editorOptions={confirmedPasswordEditorOptions}>
          <RequiredRule message='Password is required' />
          <CustomRule message='Passwords do not match' validationCallback={confirmPassword} />
          <Label visible={false} />
        </Item>
        <Item>
          <div className='policy-info'>
            By creating an account, you agree to the <Link to={redirectLink}>Terms of Service</Link> and <Link to={redirectLink}>Privacy Policy</Link>
          </div>
        </Item>
        <ButtonItem>
          <ButtonOptions width='100%' type='default' useSubmitBehavior>
            <span className='dx-button-text'>{loading ? <LoadIndicator width='24px' height='24px' visible /> : 'Create a new account'}</span>
          </ButtonOptions>
        </ButtonItem>
      </Form>

      <div className='login-link'>
        Have an account? <Link to={redirectLink}>Sign In</Link>
      </div>
      {/*<LoginOauth />*/}
    </form>
  );
};

const usernameEditorOptions = { stylingMode: 'filled', placeholder: 'Username' };
const nameEditorOptions = { stylingMode: 'filled', placeholder: 'name' };
const passwordEditorOptions = { stylingMode: 'filled', placeholder: 'Password', mode: 'password' };
const confirmedPasswordEditorOptions = { stylingMode: 'filled', placeholder: 'Confirm Password', mode: 'password' };
