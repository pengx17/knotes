import React, { useCallback, useMemo } from 'react';
import isHotkey from 'is-hotkey';
import { createEditor, Editor, Point, Range, Transforms } from 'slate';
import { withHistory } from 'slate-history';
import { Editable, Slate, withReact, useSlate } from 'slate-react';
import { css } from '@emotion/core';
import { IconButton } from 'office-ui-fabric-react';

const SHORTCUTS = {
  '*': 'list-item',
  '-': 'list-item',
  '+': 'list-item',
  '>': 'block-quote',
  '#': 'heading-one',
  '##': 'heading-two',
  '###': 'heading-three',
  '####': 'heading-four',
  '#####': 'heading-five',
  '######': 'heading-six'
};

const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code'
};

const LIST_TYPES = ['numbered-list', 'bulleted-list'];

export const Toolbar: React.FC<any> = React.forwardRef(({ ...props }, ref) => (
  <Menu {...props} ref={ref} />
));

export const Button: React.FC<any> = React.forwardRef(({ ...props }, ref) => (
  <span
    {...props}
    ref={ref}
    css={css`
      width: 40px;
      height: 40px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    `}
  />
));

export const EditorValue: React.FC<any> = React.forwardRef(
  ({ className, value, ...props }, ref) => {
    const textLines = value.document.nodes
      .map(node => node.text)
      .toArray()
      .join('\n');
    return (
      <div
        ref={ref}
        {...props}
        css={css`
          margin: 30px -20px 0;
        `}
      >
        <div
          css={css`
            font-size: 14px;
            padding: 5px 20px;
            color: #404040;
            border-top: 2px solid #eeeeee;
            background: #f8f8f8;
          `}
        >
          Slate's value as text
        </div>
        <div
          css={css`
            color: #404040;
            font: 12px monospace;
            white-space: pre-wrap;
            padding: 10px 20px;
            div {
              margin: 0 0 0.5em;
            }
          `}
        >
          {textLines}
        </div>
      </div>
    );
  }
);

export const Icon: React.FC<any> = ({ icon, active }) => (
  <IconButton
    checked={active}
    css={css`
      font-size: 18px;
      vertical-align: text-bottom;
      color: ${!active ? '#aaa' : undefined};
    `}
    iconProps={{ iconName: icon }}
  />
);

export const Instruction: React.FC<any> = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      {...props}
      ref={ref}
      css={css`
        white-space: pre-wrap;
        margin: 0 -20px 10px;
        padding: 10px 20px;
        font-size: 14px;
        background: #f8f8e8;
      `}
    />
  )
);

export const Menu: React.FC<any> = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      {...props}
      ref={ref}
      css={css`
        position: relative;
        border-bottom: 2px solid #eee;
        display: flex;
      `}
    />
  )
);

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === format
  });

  return !!match;
};

const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: n => LIST_TYPES.includes(n.type),
    split: true
  });

  Transforms.setNodes(editor, {
    type: isActive ? 'paragraph' : isList ? 'list-item' : format
  });

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const BlockButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <Button
      onMouseDown={event => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      <Icon active={isBlockActive(editor, format)} icon={icon} />
    </Button>
  );
};

const MarkButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <Button
      onMouseDown={event => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      <Icon active={isMarkActive(editor, format)} icon={icon} />
    </Button>
  );
};

const withShortcuts = editor => {
  const { deleteBackward, insertText } = editor;

  editor.insertText = text => {
    const { selection } = editor;

    if (text === ' ' && selection && Range.isCollapsed(selection)) {
      const { anchor } = selection;
      const block = Editor.above(editor, {
        match: n => Editor.isBlock(editor, n)
      });
      const path = block ? block[1] : [];
      const start = Editor.start(editor, path);
      const range = { anchor, focus: start };
      const beforeText = Editor.string(editor, range);
      const type = SHORTCUTS[beforeText];

      if (type) {
        Transforms.select(editor, range);
        Transforms.delete(editor);
        Transforms.setNodes(
          editor,
          { type },
          { match: n => Editor.isBlock(editor, n) }
        );

        if (type === 'list-item') {
          const list = { type: 'bulleted-list', children: [] };
          Transforms.wrapNodes(editor, list, {
            match: n => n.type === 'list-item'
          });
        }

        return;
      }
    }

    insertText(text);
  };

  editor.deleteBackward = (...args) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const match = Editor.above(editor, {
        match: n => Editor.isBlock(editor, n)
      });

      if (match) {
        const [block, path] = match;
        const start = Editor.start(editor, path);

        if (
          block.type !== 'paragraph' &&
          Point.equals(selection.anchor, start)
        ) {
          Transforms.setNodes(editor, { type: 'paragraph' });

          if (block.type === 'list-item') {
            Transforms.unwrapNodes(editor, {
              match: n => n.type === 'bulleted-list',
              split: true
            });
          }

          return;
        }
      }

      deleteBackward(...args);
    }
  };

  return editor;
};

const Element = ({ attributes, children, element }) => {
  switch (element.type) {
    case 'block-quote':
      return (
        <blockquote
          css={css`
            border-left: 2px solid #ddd;
            margin-left: 0;
            margin-right: 0;
            padding-left: 10px;
            color: #aaa;
            font-style: italic;
          `}
          {...attributes}
        >
          {children}
        </blockquote>
      );
    case 'bulleted-list':
      return <ul {...attributes}>{children}</ul>;
    case 'heading-one':
      return <h1 {...attributes}>{children}</h1>;
    case 'heading-two':
      return <h2 {...attributes}>{children}</h2>;
    case 'heading-three':
      return <h3 {...attributes}>{children}</h3>;
    case 'heading-four':
      return <h4 {...attributes}>{children}</h4>;
    case 'heading-five':
      return <h5 {...attributes}>{children}</h5>;
    case 'heading-six':
      return <h6 {...attributes}>{children}</h6>;
    case 'list-item':
      return <li {...attributes}>{children}</li>;
    default:
      return (
        <p
          css={css`
            margin: 0;
          `}
          {...attributes}
        >
          {children}
        </p>
      );
  }
};

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = (
      <code
        css={css`
          background-color: #eee;
          padding: 3px;
        `}
      >
        {children}
      </code>
    );
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};

export const ContentEditor = React.memo(
  ({ value, onChange }: { value: any; onChange: (v: any) => void }) => {
    const renderElement = useCallback(props => <Element {...props} />, []);
    const renderLeaf = useCallback(props => <Leaf {...props} />, []);
    const editor = useMemo(
      () => withShortcuts(withReact(withHistory(createEditor()))),
      []
    );
    return (
      <Slate editor={editor} value={value} onChange={value => onChange(value)}>
        <div
          css={{
            background: '#fff',
            border: '1px solid #000'
          }}
        >
          <Toolbar>
            <BlockButton format="heading-one" icon="Header1" />
            <BlockButton format="heading-two" icon="Header2" />
            <BlockButton format="heading-three" icon="Header3" />
            <BlockButton format="heading-four" icon="Header4" />
            <MarkButton format="bold" icon="bold" />
            <MarkButton format="italic" icon="italic" />
            <MarkButton format="underline" icon="underline" />
            <MarkButton format="code" icon="code" />
            <BlockButton format="block-quote" icon="RightDoubleQuote" />
            <BlockButton format="numbered-list" icon="NumberedList" />
            <BlockButton format="bulleted-list" icon="BulletedList" />
          </Toolbar>

          <Editable
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder="Write some your ideas here"
            spellCheck
            autoFocus
            css={{
              padding: '12px'
            }}
            onKeyDown={event => {
              for (const hotkey in HOTKEYS) {
                if (isHotkey(hotkey, event as any)) {
                  event.preventDefault();
                  const mark = HOTKEYS[hotkey];
                  toggleMark(editor, mark);
                }
              }
            }}
          />
        </div>
      </Slate>
    );
  }
);
