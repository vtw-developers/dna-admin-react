import React, { useCallback, useState } from 'react';

import Drawer from 'devextreme-react/drawer';
import { Template } from 'devextreme-react/core/template';

import { useNavigate } from 'react-router';

import { AppFooter, AppHeader, SideNavigationMenu } from '../../components';
import { useScreenSize } from '../../utils/media-query';
import { useMenuPatch } from '../../utils/patches';

import type { SideNavToolbarProps } from '../../types';

import './side-nav-outer-toolbar.scss';
import { apollo } from '../../graphql-apollo';
import { gql } from '@apollo/client';

export const SideNavOuterToolbar = ({
  title,
  children,
}: React.PropsWithChildren<SideNavToolbarProps>) => {
  const navigate = useNavigate();
  const { isXSmall, isLarge } = useScreenSize();
  const [patchCssClass, onMenuReady] = useMenuPatch();
  const [menuStatus, setMenuStatus] = useState(
    isLarge ? MenuStatus.Opened : MenuStatus.Closed
  );

  const toggleMenu = useCallback(({ event }) => {
    setMenuStatus((prevMenuStatus) =>
      prevMenuStatus === MenuStatus.Closed
        ? MenuStatus.Opened
        : MenuStatus.Closed
    );
    event.stopPropagation();
  }, []);

  const temporaryOpenMenu = useCallback(() => {
    setMenuStatus((prevMenuStatus) =>
      prevMenuStatus === MenuStatus.Closed
        ? MenuStatus.TemporaryOpened
        : prevMenuStatus
    );
  }, []);

  const onOutsideClick = useCallback(() => {
    setMenuStatus((prevMenuStatus) =>
      prevMenuStatus !== MenuStatus.Closed && !isLarge
        ? MenuStatus.Closed
        : prevMenuStatus
    );
    return !isLarge;
  }, [isLarge]);

  const onNavigationChanged = useCallback(
    ({ itemData: { programId }, event, node }) => {
      if (menuStatus === MenuStatus.Closed || !programId || node.selected) {
        event.preventDefault();
        return;
      }
      apollo
        .query({
          query: gql`
            query program($id: ID) {
              program(id: $id) {
                id
                name
                path
              }
            }
          `,
          variables: {
            id: programId,
          },
        })
        .then((menuResult: any) => {
          navigate(menuResult.data.program.path);
        });
      if (!isLarge || menuStatus === MenuStatus.TemporaryOpened) {
        setMenuStatus(MenuStatus.Closed);
        event.stopPropagation();
      }
    },
    [navigate, menuStatus, isLarge]
  );

  return (
    <div className='side-nav-outer-toolbar'>
      <AppHeader
        className='layout-header'
        menuToggleEnabled
        toggleMenu={toggleMenu}
        title={title}
      />
      <Drawer
        className={['drawer layout-body', patchCssClass].join(' ')}
        position='before'
        closeOnOutsideClick={onOutsideClick}
        openedStateMode={isLarge ? 'shrink' : 'overlap'}
        revealMode={isXSmall ? 'slide' : 'expand'}
        minSize={isXSmall ? 0 : 48}
        maxSize={250}
        shading={isLarge ? false : true}
        opened={menuStatus === MenuStatus.Closed ? false : true}
        template='menu'
      >
        <div className='content'>
          {React.Children.map(children, (item) => {
            return (
              React.isValidElement(item) && item.type !== AppFooter && item
            );
          })}
        </div>
        <Template name='menu'>
          <SideNavigationMenu
            compactMode={menuStatus === MenuStatus.Closed}
            selectedItemChanged={onNavigationChanged}
            openMenu={temporaryOpenMenu}
            onMenuReady={onMenuReady}
          />
        </Template>
      </Drawer>
    </div>
  );
};

const MenuStatus = {
  Closed: 1,
  Opened: 2,
  TemporaryOpened: 3,
};
