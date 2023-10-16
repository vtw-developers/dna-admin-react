import React, { useCallback, useEffect, useRef, useState } from 'react';
import Toolbar, { Item } from 'devextreme-react/toolbar';
import Button from 'devextreme-react/button';
import DataGrid, {
  Column,
  HeaderFilter,
  LoadPanel, Pager, Paging, Scrolling, Sorting
} from 'devextreme-react/data-grid';
import TextBox, { TextBoxTypes } from 'devextreme-react/text-box';
import { useNavigate } from 'react-router-dom';
import './bulletin-board-list.scss';
import { apollo } from '../../../../graphql-apollo';
import { gql } from '@apollo/client';
import { PageableService } from '../../util/pageable';
import DataSource from 'devextreme/data/data_source';
import { Contact } from '../../../../types/crm-contact';
import CustomStore from 'devextreme/data/custom_store';

export const BulletinBoardList = () => {
  const pageableService = new PageableService();
  const navigate = useNavigate();
  const gridRef = useRef<DataGrid>(null);
  const [gridDataSource, setGridDataSource] = useState<DataSource<Contact[], string>>();

  useEffect(() => {
    setGridData();
  }, []);

  const setGridData = () => {
    setGridDataSource(
      new DataSource({
        store: new CustomStore({
          key: 'id',
          load: (loadOptions) => {
            const pageable = pageableService.getPageable(loadOptions);
            const page$ = apollo
              .query({
                query: gql`
                  query posts(
                    $page: Int = 0
                    $size: Int = 1000
                    $sortBy: String = "id"
                    $sortDir: String = "asc"
                  ) {
                    posts(
                      page: $page
                      size: $size
                      sortBy: $sortBy
                      sortDir: $sortDir
                    ) {
                      totalElements
                      content {
                        id
                        title
                        content
                        user {
                            username
                            name
                        }
                        writtenDate
                      }
                    }
                  }
                `,
                variables: {
                  page: pageable.page || 0,
                  size: pageable.size,
                  sortBy: pageable.sortBy,
                  sortDir: pageable.sortDir,
                },
              })
              .then((page: any) => {
                console.log(page.data);
                return pageableService.transformPage(page.data.posts);
              });
            return page$;
          },
        }),
      })
    );
  };

  const refresh = useCallback(() => {
    gridRef.current?.instance.refresh();
  }, []);

  const search = useCallback((e: TextBoxTypes.InputEvent) => {
    gridRef.current?.instance.searchByText(e.component.option('text') ?? '');
  }, []);

  const onClickNewPost = () => {
    navigate('/bulletin-board/new');
  };

  const onRowClick = (e) => {
    if (e.data == undefined) {
      return;
    }
    const postId = e.data.id;
    navigate(`/bulletin-board/detail/${postId}`);
  };

  return (
    <div className='view-wrapper view-wrapper-task-list bulletin-board'>
      <Toolbar className='toolbar-common'>
        <Item location='before'>
          <span className='toolbar-header'>게시판</span>
        </Item>
        <Item
          location='after'
          widget='dxButton'
          locateInMenu='auto'
        >
          <Button
            icon='plus'
            text='글쓰기'
            type='default'
            stylingMode='contained'
            onClick={onClickNewPost}

          />
        </Item>
        <Item
          location='after'
          widget='dxButton'
          showText='inMenu'
          locateInMenu='auto'
        >
          <Button
            icon='refresh'
            text='Refresh'
            stylingMode='text'
            onClick={refresh}
          />
        </Item>
        <Item location='after' locateInMenu='auto'>
          <div className='separator' />
        </Item>
        <Item
          location='after'
          widget='dxTextBox'
          locateInMenu='auto'
        >
          <TextBox
            mode='search'
            placeholder='검색'
            onInput={search}
          />
        </Item>
      </Toolbar>
      <DataGrid
        dataSource={gridDataSource}
        onRowClick={onRowClick}
        ref={gridRef}
      >
        <LoadPanel showPane={false} />
        <HeaderFilter visible />
        <Sorting mode='multiple' />
        <Scrolling rowRenderingMode='virtual' />
        <Paging defaultPageSize={10} />
        <Pager
          visible
          displayMode='full'
          showPageSizeSelector
          showInfo
          showNavigationButtons
        />
        <Column
          dataField='id'
          caption='목차'
          width={100}
        />
        <Column
          dataField='title'
          caption='제목'
          width={500}
        />
        <Column
          dataField='user.name'
          caption='작성자'
        />
        <Column
          dataField='user.username'
          caption='아이디'
        />
        <Column
          dataField='writtenDate'
          caption='작성일'
          alignment='left'
          dataType='datetime'
          sortOrder='desc'
          format='yyyy-MM-dd, hh:mm:ss aa'
        />
      </DataGrid>
    </div>
  );
};
