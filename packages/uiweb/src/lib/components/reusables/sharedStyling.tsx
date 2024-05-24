import styled from 'styled-components';


// Define types and export components
type SectionStyleProps = {
  flexDirection?: string;
  gap?: string;
  cursor?: string;
  alignItems?: string;
  alignSelf?: string;
  minHeight?: string;
  minWidth?: string;
  margin?: string;
  gradient?: string;
  position?: string;
  padding?: string;
  overflow?: string;
  background?: string;
  justifyContent?: string;
  maxHeight?: string;
  height?: string;
  maxWidth?: string;
  width?: string;
  right?: string;
  bottom?: string;
  top?: string;
  left?: string;
  border?: string;
  borderColor?: string;
  borderStyle?: string;
  borderWidth?: string;
  borderRadius?: string;
  lineHeight?: string;
  flex?: string;
  whiteSpace?: string;
  visibility?: string;
  zIndex?: string;
  animation?: string;
  fontSize?: string;
};

export const Section = styled.div<SectionStyleProps>`
  display: flex;
  cursor: ${(props) => props.cursor || 'default'};
  flex: ${(props) => props.flex || 'default'};
  flex-direction: ${(props) => props.flexDirection || 'row'};
  gap: ${(props) => props.gap || '0px'};
  align-items: ${(props) => props.alignItems || 'center'};
  justify-content: ${(props) => props.justifyContent || 'center'};
  align-self: ${(props) => props.alignSelf || 'stretch'};
  margin: ${(props) => props.margin || '0px'};
  min-height: ${(props) => props.minHeight || 'auto'};
  max-height: ${(props) => props.maxHeight || 'auto'};
  max-width: ${(props) => props.maxWidth || 'auto'};
  min-width: ${(props) => props.minWidth || 'auto'};
  height: ${(props) => props.height || 'auto'};
  width: ${(props) => props.width || 'auto'};
  line-height: ${(props) => props.lineHeight || 'initial'};
  overflow: ${(props) => props.overflow || 'default'};
  padding: ${(props) => props.padding || '0px'};
  position: ${(props) => props.position || 'relative'};
  background: ${(props) =>
    props.gradient ? props.gradient : props.background ? props.background : 'transparent' || 'transparent'};
  right: ${(props) => props.right || 'auto'};
  top: ${(props) => props.top || 'auto'};
  bottom: ${(props) => props.bottom || 'auto'};
  left: ${(props) => props.left || 'auto'};
  border-radius: ${(props) => props.borderRadius || '0px'};
  border-width: ${(props) => props.borderWidth || 'initial'};
  border-color: ${(props) => props.borderColor || 'initial'};
  border-style: ${(props) => props.borderStyle || 'initial'};
  z-index: ${(props) => props.zIndex || '0'};
  white-space: ${(props) => props.whiteSpace || 'normal'};
  border: ${(props) => props.border || 'initial'};
  font-size: ${(props) => props.fontSize || 'initial'};

  &.skeleton {
    > * {
      visibility: ${(props) => (props.visibility || props.animation ? 'hidden' : 'visible')};
    }

    &:after {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 1;
      animation: ${(props) => props.animation};
      border-radius: 8px;
    }
  }
`;

type DivStyleProps = {
  height?: string;
  lineHeight?: string;
  width?: string;
  cursor?: string;
  alignSelf?: string;
  margin?: string;
  overflow?: string;
  borderRadius?: string;
  textAlign?: string;
  visibility?: string;
  animation?: string;
};
export const Div = styled.div<DivStyleProps>`
  height: ${(props) => props.height || 'auto'};
  width: ${(props) => props.width || '100%'};
  margin: ${(props) => props.margin || '0px'};
  cursor: ${(props) => props.cursor || 'default'};
  line-height: ${(props) => props.lineHeight || 'initial'};
  overflow: ${(props) => props.overflow || 'default'};
  border-radius: ${(props) => props.borderRadius || '0px'};
  align-self: ${(props) => props.alignSelf || 'center'};
  text-align: ${(props) => props.textAlign || 'default'};

  &.skeleton {
    > * {
      visibility: ${(props) => (props.visibility || props.animation ? 'hidden' : 'visible')};
    }

    &:after {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      opacity: 1;
      z-index: 1;
      animation: ${(props) => props.animation};
      border-radius: 8px;
    }
  }
`;

type SpanStyleProps = {
  alignSelf?: string;
  background?: string;
  borderRadius?: string;
  border?: string;
  bottom?: string;
  flex?: string;
  fontSize?: string;
  fontWeight?: string;
  left?: string;
  letterSpacing?: string;
  lineHeight?: string;
  margin?: string;
  padding?: string;
  position?: string;
  textAlign?: string;
  right?: string;
  textTransform?: string;
  zIndex?: string;
  top?: string;
  maxWidth?: string;
  width?: string;
  cursor?: string;
  whiteSpace?: string;
  visibility?: string;
  animation?: string;
  textWrap?: string;
};

export const Span = styled.span<SpanStyleProps>`
  align-self: ${(props) => props.alignSelf || 'auto'};
  background: ${(props) => props.background || 'transparent'};
  border-radius: ${(props) => props.borderRadius || 'initial'};
  border: ${(props) => props.border || 'initial'};
  bottom: ${(props) => props.bottom || 'auto'};
  color: ${(props) => props.color || 'inherit'};
  flex: ${(props) => props.flex || 'initial'};
  font-size: ${(props) => props.fontSize || 'inherit'};
  font-weight: ${(props) => props.fontWeight || '300'};
  left: ${(props) => props.left || 'auto'};
  letter-spacing: ${(props) => props.letterSpacing || 'inherit'};
  line-height: ${(props) => props.lineHeight || 'initial'};
  cursor: ${(props) => props.cursor || 'default'};
  margin: ${(props) => props.margin || '0px'};
  padding: ${(props) => props.padding || '0px'};
  position: ${(props) => props.position || 'relative'};
  right: ${(props) => props.right || 'auto'};
  text-align: ${(props) => props.textAlign || 'center'};
  text-transform: ${(props) => props.textTransform || 'inherit'};
  top: ${(props) => props.top || 'auto'};
  width: ${(props) => props.width || 'auto'};
  z-index: ${(props) => props.zIndex || 'auto'};
  max-width: ${(props) => props.maxWidth || 'initial'};
  white-space: ${(props) => props.whiteSpace || 'normal'};
  text-wrap: ${(props) => props.textWrap || 'normal'};

  &.skeleton {
    > * {
      visibility: ${(props) => (props.visibility || props.animation ? 'hidden' : 'visible')};
    }

    &:after {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      opacity: 1;
      z-index: 1;
      animation: ${(props) => props.animation};
      border-radius: 8px;
    }
  }
`;

type AnchorStyleProps = {
  alignSelf?: string;
  background?: string;
  borderRadius?: string;
  border?: string;
  bottom?: string;
  flex?: string;
  fontSize?: string;
  fontWeight?: string;
  left?: string;
  letterSpacing?: string;
  lineHeight?: string;
  margin?: string;
  padding?: string;
  position?: string;
  textAlign?: string;
  textDecoration?: string;
  right?: string;
  textTransform?: string;
  zIndex?: string;
  top?: string;
  maxWidth?: string;
  width?: string;
  cursor?: string;
};

export const Anchor = styled.a<AnchorStyleProps>`
  align-self: ${(props) => props.alignSelf || 'auto'};
  background: ${(props) => props.background || 'transparent'};
  border-radius: ${(props) => props.borderRadius || 'initial'};
  border: ${(props) => props.border || 'initial'};
  bottom: ${(props) => props.bottom || 'auto'};
  color: ${(props) => props.color || 'inherit'};
  flex: ${(props) => props.flex || 'initial'};
  font-size: ${(props) => props.fontSize || 'inherit'};
  font-weight: ${(props) => props.fontWeight || '300'};
  left: ${(props) => props.left || 'auto'};
  letter-spacing: ${(props) => props.letterSpacing || 'inherit'};
  line-height: ${(props) => props.lineHeight || 'initial'};
  cursor: ${(props) => props.cursor || 'pointer'};
  margin: ${(props) => props.margin || '0px'};
  padding: ${(props) => props.padding || '0px'};
  position: ${(props) => props.position || 'relative'};
  right: ${(props) => props.right || 'auto'};
  text-align: ${(props) => props.textAlign || 'center'};
  text-decoration: ${(props) => props.textDecoration || 'center'};
  text-transform: ${(props) => props.textTransform || 'inherit'};
  top: ${(props) => props.top || 'auto'};
  width: ${(props) => props.width || 'auto'};
  z-index: ${(props) => props.zIndex || 'auto'};
  max-width: ${(props) => props.maxWidth || 'initial'};
`;

type ImageStyleProps = {
  display?: string;
  height?: string;
  maxHeight?: string;
  padding?: string;
  widthmargin?: string;
  verticalAlign?: string;
  borderRadius?: string;
  overflow?: string;
  cursor?: string;
  filter?: string;
  alt?: string;
  objectFit?: string;
  margin?: string;
};

export const Image = styled.img<ImageStyleProps>`
  display: ${(props) => props.display || 'flex'};
  height: ${(props) => props.height || 'auto'};
  max-height: ${(props) => props.maxHeight || 'initial'};
  padding: ${(props) => props.padding || '0px'};
  width: ${(props) => props.width || '100%'};
  margin: ${(props) => props.margin || '0px'};
  vertical-align: ${(props) => props.verticalAlign || 'auto'};
  border-radius: ${(props) => props.borderRadius || 'initial'};
  overflow: ${(props) => props.overflow || 'hidden'};
  cursor: ${(props) => props.cursor || 'default'};
  filter: ${(props) => props.filter || 'none'};
  alt: ${(props) => props.alt || 'Image'};
  object-fit: ${(props) => props.objectFit || 'fill'};
`;

type ButtonStyleProps = {
  display?: string;
  lineHeight?: string;
  height?: string;
  minHeight?: string;
  flex?: string;
  flexDirection?: string;
  alignSelf?: string;
  alignItems?: string;
  justifyContent?: string;
  fontWeight?: string;
  fontSize?: string;
  color?: string;
  background?: string;
  margin?: string;
  padding?: string;
  border?: string;
  borderRadius?: string;
  position?: string;
  textDecoration?: string;
  width?: string;
  overflow?: string;
  zIndex?: string;
  cursor?: string;
  fontFamily?: string;
  hover?: string;
  hoverBackground?: string;
  hoverBorder?: string;
  hoverSVGPathStroke?: string;
};

export const Button = styled.button<ButtonStyleProps>`
  display: ${(props) => props.display || 'flex'};
  line-height: ${(props) => props.lineHeight || 'normal'};
  flex: ${(props) => props.flex || 'initial'};
  flex-direction: ${(props) => props.flexDirection || 'row'};
  align-self: ${(props) => props.alignSelf || 'auto'};
  align-items: ${(props) => props.alignItems || 'center'};
  justify-content: ${(props) => props.justifyContent || 'center'};
  font-weight: ${(props) => props.fontWeight || 400};
  font-size: ${(props) => props.fontSize || 'inherit'};
  color: ${(props) => props.color || 'inherit'};
  background: ${(props) => props.background || 'inherit'};
  margin: ${(props) => props.margin || 'initial'};

  height: ${(props) => props.height || 'initial'};
  min-height: ${(props) => props.minHeight || 'auto'};
  padding: ${(props) => props.padding || 'initial'};
  border: ${(props) => props.border || 'none'};
  border-radius: ${(props) => props.borderRadius || 'inherit'};
  position: ${(props) => props.position || 'relative'};
  text-decoration: ${(props) => props.textDecoration || 'none'};
  width: ${(props) => props.width || 'initial'};
  overflow: ${(props) => props.overflow || 'hidden'};
  z-index: ${(props) => props.zIndex || '3'};
  cursor: ${(props) => props.cursor || 'pointer'};
  font-family: ${(props) => props.fontFamily || 'inherit'};

  &:before {
    background: ${(props) => props.hover || (props.background ? props.background : 'transparent')};
    bottom: 0;
    content: '';
    display: none;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    z-index: -1;
  }

  &:after {
    background: ${(props) => props.hoverBackground || '#000'};
    bottom: 0;
    content: '';
    left: 0;
    opacity: 0;
    position: absolute;
    right: 0;
    top: 0;
    z-index: -1;
  }

  &:hover {
    border: ${(props) => props.hoverBorder || 'none'};

    & svg > path {
      stroke: ${(props) => props.hoverSVGPathStroke || 'auto'};
    }
  }

  &:hover:before {
    display: block;
  }

  &:hover:after {
    opacity: ${(props) => (props.hoverBackground ? 1 : 0.08)};
  }

  &:active:after {
    opacity: ${(props) => (props.hoverBackground ? 1 : 0.15)};
  }

  & > div {
    display: flex;
  }
`;
