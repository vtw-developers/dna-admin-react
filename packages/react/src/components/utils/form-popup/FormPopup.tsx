import './FormPopup.scss';
import React, { PropsWithChildren, useCallback, useRef } from 'react';

import { Popup, ToolbarItem } from 'devextreme-react/popup';
import ValidationGroup from 'devextreme-react/validation-group';
import { useScreenSize } from '../../../utils/media-query';
import { Button } from 'devextreme-react';

type PopupProps = {
  title: string;
  visible: boolean;
  width?: number;
  wrapperAttr?: { class: string };
  isSaveDisabled?: boolean;
  setVisible: (visible: boolean) => void;
  onSave?: () => void;
  onClose?: () => void;
};

export const FormPopup = ({
  title,
  visible,
  width = 480,
  setVisible,
  onSave,
  onClose,
  wrapperAttr = { class: '' },
  isSaveDisabled = false,
  children,
}: PropsWithChildren<PopupProps>) => {
  const { isXSmall } = useScreenSize();
  const validationGroup = useRef<ValidationGroup>(null);

  const close = () => {
    // validationGroup.current?.instance.reset();
    setVisible(false);
  };

  const onCancelClick = useCallback(() => {
    close();
    onClose && onClose();
  }, [close, validationGroup]);

  const onSaveClick = useCallback(() => {
    // if (!validationGroup.current?.instance.validate().isValid) return;
    onSave && onSave();
    close();
  }, [close, validationGroup]);

  return (
    <Popup
      title={title}
      visible={visible}
      fullScreen={isXSmall}
      width={width}
      wrapperAttr={{
        ...wrapperAttr,
        class: `${wrapperAttr?.class} form-popup`,
      }}
      height='auto'
    >
      <ToolbarItem toolbar='bottom' location='center'>
        <div
          className={`form-popup-buttons-container ${
            width <= 360 ? 'flex-buttons' : ''
          }`}
        >
          <Button
            text='저장'
            stylingMode='contained'
            type='default'
            disabled={isSaveDisabled}
            onClick={onSaveClick}
          />
          <Button text='취소' stylingMode='contained' onClick={onCancelClick} />
        </div>
      </ToolbarItem>

      <ValidationGroup ref={validationGroup}>{children}</ValidationGroup>
    </Popup>
  );
};
