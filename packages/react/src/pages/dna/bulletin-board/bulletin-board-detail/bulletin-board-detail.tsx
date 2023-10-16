import Toolbar, { Item } from 'devextreme-react/toolbar';
import Button from 'devextreme-react/button';
import { BulletinBoardEditor } from '../bulletin-board-editor/bulletin-board-editor';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TextBox from 'devextreme-react/text-box';
import './bulletin-board-detail.scss';
import { apollo } from '../../../../graphql-apollo';
import { gql } from '@apollo/client';
import { confirm, custom } from 'devextreme/ui/dialog';

export const BulletinBoardDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const loadDetail = async() => {
    const post = await apollo.query<any>({
      query: gql`
        query post($id: ID) {
          post(id: $id) {
            id
            title
            content
            userName
            writtenDate
          }
        }
      `,
      variables: {
        id
      }
    }).then(result => {
      return result.data.post;
    });
    setDetail(post);
    return post;
  };
  const [detail, setDetail] = useState<any>(loadDetail);
  const [isSaved, setIsSaved] = useState<any>(true);

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
          mutation updatePost($post: BulletinBoardInput) {
            updatePost(post: $post) {
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
        console.log(result.data.updatePost);
      });
      setIsSaved(!isSaved);
    }
  };

  const onRemoved = () => {
    const result = confirm('해당 게시글을 삭제하시겠습니까?', '게시글 삭제');
    result.then(dialogResult => {
      if(dialogResult) {
        apollo.mutate<any>({
          mutation: gql`
            mutation deletePost($id: ID) {
              deletePost(id: $id) {
                id
                title
                content
                userName
                writtenDate
              }
            }
          `,
          variables: {
            id
          }
        }).then(result => {
          console.log(result.data.deletePost);
          navigate('/bulletin-board');
        });
      }
    });
  };

  const onClickBack = () => {
    navigate('/bulletin-board');
  };

  return(
    <div className='view-wrapper view-wrapper-task-list bulletin-board-detail'>
      <Toolbar className='toolbar-common'>
        <Item location='before'>
          <span className='toolbar-header'>{ isSaved ? detail?.title : '게시글 수정' }</span>
        </Item>
        <Item
          location='after'
          widget='dxButton'
          locateInMenu='auto'
        >
          <Button
            text={isSaved ? '수정' : '저장'}
            type={isSaved ? 'default' : 'success'}
            stylingMode='contained'
            width='100px'
            onClick={onSaved}
          />
        </Item>
        <Item
          location='after'
          widget='dxButton'
          locateInMenu='auto'
        >
          <Button
            text='삭제'
            type='danger'
            stylingMode='contained'
            width='100px'
            onClick={onRemoved}
          />
        </Item>
        <Item location='after' locateInMenu='auto'>
          <div className='separator' />
        </Item>
        <Item
          location='after'
          widget='dxButton'
          locateInMenu='auto'
        >
          <Button
            icon='arrowright'
            width='10px'
            onClick={onClickBack}
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
        visible={!isSaved}
      />
      <div className='bulletin-board-detail-editor'>
        <BulletinBoardEditor detail={detail} setDetail={setDetail} isSaved={isSaved} />
      </div>
    </div>
  );
};
