import React, { useState, useRef, useCallback, useContext, useEffect } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import Button, { ButtonTypes } from 'devextreme-react/button';
import Form, { Item, Label, ButtonItem, ButtonOptions, RequiredRule, /*EmailRule*/ } from 'devextreme-react/form';
import LoadIndicator from 'devextreme-react/load-indicator';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';

import { useAuth } from '../../../contexts/auth';
import { ThemeContext } from '../../../theme/theme';

import './LoginForm.scss';
import { signInAgain } from '../../../api/auth';

function getButtonStylingMode(theme: string | undefined): ButtonTypes.ButtonStyle {
  return theme === 'dark' ? 'outlined' : 'contained';
}

export const LoginForm = ({ resetLink, createAccountLink }) => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const formData = useRef({ username: '', password: '', rememberMe: false });
  const themeContext = useContext(ThemeContext);
  const [userId, setUserId] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('rememberId') !== null) {
      setUserId(localStorage.getItem('rememberId') as any);
      setRememberMe(true);
    }
  }, []);

  const onSubmit = useCallback(
    async(e) => {
      e.preventDefault();
      const { username, password, rememberMe } = formData.current;
      setLoading(true);
      if(rememberMe) localStorage.setItem('rememberId', username);
      const result = await signIn(username, password, rememberMe) as any;
      if (result.isOk) {
        navigate('/');
      } else {
        setLoading(false);
        if (result.lockedUser) {
          notify(result.message, 'error', 2000);
        } else if (result.duplicateLogin) {
          const result = confirm('동일 아이디로 이미 접속 중입니다. <br><br> 지금 다시 로그인 하시겠습니까?', '재 로그인');
          result.then((dialogResult) => {
            if (dialogResult) {
              return signInAgain(username, password, rememberMe);
            }
          });
        } else {
          notify(result.message, 'error', 2000);
        }
      }
    },
    [signIn]
  );

  const onCreateAccountClick = useCallback(() => {
    navigate(createAccountLink);
  }, [navigate]);

  return (
    <form className='login-form' onSubmit={onSubmit}>
      <Form
        formData={formData.current}
        disabled={loading}
        showColonAfterLabel
        showRequiredMark={false}
      >
        <Item dataField='username' editorType='dxTextBox' editorOptions={{ stylingMode: 'filled', placeholder: 'Username', value: userId }}>
          <RequiredRule message='Username is required' />
          {/*<EmailRule message='Email is invalid' />*/}
          <Label visible={false} />
        </Item>
        <Item dataField='password' editorType='dxTextBox' editorOptions={{ stylingMode: 'filled', placeholder: 'Password', mode: 'password' }}>
          <RequiredRule message='Password is required' />
          <Label visible={false} />
        </Item>
        <Item dataField='rememberMe' editorType='dxCheckBox' editorOptions={{ text: 'Remember me', elementAttr: { class: 'form-text' }, value: rememberMe }}>
          <Label visible={false} />
        </Item>
        <ButtonItem>
          <ButtonOptions width='100%' type='default' useSubmitBehavior>
            <span className='dx-button-text'>{loading ? <LoadIndicator width='24px' height='24px' visible /> : 'Sign In'}</span>
          </ButtonOptions>
        </ButtonItem>
      </Form>
      <div className='reset-link'>
        <Link to={resetLink}>Forgot password?</Link>
      </div>

      <Button
        className='btn-create-account'
        text='Create an account'
        width='100%'
        onClick={onCreateAccountClick}
        stylingMode={getButtonStylingMode(themeContext?.theme)}
      />

      {/*<LoginOauth />*/}
    </form>
  );
};

// const usernameEditorOptions = { stylingMode: 'filled', placeholder: 'Username', value: '' };
// const passwordEditorOptions = { stylingMode: 'filled', placeholder: 'Password', mode: 'password' };
// const rememberMeEditorOptions = { text: 'Remember me', elementAttr: { class: 'form-text' } };
