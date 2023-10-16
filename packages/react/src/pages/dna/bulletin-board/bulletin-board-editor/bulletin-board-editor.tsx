import React, { PropsWithChildren, useEffect, useRef } from 'react';
import { HtmlEditor } from 'devextreme-react';
import { Toolbar, Item } from 'devextreme-react/html-editor';

type Props = {
  detail
  setDetail
  isSaved
}
export const BulletinBoardEditor = ({ detail, setDetail, isSaved }:PropsWithChildren<Props>) => {
  const sizeValues = [ '8pt', '10pt', '12pt', '14pt', '18pt', '24pt', '36pt' ];
  const fontValues = [ 'Arial', 'Georgia', 'Tahoma', 'Times New Roman', 'Verdana' ];
  const headerValues = [ false, 1, 2, 3, 4, 5 ];
  const htmlEditorRef = useRef<HtmlEditor>(null);

  const updateField = (field: string) => (value) => {
    setDetail((prevState) => ({ ...prevState, ...{ [field]: value } }));
  };

  useEffect(() => {
    if (isSaved) {
      document.body.getElementsByClassName('dx-htmleditor')[0].classList.remove('dx-htmleditor-outlined');
      document.body.getElementsByClassName('dx-htmleditor-toolbar-wrapper')[0].setAttribute('hidden', 'true');
    }
    htmlEditorRef?.current?.instance.setSelection(detail?.content?.length, 0);
  }, [detail]);

  useEffect(() => {
    if (isSaved) {
      document.body.getElementsByClassName('dx-htmleditor')[0].classList.remove('dx-htmleditor-outlined');
      document.body.getElementsByClassName('dx-htmleditor-toolbar-wrapper')[0].setAttribute('hidden', 'true');
    }
  }, [isSaved]);

  return (
    <div className='bulletin-board-editor'>
      <HtmlEditor
        placeholder='내용을 입력해주세요.'
        ref={htmlEditorRef}
        value={detail?.content}
        valueType='html'
        height='700px'
        onValueChange={updateField('content')}
        readOnly={isSaved}
      >
        <Toolbar>
          <Item name='undo' />
          <Item name='redo' />
          <Item name='separator' />
          <Item name='size' acceptedValues={sizeValues} />
          <Item name='font' acceptedValues={fontValues} />
          <Item name='separator' />
          <Item name='bold' />
          <Item name='italic' />
          <Item name='strike' />
          <Item name='underline' />
          <Item name='separator' />
          <Item name='alignLeft' />
          <Item name='alignCenter' />
          <Item name='alignRight' />
          <Item name='alignJustify' />
          <Item name='separator' />
          <Item name='orderedList' />
          <Item name='bulletList' />
          <Item name='separator' />
          <Item name='header' acceptedValues={headerValues} />
          <Item name='separator' />
          <Item name='color' />
          <Item name='background' />
          <Item name='separator' />
          <Item name='link' />
          <Item name='image' />
          <Item name='separator' />
          <Item name='clear' />
          <Item name='codeBlock' />
          <Item name='blockquote' />
          <Item name='separator' />
        </Toolbar>
      </HtmlEditor>
    </div>
  );
};
