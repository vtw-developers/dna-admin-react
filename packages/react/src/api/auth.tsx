import axios from 'axios';
// import { defaultUser } from '../utils/default-user';

/* eslint-disable @typescript-eslint/no-unused-vars */
export async function signIn(username: string, password: string, rememberMe: boolean) {
  try {
    // Send request
    const requestData = {
      username, password, rememberMe
    };
    // Send request
    return axios.post('/dna/admin/auth/signin', requestData)
      .then((response: any) => {
        if (response.data.accessToken) {
          localStorage.setItem('user', JSON.stringify(response.data));
        }
        return {
          isOk: true,
          data: getUser(),
        };
      })
      .catch((error) => {
        if (error.response.data.message === 'lockedUser') {
          return {
            isOk: false,
            lockedUser: true,
            message: 'Locked User'
          };
        } else if (error.response.data.message === 'duplicateLogin') {
          return {
            isOk: false,
            lockedUser: false,
            duplicateLogin: true,
            message: 'DuplicateLogin User',
          };
        } else {
          return {
            isOk: false,
            lockedUser: false,
            message: 'Incorrect Information',
          };
        }
      });
  } catch {
    return {
      isOk: false,
      message: 'Authentication failed',
    };
  }
}

export async function signInAgain(username: string, password: string, rememberMe: boolean) {
  try {
    const requestData = {
      username, password, rememberMe
    };
    return axios.post('/dna/admin/auth/signinagain', requestData)
      .then((response: any) => {
        if (response.data.accessToken) {
          localStorage.setItem('user', JSON.stringify(response.data));
        }
        return {
          isOk: true,
          data: getUser(),
        };
      })
      .catch((error) => {
        console.log(error.response);
      });
  } catch {
    return {
      isOk: false,
      message: 'Authentication failed',
    };
  }
}

export function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user || '') : undefined;
}

export async function createAccount(username: string, password: string, name: string) {
  try {
    const requestData = {
      username, password, name
    };
    // Send request
    return axios.post('/dna/admin/auth/signup', requestData)
      .then((result) => {
        return {
          isOk: true,
        };
      })
      .catch((error) => {
        console.log(error.response);
        return {
          isOk: false,
          message: 'Already Exist ID',
        };
      });
  } catch {
    return {
      isOk: false,
      message: 'Failed to create account',
    };
  }
}

export async function changePassword(email: string, recoveryCode?: string) {
  try {
    // Send request
    return {
      isOk: true,
      data: { email },
    };
  } catch {
    return {
      isOk: false,
      message: 'Failed to change password',
    };
  }
}

export async function resetPassword(email: string) {
  try {
    // Send request
    return {
      isOk: true,
    };
  } catch {
    return {
      isOk: false,
      message: 'Failed to reset password',
    };
  }
}

export async function logOut() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '');
    const requestData = {
      username: user.username
    };
    return axios.post('/dna/admin/auth/logout', requestData)
      .then((response: any) => {
        localStorage.removeItem('user');
        if (!user.rememberMe) localStorage.removeItem('rememberId');
        return {
          isOk: true,
          data: getUser(),
        };
      })
      .catch((error) => {
        console.log(error.response);
        return {
          isOk: false,
          message: 'Logout error',
        };
      });
  } catch {
    return {
      isOk: false,
      message: 'Authentication failed',
    };
  }

}
