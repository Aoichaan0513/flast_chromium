import { platform } from 'os';
import styled, { css } from 'styled-components';
import { borderRadius } from '../../../../../themes';

export const StyledPanel = styled.div`
  width: 100%;
  height: 100%;
  grid-area: panel;
  display: grid;
  grid-template-rows: 1fr;
  grid-template-areas: 'content';
  border-radius: ${borderRadius.toUnit()};
  overflow: hidden;
  user-select: none;
`;

export const StyledPanelContainer = styled.div`
  width: 100%;
  height: 100%;
  padding: 8px 0;
  grid-area: content;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: auto;

  &::-webkit-scrollbar {
    width: 12px;
    height: 12px;
  }

  &::-webkit-scrollbar-track {
    border: solid 2px transparent;
    border-right: solid 3px transparent;
  }

  &::-webkit-scrollbar-thumb {
    box-shadow: inset 0 0 10px 10px #bbb;
    border: solid 2px transparent;
    border-right: solid 3px transparent;
    border-radius: 9px;
  }

  &::-webkit-scrollbar-thumb:hover, ::-webkit-scrollbar-thumb:active {
    box-shadow: inset 0 0 10px 10px #aaa;
  }
`;

export const StyledItem = styled.div`
  width: 100%;
  height: 32px;
  padding: 4px 12px;
  display: grid;
  grid-template-columns: 20px 1fr auto 20px;
  align-items: center;
  flex-shrink: 0;
  gap: 8px;
  transition: all .2s ease-out;
`;

export const StyledItemContainer = styled.div`
  width: 100%;
  height: 32px;
  padding: 0 0 0 12px;
  display: grid;
  grid-template-columns: 20px 1fr auto;
  align-items: center;
  flex-shrink: 0;
  gap: 8px;
  transition: all .2s ease-out;
`;

interface StyledItemIconProps {
    favicon?: string;
}

export const StyledItemIcon = styled.div<StyledItemIconProps>`
  width: 20px;
  min-width: 20px;
  height: 20px;
  min-height: 20px;
  display: flex;
  place-content: center;
  place-items: center;
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;

  ${({ favicon }) => favicon && css`
    background-image: url('${favicon}');
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;
  `};

  svg {
    width: 20px;
    height: 20px;
  }
`;

export const StyledItemLabel = styled.div`
  margin: 1px 0 0;
  font-size: 13px;
  font-weight: ${platform() !== 'darwin' ? 400 : 300};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const StyledItemShortcut = styled.div`
  margin: 0;
  padding: 2px 0 0;
  display: inline-flex;
  place-items: center;
  place-content: center;
  font-family: 'SF Pro Text', 'SF Mono Regular', Roboto, sans-serif;
  font-size: 11px;
  font-weight: 400;
`;

export const StyledItemShortcutText = styled.span`
  margin-bottom: 1px;
  color: inherit;
  font-family: 'Roboto', sans-serif;
  font-size: 13.5px;
  font-weight: 400;
`;

export const StyledItemButtonContainer = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
`;

export const StyledItemButton = styled.button`
  min-width: 40px;
  height: 100%;
  margin: 0;
  padding: 0 8px;
  display: flex;
  place-items: center;
  place-content: center;
  font-size: 13px;
  font-weight: 300;
  background: none;
  border: none;
  transition: ${({ theme }) => theme.transitions.create(['background-color', 'box-shadow', 'border-color'], {
    duration: theme.transitions.duration.short
  })};

  svg, img {
    width: 20px;
    height: 20px;
  }
`;
