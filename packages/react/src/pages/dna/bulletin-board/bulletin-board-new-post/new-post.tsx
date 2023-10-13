import React, { useState } from 'react';
import { BulletinBoardEditor } from '../bulletin-board-editor/bulletin-board-editor';
import Toolbar, { Item } from 'devextreme-react/toolbar';
import Button from 'devextreme-react/button';
import { useNavigate } from 'react-router-dom';
import TextBox from 'devextreme-react/text-box';
import { apollo } from '../../../../graphql-apollo';
import { gql } from '@apollo/client';
import { custom } from 'devextreme/ui/dialog';

export const NewPost = () => {
  const navigate = useNavigate();
  const initial = { id: '', title: '', content: '', userName: 'Jitto', writtenDate: '' };
  const [detail, setDetail] = useState<any>(initial);

  const updateField = (field: string) => (value) => {
    setDetail((prevState) => ({ ...prevState, ...{ [field]: value.value } }));
  };

  const onSaved = () => {
    if (detail.title === '') {
      const alert = custom({
        title: '제목 입력',
        messageHtml: '제목을 입력해주세요.',
        buttons: [{ text: 'OK' }]
      });
      alert.show();
    } else if (detail.content === '') {
      const alert = custom({
        title: '내용 입력',
        messageHtml: '내용을 입력해주세요.',
        buttons: [{ text: 'OK' }]
      });
      alert.show();
    } else {
      apollo.mutate<any>({
        mutation: gql`
          mutation createPost($post: BulletinBoardInput) {
            createPost(post: $post) {
              id
              title
              content
              userName
              writtenDate
            }
          }
        `,
        variables: {
          post: detail
        }
      }).then(result => {
        console.log(result.data.createPost);
        navigate('/bulletin-board');
      });
    }
  };

  return (
    <div className='view-wrapper view-wrapper-task-list new-post'>
      <Toolbar className='toolbar-common'>
        <Item location='before'>
          <span className='toolbar-header'>New Post</span>
        </Item>
        <Item
          location='after'
          widget='dxButton'
          locateInMenu='auto'
        >
          <Button
            text='Save'
            type='default'
            stylingMode='contained'
            width='100px'
            onClick={onSaved}
          />
        </Item>
      </Toolbar>
      <TextBox
        label='제목'
        maxLength={100}
        placeholder='제목을 입력해주세요.'
        value={detail?.title}
        onValueChanged={updateField('title')}
        height='40px'
      />
      <BulletinBoardEditor detail={detail} setDetail={setDetail} />
    </div>
  );
};

