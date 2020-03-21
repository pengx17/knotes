import React from 'react';
import { AddButton } from '../note/add-button';
import { UserPersona } from './persona';
import { MetaList } from './meta-list';

export const Nav = () => {
  return (
    <div
      css={{
        height: '100%',
        display: 'flex',
        flexFlow: 'column',
        alignItems: 'center',
        padding: '12px 6px',
        borderRight: '2px solid rgb(96, 94, 92);',
        maxWidth: '240px'
      }}
    >
      <div
        css={{
          flexShrink: 0,
          margin: '6px 0'
        }}
      >
        <UserPersona />
      </div>

      <div
        css={{
          padding: '12px 0',
          flex: '1',
          alignSelf: 'stretch',
          overflow: 'auto'
        }}
      >
        <MetaList />
      </div>
      <div
        css={{
          flexShrink: 0
        }}
      >
        <AddButton />
      </div>
    </div>
  );
};
