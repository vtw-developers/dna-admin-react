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
import DataSource from 'devextreme/data/data_source';
import CustomStore from 'devextreme/data/custom_store';
import { PageableService } from '../../../util/pageable';
import Lookup from 'devextreme-react/lookup';
import NumberBox from 'devextreme-react/number-box';

type Props = {
  visible: boolean;
  width?: number;
  wrapperAttr?: { class: string };
  isSaveDisabled?: boolean;
  setVisible: (visible: boolean) => void;
  onSave?: () => void;
};

const pageableService = new PageableService();

export const ReservationPopup = ({
  visible,
  setVisible,
  onSave,
}: PropsWithChildren<Props>) => {
  const [gridDataSource, setGridDataSource] =
    useState<DataSource<any[], string>>();
  const [movieId, setMovieId] = useState<number>();
  const [audienceCount, setAudienceCount] = useState<number>(1);

  const reset = useCallback(() => {
    setMovieId(undefined);
    setAudienceCount(1);
  }, []);

  const close = useCallback(() => {
    reset();
  }, []);

  const save = useCallback(() => {
    apollo
      .mutate({
        mutation: gql`
          mutation reserveMovie($movieId: ID, $audienceCount: Int) {
            reserveMovie(movieId: $movieId, audienceCount: $audienceCount) {
              id
            }
          }
        `,
        variables: {
          movieId,
          audienceCount,
        },
      })
      .then((result: any) => {
        console.log(result);
        onSave && onSave();
        reset();
      });
  }, [movieId, audienceCount]);

  useEffect(() => {
    setGridDataSource(
      new DataSource({
        paginate: true,
        pageSize: 10,
        store: new CustomStore({
          key: 'id',
          load: (loadOptions) => {
            const pageable = pageableService.getPageable(loadOptions);

            const page$ = apollo
              .query({
                query: gql`
                  query movies(
                    $page: Int = 0
                    $size: Int = 10
                    $sortBy: String = "id"
                    $sortDir: String = "asc"
                    $filter: String = ""
                  ) {
                    movies(
                      page: $page
                      size: $size
                      sortBy: $sortBy
                      sortDir: $sortDir
                      filter: $filter
                    ) {
                      totalElements
                      content {
                        id
                        name
                      }
                    }
                  }
                `,
                variables: {
                  page: pageable.page || 0,
                  size: pageable.size,
                  sortBy: pageable.sortBy,
                  sortDir: pageable.sortDir,
                  filter: pageable.filter,
                },
              })
              .then((page: any) => {
                console.log(page);
                return pageableService.transformPage(page.data.movies);
              });
            return page$;
          },
        }),
      })
    );
  }, []);

  return (
    <FormPopup
      title='직원 생성'
      visible={visible}
      setVisible={setVisible}
      onSave={save}
      onClose={close}
    >
      <Form className='plain-styled-form' screenByWidth={getSizeQualifier}>
        <GroupItem>
          <ColCountByScreen xs={1} sm={1} md={1} lg={1} />
          <FormItem>
            <Label text='영화' />
            <Lookup
              value={movieId}
              onValueChange={setMovieId}
              dataSource={gridDataSource}
              displayExpr='name'
              valueExpr='id'
            />
          </FormItem>
          <FormItem>
            <Label text='인원' />
            <NumberBox value={audienceCount} onValueChange={setAudienceCount} />
          </FormItem>
        </GroupItem>
      </Form>
    </FormPopup>
  );
};
