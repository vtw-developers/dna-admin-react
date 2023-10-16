import React, { useCallback, useEffect, useRef, useState } from 'react';

import TreeView from 'devextreme-react/tree-view';
import { useNavigation } from '../../../contexts/navigation';
import { useScreenSize } from '../../../utils/media-query';

import type { SideNavigationMenuProps } from '../../../types';

import './SideNavigationMenu.scss';

import * as events from 'devextreme/events';
import { apollo } from '../../../graphql-apollo';
import { gql } from '@apollo/client';
import { Template } from 'devextreme-react/core/template';
import Button from 'devextreme-react/button';

export const SideNavigationMenu = (
  props: React.PropsWithChildren<SideNavigationMenuProps>
) => {
  const { children, selectedItemChanged, openMenu, compactMode, onMenuReady } =
    props;

  const { isLarge } = useScreenSize();

  const [menuItems, setMenuItems] = useState<any>([]);

  useEffect(() => {
    menuList();
  }, []);

  function menuList() {
    apollo
      .query({
        query: gql`
          query menus {
            menus {
              id
              name
              type
              parentId
              programId
              icon
            }
          }
        `,
      })
      .then((menuResult: any) => {
        setMenuItems(
          menuResult.data.menus.map((item) => ({
            ...item,
            expanded: isLarge,
          }))
        );
      });
  }

  const {
    navigationData: { currentPath },
  } = useNavigation();

  const treeViewRef = useRef<TreeView>(null);
  const wrapperRef = useRef();
  const getWrapperRef = useCallback(
    (element) => {
      const prevElement = wrapperRef.current;
      if (prevElement) {
        events.off(prevElement, 'dxclick');
      }

      wrapperRef.current = element;
      events.on(element, 'dxclick', (e: React.PointerEvent) => {
        openMenu(e);
      });
    },
    [openMenu]
  );

  useEffect(() => {
    const treeView = treeViewRef.current && treeViewRef.current.instance;
    if (!treeView) {
      return;
    }

    if (currentPath !== undefined) {
      treeView.selectItem(currentPath);
      treeView.expandItem(currentPath);
    }

    if (compactMode) {
      treeView.collapseAll();
    }
  }, [currentPath, compactMode]);

  const itemTemplate = useCallback((itemObj) => {
    return (
      <Button
        icon={itemObj.icon}
        stylingMode='text'
        text={itemObj.name}
        className='noHover'
      />
    );
  }, []);

  return (
    <div
      className='dx-swatch-additional side-navigation-menu'
      ref={getWrapperRef}
    >
      {children}
      <div className='menu-container'>
        <TreeView
          ref={treeViewRef}
          items={menuItems}
          dataStructure='plain'
          parentIdExpr='parentId'
          keyExpr='id'
          itemTemplate='itemTemplate'
          selectionMode='single'
          focusStateEnabled={false}
          expandEvent='click'
          onItemClick={selectedItemChanged}
          onContentReady={onMenuReady}
          width='100%'
        >
          <Template name='itemTemplate' render={itemTemplate} />
        </TreeView>
      </div>
    </div>
  );
};
